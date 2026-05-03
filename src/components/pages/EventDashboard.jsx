import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EventProvider } from '../../contexts/EventContext';
import Header from '../layout/Header';
import BottomNav from '../layout/BottomNav';
import HomeTab from '../tabs/HomeTab';
import ListeTab from '../tabs/ListeTab';
import SpeseTab from '../tabs/SpeseTab';
import InfoTab from '../tabs/InfoTab';
import SondaggiTab from '../tabs/SondaggiTab';
import EventEditor from '../admin/EventEditor';
import GuestAccessPage from './GuestAccessPage';

/**
 * Wrapper route per la dashboard di un singolo evento.
 * Gestisce: autenticazione, guest access, EventProvider.
 */
export default function EventDashboard() {
  const { eventId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [guestUser, setGuestUser] = useState(null);

  // Recupera eventuale sessione guest da localStorage
  useEffect(() => {
    if (!user && eventId) {
      const saved = localStorage.getItem(`grigliatron_guest_${eventId}`);
      if (saved) {
        try { setGuestUser(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, [user, eventId]);

  // Salva evento in visited
  useEffect(() => {
    if (eventId && (user || guestUser)) {
      const visited = JSON.parse(localStorage.getItem('grigliatron_visited_events') || '[]');
      if (!visited.includes(eventId)) {
        visited.push(eventId);
        localStorage.setItem('grigliatron_visited_events', JSON.stringify(visited));
      }
    }
  }, [eventId, user, guestUser]);

  if (authLoading) {
    return (
      <div className="app-splash">
        <div className="splash-content">
          <span className="splash-emoji">🔥</span>
          <h1 className="splash-title">GrigliaTron</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Utente non autenticato e nessuna sessione guest
  if (!user && !guestUser) {
    return <GuestAccessPage eventId={eventId} onGuestJoin={setGuestUser} />;
  }

  const currentUser = user || guestUser;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab onNavigate={setActiveTab} />;
      case 'liste': return <ListeTab />;
      case 'sondaggi': return <SondaggiTab />;
      case 'spese': return <SpeseTab />;
      case 'info': return <InfoTab />;
      default: return <HomeTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <EventProvider eventId={eventId} currentUser={currentUser}>
      <div className="app-layout">
        <Header onNavigate={setActiveTab} />
        <EventEditor />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="tab-main">
          {renderTabContent()}
        </main>
      </div>
    </EventProvider>
  );
}
