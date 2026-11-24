// Greeting picture renderer. Uses the browser's text engine (HarfBuzz in Chromium), which shapes
// Urdu correctly: right-to-left order, joined letters, Nastaliq ligatures.
import { presetCanvas, BACKGROUNDS } from './backgrounds.js';
import { uid } from './store.js';
import { splitTitle } from './messages.js';

export const SIZES = [
  { id: 'whatsapp', en: 'WhatsApp Status', w: 1080, h: 1920 },
  { id: 'igstory', en: 'Instagram Story', w: 1080, h: 1920 },
  { id: 'igpost', en: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'facebook', en: 'Facebook Post', w: 1200, h: 1200 },
  { id: 'card', en: 'Greeting Card', w: 1080, h: 1350 },
  { id: 'landscape', en: 'Landscape (HD)', w: 1920, h: 1080 },
  { id: 'custom', en: 'Custom', w: 1080, h: 1350 }
];

export const FONTS = [
  { family: 'Noto Nastaliq Urdu', label: 'Noto Nastaliq Urdu (built-in)' },
  { family: 'Jameel Noori Nastaleeq', label: 'Jameel Noori Nastaleeq (if installed)' },
  { family: 'Urdu Typesetting', label: 'Urdu Typesetting (Windows)' },
  { family: 'Noto Naskh Arabic', label: 'Noto Naskh Arabic (built-in)' },
  { family: 'Segoe UI', label: 'Segoe UI (English)' },
  { family: 'Georgia', label: 'Georgia (English)' }
];

const FALLBACK = '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Urdu Typesetting", "Noto Naskh Arabic", "Segoe UI", serif';
export const fontStack = (family) => `"${family}", ${FALLBACK}`;

export const GOLD = 'gold-gradient';

export function makeText(overrides = {}) {
  return {
    id: uid(), text: 'صبح بخیر', x: 0.5, y: 0.5, width: 0.82,
    font: 'Noto Nastaliq Urdu', size: 64, bold: false, color: '#ffffff', align: 'center', lineHeight: 1.9, rotation: 0,
    shadow: true, shadowColor: 'rgba(0,0,0,0.6)', shadowBlur: 14,
    outline: false, outlineColor: '#5a2a00', outlineWidth: 3,
    panel: false, panelColor: '#000000', panelOpacity: 0.35,
    ...overrides
  };
}

/** Build a ready design from a message: automatic placement of title + body */
export function autoDesign(message, bgId, sizeId = 'whatsapp', image = null) {
  const size = SIZES.find(s => s.id === sizeId) || SIZES[0];
  const bg = BACKGROUNDS.find(b => b.id === bgId);
  const tone = image ? 'dark' : (bg ? bg.tone : 'dark');
  const portrait = size.h / size.w;
  const { title, body } = splitTitle(message);
  const light = tone === 'light';
  const titleT = makeText({
    text: title, y: portrait > 1.5 ? 0.2 : portrait > 1.1 ? 0.18 : 0.2, size: portrait > 1.5 ? 140 : portrait > 1.1 ? 124 : 100, width: 0.9,
    color: light ? '#9a5b10' : GOLD, shadow: true, shadowColor: light ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)', shadowBlur: 18,
    outline: !light, outlineColor: 'rgba(70,30,0,0.8)', outlineWidth: 4
  });
  const lines = body.split('\n').length;
  const bodyT = makeText({
    text: body, y: portrait > 1.5 ? 0.58 : portrait > 1.1 ? 0.6 : 0.62,
    size: (portrait > 1.5 ? 64 : portrait > 1.1 ? 56 : 46) * (lines > 5 ? 0.85 : 1), width: 0.84,
    color: light ? '#3a2410' : '#ffffff', shadow: !light, shadowBlur: 10,
    panel: true, panelColor: light ? '#ffffff' : '#000000', panelOpacity: light ? 0.55 : 0.32
  });
  return {
    id: uid(), name: 'صبح بخیر', sizeId: size.id, width: size.w, height: size.h,
    bg: { type: image ? 'image' : 'preset', id: bgId || 'sunrise-meadow', image, zoom: 1, offsetX: 0, offsetY: 0, brightness: 100, contrast: 100, saturation: 100, blur: 0, darken: tone === 'dark' && image ? 0.25 : 0 },
    border: 'none',
    texts: [titleT, bodyT],
    updatedAt: Date.now()
  };
}

