import React, { useEffect, useState } from 'react';
import { api } from '../lib/store.js';
import { MOODS, LENGTHS } from '../lib/messages.js';
import { SIZES } from '../lib/render.js';

function KeyField({ name, label, help, status, onSaved }) {
  const [val, setVal] = useState('');
  return (
    <div className="key-field">
      <label className="lbl">{label} {status ? <span className="badge claude">✔ saved</span> : <span className="badge">not set</span>}</label>
      <div className="row gap">
        <input type="password" placeholder={status ? '•••••••• (saved – type to replace)' : 'Paste your key here'} value={val} onChange={e => setVal(e.target.value)} />
        <button className="btn small primary" disabled={!val.trim()} onClick={async () => { await api.setSecret(name, val); setVal(''); onSaved('Key saved securely'); }}>Save</button>
        {status && <button className="btn small danger" onClick={async () => { await api.setSecret(name, ''); onSaved('Key removed'); }}>Remove</button>}
      </div>
      <p className="muted small">{help}</p>
    </div>
  );
}

export default function Settings({ app }) {
  const { settings, setSettings, notify } = app;
  const [status, setStatus] = useState({ claude: false, openai: false, encrypted: false });
  const refresh = () => api.secretsStatus().then(setStatus);
  useEffect(() => { refresh(); }, []);
  const saved = (m) => { notify(m); refresh(); };
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="page narrow">
      <h1>Settings <span className="urdu small-ur">ترتیبات</span></h1>

      <section className="card">
        <h2>AI connections</h2>
        {!api.isElectron && <p className="note">API keys can only be saved in the desktop app.</p>}
        <KeyField name="claude" label="Claude API key (Urdu messages)" status={status.claude} onSaved={saved}
          help="Get a key at console.anthropic.com. Used only to write Urdu messages. Paid per use (each message costs a fraction of a cent)." />
        <label className="lbl">Claude model</label>
        <input value={settings.claudeModel} onChange={e => set('claudeModel', e.target.value)} />
        <KeyField name="openai" label="OpenAI API key (AI backgrounds)" status={status.openai} onSaved={saved}
          help="Get a key at platform.openai.com. Used only to generate background pictures. Paid per image." />
        <label className="lbl">OpenAI image model</label>
        <select value={settings.imageModel} onChange={e => set('imageModel', e.target.value)}>
          <option value="gpt-image-1">gpt-image-1</option>
          <option value="dall-e-3">dall-e-3</option>
        </select>
        <p className="muted small">{status.encrypted ? '🔒 Keys are encrypted with your Windows account (DPAPI) and never leave this PC except to call the AI service.' : 'Keys are stored locally on this PC.'}</p>
      </section>

      <section className="card">
        <h2>Defaults</h2>
        <div className="grid2">
          <label>Default mood
            <select value={settings.defaultMood} onChange={e => set('defaultMood', e.target.value)}>{MOODS.map(m => <option key={m.id} value={m.id}>{m.en}</option>)}</select>
          </label>
          <label>Default length
            <select value={settings.defaultLength} onChange={e => set('defaultLength', e.target.value)}>{LENGTHS.map(l => <option key={l.id} value={l.id}>{l.en}</option>)}</select>
          </label>
          <label>Default picture size
            <select value={settings.defaultSize} onChange={e => set('defaultSize', e.target.value)}>{SIZES.filter(s => s.id !== 'custom').map(s => <option key={s.id} value={s.id}>{s.en}</option>)}</select>
          </label>
          <label>Theme
            <select value={settings.theme} onChange={e => set('theme', e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>What works offline?</h2>
        <table className="feature-table">
          <thead><tr><th>Feature</th><th>Needs</th></tr></thead>
          <tbody>
            <tr><td>Built-in backgrounds, your own photos, designer, Urdu text, export, copy</td><td>✅ Works offline, free</td></tr>
            <tr><td>Offline message library (hand-written Urdu messages)</td><td>✅ Works offline, free</td></tr>
            <tr><td>Fresh AI-written Urdu messages</td><td>🌐 Internet + Claude API key (paid)</td></tr>
            <tr><td>AI-generated backgrounds</td><td>🌐 Internet + OpenAI API key (paid)</td></tr>
            <tr><td>Copy & open WhatsApp Web</td><td>🌐 Internet</td></tr>
          </tbody>
        </table>
      </section>

      <p className="muted small center">Subah Bakhair Studio · Phase 1 · v0.1.0</p>
    </div>
  );
}
