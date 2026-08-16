import { useState } from 'react';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import EmptyState from '../shared/EmptyState';
import { formatTimestamp } from '../../utils/formatters';

export default function FeedbackCard() {
  const { event, feedbacks, addFeedback, deleteFeedback, currentUser, isEventAdmin } = useEvent();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState('bug');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addFeedback({
      text: text.trim(),
      type,
      authorId: currentUser?.uid || currentUser?.guestId || 'anonimo',
      authorName: currentUser?.displayName || currentUser?.name || 'Anonimo',
    });

    setText('');
    setType('bug');
    setShowForm(false);
  };

  const getEmojiForType = (t) => {
    switch (t) {
      case 'bug': return '🐛';
      case 'idea': return '💡';
      default: return '💬';
    }
  };

  return (
    <Card
      title="Feedback & Idee"
      emoji="💡"
      id="feedback-card"
      className="feedback-card"
    >
      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
        Hai trovato un bug? Hai un'idea per migliorare GrigliaTron? Lascia un messaggio qui!
      </p>

      {feedbacks.length > 0 ? (
        <ul className="updates-list">
          {feedbacks.map(f => (
            <li key={f.id} className="update-item">
              <div className="update-header">
                <span className="update-author">{getEmojiForType(f.type)} {f.authorName}</span>
                <span className="update-time">{f.createdAt ? formatTimestamp(f.createdAt) : ''}</span>
              </div>
              <p className="update-text">{f.text}</p>
              {isEventAdmin && (
                <button 
                  className="btn btn-ghost btn-sm btn-danger" 
                  onClick={() => deleteFeedback(f.id)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Elimina
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message="Nessun feedback ancora." emoji="💭" />
      )}

      {currentUser && !showForm && (
        <button className="btn btn-add-item" onClick={() => setShowForm(true)}>
          + Lascia un feedback
        </button>
      )}

      {showForm && (
        <form className="add-item-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select 
              className="input input-sm" 
              value={type} 
              onChange={e => setType(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="bug">🐛 Bug</option>
              <option value="idea">💡 Idea</option>
              <option value="altro">💬 Altro</option>
            </select>
          </div>
          <textarea
            className="input textarea"
            placeholder="Descrivi il problema o la tua idea..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="add-item-buttons">
            <button type="submit" className="btn btn-primary btn-sm">Invia</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annulla</button>
          </div>
        </form>
      )}
    </Card>
  );
}
