// Built-in background library. Every background is painted with code at the exact export size,
// so it is always sharp (portrait or landscape) and works fully offline.

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function vgrad(ctx, W, H, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
}
function sun(ctx, x, y, r) {
  glow(ctx, x, y, r * 6, 'rgba(255,220,150,0.9)', 0.7);
  glow(ctx, x, y, r * 2.4, 'rgba(255,240,200,1)', 0.9);
  ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function hills(ctx, W, H, baseY, amp, color, seed, waves = 2) {
  const r = rng(seed); const ph = r() * 6;
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += W / 60) {
    const y = baseY + Math.sin(x / W * Math.PI * waves + ph) * amp + Math.sin(x / W * Math.PI * waves * 2.3 + ph * 2) * amp * 0.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function mountains(ctx, W, H, baseY, height, color, seed, peaks = 5) {
  const r = rng(seed);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, baseY);
  const step = W / peaks;
  for (let i = 0; i < peaks; i++) {
    const px = step * i + step * (0.3 + r() * 0.4);
    ctx.lineTo(px, baseY - height * (0.5 + r() * 0.5));
    ctx.lineTo(step * (i + 1), baseY - height * r() * 0.2);
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function clouds(ctx, W, H, n, seed, color = 'rgba(255,255,255,0.35)', maxY = 0.5) {
  const r = rng(seed); ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const cx = r() * W, cy = r() * H * maxY, s = W * (0.06 + r() * 0.08);
    for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.ellipse(cx + (j - 2) * s * 0.7, cy + Math.sin(j) * s * 0.2, s, s * 0.45, 0, 0, Math.PI * 2); ctx.fill(); }
  }
}
function bokeh(ctx, W, H, n, seed, colors, minR = 0.01, maxR = 0.05, alpha = 0.35) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, rad = W * (minR + r() * (maxR - minR));
    glow(ctx, x, y, rad, colors[i % colors.length], alpha * (0.5 + r() * 0.5));
  }
}
function stars(ctx, W, H, n, seed, maxY = 0.45) {
  const r = rng(seed); ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) { ctx.globalAlpha = 0.3 + r() * 0.7; ctx.beginPath(); ctx.arc(r() * W, r() * H * maxY, W * 0.0015 * (1 + r() * 1.5), 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function rose(ctx, x, y, s, petal, dark) {
  for (let ring = 4; ring >= 1; ring--) {
    const n = 4 + ring;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + ring * 0.6;
      ctx.fillStyle = ring % 2 ? petal : dark;
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * s * ring * 0.18, y + Math.sin(a) * s * ring * 0.18, s * 0.22 * ring * 0.55 + s * 0.12, s * 0.16 * ring * 0.5 + s * 0.08, a, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(x, y, s * 0.1, 0, Math.PI * 2); ctx.fill();
}
function leaf(ctx, x, y, s, a, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.5, -s * 0.35, s, 0); ctx.quadraticCurveTo(s * 0.5, s * 0.35, 0, 0); ctx.fill(); ctx.restore();
}
function sunflower(ctx, x, y, s) {
  ctx.fillStyle = '#2f7a2f'; ctx.fillRect(x - s * 0.04, y, s * 0.08, s * 3);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; ctx.fillStyle = i % 2 ? '#ffc61a' : '#ffb000'; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55, s * 0.38, s * 0.13, a, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#5a3412'; ctx.beginPath(); ctx.arc(x, y, s * 0.36, 0, Math.PI * 2); ctx.fill();
}
function butterfly(ctx, x, y, s, a, c1, c2) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  [[-1], [1]].forEach(([d]) => {
    ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(d * s * 0.45, -s * 0.25, s * 0.45, s * 0.35, d * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(d * s * 0.35, s * 0.3, s * 0.3, s * 0.25, -d * 0.4, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.06, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function starPattern(ctx, W, H, size, color, lw) {
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  for (let y = 0; y < H + size; y += size) for (let x = 0; x < W + size; x += size) {
    const cx = x, cy = y, r = size * 0.42;
    for (const rot of [0, Math.PI / 4]) {
      ctx.beginPath();
      for (let k = 0; k < 4; k++) { const a = rot + k * Math.PI / 2 + Math.PI / 4; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + size / 2, cy); ctx.lineTo(cx + size / 2, cy + size); ctx.stroke();
  }
}
function mosque(ctx, W, H, baseY, color) {
  const cx = W / 2, u = Math.min(W, H * 0.75);
  ctx.fillStyle = color;
  // body
  ctx.fillRect(cx - u * 0.3, baseY - u * 0.18, u * 0.6, u * 0.18);
  // main dome
  ctx.beginPath(); ctx.moveTo(cx - u * 0.17, baseY - u * 0.18);
  ctx.bezierCurveTo(cx - u * 0.2, baseY - u * 0.42, cx - u * 0.02, baseY - u * 0.44, cx, baseY - u * 0.5);
  ctx.bezierCurveTo(cx + u * 0.02, baseY - u * 0.44, cx + u * 0.2, baseY - u * 0.42, cx + u * 0.17, baseY - u * 0.18);
  ctx.fill();
  ctx.fillRect(cx - u * 0.004, baseY - u * 0.56, u * 0.008, u * 0.07);
  ctx.beginPath(); ctx.arc(cx, baseY - u * 0.575, u * 0.018, 0.3 * Math.PI, 1.7 * Math.PI, true); ctx.lineWidth = u * 0.006; ctx.strokeStyle = color; ctx.stroke();
  // small domes
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.arc(cx + d * u * 0.22, baseY - u * 0.18, u * 0.06, Math.PI, 0); ctx.fill();
  }
  // minarets
  for (const d of [-1, 1]) {
    const mx = cx + d * u * 0.4;
    ctx.fillRect(mx - u * 0.022, baseY - u * 0.52, u * 0.044, u * 0.52);
    ctx.fillRect(mx - u * 0.035, baseY - u * 0.4, u * 0.07, u * 0.015);
    ctx.fillRect(mx - u * 0.032, baseY - u * 0.25, u * 0.064, u * 0.012);
    ctx.beginPath(); ctx.moveTo(mx - u * 0.026, baseY - u * 0.52); ctx.lineTo(mx, baseY - u * 0.6); ctx.lineTo(mx + u * 0.026, baseY - u * 0.52); ctx.fill();
  }
  ctx.fillRect(0, baseY, W, H - baseY);
}
function vignette(ctx, W, H, strength = 0.35) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// tone: 'dark' = light text reads best, 'light' = dark text reads best
export const BACKGROUNDS = [
  { id: 'sunrise-meadow', name: 'Sunrise Meadow', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#24407a'], [0.45, '#e9866b'], [0.68, '#ffd38a'], [1, '#ffe9b8']]);
    clouds(ctx, W, H, 5, 3, 'rgba(255,220,200,0.25)', 0.45);
    sun(ctx, W * 0.5, H * 0.66, W * 0.07);
    hills(ctx, W, H, H * 0.74, H * 0.03, '#6f9a4a', 11, 1.5);
    hills(ctx, W, H, H * 0.8, H * 0.035, '#4f7d36', 12, 2.2);
    hills(ctx, W, H, H * 0.88, H * 0.03, '#35602a', 13, 3);
  } },
  { id: 'golden-sky', name: 'Golden Sky', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#7a3e6b'], [0.4, '#e2725b'], [0.75, '#ffbb5c'], [1, '#ffe08a']]);
    sun(ctx, W * 0.7, H * 0.72, W * 0.08);
    clouds(ctx, W, H, 7, 21, 'rgba(255,200,170,0.3)', 0.8);
    hills(ctx, W, H, H * 0.9, H * 0.02, '#3b2238', 22, 2);
  } },
  { id: 'mountain-lake', name: 'Mountain Lake', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#3c5f95'], [0.45, '#b8a5c9'], [0.62, '#ffd1a8'], [0.63, '#9fb7d4'], [1, '#4c6f9a']]);
    sun(ctx, W * 0.3, H * 0.56, W * 0.05);
    mountains(ctx, W, H, H * 0.63, H * 0.2, '#6c6a9a', 31, 4);
    mountains(ctx, W, H, H * 0.63, H * 0.12, '#4b4a7a', 32, 6);
    ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(0, H * 1.26); ctx.scale(1, -1);
    mountains(ctx, W, H, H * 0.63, H * 0.12, '#4b4a7a', 32, 6); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 12; i++) ctx.fillRect(W * (0.1 + (i * 37 % 80) / 100), H * (0.66 + i * 0.025), W * 0.2, H * 0.002);
  } },
  { id: 'beach-morning', name: 'Beach Morning', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#5b8fd1'], [0.5, '#ffc89a'], [0.62, '#ffe2b5']]);
    sun(ctx, W * 0.5, H * 0.6, W * 0.06);
    const g = ctx.createLinearGradient(0, H * 0.62, 0, H * 0.8); g.addColorStop(0, '#4f9fc7'); g.addColorStop(1, '#2f7aa8');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.62, W, H * 0.2);
    hills(ctx, W, H, H * 0.82, H * 0.01, '#f2d6a2', 41, 1);
    hills(ctx, W, H, H * 0.86, H * 0.008, '#e8c48a', 42, 1.3);
    clouds(ctx, W, H, 4, 43, 'rgba(255,255,255,0.4)', 0.35);
  } },
  { id: 'green-garden', name: 'Sunlight Through Trees', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#1f4d2c'], [0.5, '#3f7d3a'], [1, '#183b22']]);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(255,240,170,${0.05 + i * 0.012})`;
      ctx.beginPath(); ctx.moveTo(W * (0.55 + i * 0.05), 0); ctx.lineTo(W * (0.6 + i * 0.05), 0); ctx.lineTo(W * (0.05 + i * 0.12), H); ctx.lineTo(W * (-0.05 + i * 0.12), H); ctx.fill();
    }
    ctx.restore();
    glow(ctx, W * 0.75, 0, W * 0.6, 'rgba(255,245,190,0.8)', 0.6);
    bokeh(ctx, W, H, 50, 51, ['rgba(190,240,140,1)', 'rgba(255,250,200,1)'], 0.01, 0.04, 0.35);
    const r = rng(52); for (let i = 0; i < 40; i++) leaf(ctx, r() * W, r() < 0.5 ? r() * H * 0.15 : H - r() * H * 0.15, W * (0.06 + r() * 0.06), r() * 6.28, r() < 0.5 ? '#2f6b2a' : '#4c8f3a');
  } },
  { id: 'sunflower-field', name: 'Sunflower Field', cat: 'flowers', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#3f8fd6'], [0.6, '#a8d8f5'], [1, '#d8f0ff']]);
    clouds(ctx, W, H, 5, 61, 'rgba(255,255,255,0.7)', 0.4);
    hills(ctx, W, H, H * 0.78, H * 0.015, '#4f8f2f', 62, 1);
    const r = rng(63);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 6 + row * 2; i++) {
      const s = W * (0.05 + row * 0.03);
      sunflower(ctx, W * (i + 0.5 + (r() - 0.5) * 0.5) / (6 + row * 2), H * (0.78 + row * 0.07), s);
    }
  } },
  { id: 'rose-garden', name: 'Pink Roses', cat: 'flowers', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#5a1530'], [0.5, '#a3365a'], [1, '#e8869f']]);
    bokeh(ctx, W, H, 40, 71, ['rgba(255,200,220,1)', 'rgba(255,240,240,1)'], 0.01, 0.05, 0.3);
    const r = rng(72);
    const spots = [[0.12, 0.9], [0.32, 0.95], [0.55, 0.9], [0.8, 0.94], [0.95, 0.85], [0.05, 0.08], [0.9, 0.06], [0.7, 0.98]];
    spots.forEach(([x, y]) => { for (let k = 0; k < 3; k++) leaf(ctx, W * x, H * y, W * 0.14, r() * 6.28, '#2e5a2a'); });
    spots.forEach(([x, y]) => rose(ctx, W * x, H * y, W * (0.12 + r() * 0.06), '#f27a9c', '#c03d68'));
  } },
  { id: 'dew-flowers', name: 'Dew Drops', cat: 'flowers', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#0f4a4a'], [1, '#2a8a7a']]);
    const r = rng(81);
    for (let i = 0; i < 25; i++) leaf(ctx, r() * W, r() * H, W * (0.15 + r() * 0.15), r() * 6.28, `rgba(${60 + r() * 60},${150 + r() * 60},${90 + r() * 40},0.5)`);
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * H, s = W * (0.006 + r() * 0.018);
      ctx.fillStyle = 'rgba(200,255,250,0.25)'; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.25, 0, Math.PI * 2); ctx.fill();
    }
    vignette(ctx, W, H, 0.4);
  } },
  { id: 'watercolor-floral', name: 'Watercolor Flowers', cat: 'artistic', tone: 'light', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#fffaf2'], [1, '#fff1e4']]);
    const r = rng(91);
    const cols = ['rgba(244,143,177,1)', 'rgba(255,183,148,1)', 'rgba(206,147,216,1)', 'rgba(255,213,128,1)'];
    const corners = [[0, 0], [1, 0], [0, 1], [1, 1]];
    corners.forEach(([cx, cy], ci) => {
      for (let i = 0; i < 9; i++) glow(ctx, W * cx + (r() - 0.5) * W * 0.5, H * cy + (r() - 0.5) * H * 0.25, W * (0.08 + r() * 0.12), cols[(i + ci) % 4], 0.45);
      for (let i = 0; i < 8; i++) leaf(ctx, W * cx + (r() - 0.5) * W * 0.5, H * cy + (r() - 0.5) * H * 0.25, W * 0.12, r() * 6.28, 'rgba(110,170,110,0.45)');
    });
  } },
  { id: 'butterflies', name: 'Butterflies', cat: 'nature', tone: 'light', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#fdf6ff'], [0.5, '#fff4e8'], [1, '#eef9f0']]);
    bokeh(ctx, W, H, 25, 101, ['rgba(255,190,220,1)', 'rgba(190,220,255,1)', 'rgba(255,230,160,1)'], 0.03, 0.1, 0.35);
    const r = rng(102); const pal = [['#ff9fc0', '#ffcf6b'], ['#8fc7ff', '#c7a4ff'], ['#ffb86b', '#ff7f7f']];
    for (let i = 0; i < 9; i++) {
      const edge = i % 3; const x = edge === 0 ? r() * W * 0.25 : edge === 1 ? W - r() * W * 0.25 : r() * W;
      const y = edge === 2 ? (r() < 0.5 ? r() * H * 0.12 : H - r() * H * 0.12) : r() * H;
      const p = pal[i % 3]; butterfly(ctx, x, y, W * (0.04 + r() * 0.04), (r() - 0.5) * 1.2, p[0], p[1]);
    }
  } },
  { id: 'mosque-sunrise', name: 'Sunrise over Mosque', cat: 'islamic', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#0d1b3d'], [0.45, '#3b3f7a'], [0.7, '#e2876a'], [0.85, '#ffc77a']]);
    stars(ctx, W, H, 120, 111, 0.4);
    glow(ctx, W * 0.5, H * 0.85, W * 0.7, 'rgba(255,200,120,0.9)', 0.6);
    mosque(ctx, W, H, H * 0.86, '#1a1430');
  } },
  { id: 'islamic-green', name: 'Islamic Pattern – Emerald', cat: 'islamic', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#0b3b33'], [1, '#0f5a49']]);
    starPattern(ctx, W, H, W / 6, 'rgba(230,190,110,0.28)', W * 0.0025);
    vignette(ctx, W, H, 0.5);
  } },
  { id: 'islamic-cream', name: 'Islamic Pattern – Ivory', cat: 'islamic', tone: 'light', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#fffaf0'], [1, '#f6ead2']]);
    starPattern(ctx, W, H, W / 6, 'rgba(184,140,60,0.25)', W * 0.002);
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.5);
    g.addColorStop(0, 'rgba(255,250,240,0.9)'); g.addColorStop(1, 'rgba(255,250,240,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } },
  { id: 'night-to-dawn', name: 'Night to Dawn', cat: 'nature', tone: 'dark', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#0b1030'], [0.5, '#4a3a7a'], [0.85, '#f29f8f'], [1, '#ffd2a0']]);
    stars(ctx, W, H, 180, 141, 0.55);
    ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.14, W * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b1030'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.13, W * 0.045, 0, Math.PI * 2); ctx.fill();
  } },
  { id: 'soft-peach', name: 'Soft Peach', cat: 'artistic', tone: 'light', draw(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#ffe1c6'); g.addColorStop(1, '#ffc2cf'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    bokeh(ctx, W, H, 14, 151, ['rgba(255,255,255,1)'], 0.05, 0.15, 0.35);
  } },
  { id: 'soft-sky', name: 'Soft Sky', cat: 'artistic', tone: 'light', draw(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#d6ecff'); g.addColorStop(1, '#fff3d6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    clouds(ctx, W, H, 6, 161, 'rgba(255,255,255,0.6)', 1);
  } },
  { id: 'soft-lavender', name: 'Lavender Dream', cat: 'artistic', tone: 'dark', draw(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6a4c9c'); g.addColorStop(1, '#d58fb5'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    bokeh(ctx, W, H, 30, 171, ['rgba(255,220,255,1)', 'rgba(255,255,255,1)'], 0.01, 0.06, 0.3);
  } },
  { id: 'minimal-cream', name: 'Minimal Gold', cat: 'artistic', tone: 'light', draw(ctx, W, H) {
    vgrad(ctx, W, H, [[0, '#fffdf7'], [1, '#f7efdf']]);
    ctx.strokeStyle = 'rgba(190,150,70,0.6)'; ctx.lineWidth = W * 0.003;
    const m = W * 0.05; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = W * 0.0012; ctx.strokeRect(m * 1.4, m * 1.4, W - 2.8 * m, H - 2.8 * m);
  } }
];

