import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api, uid } from './lib/store.js';
import { generateMessage } from './lib/messages.js';
import { autoDesign, designThumb } from './lib/render.js';
import { MOOD_BACKGROUNDS } from './lib/backgrounds.js';
import Home from './screens/Home.jsx';
import MessageScreen from './screens/MessageScreen.jsx';
import Designer from './screens/Designer.jsx';
import Preview from './screens/Preview.jsx';
import Library from './screens/Library.jsx';
import Settings from './screens/Settings.jsx';

const NAV = [
  { id: 'home', en: 'Home', ur: 'ہوم', icon: '🏠' },
  { id: 'message', en: 'Message', ur: 'پیغام', icon: '✍️' },
  { id: 'designer', en: 'Designer', ur: 'ڈیزائن', icon: '🎨' },
  { id: 'preview', en: 'Preview & Share', ur: 'محفوظ کریں', icon: '📤' },
  { id: 'library', en: 'My Library', ur: 'لائبریری', icon: '⭐' },
  { id: 'settings', en: 'Settings', ur: 'ترتیبات', icon: '⚙️' }
];

const DEFAULT_SETTINGS = { theme: 'light', claudeModel: 'claude-sonnet-5-5', imageModel: 'gpt-image-1', defaultLength: 'medium', defaultMood: 'inspirational', defaultSize: 'whatsapp' };
const EMPTY_LIB = { favorites: [], history: [], designs: [], exports: [], myImages: [] };

