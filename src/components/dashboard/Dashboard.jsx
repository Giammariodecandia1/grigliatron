import CountdownCard from './CountdownCard';
import ParticipantsCard from './ParticipantsCard';
import FoodCard from './FoodCard';
import GearCard from './GearCard';
import TasksCard from './TasksCard';
import LocationCard from './LocationCard';
import WeatherCard from './WeatherCard';
import ExpensesCard from './ExpensesCard';
import UpdatesCard from './UpdatesCard';
import ReviewsCard from './ReviewsCard';
import { useEvent } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Dashboard principale — layout a griglia responsive.
 */
export default function Dashboard() {
  const { event, loading } = useEvent();
  const { user, loading: authLoading } = useAuth();

  if (loading || authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="dashboard-empty">
        <span className="dashboard-empty-emoji">🔥</span>
        <h2>Nessun evento trovato</h2>
        <p>L'evento non esiste ancora o non è configurato.</p>
        <p className="dashboard-empty-hint">Se sei l'admin, esegui il seed dei dati dalla console.</p>
      </div>
    );
  }

  return (
    <main className="dashboard">
      <div className="dashboard-grid">
        {/* Top row — full width */}
        <div className="dashboard-full">
          <CountdownCard />
        </div>

        {/* Main content area */}
        <div className="dashboard-col-main">
          <ParticipantsCard />
          <FoodCard />
          <GearCard />
          <TasksCard />
          <UpdatesCard />
          <ExpensesCard />
          <ReviewsCard />
        </div>

        {/* Side column */}
        <div className="dashboard-col-side">
          <LocationCard />
          <WeatherCard />
        </div>
      </div>
    </main>
  );
}
