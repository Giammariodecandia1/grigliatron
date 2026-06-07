import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';
import { formatTimestamp } from '../../utils/formatters';

/**
 * Card Recensioni post-evento — "Com'è andata?"
 * V1.1: Aggiunto modifica/cancellazione per autore + admin.
 */
export default function ReviewsCard() {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, reviews, addReview, deleteReview, updateItem } = useEvent();
  const theme = getTheme(event?.theme || event?.type);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  if (!event) return null;

  const isCompleted = event.status === 'completed' || event.status === 'archived';
  const alreadyReviewed = user && reviews.some(r => r.authorId === user.uid);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const canManage = (review) => {
    if (!user) return false;
    return isEventAdmin || review.authorId === user.uid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addReview({
      rating,
      comment: comment.trim(),
      authorId: user.uid,
      authorName: user.displayName || 'Anonimo',
    });
    setComment('');
    setRating(5);
    setShowForm(false);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Eliminare questa recensione?')) {
      await deleteReview(reviewId);
    }
  };

  const handleStartEdit = (rev) => {
    setEditForm({ rating: rev.rating || 5, comment: rev.comment || '' });
    setEditingId(rev.id);
  };

  const handleSaveEdit = async (rev) => {
    if (!editForm.comment.trim()) return;
    await updateItem('reviews', rev.id, {
      rating: editForm.rating,
      comment: editForm.comment.trim(),
    });
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  return (
    <Card
      title="Com'è andata?"
      emoji={theme.sectionEmojis.reviews}
      count={reviews.length > 0 ? avgRating : undefined}
      countLabel={reviews.length > 0 ? '⭐ media' : ''}
      id="reviews-card"
    >
      {!isCompleted && (
        <div className="reviews-locked">
          <span className="reviews-locked-emoji">🔒</span>
          <p>Le recensioni saranno disponibili a evento concluso.</p>
        </div>
      )}

      {isCompleted && user && !alreadyReviewed && !showForm && (
        <button className="btn btn-add-item" onClick={() => setShowForm(true)}>
          ⭐ Lascia una recensione
        </button>
      )}

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-rating-selector">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`review-star ${star <= rating ? 'review-star-active' : ''}`}
                onClick={() => setRating(star)}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea
            className="input textarea"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Com'è andata? Racconta!"
            rows={2}
            autoFocus
          />
          <div className="add-item-buttons">
            <button type="submit" className="btn btn-primary btn-sm">Pubblica</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annulla</button>
          </div>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="reviews-list">
          {reviews.map(rev => (
            <li key={rev.id} className="review-item">
              {editingId === rev.id ? (
                /* ─── Inline edit mode ────────────────────────────── */
                <div className="review-edit-form">
                  <div className="review-rating-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`review-star ${star <= editForm.rating ? 'review-star-active' : ''}`}
                        onClick={() => setEditForm({ ...editForm, rating: star })}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="input textarea"
                    value={editForm.comment}
                    onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                    rows={2}
                    autoFocus
                  />
                  <div className="add-item-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(rev)}>💾 Salva</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>Annulla</button>
                  </div>
                </div>
              ) : (
                /* ─── Normal display mode ─────────────────────────── */
                <>
                  <div className="review-header">
                    <strong>{rev.authorName}</strong>
                    <span className="review-stars">
                      {'⭐'.repeat(rev.rating || 0)}
                    </span>
                    {rev.createdAt && (
                      <span className="review-time">{formatTimestamp(rev.createdAt)}</span>
                    )}
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  {canManage(rev) && (
                    <div className="admin-actions review-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleStartEdit(rev)}
                        title="Modifica"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-ghost btn-danger"
                        onClick={() => handleDelete(rev.id)}
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
      )}

      {isCompleted && reviews.length === 0 && !showForm && (
        <EmptyState message="Nessuna recensione ancora. Sii il primo!" emoji="✨" />
      )}
    </Card>
  );
}