export default function App() {
  const [screen, setScreen] = useState('home');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lib, setLib] = useState(EMPTY_LIB);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState({ text: '', source: '', note: '', mood: 'inspirational', length: 'medium', recipient: 'everyone', instruction: '' });
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');

  // ---- design with undo / redo ----
  const [design, setDesignState] = useState(null);
  const past = useRef([]); const future = useRef([]); const lastPush = useRef({ key: '', at: 0 });
  const updateDesign = useCallback((fn, key = '') => {
    setDesignState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      if (!prev || next === prev) return next;
      const now = Date.now();
      if (!(key && key === lastPush.current.key && now - lastPush.current.at < 700)) {
        past.current.push(prev); if (past.current.length > 60) past.current.shift();
      }
      lastPush.current = { key, at: now };
      future.current = [];
      return { ...next, updatedAt: now };
    });
  }, []);
  const replaceDesign = useCallback((d) => { past.current = []; future.current = []; setDesignState(d); }, []);
  const undo = useCallback(() => setDesignState(cur => { if (!past.current.length) return cur; future.current.push(cur); lastPush.current = { key: '', at: 0 }; return past.current.pop(); }), []);
  const redo = useCallback(() => setDesignState(cur => { if (!future.current.length) return cur; past.current.push(cur); return future.current.pop(); }), []);

  // ---- load persisted data ----
  useEffect(() => {
    (async () => {
      const s = await api.storeGet('settings');
      const l = await api.storeGet('library');
      const d = await api.storeGet('currentDesign');
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...s });
      if (l) setLib({ ...EMPTY_LIB, ...l });
      if (d) setDesignState(d);
      if (s) setMessage(m => ({ ...m, mood: s.defaultMood || m.mood, length: s.defaultLength || m.length }));
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) api.storeSet('settings', settings); }, [settings, loaded]);
  useEffect(() => { if (loaded) api.storeSet('library', lib); }, [lib, loaded]);
  // automatic project saving (debounced)
  useEffect(() => {
    if (!loaded || !design) return;
    const t = setTimeout(() => api.storeSet('currentDesign', design), 800);
    return () => clearTimeout(t);
  }, [design, loaded]);
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); }, []);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea' || tag === 'input') return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // ---- actions ----
  const addHistory = (text, mood, source) => setLib(l => ({ ...l, history: [{ id: uid(), text, mood, source, at: Date.now() }, ...l.history.filter(h => h.text !== text)].slice(0, 100) }));

  const generate = async (opts = {}) => {
    const o = { ...message, ...opts };
    setBusy('message');
    try {
      const res = await generateMessage({ ...o, avoid: lib.history.slice(0, 10).map(h => h.text) }, settings);
      const next = { ...o, text: res.text, source: res.source, note: res.note || '' };
      setMessage(next);
      addHistory(res.text, o.mood, res.source);
      return next;
    } finally { setBusy(''); }
  };

  const sendToDesign = (text, moodOverride) => {
    const mood = moodOverride || message.mood;
    if (design) {
      // keep current background and styling; replace the text
      const d = autoDesign(text, design.bg.id, design.sizeId, design.bg.type === 'image' ? design.bg.image : null);
      updateDesign(prev => ({ ...prev, texts: d.texts.map((t, i) => prev.texts[i] ? { ...prev.texts[i], text: t.text } : t) }));
    } else {
      const options = MOOD_BACKGROUNDS[mood] || MOOD_BACKGROUNDS.inspirational;
      replaceDesign(autoDesign(text, options[Math.floor(Math.random() * options.length)], settings.defaultSize));
    }
    setScreen('designer');
  };

  // one-click greeting: message + matching background + automatic layout
  const oneClick = async (mood) => {
    const m = mood || message.mood;
    const res = await generate({ mood: m });
    const options = MOOD_BACKGROUNDS[m] || MOOD_BACKGROUNDS.inspirational;
    replaceDesign(autoDesign(res.text, options[Math.floor(Math.random() * options.length)], settings.defaultSize));
    setScreen('preview');
  };

  const toggleFavorite = (text, mood) => setLib(l => {
    const exists = l.favorites.some(f => f.text === text);
    return { ...l, favorites: exists ? l.favorites.filter(f => f.text !== text) : [{ id: uid(), text, mood, at: Date.now() }, ...l.favorites] };
  });

  const saveDesignToLibrary = async () => {
    if (!design) return;
    const thumb = await designThumb(design);
    setLib(l => {
      const others = l.designs.filter(d => d.id !== design.id);
      return { ...l, designs: [{ id: design.id, name: design.name || 'صبح بخیر', thumb, design, updatedAt: Date.now() }, ...others].slice(0, 200) };
    });
    notify('Design saved to My Library');
  };

  const app = {
    screen, setScreen, settings, setSettings, lib, setLib, message, setMessage, busy, setBusy, notify,
    design, updateDesign, replaceDesign, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    generate, oneClick, sendToDesign, toggleFavorite, saveDesignToLibrary
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">☀️</div>
          <div>
            <div className="brand-ur urdu">صبح بخیر اسٹوڈیو</div>
            <div className="brand-en">Subah Bakhair Studio</div>
          </div>
        </div>
        <nav>
          {NAV.map(n => (
            <button key={n.id} className={'nav-btn' + (screen === n.id ? ' active' : '')} onClick={() => setScreen(n.id)}>
              <span className="nav-icon">{n.icon}</span><span>{n.en}</span><span className="nav-ur urdu">{n.ur}</span>
            </button>
          ))}
        </nav>
        <button className="theme-btn" onClick={() => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}>
          {settings.theme === 'dark' ? '☀️ Light theme' : '🌙 Dark theme'}
        </button>
      </aside>
      <main className="main">
        {screen === 'home' && <Home app={app} />}
        {screen === 'message' && <MessageScreen app={app} />}
        {screen === 'designer' && <Designer app={app} />}
        {screen === 'preview' && <Preview app={app} />}
        {screen === 'library' && <Library app={app} />}
        {screen === 'settings' && <Settings app={app} />}
      </main>
      {busy && <div className="busy"><div className="spinner" /> {busy === 'message' ? 'Writing your Urdu message…' : busy === 'image' ? 'Generating background with AI… (this can take up to a minute)' : 'Working…'}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
