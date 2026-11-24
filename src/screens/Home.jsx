import React, { useMemo } from 'react';
import { MOODS } from '../lib/messages.js';
import { BACKGROUNDS, thumbnail } from '../lib/backgrounds.js';
import { autoDesign } from '../lib/render.js';

function greetingByTime() {
  const h = new Date().getHours();
  if (h < 12) return { ur: 'صبح بخیر! آج کا دن خوشیوں بھرا ہو', en: 'Good morning! Let’s make someone smile today.' };
  if (h < 17) return { ur: 'السلام علیکم! کل صبح کے لیے پیغام تیار کیجیے', en: 'Prepare tomorrow’s morning greeting in advance.' };
  return { ur: 'شب بخیر! کل صبح کی مبارکباد ابھی بنائیے', en: 'Create tomorrow morning’s greeting now.' };
}

export default function Home({ app }) {
  const { message, setMessage, oneClick, busy, lib, replaceDesign, setScreen, sendToDesign, settings } = app;
  const g = greetingByTime();
  const featured = useMemo(() => BACKGROUNDS.slice(0, 8).map(b => ({ ...b, thumb: thumbnail(b.id) })), []);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <div className="hero-ur urdu">{g.ur}</div>
          <div className="hero-en">{g.en}</div>
          <p className="muted">Choose a mood, press one button, and get a beautiful Urdu greeting picture ready to share.</p>
        </div>
        <div className="hero-sun" aria-hidden>☀️</div>
      </section>

      <section className="card">
        <h2>1. Choose a mood <span className="urdu small-ur">مزاج منتخب کریں</span></h2>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button key={m.id} className={'mood' + (message.mood === m.id ? ' active' : '')} onClick={() => setMessage(s => ({ ...s, mood: m.id }))}>
              <span className="mood-icon">{m.icon}</span>
              <span className="urdu mood-ur">{m.ur}</span>
              <span className="mood-en">{m.en}</span>
            </button>
          ))}
        </div>
        <div className="row gap">
          <button className="btn primary big" disabled={!!busy} onClick={() => oneClick()}>
            ✨ Generate New Greeting <span className="urdu">نیا پیغام بنائیں</span>
          </button>
          <button className="btn" onClick={() => setScreen('message')}>Customize message first…</button>
        </div>
      </section>

      <section className="card">
        <h2>Featured backgrounds <span className="urdu small-ur">منتخب پس منظر</span></h2>
        <div className="thumb-row">
          {featured.map(b => (
            <button key={b.id} className="thumb" title={b.name} onClick={() => {
              replaceDesign(autoDesign(message.text || 'صبح بخیر\nآپ کا دن خوشیوں بھرا ہو', b.id, settings.defaultSize));
              setScreen('designer');
            }}>
              <img src={b.thumb} alt={b.name} /><span>{b.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <h2>Recent designs</h2>
          {lib.designs.length === 0 && <p className="muted">Your saved designs will appear here.</p>}
          <div className="thumb-row">
            {lib.designs.slice(0, 6).map(d => (
              <button key={d.id} className="thumb small" onClick={() => { replaceDesign(d.design); setScreen('designer'); }}>
                <img src={d.thumb} alt="" />
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <h2>Favorite messages</h2>
          {lib.favorites.length === 0 && <p className="muted">Press ☆ on a message to keep it here.</p>}
          {lib.favorites.slice(0, 4).map(f => (
            <div key={f.id} className="fav-line">
              <div className="urdu fav-text">{f.text.split('\n').slice(0, 2).join(' — ')}</div>
              <button className="btn small" onClick={() => sendToDesign(f.text, f.mood)}>Use</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
