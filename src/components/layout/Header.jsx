import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { getTheme } from '../../config/themes';
import { formatDateWithDay } from '../../utils/formatters';
import { getInitials } from '../../utils/formatters';
import {
  generateEventSummary,
  generateMissingItems,
  shareViaWhatsApp,
  copyToClipboard,
} from '../../utils/shareUtils';

import { useNavigate } from 'react-router-dom';

/**
 * Header evento con info, login/logout, condivisione e nome utente.
 */
export default function Header({ onNavigate }) {
  const navigate = useNavigate();
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, foodItems, gearItems, tasks, participants } = useEvent();
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const shareRef = useRef(null);

  const theme = getTheme(event?.theme || event?.type);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    if (shareOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpen]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (msg) => {
    setToast(msg);
    setShareOpen(false);
  };

  const handleCopySummary = async () => {
    const text = generateEventSummary(event, foodItems, gearItems, tasks, participants);
    const ok = await copyToClipboard(text);
    showToast(ok ? '✅ Riepilogo copiato!' : '❌ Errore copia');
  };

  const handleCopyMissing = async () => {
    const text = generateMissingItems(event, foodItems, gearItems, tasks);
    const ok = await copyToClipboard(text);
    showToast(ok ? '✅ Lista "cosa manca" copiata!' : '❌ Errore copia');
  };

  const handleWhatsAppSummary = () => {
    const text = generateEventSummary(event, foodItems, gearItems, tasks, participants);
    shareViaWhatsApp(text);
    setShareOpen(false);
  };

  const handleWhatsAppMissing = () => {
    const text = generateMissingItems(event, foodItems, gearItems, tasks);
    shareViaWhatsApp(text);
    setShareOpen(false);
  };

  // Conteggio cose mancanti per il badge
  const missingCount = event ? [
    ...foodItems.filter(i => !i.status || i.status === 'free'),
    ...gearItems.filter(i => !i.status || i.status === 'free'),
    ...tasks.filter(i => !i.status || i.status === 'free'),
  ].length : 0;

  return (
    <header className="app-header" style={{ background: theme.gradient }}>
      <div className="header-content">
        <div className="header-left">
          <div 
            className="header-brand" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
            title="Torna ai miei eventi"
          >
            <span className="header-emoji">{theme.headerEmoji}</span>
            <div>
              <h1 className="header-app-name">GrigliaTron</h1>
              <p className="header-tagline">{theme.tagline}</p>
            </div>
          </div>

          {event && (
            <div className="header-event-info">
              <h2 className="header-event-title">{event.title}</h2>
              <p className="header-event-meta">
                {formatDateWithDay(event.date)}
                {event.time && ` — ${event.time}`}
                {event.locationName && ` — ${event.locationName}`}
              </p>
              <span
                className="header-status-badge"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                {event.status === 'open' ? '🟢 Aperto' :
                 event.status === 'active' ? '🟡 In corso' :
                 event.status === 'completed' ? '🔵 Concluso' :
                 event.status === 'archived' ? '⚪ Archiviato' :
                 '📝 Bozza'}
              </span>
              {isEventAdmin && <span className="header-admin-badge">👑 Admin</span>}
            </div>
          )}
        </div>

        <div className="header-right">
          {/* Share button */}
          {event && user && (
            <div className="share-container" ref={shareRef}>
              <button
                className="btn btn-header-share"
                onClick={() => setShareOpen(!shareOpen)}
                title="Condividi"
                id="share-button"
              >
                📤
                {missingCount > 0 && (
                  <span className="share-badge">{missingCount}</span>
                )}
              </button>

              {shareOpen && (
                <div className="share-dropdown">
                  <div className="share-dropdown-section">
                    <span className="share-dropdown-label">📋 Riepilogo completo</span>
                    <button className="btn btn-share-option" onClick={handleCopySummary}>
                      📋 Copia testo
                    </button>
                    <button className="btn btn-share-option" onClick={handleWhatsAppSummary}>
                      💬 WhatsApp
                    </button>
                  </div>
                  <div className="share-dropdown-divider" />
                  <div className="share-dropdown-section">
                    <span className="share-dropdown-label">
                      ⚠️ Cosa manca?
                      {missingCount > 0 && <span className="share-missing-count">{missingCount}</span>}
                    </span>
                    <button className="btn btn-share-option btn-share-missing" onClick={handleCopyMissing}>
                      📋 Copia lista
                    </button>
                    <button className="btn btn-share-option btn-share-missing" onClick={handleWhatsAppMissing}>
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User info */}
          {authLoading ? (
            <div className="header-loading">...</div>
          ) : user ? (
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
              <button className="btn btn-header-logout" onClick={signOut}>
                Esci
              </button>
            </div>
          ) : (
            <button className="btn btn-header-login" onClick={signIn}>
              Accedi con Google
            </button>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="toast-notification" key={toast}>
          {toast}
        </div>
      )}
    </header>
  );
}
