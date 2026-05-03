import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { useCountdown } from '../../hooks/useCountdown';
import { getTheme } from '../../config/themes';
import { formatDateWithDay } from '../../utils/formatters';
import { getInitials } from '../../utils/formatters';

/**
 * HomeTab — Centro di comando compatto.
 * Mostra: hero evento, countdown inline, riepilogo personale,
 * partecipanti compatti, aggiornamenti urgenti e griglia sezioni.
 */
export default function HomeTab({ onNavigate }) {
  const { user } = useAuth();
  const { event, participants, foodItems, gearItems, tasks, expenses, updates, reviews, polls } = useEvent();
  const countdown = useCountdown(event?.date, event?.time);
  const theme = getTheme(event?.theme || event?.type);

  if (!event) return null;

  // ─── Dati riepilogo personale ──────────────────────────────────
  const myItemsClaimed = user ? [
    ...foodItems.filter(i => (i.volunteers || []).some(v => v.uid === user.uid)),
    ...gearItems.filter(i => (i.volunteers || []).some(v => v.uid === user.uid)),
    ...tasks.filter(i => (i.volunteers || []).some(v => v.uid === user.uid)),
  ] : [];

  const myParticipant = user ? participants.find(p => p.id === user.uid) : null;

  // ─── Partecipanti summary ─────────────────────────────────────
  const confirmedCount = participants.filter(p => p.status === 'partecipo').length;
  const maybeCount = participants.filter(p => p.status === 'forse').length;
  const declinedCount = participants.filter(p => p.status === 'non posso').length;

  // ─── Items liberi ─────────────────────────────────────────────
  const freeFood = foodItems.filter(i => !i.status || i.status === 'free').length;
  const freeGear = gearItems.filter(i => !i.status || i.status === 'free').length;
  const freeTasks = tasks.filter(i => !i.status || i.status === 'free').length;
  const totalFree = freeFood + freeGear + freeTasks;

  // ─── Aggiornamenti urgenti ────────────────────────────────────
  const urgentUpdates = updates.filter(u => u.type === 'urgente');
  const openPolls = polls.filter(p => p.status === 'open');

  // ─── Total expenses ───────────────────────────────────────────
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // ─── Countdown inline text ────────────────────────────────────
  const getCountdownText = () => {
    if (countdown.isPast) return '⭐ Evento concluso';
    if (countdown.isToday) return '🔥 È OGGI!';
    return `${countdown.days}g ${countdown.hours}h ${countdown.minutes}m`;
  };

  // ─── Sezioni card ─────────────────────────────────────────────
  const sections = [
    {
      id: 'food',
      tab: 'liste',
      emoji: theme.sectionEmojis.food,
      title: 'Cibo & Bevande',
      badge: freeFood > 0 ? `${freeFood} liberi` : foodItems.length > 0 ? '✅ OK' : '—',
      badgeType: freeFood > 0 ? 'warning' : 'ok',
      count: foodItems.length,
    },
    {
      id: 'gear',
      tab: 'liste',
      emoji: theme.sectionEmojis.gear,
      title: 'Attrezzatura',
      badge: freeGear > 0 ? `${freeGear} liberi` : gearItems.length > 0 ? '✅ OK' : '—',
      badgeType: freeGear > 0 ? 'warning' : 'ok',
      count: gearItems.length,
    },
    {
      id: 'tasks',
      tab: 'liste',
      emoji: theme.sectionEmojis.tasks,
      title: 'Cose da fare',
      badge: freeTasks > 0 ? `${freeTasks} liberi` : tasks.length > 0 ? '✅ OK' : '—',
      badgeType: freeTasks > 0 ? 'warning' : 'ok',
      count: tasks.length,
    },
    {
      id: 'sondaggi',
      tab: 'sondaggi',
      emoji: '📊',
      title: 'Sondaggi',
      badge: openPolls.length > 0 ? `${openPolls.length} aperti` : polls.length > 0 ? 'Chiusi' : '—',
      badgeType: openPolls.length > 0 ? 'warning' : 'info',
      count: polls.length,
    },
    {
      id: 'expenses',
      tab: 'spese',
      emoji: theme.sectionEmojis.expenses,
      title: 'Spese',
      badge: expenses.length > 0 ? `€${totalExpenses.toFixed(0)}` : '—',
      badgeType: 'info',
      count: expenses.length,
    },
    {
      id: 'location',
      tab: 'info',
      emoji: theme.sectionEmojis.location,
      title: 'Dove & Quando',
      badge: event.locationName ? '📍' : 'Da definire',
      badgeType: 'info',
    },
    {
      id: 'updates',
      tab: 'info',
      emoji: theme.sectionEmojis.updates,
      title: 'Aggiornamenti',
      badge: urgentUpdates.length > 0 ? `${urgentUpdates.length} urgenti` : updates.length > 0 ? `${updates.length}` : '—',
      badgeType: urgentUpdates.length > 0 ? 'danger' : 'info',
      count: updates.length,
    },
    {
      id: 'weather',
      tab: 'info',
      emoji: theme.sectionEmojis.weather,
      title: 'Meteo',
      badge: '🌤️',
      badgeType: 'info',
    },
    {
      id: 'participants',
      tab: 'info',
      emoji: theme.sectionEmojis.participants,
      title: 'Partecipanti',
      badge: confirmedCount > 0 ? `${confirmedCount} conf.` : '—',
      badgeType: confirmedCount > 0 ? 'ok' : 'info',
    },
    {
      id: 'reviews',
      tab: 'info',
      emoji: theme.sectionEmojis.reviews,
      title: 'Recensioni',
      badge: reviews.length > 0 ? `${reviews.length}` : '—',
      badgeType: 'info',
    },
  ];

  const handleSectionClick = (section) => {
    // Navigate to the target tab
    onNavigate(section.tab);
    
    // Set hash so the mounted tab knows what to show/scroll to
    window.location.hash = section.id;
    
    // Attempt to scroll to the element. Since the tab might need to mount,
    // we use a retry mechanism for up to 1 second.
    let attempts = 0;
    const interval = setInterval(() => {
      const el = document.getElementById(`${section.id}-card`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80; // Offset for header
        window.scrollTo({ top: y, behavior: 'smooth' });
        clearInterval(interval);
      }
      if (++attempts > 10) clearInterval(interval); // Stop after 1 second (10 * 100ms)
    }, 100);
  };

  return (
    <div className="home-tab">

      {/* ─── Hero compatto ────────────────────────────────────────── */}
      <div className="home-hero" style={{ background: theme.gradientSubtle }}>
        <div className="home-hero-info">
          <span className="home-hero-emoji">{theme.headerEmoji}</span>
          <div>
            <h2 className="home-hero-title">{event.title}</h2>
            <p className="home-hero-meta">
              {formatDateWithDay(event.date)}
              {event.time && ` — ${event.time}`}
              {event.locationName && ` — ${event.locationName}`}
            </p>
          </div>
        </div>
        <div className="home-hero-countdown">
          <span className={`home-countdown-badge ${countdown.isToday ? 'countdown-today-badge' : countdown.isPast ? 'countdown-past-badge' : ''}`}>
            {getCountdownText()}
          </span>
        </div>
      </div>

      {/* ─── Aggiornamenti urgenti ────────────────────────────────── */}
      {urgentUpdates.length > 0 && (
        <div className="home-urgent">
          {urgentUpdates.slice(0, 2).map(upd => (
            <div key={upd.id} className="home-urgent-item" onClick={() => onNavigate('info')}>
              <span className="home-urgent-icon">🚨</span>
              <div className="home-urgent-content">
                <strong>{upd.authorName}</strong>
                <p>{upd.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Partecipanti compatti ────────────────────────────────── */}
      <div className="home-participants-summary" onClick={() => onNavigate('info')}>
        <div className="home-participants-header">
          <span className="home-section-emoji">{theme.sectionEmojis.participants}</span>
          <h3 className="home-section-title">Partecipanti</h3>
        </div>
        <div className="home-participants-pills">
          <span className="participant-pill pill-confirmed">✅ {confirmedCount}</span>
          {maybeCount > 0 && <span className="participant-pill pill-maybe">🤔 {maybeCount}</span>}
          {declinedCount > 0 && <span className="participant-pill pill-declined">❌ {declinedCount}</span>}
        </div>
        {/* Avatar strip */}
        {participants.length > 0 && (
          <div className="home-participants-avatars">
            {participants.filter(p => p.status === 'partecipo').slice(0, 8).map(p => (
              p.photoURL ? (
                <img key={p.id} src={p.photoURL} alt={p.name} className="home-avatar" title={p.name} />
              ) : (
                <div key={p.id} className="home-avatar home-avatar-initials" title={p.name}>
                  {getInitials(p.name)}
                </div>
              )
            ))}
            {confirmedCount > 8 && (
              <div className="home-avatar home-avatar-more">+{confirmedCount - 8}</div>
            )}
          </div>
        )}
      </div>

      {/* ─── Riepilogo personale ──────────────────────────────────── */}
      {user && myParticipant && (
        <div className="home-personal">
          <div className="home-personal-header">
            <span className="home-section-emoji">👤</span>
            <h3 className="home-section-title">Il tuo riepilogo</h3>
          </div>
          <div className="home-personal-stats">
            <div className="personal-stat">
              <span className="personal-stat-value">{myItemsClaimed.length}</span>
              <span className="personal-stat-label">cose prese</span>
            </div>
            <div className="personal-stat-divider" />
            <div className="personal-stat">
              <span className="personal-stat-value">
                {myParticipant.status === 'partecipo' ? '✅' : myParticipant.status === 'forse' ? '🤔' : '❌'}
              </span>
              <span className="personal-stat-label">{myParticipant.status}</span>
            </div>
          </div>
          {myItemsClaimed.length > 0 && (
            <div className="home-personal-items">
              {myItemsClaimed.slice(0, 5).map(item => (
                <span key={item.id} className="personal-item-pill">
                  {item.name || item.title}
                </span>
              ))}
              {myItemsClaimed.length > 5 && (
                <span className="personal-item-pill personal-item-more">
                  +{myItemsClaimed.length - 5} altri
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Griglia sezioni ─────────────────────────────────────── */}
      <div className="home-sections">
        <h3 className="home-sections-heading">Sezioni</h3>
        <div className="home-sections-grid">
          {sections.map(section => (
            <button
              key={section.id}
              className="home-section-card"
              onClick={() => handleSectionClick(section)}
              id={`home-card-${section.id}`}
            >
              <span className="section-card-emoji">{section.emoji}</span>
              <span className="section-card-title">{section.title}</span>
              <span className={`section-card-badge badge-${section.badgeType}`}>
                {section.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Cosa manca ──────────────────────────────────────────── */}
      {totalFree > 0 && (
        <div className="home-missing-banner" onClick={() => onNavigate('liste')}>
          <span className="home-missing-icon">⚠️</span>
          <span className="home-missing-text">
            <strong>{totalFree} cose</strong> servono ancora volontari!
          </span>
          <span className="home-missing-arrow">→</span>
        </div>
      )}
    </div>
  );
}
