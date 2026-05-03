import { useEvent } from '../../contexts/EventContext';
import { useCountdown } from '../../hooks/useCountdown';
import Card from '../shared/Card';
import { getTheme } from '../../config/themes';

/**
 * Card countdown con cifre animate e stati dinamici.
 */
export default function CountdownCard() {
  const { event } = useEvent();
  const countdown = useCountdown(event?.date, event?.time);
  const theme = getTheme(event?.theme || event?.type);

  if (!event) return null;

  return (
    <Card
      title="Countdown"
      emoji={theme.sectionEmojis.countdown}
      id="countdown-card"
      className="countdown-card"
    >
      {countdown.isPast ? (
        <div className="countdown-past">
          <span className="countdown-past-emoji">⭐</span>
          <p className="countdown-past-text">{countdown.label}</p>
        </div>
      ) : countdown.isToday ? (
        <div className="countdown-today">
          <span className="countdown-today-emoji">🔥</span>
          <p className="countdown-today-text">{countdown.label}</p>
        </div>
      ) : (
        <>
          <div className="countdown-digits">
            <div className="countdown-block">
              <span className="countdown-number">{countdown.days}</span>
              <span className="countdown-label">giorni</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-block">
              <span className="countdown-number">{countdown.hours}</span>
              <span className="countdown-label">ore</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-block">
              <span className="countdown-number">{countdown.minutes}</span>
              <span className="countdown-label">min</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-block">
              <span className="countdown-number countdown-seconds">{countdown.seconds}</span>
              <span className="countdown-label">sec</span>
            </div>
          </div>
          <p className="countdown-text">{countdown.label}</p>
        </>
      )}
    </Card>
  );
}
