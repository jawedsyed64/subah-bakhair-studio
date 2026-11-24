import React, { useState } from 'react';
import { MOODS } from '../lib/messages.js';
import { api } from '../lib/store.js';

const moodName = (id) => { const m = MOODS.find(x => x.id === id); return m ? `${m.icon} ${m.en}` : ''; };

export default function Library({ app }) {
  const { lib, setLib, sendToDesign, replaceDesign, setScreen, toggleFavorite, notify } = app;
  const [tab, setTab] = useState('designs');
  const [q, setQ] = useState('');
  const match = (s) => !q || (s || '').toLowerCase().includes(q.toLowerCase());

  const MessageList = ({ items, kind }) => (
    <div className="msg-list">
      {items.filter(i => match(i.text)).length === 0 && <p className="muted">Nothing here yet.</p>}
      {items.filter(i => match(i.text)).map(i => (
        <div key={i.id} className="msg-item">
          <div className="urdu msg-item-text" dir="rtl">{i.text}</div>
          <div className="msg-item-meta">
            <span className="muted small">{moodName(i.mood)} · {new Date(i.at).toLocaleString()}{i.source ? ` · ${i.source === 'claude' ? 'Claude AI' : 'offline'}` : ''}</span>
            <div className="row gap">
              <button className="btn small" onClick={() => sendToDesign(i.text, i.mood)}>Use</button>
              <button className="btn small" onClick={async () => { await api.copyText(i.text); notify('Copied'); }}>Copy</button>
              {kind === 'history' && <button className="btn small" onClick={() => toggleFavorite(i.text, i.mood)}>{lib.favorites.some(f => f.text === i.text) ? '★' : '☆'}</button>}
              <button className="btn small danger" onClick={() => setLib(l => ({ ...l, [kind]: l[kind].filter(x => x.id !== i.id) }))}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page">
      <h1>My Library <span className="urdu small-ur">میری لائبریری</span></h1>
      <div className="row gap">
        <div className="seg">
          {[['designs', 'Saved designs'], ['favorites', 'Favorite messages'], ['history', 'Recent messages'], ['exports', 'Exported images'], ['images', 'My photos']].map(([id, l]) =>
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{l}</button>)}
        </div>
        <input className="search" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {tab === 'designs' && (
        <div className="design-grid">
          {lib.designs.filter(d => match(d.name)).length === 0 && <p className="muted">Save a design from the Designer to keep it here.</p>}
          {lib.designs.filter(d => match(d.name)).map(d => (
            <div key={d.id} className="design-card">
              <img src={d.thumb} alt="" onClick={() => { replaceDesign(d.design); setScreen('designer'); }} />
              <input className="name-input" value={d.name} onChange={e => setLib(l => ({ ...l, designs: l.designs.map(x => x.id === d.id ? { ...x, name: e.target.value, design: { ...x.design, name: e.target.value } } : x) }))} />
              <div className="row gap">
                <button className="btn small" onClick={() => { replaceDesign(d.design); setScreen('designer'); }}>Open</button>
                <button className="btn small" onClick={() => { replaceDesign({ ...d.design, id: Math.random().toString(36).slice(2) }); setScreen('designer'); }}>Duplicate</button>
                <button className="btn small danger" onClick={() => setLib(l => ({ ...l, designs: l.designs.filter(x => x.id !== d.id) }))}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'favorites' && <MessageList items={lib.favorites} kind="favorites" />}
      {tab === 'history' && <MessageList items={lib.history} kind="history" />}
      {tab === 'exports' && (
        <div className="msg-list">
          {lib.exports.length === 0 && <p className="muted">Images you save will be listed here.</p>}
          {lib.exports.filter(x => match(x.name)).map((x, i) => (
            <div key={i} className="msg-item row between">
              <span>{x.name} <span className="muted small">· {new Date(x.at).toLocaleString()}</span></span>
              {x.path && <button className="btn small" onClick={() => api.showFile(x.path)}>Show in folder</button>}
            </div>
          ))}
        </div>
      )}
      {tab === 'images' && (
        <div className="design-grid">
          {lib.myImages.length === 0 && <p className="muted">Uploaded and AI-generated backgrounds appear here.</p>}
          {lib.myImages.filter(m => match(m.name)).map(m => (
            <div key={m.id} className="design-card">
              <img src={m.dataUrl} alt="" />
              <div className="small muted ellipsis">{m.name}</div>
              <button className="btn small danger" onClick={() => setLib(l => ({ ...l, myImages: l.myImages.filter(x => x.id !== m.id) }))}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