export const BG_CATEGORIES = [
  { id: 'all', en: 'All' },
  { id: 'nature', en: 'Nature & Morning' },
  { id: 'flowers', en: 'Flowers' },
  { id: 'islamic', en: 'Islamic' },
  { id: 'artistic', en: 'Artistic' },
  { id: 'mine', en: 'My Photos & AI' }
];

// suggested backgrounds per mood (for one-click greetings)
export const MOOD_BACKGROUNDS = {
  inspirational: ['sunrise-meadow', 'golden-sky', 'mountain-lake', 'beach-morning'],
  romantic: ['rose-garden', 'soft-peach', 'soft-lavender', 'watercolor-floral'],
  funny: ['sunflower-field', 'soft-sky', 'butterflies'],
  spiritual: ['mosque-sunrise', 'islamic-green', 'islamic-cream'],
  friendship: ['sunflower-field', 'butterflies', 'green-garden', 'soft-sky'],
  family: ['sunrise-meadow', 'watercolor-floral', 'green-garden'],
  motivational: ['mountain-lake', 'golden-sky', 'sunrise-meadow'],
  poetry: ['watercolor-floral', 'minimal-cream', 'night-to-dawn', 'dew-flowers'],
  gratitude: ['islamic-cream', 'sunrise-meadow', 'dew-flowers'],
  peace: ['beach-morning', 'mountain-lake', 'soft-sky', 'green-garden']
};

const cache = new Map();
/** Returns a canvas with the preset painted at W×H (cached) */
export function presetCanvas(id, W, H) {
  const key = `${id}@${W}x${H}`;
  if (cache.has(key)) return cache.get(key);
  const bg = BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.save(); bg.draw(ctx, W, H); ctx.restore();
  if (cache.size > 40) cache.delete(cache.keys().next().value);
  cache.set(key, c);
  return c;
}

export function thumbnail(id, w = 160, h = 240) {
  return presetCanvas(id, w, h).toDataURL('image/jpeg', 0.85);
}
