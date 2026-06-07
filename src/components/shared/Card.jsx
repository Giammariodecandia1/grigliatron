/**
 * Card container con glassmorphism e barra di progresso opzionale.
 * @param {{ title, emoji, count, countLabel, children, className, actions, id, items }} props
 */
export default function Card({ title, emoji, count, countLabel, children, className = '', actions, id, items }) {
  // Calcola progresso se ci sono items
  const progress = items && items.length > 0 ? calculateProgress(items) : null;

  return (
    <section className={`card ${className}`} id={id}>
      <div className="card-header">
        <div className="card-title-row">
          {emoji && <span className="card-emoji">{emoji}</span>}
          <h2 className="card-title">{title}</h2>
          {count !== undefined && (
            <span className="card-count">
              {count}{countLabel ? ` ${countLabel}` : ''}
            </span>
          )}
        </div>
        {actions && <div className="card-actions">{actions}</div>}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="card-progress">
          <div className="card-progress-bar">
            <div
              className="card-progress-done"
              style={{ width: `${progress.donePercent}%` }}
            />
            <div
              className="card-progress-claimed"
              style={{ width: `${progress.claimedPercent}%` }}
            />
          </div>
          <span className="card-progress-label">
            {progress.doneCount + progress.claimedCount}/{progress.total} coperti
          </span>
        </div>
      )}

      <div className="card-body">
        {children}
      </div>
    </section>
  );
}

function calculateProgress(items) {
  const total = items.length;
  if (total === 0) return null;

  const doneCount = items.filter(i => i.status === 'completed' || i.status === 'done').length;
  const claimedCount = items.filter(i => i.status === 'claimed').length;

  return {
    total,
    doneCount,
    claimedCount,
    donePercent: (doneCount / total) * 100,
    claimedPercent: (claimedCount / total) * 100,
  };
}
