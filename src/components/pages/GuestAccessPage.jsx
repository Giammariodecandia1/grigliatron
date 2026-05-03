import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Pagina di accesso Guest — mostrata quando un utente non loggato
 * apre un link evento con allowGuests = true.
 */
export default function GuestAccessPage({ eventId, onGuestJoin }) {
  const { signIn } = useAuth();
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    getDoc(doc(db, 'events', eventId)).then(snap => {
      if (snap.exists()) setEventInfo({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId]);

  const handleGuestJoin = async () => {
    if (!guestName.trim() || !eventId) return;
    setJoining(true);
    try {
      const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const guestSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      await setDoc(doc(db, 'events', eventId, 'participants', guestId), {
        id: guestId, name: guestName.trim(), status: 'partecipo',
        isGuest: true, guestSessionId, quoteCount: 1,
        joinedAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });

      const guestData = { guestId, name: guestName.trim(), guestSessionId, isGuest: true };
      localStorage.setItem(`grigliatron_guest_${eventId}`, JSON.stringify(guestData));

      const visited = JSON.parse(localStorage.getItem('grigliatron_visited_events') || '[]');
      if (!visited.includes(eventId)) { visited.push(eventId); localStorage.setItem('grigliatron_visited_events', JSON.stringify(visited)); }

      onGuestJoin(guestData);
    } catch (err) { alert('Errore: ' + err.message); setJoining(false); }
  };

  if (loading) {
    return (<div className="app-splash"><div className="splash-content"><span className="splash-emoji">🔥</span><h1 className="splash-title">GrigliaTron</h1><div className="loading-spinner"></div></div></div>);
  }

  if (!eventInfo) {
    return (<div className="app-splash"><div className="splash-content"><span className="splash-emoji">❌</span><h1 className="splash-title">Evento non trovato</h1><p className="splash-subtitle">Questo link potrebbe essere sbagliato o l'evento è stato eliminato.</p></div></div>);
  }

  return (
    <div className="app-splash">
      <div className="splash-content guest-access-content">
        <span className="splash-emoji">🔥</span>
        <h1 className="splash-title">{eventInfo.title || 'Evento'}</h1>
        {eventInfo.date && <p className="splash-subtitle">📅 {new Date(eventInfo.date + 'T00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}{eventInfo.time ? ` — ${eventInfo.time}` : ''}</p>}
        {eventInfo.locationName && <p className="splash-subtitle">📍 {eventInfo.locationName}</p>}
        {eventInfo.description && <p className="guest-event-desc">{eventInfo.description}</p>}

        <div className="guest-access-divider"></div>
        <h3 className="guest-access-prompt">Vuoi partecipare?</h3>

        {!showNameForm ? (
          <div className="guest-access-buttons">
            <button className="btn btn-login-main" onClick={signIn}>
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Entra con Google
            </button>
            {eventInfo.allowGuests !== false && (
              <button className="btn btn-guest-access" onClick={() => setShowNameForm(true)}>👤 Continua come ospite</button>
            )}
          </div>
        ) : (
          <div className="guest-name-form">
            <label className="form-label">Come ti chiami?
              <input className="input" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Il tuo nome" autoFocus />
            </label>
            <div className="guest-name-buttons">
              <button className="btn btn-primary" onClick={handleGuestJoin} disabled={!guestName.trim() || joining}>{joining ? '⏳ Accesso...' : '✅ Partecipa'}</button>
              <button className="btn btn-ghost" onClick={() => setShowNameForm(false)}>Annulla</button>
            </div>
            <p className="guest-hint">Come ospite puoi vedere l'evento, confermare la presenza e scegliere cosa portare.</p>
          </div>
        )}
      </div>
    </div>
  );
}
