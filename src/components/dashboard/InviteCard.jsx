import { useState, useEffect } from 'react';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import { copyToClipboard, shareViaWhatsApp } from '../../utils/shareUtils';

/**
 * Card "Condividi evento" — mostra link invito, testo pre-formattato, share.
 * Visibile solo all'admin dell'evento.
 */
export default function InviteCard() {
  const { event, eventId, isEventAdmin } = useEvent();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  if (!event || !isEventAdmin) return null;

  const eventUrl = `${window.location.origin}/event/${eventId}`;
  const inviteText = `🔥 Ti invito su GrigliaTron per organizzarci senza caos su WhatsApp.\n\nApri il link, conferma la presenza e scegli cosa portare:\n${eventUrl}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(eventUrl);
    setToast(ok ? '✅ Link copiato!' : '❌ Errore');
  };

  const handleCopyInvite = async () => {
    const ok = await copyToClipboard(inviteText);
    setToast(ok ? '✅ Testo invito copiato!' : '❌ Errore');
  };

  const handleWhatsApp = () => shareViaWhatsApp(inviteText);

  const handleNativeShare = async () => {
    if (!navigator.share) return handleCopyLink();
    try {
      await navigator.share({ title: event.title, text: inviteText, url: eventUrl });
    } catch { /* user cancelled */ }
  };

  return (
    <Card title="Condividi evento" emoji="📤" id="invite-card">
      <div className="invite-content">
        <div className="invite-link-box">
          <code className="invite-link-text">{eventUrl}</code>
        </div>
        <div className="invite-buttons">
          <button className="btn btn-primary btn-sm" onClick={handleCopyLink}>📋 Copia link</button>
          <button className="btn btn-ghost btn-sm" onClick={handleCopyInvite}>📝 Copia testo invito</button>
          <button className="btn btn-ghost btn-sm" onClick={handleWhatsApp}>💬 WhatsApp</button>
          {navigator.share && (
            <button className="btn btn-ghost btn-sm" onClick={handleNativeShare}>📤 Condividi</button>
          )}
        </div>
        {event.allowGuests !== false && (
          <p className="invite-guest-note">👤 Gli amici possono partecipare anche senza account Google.</p>
        )}
      </div>
      {toast && <div className="toast-notification" key={toast}>{toast}</div>}
    </Card>
  );
}
