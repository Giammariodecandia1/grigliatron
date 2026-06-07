import { useEvent } from '../../contexts/EventContext';

/**
 * Bottom navigation mobile — 4 tab con badge numerici.
 * Visibile solo sotto 768px via CSS.
 */
export default function BottomNav({ activeTab, onTabChange }) {
  const { foodItems, gearItems, tasks, expenses, updates, polls } = useEvent();

  // Badge: elementi liberi nelle liste
  const freeListCount = [
    ...foodItems.filter(i => !i.status || i.status === 'free'),
    ...gearItems.filter(i => !i.status || i.status === 'free'),
    ...tasks.filter(i => !i.status || i.status === 'free'),
  ].length;

  // Badge: aggiornamenti urgenti
  const urgentCount = updates.filter(u => u.type === 'urgente').length;

  // Badge: sondaggi aperti
  const openPollsCount = polls.filter(p => p.status === 'open').length;

  const tabs = [
    { id: 'home', label: 'Home', emoji: '🏠', badge: urgentCount },
    { id: 'liste', label: 'Liste', emoji: '📋', badge: freeListCount },
    { id: 'sondaggi', label: 'Sond.', emoji: '📊', badge: openPollsCount },
    { id: 'spese', label: 'Spese', emoji: '💰', badge: expenses.length > 0 ? expenses.length : 0 },
    { id: 'info', label: 'Info', emoji: 'ℹ️', badge: 0 },
  ];

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`bottom-nav-tab ${activeTab === tab.id ? 'bottom-nav-tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          id={`tab-${tab.id}`}
        >
          <span className="bottom-nav-emoji">{tab.emoji}</span>
          <span className="bottom-nav-label">{tab.label}</span>
          {tab.badge > 0 && (
            <span className="bottom-nav-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
