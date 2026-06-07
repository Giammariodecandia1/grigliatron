/**
 * Utility di condivisione per GrigliaTron.
 * Genera riepiloghi testuali, lista "cosa manca", e gestisce WhatsApp / clipboard.
 */
import { formatDateWithDay } from './formatters';

/**
 * Genera il riepilogo completo dell'evento.
 */
export function generateEventSummary(event, foodItems, gearItems, tasks, participants) {
  if (!event) return '';

  const lines = [];
  const theme = event.theme || event.type || 'grigliata';
  const emoji = theme === 'grigliata' ? '🔥' : theme === 'compleanno' ? '🎂' : theme === 'cena' ? '🍷' : theme === 'viaggio' ? '🗺️' : '🌿';

  // Header
  lines.push(`${emoji} *GRIGLIATRON — ${event.title}*`);
  if (event.date) lines.push(`📅 ${formatDateWithDay(event.date)}${event.time ? ` — ${event.time}` : ''}`);
  if (event.locationName) lines.push(`📍 ${event.locationName}`);
  lines.push('');

  // Partecipanti
  if (participants.length > 0) {
    const confirmed = participants.filter(p => p.status === 'partecipo');
    const maybe = participants.filter(p => p.status === 'forse');
    lines.push(`👥 *PARTECIPANTI* (${confirmed.length} confermati)`);
    if (confirmed.length > 0) lines.push(confirmed.map(p => `✅ ${p.name}`).join(', '));
    if (maybe.length > 0) lines.push(maybe.map(p => `🤔 ${p.name}`).join(', '));
    lines.push('');
  }

  // Cibo & Bevande
  if (foodItems.length > 0) {
    lines.push('🥩 *CIBO & BEVANDE*');
    foodItems.forEach(item => {
      const status = getItemStatusEmoji(item);
      const assignee = getItemAssignee(item);
      const qty = item.quantity ? ` (${item.quantity})` : '';
      lines.push(`${status} ${item.name}${qty}${assignee}`);
    });
    lines.push('');
  }

  // Attrezzatura
  if (gearItems.length > 0) {
    lines.push('⛺ *ATTREZZATURA*');
    gearItems.forEach(item => {
      const status = getItemStatusEmoji(item);
      const assignee = getItemAssignee(item);
      const qty = item.quantity ? ` (${item.quantity})` : '';
      lines.push(`${status} ${item.name}${qty}${assignee}`);
    });
    lines.push('');
  }

  // Tasks
  if (tasks.length > 0) {
    lines.push('📋 *DA FARE*');
    tasks.forEach(item => {
      const status = getItemStatusEmoji(item);
      const assignee = getItemAssignee(item);
      lines.push(`${status} ${item.title || item.name}${assignee}`);
    });
    lines.push('');
  }

  lines.push('_Organizzato con GrigliaTron_ 🔥');

  return lines.join('\n');
}

/**
 * Genera SOLO la lista di cosa manca (items senza volontari).
 * Questa è la feature killer per la chat di gruppo.
 */
export function generateMissingItems(event, foodItems, gearItems, tasks) {
  if (!event) return '';

  const lines = [];
  lines.push(`⚠️ *COSA MANCA — ${event.title}*`);
  lines.push('');

  const missingFood = foodItems.filter(i => !i.status || i.status === 'free');
  const missingGear = gearItems.filter(i => !i.status || i.status === 'free');
  const missingTasks = tasks.filter(i => !i.status || i.status === 'free');

  const totalMissing = missingFood.length + missingGear.length + missingTasks.length;

  if (totalMissing === 0) {
    lines.push('✅ *Tutto coperto!* Niente da aggiungere.');
    lines.push('');
    lines.push('_GrigliaTron_ 🔥');
    return lines.join('\n');
  }

  if (missingFood.length > 0) {
    lines.push('🥩 *Cibo & Bevande*');
    missingFood.forEach(item => {
      const qty = item.quantity ? ` (${item.quantity})` : '';
      lines.push(`🔴 ${item.name}${qty}`);
    });
    lines.push('');
  }

  if (missingGear.length > 0) {
    lines.push('⛺ *Attrezzatura*');
    missingGear.forEach(item => {
      const qty = item.quantity ? ` (${item.quantity})` : '';
      lines.push(`🔴 ${item.name}${qty}`);
    });
    lines.push('');
  }

  if (missingTasks.length > 0) {
    lines.push('📋 *Da fare*');
    missingTasks.forEach(item => {
      lines.push(`🔴 ${item.title || item.name}`);
    });
    lines.push('');
  }

  lines.push(`👉 *${totalMissing} cose da coprire!*`);
  lines.push('');
  lines.push('_Organizzato con GrigliaTron_ 🔥');

  return lines.join('\n');
}

/**
 * Condivide testo via WhatsApp (apre wa.me).
 */
export function shareViaWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

/**
 * Copia testo negli appunti. Restituisce true se OK.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback per browser vecchi
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// ─── Helpers privati ────────────────────────────────────────────

function getItemStatusEmoji(item) {
  if (item.status === 'completed' || item.status === 'done') return '✅';
  if (item.status === 'claimed') return '🟡';
  return '🔴';
}

function getItemAssignee(item) {
  const volunteers = item.volunteers || [];
  if (item.status === 'completed' || item.status === 'done') return '';
  if (volunteers.length > 0) {
    return ` → ${volunteers.map(v => v.name).join(', ')}`;
  }
  if (item.status === 'claimed' && item.assignedToName) {
    return ` → ${item.assignedToName}`;
  }
  return ' → *SERVE!*';
}
