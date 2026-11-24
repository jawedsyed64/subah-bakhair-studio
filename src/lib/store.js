// Thin wrapper over the Electron preload API, with a browser fallback for development
const fallback = {
  isElectron: false,
  storeGet: async (k) => { try { return JSON.parse(localStorage.getItem('sbs:' + k)); } catch { return undefined; } },
  storeSet: async (k, v) => { localStorage.setItem('sbs:' + k, JSON.stringify(v)); return true; },
  secretsStatus: async () => ({ claude: false, openai: false, encrypted: false }),
  setSecret: async () => true,
  aiMessage: async () => ({ ok: false, error: 'NO_KEY' }),
  aiImage: async () => ({ ok: false, error: 'Only available in the desktop app' }),
  saveImage: async ({ dataUrl, defaultName, format }) => {
    const a = document.createElement('a'); a.href = dataUrl; a.download = `${defaultName}.${format === 'png' ? 'png' : 'jpg'}`; a.click();
    return { ok: true };
  },
  copyImage: async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return true;
  },
  copyText: async (t) => { await navigator.clipboard.writeText(t); return true; },
  openExternal: async (url) => { window.open(url, '_blank'); return true; },
  showFile: async () => true
};

export const api = (typeof window !== 'undefined' && window.api) ? window.api : fallback;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
