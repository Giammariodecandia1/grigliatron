import InviteCard from '../dashboard/InviteCard';
import LocationCard from '../dashboard/LocationCard';
import WeatherCard from '../dashboard/WeatherCard';
import UpdatesCard from '../dashboard/UpdatesCard';
import ReviewsCard from '../dashboard/ReviewsCard';
import ParticipantsCard from '../dashboard/ParticipantsCard';

/**
 * InfoTab — Dove & Quando, Meteo, Aggiornamenti, Recensioni, Partecipanti completi.
 */
export default function InfoTab() {
  return (
    <div className="tab-content info-tab">
      <InviteCard />
      <ParticipantsCard />
      <LocationCard />
      <WeatherCard />
      <UpdatesCard />
      <ReviewsCard />
    </div>
  );
}
