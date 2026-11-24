import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BACKGROUNDS, BG_CATEGORIES, thumbnail } from '../lib/backgrounds.js';
import { renderDesign, hitTest, loadImage, ensureFonts, makeText, SIZES, FONTS, GOLD, resizeDesign } from '../lib/render.js';
import { api, uid } from '../lib/store.js';

const SWATCHES = ['#ffffff', GOLD, '#fff3c4', '#ffd166', '#ff9f1c', '#e63946', '#ff6fa3', '#9b5de5', '#3a86ff', '#2a9d8f', '#1b4332', '#3a2410', '#000000'];
const EMOJIS = ['🌸', '🌹', '🌻', '🌷', '☀️', '🌅', '🦋', '🕊️', '☕', '💐', '✨', '🤲', '🕌', '❤️', '😊'];

function downscale(dataUrl, max = 2600) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height));
      if (s === 1) return res(dataUrl);
      const c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.92));
    };
    im.onerror = () => res(dataUrl);
    im.src = dataUrl;
  });
}

function Slider({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <label className="slider">
      <span>{label}<b>{Math.round(value * 100) / 100}{suffix}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

export default function Designer({ app }) {
  const { design, updateDesign, replaceDesign, undo, redo, canUndo, canRedo, setScreen, lib, setLib, settings, busy, setBusy, notify, saveDesignToLibrary, message } = app;
  const canvasRef = useRef(null);
  const boxesRef = useRef([]);
  const dragRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [guides, setGuides] = useState(null);
  const [cat, setCat] = useState('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [tab, setTab] = useState('text');
  const [fontList, setFontList] = useState(FONTS);
  const [fontTick, setFontTick] = useState(0);
  const [bgImg, setBgImg] = useState(null);

  const thumbs = useMemo(() => BACKGROUNDS.map(b => ({ ...b, thumb: thumbnail(b.id) })), []);

  // background image
  useEffect(() => {
    let alive = true;
    if (design && design.bg.type === 'image') loadImage(design.bg.image).then(im => alive && setBgImg(im));
    else setBgImg(null);
    return () => { alive = false; };
  }, [design && design.bg.type, design && design.bg.image]);

  // fonts: redraw once loaded
  useEffect(() => {
    if (!design) return;
    ensureFonts(design).then(() => setFontTick(t => t + 1));
    const onDone = () => setFontTick(t => t + 1);
    document.fonts && document.fonts.addEventListener('loadingdone', onDone);
    return () => document.fonts && document.fonts.removeEventListener('loadingdone', onDone);
  }, [design && design.texts.map(t => t.font).join('|')]);

  // draw
  useEffect(() => {
    const c = canvasRef.current; if (!c || !design) return;
    const id = requestAnimationFrame(() => {
      c.width = design.width; c.height = design.height;
      boxesRef.current = renderDesign(c.getContext('2d'), design, bgImg, { selectedId, guides });
    });
    return () => cancelAnimationFrame(id);
  }, [design, bgImg, selectedId, guides, fontTick]);

  useEffect(() => {
    if (design && !selectedId && design.texts[1]) setSelectedId(design.texts[1].id);
  }, [design && design.id]);

  if (!design) {
    return (
      <div className="page center-empty">
        <div className="urdu empty-ur">صبح بخیر</div>
        <p>No design open yet.</p>
        <div className="row gap">
          <button className="btn primary" onClick={() => setScreen('home')}>Start from Home</button>
          <button className="btn" onClick={() => setScreen('message')}>Write a message</button>
        </div>
      </div>
    );
  }

  const sel = design.texts.find(t => t.id === selectedId);
  const setText = (k, v) => updateDesign(d => ({ ...d, texts: d.texts.map(t => t.id === selectedId ? { ...t, [k]: v } : t) }), 'text-' + k + selectedId);
  const setBg = (k, v) => updateDesign(d => ({ ...d, bg: { ...d.bg, [k]: v } }), 'bg-' + k);

  // ---- canvas pointer interaction ----
  const toCanvas = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * design.width / r.width, y: (e.clientY - r.top) * design.height / r.height };
  };
  const onDown = (e) => {
    const p = toCanvas(e);
    const id = hitTest(boxesRef.current, p.x, p.y);
    setSelectedId(id);
    if (id) {
      const t = design.texts.find(x => x.id === id);
      dragRef.current = { id, sx: p.x, sy: p.y, ox: t.x, oy: t.y, key: 'drag-' + id + Date.now() };
      canvasRef.current.setPointerCapture(e.pointerId);
      setTab('text');
    }
  };
  const onMove = (e) => {
    const dr = dragRef.current; if (!dr) return;
    const p = toCanvas(e);
    let nx = dr.ox + (p.x - dr.sx) / design.width, ny = dr.oy + (p.y - dr.sy) / design.height;
    const g = { v: Math.abs(nx - 0.5) < 0.012, h: Math.abs(ny - 0.5) < 0.008 };
    if (g.v) nx = 0.5; if (g.h) ny = 0.5;
    setGuides(g.v || g.h ? g : null);
    updateDesign(d => ({ ...d, texts: d.texts.map(t => t.id === dr.id ? { ...t, x: nx, y: ny } : t) }), dr.key);
  };
  const onUp = () => { dragRef.current = null; setGuides(null); };

  // ---- background actions ----
  const choosePreset = (id) => updateDesign(d => ({ ...d, bg: { ...d.bg, type: 'preset', id, image: null, zoom: 1, offsetX: 0, offsetY: 0 } }));
  const chooseImage = (dataUrl) => updateDesign(d => ({ ...d, bg: { ...d.bg, type: 'image', image: dataUrl, zoom: 1, offsetX: 0, offsetY: 0, darken: d.bg.darken || 0.2 } }));
  const addMyImage = (dataUrl, name) => setLib(l => ({ ...l, myImages: [{ id: uid(), dataUrl, name, at: Date.now() }, ...l.myImages].slice(0, 30) }));

  const onUpload = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = async () => { const url = await downscale(fr.result); addMyImage(url, f.name); chooseImage(url); setCat('mine'); };
    fr.readAsDataURL(f);
    e.target.value = '';
  };

  const generateAiBackground = async () => {
    if (!aiPrompt.trim()) { notify('Describe the background you want first'); return; }
    if (api.isElectron) {
      const st = await api.secretsStatus();
      if (!st.openai) { notify('Add your OpenAI API key in Settings to generate AI backgrounds'); return; }
    }
    setBusy('image');
    try {
      const portrait = design.height > design.width * 1.15, landscape = design.width > design.height * 1.15;
      const size = portrait ? '1024x1536' : landscape ? '1536x1024' : '1024x1024';
      const prompt = `${aiPrompt.trim()}. Beautiful, soft, peaceful morning atmosphere, high quality, suitable as a greeting card background with calm open space for text. Absolutely no text, no letters, no words, no writing, no calligraphy, no watermark.`;
      const res = await api.aiImage({ prompt, model: settings.imageModel, size: settings.imageModel.startsWith('dall-e') ? (portrait ? '1024x1792' : landscape ? '1792x1024' : '1024x1024') : size });
      if (!res.ok) { notify('AI image failed: ' + res.error); return; }
      addMyImage(res.dataUrl, 'AI: ' + aiPrompt.trim().slice(0, 40));
      chooseImage(res.dataUrl); setCat('mine');
    } finally { setBusy(''); }
  };

  // ---- text actions ----
  const addText = (overrides = {}) => {
    const t = makeText({ text: 'نیا متن', y: 0.4, size: 56, ...overrides });
    updateDesign(d => ({ ...d, texts: [...d.texts, t] }));
    setSelectedId(t.id);
  };
  const deleteText = () => { if (!sel) return; updateDesign(d => ({ ...d, texts: d.texts.filter(t => t.id !== sel.id) })); setSelectedId(null); };

  const loadInstalledFonts = async () => {
    try {
      if (!window.queryLocalFonts) { notify('Listing installed fonts is not supported here'); return; }
      const fonts = await window.queryLocalFonts();
      const fams = [...new Set(fonts.map(f => f.family))].sort();
      const urduFirst = fams.filter(f => /nastal|naskh|urdu|nafees|jameel|alvi|arab|mehr|faiz/i.test(f));
      const rest = fams.filter(f => !urduFirst.includes(f));
      const known = new Set(FONTS.map(f => f.family));
      setFontList([...FONTS, ...urduFirst.filter(f => !known.has(f)).map(f => ({ family: f, label: f + ' ★' })), ...rest.filter(f => !known.has(f)).map(f => ({ family: f, label: f }))]);
      notify(`Found ${fams.length} installed fonts (${urduFirst.length} likely Urdu/Arabic)`);
    } catch (err) { notify('Could not read installed fonts: ' + err.message); }
  };

  const filtered = cat === 'all' ? thumbs : thumbs.filter(b => b.cat === cat);

  return (
    <div className="designer">
      <div className="toolbar">
        <button className="btn small" onClick={undo} disabled={!canUndo} title="Ctrl+Z">↶ Undo</button>
        <button className="btn small" onClick={redo} disabled={!canRedo} title="Ctrl+Y">↷ Redo</button>
        <span className="sep" />
        <select value={design.sizeId} onChange={e => updateDesign(d => resizeDesign(d, e.target.value))}>
          {SIZES.map(s => <option key={s.id} value={s.id}>{s.en}{s.id !== 'custom' ? ` (${s.w}×${s.h})` : ''}</option>)}
        </select>
        {design.sizeId === 'custom' && (
          <>
            <input className="num" type="number" min={300} max={6000} value={design.width} onChange={e => updateDesign(d => ({ ...d, width: Math.max(300, Math.min(6000, +e.target.value || 1080)) }), 'cw')} />
            ×
            <input className="num" type="number" min={300} max={6000} value={design.height} onChange={e => updateDesign(d => ({ ...d, height: Math.max(300, Math.min(6000, +e.target.value || 1350)) }), 'ch')} />
          </>
        )}
        <span className="grow" />
        <button className="btn small" onClick={saveDesignToLibrary}>💾 Save</button>
        <button className="btn small primary" onClick={() => setScreen('preview')}>👁 Preview & Export</button>
      </div>

      <div className="designer-body">
        {/* LEFT: background library */}
        <aside className="panel left">
          <h3>Backgrounds</h3>
          <div className="chip-wrap tight">
            {BG_CATEGORIES.map(c => <button key={c.id} className={'chip small' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>{c.en}</button>)}
          </div>
          <label className="btn small full upload">📁 Upload your photo<input type="file" accept="image/*" onChange={onUpload} hidden /></label>
          <div className="ai-box">
            <textarea rows={2} value={aiPrompt} placeholder="AI background, e.g. Pink roses covered with morning dew" onChange={e => setAiPrompt(e.target.value)} />
            <button className="btn small full" disabled={!!busy} onClick={generateAiBackground}>🪄 Generate with AI (OpenAI)</button>
          </div>
          <div className="bg-grid">
            {cat === 'mine'
              ? (lib.myImages.length ? lib.myImages.map(m => (
                <button key={m.id} className={'bg-thumb' + (design.bg.type === 'image' && design.bg.image === m.dataUrl ? ' active' : '')} title={m.name} onClick={() => chooseImage(m.dataUrl)}>
                  <img src={m.dataUrl} alt="" />
                </button>)) : <p className="muted small">Upload a photo or generate one with AI.</p>)
              : filtered.map(b => (
                <button key={b.id} className={'bg-thumb' + (design.bg.type === 'preset' && design.bg.id === b.id ? ' active' : '')} title={b.name} onClick={() => choosePreset(b.id)}>
                  <img src={b.thumb} alt={b.name} />
                </button>))}
          </div>
        </aside>

        {/* CENTER: canvas */}
        <section className="canvas-wrap">
          <canvas ref={canvasRef} className="canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          <div className="canvas-hint">Drag text to move it · pink lines show the centre</div>
        </section>

        {/* RIGHT: controls */}
        <aside className="panel right">
          <div className="seg full">
            <button className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>Text</button>
            <button className={tab === 'bg' ? 'active' : ''} onClick={() => setTab('bg')}>Background</button>
          </div>

          {tab === 'text' && (
            <>
              <div className="layers">
                {design.texts.map((t, i) => (
                  <button key={t.id} className={'layer' + (t.id === selectedId ? ' active' : '')} onClick={() => setSelectedId(t.id)}>
                    <span className="urdu">{(t.text || '…').split('\n')[0].slice(0, 22)}</span>
                  </button>
                ))}
              </div>
              <div className="row gap">
                <button className="btn small" onClick={() => addText()}>＋ Text box</button>
                {message.text && <button className="btn small" onClick={() => addText({ text: message.text, size: 48, panel: true })}>＋ Current message</button>}
                <button className="btn small danger" disabled={!sel} onClick={deleteText}>🗑</button>
              </div>
              <div className="emoji-row">{EMOJIS.map(em => <button key={em} onClick={() => addText({ text: em, size: 90, shadow: false, font: 'Segoe UI Emoji', y: 0.08 + Math.random() * 0.1, x: 0.15 + Math.random() * 0.7 })}>{em}</button>)}</div>

              {sel ? (
                <div className="controls">
                  <textarea className="urdu" dir="rtl" rows={4} value={sel.text} onChange={e => setText('text', e.target.value)} />
                  <label className="lbl">Font</label>
                  <select value={sel.font} onChange={e => setText('font', e.target.value)}>
                    {fontList.map(f => <option key={f.family} value={f.family}>{f.label}</option>)}
                  </select>
                  <button className="link" onClick={loadInstalledFonts}>Show all fonts installed on this PC</button>
                  <Slider label="Size" value={sel.size} min={16} max={260} onChange={v => setText('size', v)} />
                  <Slider label="Line spacing" value={sel.lineHeight} min={1} max={3} step={0.05} onChange={v => setText('lineHeight', v)} />
                  <Slider label="Text width" value={Math.round(sel.width * 100)} min={20} max={98} suffix="%" onChange={v => setText('width', v / 100)} />
                  <Slider label="Rotation" value={sel.rotation} min={-45} max={45} suffix="°" onChange={v => setText('rotation', v)} />
                  <label className="lbl">Alignment</label>
                  <div className="seg">
                    {[['right', 'Right ⇥'], ['center', 'Centre'], ['left', '⇤ Left']].map(([a, l]) => <button key={a} className={sel.align === a ? 'active' : ''} onClick={() => setText('align', a)}>{l}</button>)}
                  </div>
                  <div className="row gap">
                    <button className={'btn small' + (sel.bold ? ' on' : '')} onClick={() => setText('bold', !sel.bold)}><b>B</b> Bold</button>
                    <button className="btn small" onClick={() => setText('x', 0.5)}>Centre horizontally</button>
                  </div>
                  <label className="lbl">Colour</label>
                  <div className="swatches">
                    {SWATCHES.map(c => <button key={c} className={'sw' + (sel.color === c ? ' active' : '') + (c === GOLD ? ' gold' : '')} style={c === GOLD ? {} : { background: c }} title={c === GOLD ? 'Gold gradient' : c} onClick={() => setText('color', c)} />)}
                    <input type="color" value={sel.color === GOLD ? '#f4c542' : sel.color} onChange={e => setText('color', e.target.value)} />
                  </div>

                  <div className="toggle-block">
                    <label className="chk"><input type="checkbox" checked={sel.shadow} onChange={e => setText('shadow', e.target.checked)} /> Shadow</label>
                    {sel.shadow && <Slider label="Shadow softness" value={sel.shadowBlur} min={0} max={40} onChange={v => setText('shadowBlur', v)} />}
                  </div>
                  <div className="toggle-block">
                    <label className="chk"><input type="checkbox" checked={sel.outline} onChange={e => setText('outline', e.target.checked)} /> Outline</label>
                    {sel.outline && <div className="row gap"><input type="color" value={/^#/.test(sel.outlineColor) ? sel.outlineColor : '#5a2a00'} onChange={e => setText('outlineColor', e.target.value)} /><Slider label="Width" value={sel.outlineWidth} min={1} max={12} onChange={v => setText('outlineWidth', v)} /></div>}
                  </div>
                  <div className="toggle-block">
                    <label className="chk"><input type="checkbox" checked={sel.panel} onChange={e => setText('panel', e.target.checked)} /> Transparent panel behind text</label>
                    {sel.panel && <div className="row gap"><input type="color" value={sel.panelColor} onChange={e => setText('panelColor', e.target.value)} /><Slider label="Opacity" value={sel.panelOpacity} min={0.05} max={0.95} step={0.05} onChange={v => setText('panelOpacity', v)} /></div>}
                  </div>
                </div>
              ) : <p className="muted">Click a text on the picture to edit it.</p>}
            </>
          )}

          {tab === 'bg' && (
            <div className="controls">
              <Slider label="Brightness" value={design.bg.brightness} min={30} max={170} suffix="%" onChange={v => setBg('brightness', v)} />
              <Slider label="Contrast" value={design.bg.contrast} min={30} max={170} suffix="%" onChange={v => setBg('contrast', v)} />
              <Slider label="Saturation" value={design.bg.saturation} min={0} max={200} suffix="%" onChange={v => setBg('saturation', v)} />
              <Slider label="Blur" value={design.bg.blur} min={0} max={30} onChange={v => setBg('blur', v)} />
              <Slider label="Darken (helps text stand out)" value={design.bg.darken} min={0} max={0.8} step={0.05} onChange={v => setBg('darken', v)} />
              {design.bg.type === 'image' && (
                <>
                  <h4>Crop & position photo</h4>
                  <Slider label="Zoom" value={design.bg.zoom} min={1} max={3} step={0.05} onChange={v => setBg('zoom', v)} />
                  <Slider label="Move left / right" value={design.bg.offsetX} min={-0.5} max={0.5} step={0.01} onChange={v => setBg('offsetX', v)} />
                  <Slider label="Move up / down" value={design.bg.offsetY} min={-0.5} max={0.5} step={0.01} onChange={v => setBg('offsetY', v)} />
                </>
              )}
              <label className="lbl">Border</label>
              <select value={design.border} onChange={e => updateDesign(d => ({ ...d, border: e.target.value }))}>
                <option value="none">No border</option>
                <option value="gold">Gold frame</option>
                <option value="double">Double gold frame</option>
                <option value="white">Soft white frame</option>
                <option value="corners">Decorative corners</option>
              </select>
              <button className="btn small" onClick={() => updateDesign(d => ({ ...d, bg: { ...d.bg, brightness: 100, contrast: 100, saturation: 100, blur: 0, darken: 0 } }))}>Reset adjustments</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
