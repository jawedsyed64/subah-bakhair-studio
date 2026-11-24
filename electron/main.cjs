// Subah Bakhair Studio – Electron main process
const { app, BrowserWindow, ipcMain, dialog, clipboard, nativeImage, shell, safeStorage, session } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const userDir = () => app.getPath('userData');
const dataFile = () => path.join(userDir(), 'data.json');
const secretsFile = () => path.join(userDir(), 'secrets.bin');

// ---------- local JSON store ----------
function readData() {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); } catch { return {}; }
}
function writeData(obj) {
  const tmp = dataFile() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj), 'utf8');
  fs.renameSync(tmp, dataFile());
}

// ---------- secure API keys (Windows DPAPI through safeStorage) ----------
function readSecrets() {
  try {
    const buf = fs.readFileSync(secretsFile());
    if (safeStorage.isEncryptionAvailable()) return JSON.parse(safeStorage.decryptString(buf));
    return JSON.parse(buf.toString('utf8'));
  } catch { return {}; }
}
function writeSecrets(obj) {
  const json = JSON.stringify(obj);
  const buf = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(json) : Buffer.from(json, 'utf8');
  fs.writeFileSync(secretsFile(), buf);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Subah Bakhair Studio – صبح بخیر اسٹوڈیو',
    backgroundColor: '#fff8ee',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // open external links in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(() => {
  // Allow the Local Font Access API so the app can list installed Urdu fonts
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => cb(permission === 'local-fonts' || permission === 'clipboard-sanitized-write'));
  session.defaultSession.setPermissionCheckHandler((wc, permission) => permission === 'local-fonts' || permission === 'clipboard-sanitized-write');
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ---------- IPC: storage ----------
ipcMain.handle('store:get', (e, key) => readData()[key]);
ipcMain.handle('store:set', (e, key, value) => { const d = readData(); d[key] = value; writeData(d); return true; });

ipcMain.handle('secrets:status', () => {
  const s = readSecrets();
  return { claude: !!s.claude, openai: !!s.openai, encrypted: safeStorage.isEncryptionAvailable() };
});
ipcMain.handle('secrets:set', (e, name, value) => {
  const s = readSecrets();
  if (value) s[name] = value.trim(); else delete s[name];
  writeSecrets(s);
  return true;
});

// ---------- IPC: AI text (Claude API) ----------
ipcMain.handle('ai:message', async (e, { system, prompt, model }) => {
  const key = readSecrets().claude;
  if (!key) return { ok: false, error: 'NO_KEY' };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: model || 'claude-sonnet-5-5', max_tokens: 700, system, messages: [{ role: 'user', content: prompt }] })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body.error && body.error.message) || `HTTP ${res.status}` };
    const text = (body.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: 'Network error: ' + err.message };
  }
});

// ---------- IPC: AI image (OpenAI Images API) ----------
ipcMain.handle('ai:image', async (e, { prompt, model, size }) => {
  const key = readSecrets().openai;
  if (!key) return { ok: false, error: 'NO_KEY' };
  const m = model || 'gpt-image-1';
  const payload = { model: m, prompt, size: size || '1024x1536', n: 1 };
  if (m.startsWith('dall-e')) payload.response_format = 'b64_json';
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body.error && body.error.message) || `HTTP ${res.status}` };
    const item = body.data && body.data[0];
    if (item && item.b64_json) return { ok: true, dataUrl: 'data:image/png;base64,' + item.b64_json };
    if (item && item.url) {
      const r = await fetch(item.url);
      const b = Buffer.from(await r.arrayBuffer());
      return { ok: true, dataUrl: 'data:image/png;base64,' + b.toString('base64') };
    }
    return { ok: false, error: 'No image returned' };
  } catch (err) {
    return { ok: false, error: 'Network error: ' + err.message };
  }
});

// ---------- IPC: files & clipboard ----------
ipcMain.handle('file:saveImage', async (e, { dataUrl, defaultName, format }) => {
  const ext = format === 'png' ? 'png' : 'jpg';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save greeting picture',
    defaultPath: path.join(app.getPath('pictures'), `${defaultName}.${ext}`),
    filters: [ext === 'png' ? { name: 'PNG image', extensions: ['png'] } : { name: 'JPEG image', extensions: ['jpg', 'jpeg'] }]
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  const base64 = dataUrl.split(',')[1];
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  return { ok: true, filePath };
});

ipcMain.handle('clipboard:image', (e, dataUrl) => {
  clipboard.writeImage(nativeImage.createFromDataURL(dataUrl));
  return true;
});
ipcMain.handle('clipboard:text', (e, text) => { clipboard.writeText(text); return true; });
ipcMain.handle('shell:open', (e, url) => {
  if (/^(https?:|mailto:|whatsapp:)/.test(url)) shell.openExternal(url);
  return true;
});
ipcMain.handle('shell:showFile', (e, filePath) => { shell.showItemInFolder(filePath); return true; });
