import React, { useState } from 'react';
import { MOODS, LENGTHS, RECIPIENTS } from '../lib/messages.js';
import { api } from '../lib/store.js';

export default function MessageScreen({ app }) {
  const { message, setMessage, generate, busy, sendToDesign, toggleFavorite, lib, notify } = app;
  const [editing, setEditing] = useState(false);
  const isFav = message.text && lib.favorites.some(f => f.text === message.text);
  const set = (k, v) => setMessage(m => ({ ...m, [k]: v }));

  return (
    <div className="page">
      <h1>Message Generator <span className="urdu small-ur">پیغام ساز</span></h1>
      <div className="two-col wide-right">
        <section className="card">
          <label className="lbl">Mood</label>
          <div className="chip-wrap">
            {MOODS.map(m => (
              <button key={m.id} className={'chip' + (message.mood === m.id ? ' active' : '')} onClick={() => set('mood', m.id)}>
                {m.icon} {m.en} <span className="urdu">{m.ur}</span>
              </button>
            ))}
          </div>

          <label className="lbl">Message language</label>
          <div className="chip-wrap"><span className="chip active">اردو (Urdu script)</span></div>

          <label className="lbl">Length</label>
          <div className="seg">
            {LENGTHS.map(l => (
              <button key={l.id} className={message.length === l.id ? 'active' : ''} onClick={() => set('length', l.id)}>
                {l.en} <span className="urdu">{l.ur}</span>
              </button>
            ))}
          </div>

          <label className="lbl">Recipient</label>
          <select value={message.recipient} onChange={e => set('recipient', e.target.value)}>
            {RECIPIENTS.map(r => <option key={r.id} value={r.id}>{r.en} – {r.ur}</option>)}
          </select>

          <label className="lbl">Special request (optional, English or Urdu)</label>
          <textarea rows={3} value={message.instruction} placeholder="e.g. Include a prayer for success in exams / ایک خوبصورت دعا شامل کریں"
            onChange={e => set('instruction', e.target.value)} />

          <button className="btn primary big full" disabled={!!busy} onClick={() => { setEditing(false); generate(); }}>
            ✨ Generate Message <span className="urdu">پیغام بنائیں</span>
          </button>
        </section>

        <section className="card message-card">
          {!message.text && (
            <div className="empty">
              <div className="urdu empty-ur">صبح بخیر</div>
              <p className="muted">Your Urdu message will appear here – one beautiful message at a time.</p>
            </div>
          )}
          {message.text && (
            <>
              <div className="msg-head">
                <span className={'badge ' + message.source}>{message.source === 'claude' ? '🤖 Written by Claude AI' : '📚 Offline library'}</span>
              </div>
              {editing
                ? <textarea className="urdu msg-edit" dir="rtl" value={message.text} onChange={e => set('text', e.target.value)} rows={8} />
                : <div className="urdu msg-text" dir="rtl">{message.text}</div>}
              {message.note && <p className="note">{message.note}</p>}
              <div className="row gap wrap">
                <button className="btn" disabled={!!busy} onClick={() => { setEditing(false); generate(); }}>🔄 Regenerate</button>
                <button className="btn" onClick={() => setEditing(e => !e)}>{editing ? '✔ Done editing' : '✏️ Edit Message'}</button>
                <button className="btn" onClick={async () => { await api.copyText(message.text); notify('Urdu message copied'); }}>📋 Copy</button>
                <button className="btn" onClick={() => toggleFavorite(message.text, message.mood)}>{isFav ? '★ Favorite' : '☆ Add to favorites'}</button>
                <button className="btn primary" onClick={() => sendToDesign(message.text)}>🎨 Use in Greeting Picture</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
