/**
 * Stato vuoto con messaggio simpatico.
 */
export default function EmptyState({ message = 'Niente da vedere qui... per ora!', emoji = '📭' }) {
  return (
    <div className="empty-state">
      <span className="empty-state-emoji">{emoji}</span>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}
