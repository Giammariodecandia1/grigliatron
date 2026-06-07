/**
 * Lista email dei super-admin globali della piattaforma.
 * Questi utenti hanno poteri admin su TUTTI gli eventi.
 *
 * Per la maggior parte degli utenti, l'admin dell'evento è
 * semplicemente chi lo ha creato (campo `admins[]` sull'evento).
 *
 * Puoi anche configurare via variabile d'ambiente:
 * VITE_ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
 */

// Priorità: env var > lista statica
const envAdmins = import.meta.env.VITE_ADMIN_EMAILS
  ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  : [];

export const ADMIN_EMAILS = envAdmins;

/**
 * Controlla se l'email fornita è di un super-admin globale.
 * @param {string} email
 * @returns {boolean}
 */
export function isGlobalAdmin(email) {
  if (!email || ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
