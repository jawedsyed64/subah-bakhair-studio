import React, { useEffect, useState } from 'react';
import { exportDesign, SIZES, resizeDesign } from '../lib/render.js';
import { api } from '../lib/store.js';

export default function Preview({ app }) {
  const { design, updateDesign, setScreen, notify, setLib, saveDesignToLibrary, oneClick, busy, message } = app;
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(95);
  const [url, setUrl] = useState('');
  const [lastFile, setLastFile] = useState('');

  useEffect(() => {
    let alive = true;
    if (design) exportDesign(design, 'jpeg', 0.9).then(u => alive && setUrl(u));
    return () => { alive = false; };
  }, [design]);

  if (!design) {
    return (
      <div className="page center-empty">
        <p>Nothing to preview yet.</p>
        <button className="btn primary" onClick={() => setScreen('home')}>Create a greeting</button>
      </div>
    );
  }

  const stamp = () => { const d = new Date(); return `SubahBakhair_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`; };

  const save = async () => {
    const dataUrl = await exportDesign(design, format === 'png' ? 'png' : 'jpeg', format === 'hq' ? 1 : quality / 100);
    const res = await api.saveImage({ dataUrl, defaultName: stamp(), format: format === 'png' ? 'png' : 'jpg' });
    if (res.ok) {
      setLastFile(res.filePath || '');
      setLib(l => ({ ...l, exports: [{ name: (res.filePath || stamp()).split(/[\\/]/).pop(), path: res.filePath || '', at: Date.now() }, ...l.exports].slice(0, 50) }));
      notify('Greeting picture saved ✔');
    }
  };
  const copy = async () => {
    const dataUrl = await exportDesign(design, 'png');
    await api.copyImage(dataUrl);
    notify('Picture copied – paste it with Ctrl+V');
  };
  const whatsappWeb = async () => {
    await copy();
    api.openExternal('https://web.whatsapp.com/');
    notify('Picture copied. In WhatsApp Web open a chat and press Ctrl+V to paste it.');
  };

  return (
    <div className="page preview-page">
      <div className="preview-img-wrap">
        {url ? <img className="preview-img" src={url} alt="Greeting preview" /> : <div className="spinner" />}
      </div>
      <aside className="card preview-side">
        <h2>Preview & Share <span className="urdu small-ur">محفوظ کریں اور بھیجیں</span></h2>
        <label className="lbl">Size</label>
        <select value={design.sizeId} onChange={e => updateDesign(d => resizeDesign(d, e.target.value))}>
          {SIZES.filter(s => s.id !== 'custom' || design.sizeId === 'custom').map(s => <option key={s.id} value={s.id}>{s.en} ({s.id === 'custom' ? `${design.width}×${design.height}` : `${s.w}×${s.h}`})</option>)}
        </select>
        <label className="lbl">Format</label>
        <div className="seg">
          <button className={format === 'png' ? 'active' : ''} onClick={() => setFormat('png')}>PNG</button>
          <button className={format === 'jpeg' ? 'active' : ''} onClick={() => setFormat('jpeg')}>JPEG</button>
          <button className={format === 'hq' ? 'active' : ''} onClick={() => setFormat('hq')}>High-quality JPG</button>
        </div>
        {format === 'jpeg' && (
          <label className="slider"><span>JPEG quality<b>{quality}%</b></span>
            <input type="range" min={60} max={100} value={quality} onChange={e => setQuality(+e.target.value)} /></label>
        )}
        <p className="muted small">Exported at full {design.width}×{design.height} resolution. Urdu text is drawn by the app (not the AI), so letters are always correct.</p>

        <button className="btn primary big full" onClick={save}>💾 Save Image</button>
        <button className="btn full" onClick={copy}>📋 Copy Image</button>
        <button className="btn full whatsapp" onClick={whatsappWeb}>🟢 Copy & open WhatsApp Web</button>
        {lastFile && <button className="btn full" onClick={() => api.showFile(lastFile)}>📂 Show saved file in folder</button>}
        <div className="row gap">
          <button className="btn" onClick={() => setScreen('designer')}>✏️ Edit Again</button>
          <button className="btn" onClick={saveDesignToLibrary}>⭐ Save design</button>
          <button className="btn" disabled={!!busy} onClick={() => oneClick(message.mood)}>🔄 New greeting</button>
        </div>
        <p className="muted small">More sharing options (Instagram, Facebook, Telegram, email, Windows Share) arrive in Phase 4. For now, save or copy the picture and paste it into any app.</p>
      </aside>
    </div>
  );
}
