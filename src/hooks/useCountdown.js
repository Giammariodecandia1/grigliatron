import { useState, useEffect } from 'react';

/**
 * Hook per countdown live verso una data evento.
 * @param {string} targetDate - Data ISO (es. '2026-05-02')
 * @param {string} targetTime - Fascia oraria (es. 'mattina', '09:00')
 * @returns {{ days, hours, minutes, seconds, isToday, isPast, label }}
 */
export function useCountdown(targetDate, targetTime) {
  const [countdown, setCountdown] = useState(calculate(targetDate, targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculate(targetDate, targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return countdown;
}

function calculate(dateStr, timeStr) {
  if (!dateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPast: false, label: '' };
  }

  // Parse target date, default to 9:00 for "mattina"
  let hour = 9;
  if (timeStr) {
    if (timeStr.includes(':')) {
      hour = parseInt(timeStr.split(':')[0], 10);
    } else if (timeStr.toLowerCase().includes('pomeriggio')) {
      hour = 14;
    } else if (timeStr.toLowerCase().includes('sera')) {
      hour = 19;
    }
  }

  const target = new Date(dateStr + 'T' + String(hour).padStart(2, '0') + ':00:00');
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  // Check if it's the same day
  const isToday =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  const isPast = diff <= 0 && !isToday;

  if (diff <= 0) {
    let label = '';
    if (isToday) {
      label = 'È oggi. Preparare carbonella e fame. 🔥';
    } else {
      label = 'Evento concluso. Lascia una recensione! ⭐';
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday, isPast: !isToday, label };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let label = '';
  if (days === 0 && hours === 0) {
    label = `Manca meno di un'ora! 🔥`;
  } else if (days === 0) {
    label = `Mancano ${hours} ${hours === 1 ? 'ora' : 'ore'} e ${minutes} minuti`;
  } else if (days === 1) {
    label = `Manca 1 giorno, ${hours} ${hours === 1 ? 'ora' : 'ore'} e ${minutes} minuti`;
  } else {
    label = `Mancano ${days} giorni, ${hours} ${hours === 1 ? 'ora' : 'ore'} e ${minutes} minuti`;
  }

  return { days, hours, minutes, seconds, isToday, isPast: false, label };
}
