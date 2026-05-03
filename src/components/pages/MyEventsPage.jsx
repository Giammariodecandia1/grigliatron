import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { getTheme } from '../../config/themes';
import { formatDateWithDay, getInitials } from '../../utils/formatters';

/**
 * Schermata "I miei eventi" — lista eventi creati dall'utente (query Firestore)
 * + eventi visitati in passato (salvati in localStorage, caricati da Firestore).
 */
export default function MyEventsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }

    let adminEvents = [];
    let visitedEvents = [];
    let adminLoaded = false;
    let visitedLoaded = false;

    const mergeAndSet = () => {
      if (!adminLoaded || !visitedLoaded) return;
      // Unisci: admin events + visited events (senza duplicati)
      const adminIds = new Set(adminEvents.map(e => e.id));
      const merged = [...adminEvents, ...visitedEvents.filter(e => !adminIds.has(e.id))];
      // Ordina per data creazione (più recenti prima)
      merged.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
      setMyEvents(merged);
      setLoading(false);
    };

    // 1. Query real-time: eventi dove l'utente è admin
    const q = query(
      collection(db, 'events'),
      where('admins', 'array-contains', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      adminEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      adminLoaded = true;
      mergeAndSet();
    });

    // 2. Carica eventi visitati da localStorage (one-shot, non real-time)
    const visitedIds = JSON.parse(localStorage.getItem('grigliatron_visited_events') || '[]');
    if (visitedIds.length > 0) {
      Promise.all(
        visitedIds.map(id =>
          getDoc(doc(db, 'events', id))
            .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
            .catch(() => null)
        )
      ).then(results => {
        visitedEvents = results.filter(Boolean);
        visitedLoaded = true;
        mergeAndSet();
      });
    } else {
      visitedLoaded = true;
      mergeAndSet();
    }

    return () => unsub();
  }, [user]);

  const handleOpenEvent = (eventId) => {
    // Salva in localStorage per accesso rapido futuro
    const visited = JSON.parse(localStorage.getItem('grigliatron_visited_events') || '[]');
    if (!visited.includes(eventId)) {
      visited.push(eventId);
      localStorage.setItem('grigliatron_visited_events', JSON.stringify(visited));
    }
    navigate(`/event/${eventId}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft': return { emoji: '📝', label: 'Bozza', cls: 'status-draft' };
      case 'open': return { emoji: '🟢', label: 'Aperto', cls: 'status-open' };
      case 'active': return { emoji: '🟡', label: 'In corso', cls: 'status-active' };
      case 'completed': return { emoji: '🔵', label: 'Concluso', cls: 'status-completed' };
      case 'archived': return { emoji: '⚪', label: 'Archiviato', cls: 'status-archived' };
      default: return { emoji: '🟢', label: 'Attivo', cls: 'status-open' };
    }
  };

  return (
    <div className="my-events-page">
      {/* Header leggero */}
      <header className="my-events-header">
        <div className="my-events-header-left">
          <span className="my-events-logo">🔥</span>
          <h1 className="my-events-title">GrigliaTron</h1>
        </div>
        <div className="my-events-header-right">
          {user && (
            <div className="header-user">
              <div className="header-user-info">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="header-avatar" />
                ) : (
                  <div className="header-avatar header-avatar-initials">
                    {getInitials(user.displayName)}
                  </div>
                )}
                <span className="header-user-name">{user.displayName}</span>
              </div>
              <button className="btn btn-header-logout" onClick={signOut}>Esci</button>
            </div>
          )}
        </div>
      </header>

      <div className="my-events-content">
        <div className="my-events-section-header">
          <h2>I miei eventi</h2>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            + Crea nuovo evento
          </button>
        </div>

        {loading ? (
          <div className="my-events-loading">
            <div className="loading-spinner"></div>
            <p>Caricamento eventi...</p>
          </div>
        ) : myEvents.length === 0 ? (
          <div className="my-events-empty">
            <span className="my-events-empty-emoji">🎉</span>
            <h3>Non hai ancora eventi</h3>
            <p>Crea il tuo primo GrigliaTron e invita gli amici!</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
              🔥 Crea nuovo evento
            </button>
          </div>
        ) : (
          <div className="my-events-grid">
            {myEvents.map(ev => {
              const theme = getTheme(ev.theme || ev.type || 'grigliata');
              const status = getStatusInfo(ev.status || 'active');
              return (
                <div
                  key={ev.id}
                  className="my-event-card"
                  onClick={() => handleOpenEvent(ev.id)}
                  style={{ '--card-accent': theme.accent }}
                >
                  <div className="my-event-card-accent" style={{ background: theme.gradient }}></div>
                  <div className="my-event-card-body">
                    <div className="my-event-card-top">
                      <span className="my-event-emoji">{theme.headerEmoji}</span>
                      <span className={`my-event-status ${status.cls}`}>
                        {status.emoji} {status.label}
                      </span>
                    </div>
                    <h3 className="my-event-card-title">{ev.title || 'Evento senza nome'}</h3>
                    {ev.date && (
                      <p className="my-event-card-date">📅 {formatDateWithDay(ev.date)}</p>
                    )}
                    {ev.locationName && (
                      <p className="my-event-card-location">📍 {ev.locationName}</p>
                    )}
                    <button className="btn btn-ghost btn-sm my-event-open-btn">
                      Apri →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer About */}
        <div className="my-events-footer">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/about')}>
            ℹ️ About GrigliaTron
          </button>
        </div>
      </div>
    </div>
  );
}
