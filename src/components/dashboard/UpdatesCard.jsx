import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';
import { formatTimestamp } from '../../utils/formatters';

const TAG_OPTIONS = [
  { value: 'info', label: 'ℹ️ Info', className: 'tag-info' },
  { value: 'urgente', label: '🚨 Urgente', className: 'tag-urgent' },
  { value: 'cambio', label: '🔄 Cambio programma', className: 'tag-change' },
];

const emailEnabled = import.meta.env.VITE_EMAIL_NOTIFICATIONS_ENABLED === 'true';

/**
 * Card Aggiornamenti — mini-feed bacheca.
 * V1.1: Aggiunto modifica/cancellazione per autore + admin.
 * V1.4: Checkbox notifica email ai partecipanti.
 */
export default function UpdatesCard() {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, updates, addUpdate, deleteUpdate, updateItem, sendEmailNotification } = useEvent();
  const theme = getTheme(event?.theme || event?.type);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('info');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', type: 'info' });

  if (!event) return null;

  const canManage = (update) => {
    if (!user) return false;
    return isEventAdmin || update.authorId === user.uid;
  };

  // Auto-enable email when urgente is selected
  const handleTagChange = (newTag) => {
    setTag(newTag);
    if (newTag === 'urgente' && emailEnabled) {
      setNotifyEmail(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);
    try {
      const updateData = {
        text: text.trim(),
        type: tag,
        authorId: user.uid,
        authorName: user.displayName || 'Anonimo',
        authorEmail: user.email || '',
        notifyByEmail: notifyEmail && emailEnabled,
        emailNotificationStatus: (notifyEmail && emailEnabled) ? 'queued' : 'not_requested',
      };

      await addUpdate(updateData);

      // Se notifica email attiva, scrivi nella collection mail
      if (notifyEmail && emailEnabled) {
        try {
          await sendEmailNotification(updateData);
        } catch (err) {
          console.error('Errore invio email:', err);
        }
      }

      setText('');
      setTag('info');
      setNotifyEmail(false);
      setShowForm(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (updateId) => {
    if (window.confirm('Eliminare questo aggiornamento?')) {
      await deleteUpdate(updateId);
    }
  };

  const handleStartEdit = (upd) => {
    setEditForm({ text: upd.text || '', type: upd.type || 'info' });
    setEditingId(upd.id);
  };

  const handleSaveEdit = async (upd) => {
    if (!editForm.text.trim()) return;
    await updateItem('updates', upd.id, {
      text: editForm.text.trim(),
      type: editForm.type,
    });
    setEditingId(null);
    setEditForm({ text: '', type: 'info' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ text: '', type: 'info' });
  };

  // Show newest first
  const sortedUpdates = [...updates].reverse();

  return (
    <Card
      title="Aggiornamenti"
      emoji={theme.sectionEmojis.updates}
      count={updates.length}
      id="updates-card"
    >
      {user && !showForm && (
        <button className="btn btn-add-item" onClick={() => setShowForm(true)}>
          + Scrivi aggiornamento
        </button>
      )}

      {showForm && (
        <form className="add-item-form" onSubmit={handleSubmit}>
          <textarea
            className="input textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Scrivi un aggiornamento..."
            rows={2}
            autoFocus
          />
          <div className="tag-selector">
            {TAG_OPTIONS.map(t => (
              <button
                key={t.value}
                type="button"
                className={`btn btn-tag ${tag === t.value ? 'btn-tag-active' : ''}`}
                onClick={() => handleTagChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Email notification checkbox */}
          <div className="email-notify-row">
            <label className={`email-notify-label ${!emailEnabled ? 'email-notify-disabled' : ''}`}>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={e => setNotifyEmail(e.target.checked)}
                disabled={!emailEnabled}
              />
              <span>📧 Notifica via email</span>
              {!emailEnabled && (
                <span className="email-notify-tooltip" title="Configura VITE_EMAIL_NOTIFICATIONS_ENABLED=true nel .env">
                  (non configurato)
                </span>
              )}
            </label>
          </div>

          <div className="add-item-buttons">
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSending}>
              {isSending ? '⏳ Invio...' : 'Pubblica'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} disabled={isSending}>
              Annulla
            </button>
          </div>
        </form>
      )}

      {sortedUpdates.length > 0 ? (
        <ul className="updates-feed">
          {sortedUpdates.map(upd => (
            <li key={upd.id} className={`update-item update-${upd.type || 'info'}`}>
              {editingId === upd.id ? (
                /* ─── Inline edit mode ─────────────────────────────── */
                <div className="update-edit-form">
                  <textarea
                    className="input textarea"
                    value={editForm.text}
                    onChange={e => setEditForm({ ...editForm, text: e.target.value })}
                    rows={2}
                    autoFocus
                  />
                  <div className="tag-selector">
                    {TAG_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        className={`btn btn-tag ${editForm.type === t.value ? 'btn-tag-active' : ''}`}
                        onClick={() => setEditForm({ ...editForm, type: t.value })}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="add-item-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(upd)}>💾 Salva</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>Annulla</button>
                  </div>
                </div>
              ) : (
                /* ─── Normal display mode ──────────────────────────── */
                <>
                  <div className="update-content">
                    <div className="update-header">
                      <strong className="update-author">{upd.authorName}</strong>
                      {upd.createdAt && (
                        <span className="update-time">{formatTimestamp(upd.createdAt)}</span>
                      )}
                      {upd.type && (
                        <span className={`update-tag tag-${upd.type}`}>
                          {TAG_OPTIONS.find(t => t.value === upd.type)?.label || upd.type}
                        </span>
                      )}
                      {upd.notifyByEmail && (
                        <span className="email-badge" title="Notifica email inviata">📧</span>
                      )}
                    </div>
                    <p className="update-text">{upd.text}</p>
                  </div>
                  {canManage(upd) && (
                    <div className="admin-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleStartEdit(upd)}
                        title="Modifica"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-ghost btn-danger"
                        onClick={() => handleDelete(upd.id)}
                        title="Elimina"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={theme.emptyMessages.updates} emoji="📢" />
      )}
    </Card>
  );
}