export function resizeDesign(design, sizeId, w, h) {
  const s = SIZES.find(x => x.id === sizeId);
  return { ...design, sizeId, width: w || s.w, height: h || s.h };
}

// ---------- image loading ----------
const imgCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  imgCache.set(src, p);
  if (imgCache.size > 30) imgCache.delete(imgCache.keys().next().value);
  return p;
}

export async function ensureFonts(design) {
  if (!document.fonts) return;
  const fams = new Set(design.texts.map(t => t.font).concat(['Noto Nastaliq Urdu']));
  await Promise.all([...fams].map(f => document.fonts.load(`64px "${f}"`, 'صبح بخیر').catch(() => null)));
}

// ---------- text layout ----------
export function wrapLines(ctx, text, maxWidth) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = line + ' ' + words[i];
      if (ctx.measureText(test).width <= maxWidth) line = test; else { out.push(line); line = words[i]; }
    }
    out.push(line);
  }
  return out;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function hexToRgba(hex, a) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

function drawBorder(ctx, W, H, style) {
  if (!style || style === 'none') return;
  const u = Math.min(W, H);
  ctx.save();
  if (style === 'gold' || style === 'double') {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f7e08a'); g.addColorStop(0.5, '#c8962e'); g.addColorStop(1, '#f7e08a');
    ctx.strokeStyle = g; ctx.lineWidth = u * 0.012; const m = u * 0.035; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    if (style === 'double') { ctx.lineWidth = u * 0.004; const m2 = u * 0.055; ctx.strokeRect(m2, m2, W - 2 * m2, H - 2 * m2); }
  } else if (style === 'white') {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = u * 0.02; const m = u * 0.03; roundRect(ctx, m, m, W - 2 * m, H - 2 * m, u * 0.04); ctx.stroke();
  } else if (style === 'corners') {
    ctx.strokeStyle = '#e6c06a'; ctx.lineWidth = u * 0.008; const m = u * 0.04, L = u * 0.16;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + dy * L); ctx.lineTo(x, y); ctx.lineTo(x + dx * L, y); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + dx * u * 0.03, y + dy * u * 0.03, u * 0.008, 0, Math.PI * 2); ctx.fillStyle = '#e6c06a'; ctx.fill();
    });
  }
  ctx.restore();
}

/**
 * Render a design onto ctx at full resolution.
 * Returns the bounding boxes of text items (for hit-testing in the editor).
 */
