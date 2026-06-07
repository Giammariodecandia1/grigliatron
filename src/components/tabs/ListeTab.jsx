import { useState, useEffect } from 'react';
import FoodCard from '../dashboard/FoodCard';
import GearCard from '../dashboard/GearCard';
import TasksCard from '../dashboard/TasksCard';

/**
 * ListeTab — contiene Cibo & Bevande, Attrezzatura, Cose da fare.
 * Sub-tab interne per navigare tra le tre sezioni.
 */
const SUB_TABS = [
  { id: 'food', label: '🥩 Cibo', emoji: '🥩' },
  { id: 'gear', label: '⛺ Attrezzatura', emoji: '⛺' },
  { id: 'tasks', label: '📋 Tasks', emoji: '📋' },
];

export default function ListeTab() {
  const [activeSubTab, setActiveSubTab] = useState('food');

  useEffect(() => {
    // Read initial hash if we navigated directly from home
    const hash = window.location.hash.replace('#', '');
    if (['food', 'gear', 'tasks'].includes(hash)) {
      setActiveSubTab(hash);
    }
  }, []);

  return (
    <div className="tab-content liste-tab">
      {/* Sub-tab selector */}
      <div className="sub-tabs">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sub-tab ${activeSubTab === tab.id ? 'sub-tab-active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="sub-tab-content">
        {activeSubTab === 'food' && <FoodCard />}
        {activeSubTab === 'gear' && <GearCard />}
        {activeSubTab === 'tasks' && <TasksCard />}
      </div>
    </div>
  );
}
