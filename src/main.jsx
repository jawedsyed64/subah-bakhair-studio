import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Register the bundled Urdu fonts (downloaded into public/fonts by the build).
// An installed copy of the same font is preferred if present.
const BUNDLED = [
  ['Noto Nastaliq Urdu', 'NotoNastaliqUrdu.ttf'],
  ['Noto Naskh Arabic', 'NotoNaskhArabic.ttf']
];
for (const [family, file] of BUNDLED) {
  for (const weight of ['400', '700']) {
    try {
      const face = new FontFace(family, `local("${family}"), url(./fonts/${file})`, { weight, display: 'swap' });
      document.fonts.add(face);
      face.load().catch(() => {});
    } catch { /* font unavailable: system fallbacks are used */ }
  }
}

createRoot(document.getElementById('root')).render(<App />);