export function renderDesign(ctx, design, bgImage, opts = {}) {
  const W = design.width, H = design.height, b = design.bg;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H);

  // background
  const filter = `brightness(${b.brightness}%) contrast(${b.contrast}%) saturate(${b.saturation}%)` + (b.blur > 0 ? ` blur(${b.blur * W / 1080}px)` : '');
  ctx.filter = filter;
  if (b.type === 'image' && bgImage) {
    const scale = Math.max(W / bgImage.width, H / bgImage.height) * (b.zoom || 1);
    const dw = bgImage.width * scale, dh = bgImage.height * scale;
    const dx = (W - dw) / 2 + (b.offsetX || 0) * W, dy = (H - dh) / 2 + (b.offsetY || 0) * H;
    ctx.drawImage(bgImage, dx, dy, dw, dh);
  } else {
    ctx.drawImage(presetCanvas(b.id, W, H), 0, 0);
  }
  ctx.filter = 'none';
  if (b.darken > 0) { ctx.fillStyle = `rgba(0,0,0,${b.darken})`; ctx.fillRect(0, 0, W, H); }

  drawBorder(ctx, W, H, design.border);

  // guides
  if (opts.guides) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,0,140,0.8)'; ctx.lineWidth = Math.max(2, W / 540); ctx.setLineDash([12, 10]);
    if (opts.guides.v) { ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); }
    if (opts.guides.h) { ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); }
    ctx.restore();
  }

  // texts
  const boxes = [];
  const scale = W / 1080;
  for (const t of design.texts) {
    if (!t.text || !t.text.trim()) continue;
    const fontPx = t.size * scale;
    ctx.save();
    ctx.font = `${t.bold ? 'bold ' : ''}${fontPx}px ${fontStack(t.font)}`;
    ctx.direction = 'rtl';
    ctx.textBaseline = 'middle';
    const maxW = t.width * W;
    const lines = wrapLines(ctx, t.text, maxW);
    const lh = fontPx * t.lineHeight;
    const lineWidths = lines.map(l => ctx.measureText(l).width);
    const boxW = Math.min(maxW, Math.max(...lineWidths, fontPx));
    const blockH = lines.length * lh;
    const pad = fontPx * 0.5;
    const cx = t.x * W, cy = t.y * H;
    ctx.translate(cx, cy);
    ctx.rotate((t.rotation || 0) * Math.PI / 180);

    if (t.panel) {
      ctx.fillStyle = hexToRgba(t.panelColor, t.panelOpacity);
      roundRect(ctx, -boxW / 2 - pad, -blockH / 2 - pad * 0.6, boxW + pad * 2, blockH + pad * 1.2, fontPx * 0.45);
      ctx.fill();
    }

    let fill = t.color;
    if (t.color === GOLD) {
      const g = ctx.createLinearGradient(0, -blockH / 2, 0, blockH / 2);
      g.addColorStop(0, '#fff3b0'); g.addColorStop(0.45, '#f4c542'); g.addColorStop(0.55, '#d99a1e'); g.addColorStop(1, '#ffe27a');
      fill = g;
    }
    const xFor = (i) => t.align === 'right' ? boxW / 2 : t.align === 'left' ? -boxW / 2 : 0;
    ctx.textAlign = t.align === 'right' ? 'right' : t.align === 'left' ? 'left' : 'center';
    lines.forEach((line, i) => {
      const y = -blockH / 2 + lh * (i + 0.5);
      if (t.outline) {
        ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = t.outlineColor; ctx.lineWidth = t.outlineWidth * scale * 2;
        if (t.shadow) { ctx.shadowColor = t.shadowColor; ctx.shadowBlur = t.shadowBlur * scale; ctx.shadowOffsetY = 3 * scale; }
        ctx.strokeText(line, xFor(i), y); ctx.restore();
      }
      if (t.shadow && !t.outline) { ctx.shadowColor = t.shadowColor; ctx.shadowBlur = t.shadowBlur * scale; ctx.shadowOffsetY = 3 * scale; }
      ctx.fillStyle = fill;
      ctx.fillText(line, xFor(i), y);
      ctx.shadowColor = 'transparent';
    });

    if (opts.selectedId === t.id) {
      ctx.strokeStyle = '#ff9a1f'; ctx.lineWidth = Math.max(2, 3 * scale); ctx.setLineDash([10 * scale, 8 * scale]);
      ctx.strokeRect(-boxW / 2 - pad, -blockH / 2 - pad * 0.6, boxW + pad * 2, blockH + pad * 1.2);
    }
    ctx.restore();
    boxes.push({ id: t.id, cx, cy, w: boxW + pad * 2, h: blockH + pad * 1.2, rot: (t.rotation || 0) * Math.PI / 180 });
  }
  ctx.restore();
  return boxes;
}

export function hitTest(boxes, x, y) {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const b = boxes[i];
    const dx = x - b.cx, dy = y - b.cy;
    const lx = dx * Math.cos(-b.rot) - dy * Math.sin(-b.rot);
    const ly = dx * Math.sin(-b.rot) + dy * Math.cos(-b.rot);
    if (Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2) return b.id;
  }
  return null;
}

/** Render a design to a data URL (PNG or JPEG) at full resolution */
export async function exportDesign(design, format = 'png', quality = 0.95) {
  await ensureFonts(design);
  const img = design.bg.type === 'image' ? await loadImage(design.bg.image) : null;
  const c = document.createElement('canvas'); c.width = design.width; c.height = design.height;
  renderDesign(c.getContext('2d'), design, img);
  return format === 'png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality);
}

export async function designThumb(design, w = 240) {
  await ensureFonts(design);
  const img = design.bg.type === 'image' ? await loadImage(design.bg.image) : null;
  const full = document.createElement('canvas'); full.width = design.width; full.height = design.height;
  renderDesign(full.getContext('2d'), design, img);
  const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * design.height / design.width);
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(full, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
