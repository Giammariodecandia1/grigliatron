/**
 * Formattazione date e testi in italiano.
 */

const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
];

const GIORNI = [
  'domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'
];

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MESI[d.getMonth()]}`;
}

export function formatDateWithDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'ora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min fa`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h fa`;

  return `${d.getDate()} ${MESI[d.getMonth()].substring(0, 3)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatCurrency(amount) {
  if (amount == null) return '€ 0,00';
  return `€ ${Number(amount).toFixed(2).replace('.', ',')}`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getStatusLabel(status) {
  const labels = {
    draft: 'Bozza',
    open: 'Aperto',
    active: 'In corso',
    completed: 'Concluso',
    archived: 'Archiviato',
    // item statuses
    free: 'Ancora libero',
    claimed: 'Ci pensa qualcuno',
    done: 'Fatto',
    // participant statuses
    partecipo: 'Partecipo ✅',
    forse: 'Forse 🤔',
    'non posso': 'Non posso ❌',
    // task priorities
    normal: 'Normale',
    important: 'Importante',
  };
  return labels[status] || status;
}

export function getEventStatusColor(status) {
  const colors = {
    draft: '#78909C',
    open: '#4CAF50',
    active: '#FF9800',
    completed: '#2196F3',
    archived: '#9E9E9E',
  };
  return colors[status] || '#78909C';
}
