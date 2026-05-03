import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import { getTheme } from '../../config/themes';
import { getInitials } from '../../utils/formatters';

/**
 * Card partecipanti con avatar, stato e badge task.
 */
export default function ParticipantsCard() {
  const { user } = useAuth();
  const { event, isEventAdmin, participants, joinEvent, updateParticipant, removeParticipant, addGuestParticipant, foodItems, gearItems, tasks } = useEvent();
  const theme = getTheme(event?.theme || event?.type);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');

  if (!event) return null;

  const confirmedCount = participants.filter(p => p.status === 'partecipo').length;
  const currentParticipant = user ? participants.find(p => p.id === user.uid) : null;

  // Count claimed items per participant
  const getClaimedCount = (userId) => {
    const foodClaimed = foodItems.filter(i => i.assignedTo === userId).length;
    const gearClaimed = gearItems.filter(i => i.assignedTo === userId).length;
    const tasksClaimed = tasks.filter(i => i.assignedTo === userId).length;
    return foodClaimed + gearClaimed + tasksClaimed;
  };

  const handleJoin = async (status) => {
    if (!user) return;
    await joinEvent(user, status, currentParticipant?.notes || '');
  };

  const handleUpdateNote = async () => {
    if (!user) return;
    await updateParticipant(user.uid, { notes: noteText });
    setShowNoteInput(false);
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Rimuovere questo partecipante?')) {
      await removeParticipant(userId);
    }
  };

  const handleAddGuest = async () => {
    if (!guestName.trim()) return;
    await addGuestParticipant(guestName.trim());
    setGuestName('');
    setShowGuestForm(false);
  };

  // ─── Admin: aggiorna quoteCount di un partecipante ────────────
  const handleQuoteChange = async (userId, value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      await updateParticipant(userId, { quoteCount: num });
    }
  };

  // ─── Utente: salva il proprio link PayPal ─────────────────────
  const [editingPaypal, setEditingPaypal] = useState(false);
  const [paypalInput, setPaypalInput] = useState('');

  const handleSavePaypal = async () => {
    if (!user) return;
    await updateParticipant(user.uid, { paypalLink: paypalInput.trim() });
    setEditingPaypal(false);
  };

  const statusButtons = [
    { key: 'partecipo', label: '✅ Partecipo', active: currentParticipant?.status === 'partecipo' },
    { key: 'forse', label: '🤔 Forse', active: currentParticipant?.status === 'forse' },
    { key: 'non posso', label: '❌ Non posso', active: currentParticipant?.status === 'non posso' },
  ];

  return (
    <Card
      title="Partecipanti"
      emoji={theme.sectionEmojis.participants}
      count={confirmedCount}
      countLabel="confermati"
      id="participants-card"
    >
      {/* My status toggle */}
      {user && (
        <div className="participants-my-status">
          <div className="status-buttons">
            {statusButtons.map(btn => (
              <button
                key={btn.key}
                className={`btn btn-status ${btn.active ? 'btn-status-active' : ''}`}
                onClick={() => handleJoin(btn.key)}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {currentParticipant && (
            <div className="participant-note-section">
              {!showNoteInput ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setNoteText(currentParticipant.notes || '');
                    setShowNoteInput(true);
                  }}
                >
                  {currentParticipant.notes ? `📝 ${currentParticipant.notes}` : '+ Aggiungi nota'}
                </button>
              ) : (
                <div className="note-input-row">
                  <input
                    className="input input-sm"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Es: arrivo più tardi, porto un amico..."
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleUpdateNote}>OK</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowNoteInput(false)}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* PayPal link personale */}
          {currentParticipant && (
            <div className="participant-paypal-section">
              {!editingPaypal ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPaypalInput(currentParticipant.paypalLink || '');
                    setEditingPaypal(true);
                  }}
                >
                  {currentParticipant.paypalLink ? `💳 PayPal configurato` : '+ Aggiungi link PayPal'}
                </button>
              ) : (
                <div className="note-input-row">
                  <input
                    className="input input-sm"
                    value={paypalInput}
                    onChange={e => setPaypalInput(e.target.value)}
                    placeholder="https://paypal.me/tuonome"
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSavePaypal}>OK</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingPaypal(false)}>✕</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Participants list */}
      <ul className="participants-list">
        {participants.map(p => {
          const claimedCount = getClaimedCount(p.id);
          return (
            <li key={p.id} className={`participant-row ${p.status === 'non posso' ? 'participant-declined' : ''}`}>
              <div className="participant-info">
                {p.photoURL ? (
                  <img src={p.photoURL} alt={p.name} className="participant-avatar" />
                ) : (
                  <div className="participant-avatar participant-avatar-initials">
                    {getInitials(p.name)}
                  </div>
                )}
                <div className="participant-details">
                  <span className="participant-name">
                    {p.name}
                    {p.isGuest && <span className="participant-badge-guest" title="Ospite senza account">👤 Ospite</span>}
                  </span>
                  <span className="participant-status-label">
                    {p.status === 'partecipo' ? '✅' : p.status === 'forse' ? '🤔' : '❌'}
                  </span>
                  {claimedCount > 0 && (
                    <span className="participant-badge" title={`${claimedCount} cose assegnate`}>
                      📦 {claimedCount}
                    </span>
                  )}
                  {(p.quoteCount != null && p.quoteCount !== 1) && (
                    <span className="participant-badge participant-badge-quote" title={`${p.quoteCount} quote`}>
                      ×{p.quoteCount}
                    </span>
                  )}
                </div>
              </div>
              {p.notes && <p className="participant-note">📝 {p.notes}</p>}
              {/* Admin: quoteCount per partecipante */}
              {isEventAdmin && (
                <div className="participant-admin-row">
                  <label className="participant-quote-label">
                    Quote:
                    <input
                      className="input input-xs participant-quote-input"
                      type="number"
                      step="0.5"
                      min="0"
                      defaultValue={p.quoteCount ?? 1}
                      onBlur={e => handleQuoteChange(p.id, e.target.value)}
                    />
                  </label>
                  {p.id !== user?.uid && (
                    <button
                      className="btn btn-sm btn-ghost btn-danger"
                      onClick={() => handleRemove(p.id)}
                      title="Rimuovi partecipante"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
              {!isEventAdmin && p.id !== user?.uid && false /* non-admin non vede rimuovi */}
            </li>
          );
        })}
      </ul>

      {participants.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-emoji">👋</span>
          <p className="empty-state-text">Nessun partecipante ancora. Sii il primo!</p>
        </div>
      )}

      {/* Admin: Aggiungi Guest */}
      {isEventAdmin && (
        <div className="admin-add-guest" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {!showGuestForm ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowGuestForm(true)}>
              + Aggiungi ospite (senza login)
            </button>
          ) : (
            <div className="note-input-row">
              <input
                className="input input-sm"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Nome ospite"
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddGuest}>Aggiungi</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowGuestForm(false)}>✕</button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
