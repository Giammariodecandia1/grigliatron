/**
 * Dati seed per l'evento iniziale "Grigliata in montagna".
 * Utilizzare la funzione seedEvent() per popolare Firestore.
 *
 * ISTRUZIONI:
 * 1. Importa seedEvent in un componente o nella console
 * 2. Chiama seedEvent() una sola volta
 * 3. Prendi nota dell'eventId generato
 */
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const INITIAL_EVENT = {
  title: 'Grigliata in montagna',
  type: 'grigliata',
  date: '2026-05-02',
  time: 'mattina',
  locationName: 'Foligno, Umbria',
  locationAddress: 'Foligno (PG), Umbria',
  mapsUrl: 'https://maps.google.com/?q=Foligno+Umbria',
  description: 'Una grigliata epica tra amici sulle colline umbre. Carne, birra, aria fresca e zero caos WhatsApp.',
  theme: 'grigliata',
  status: 'open',
  createdBy: '', // Verrà popolato dinamicamente in seedEvent
  admins: [],    // Verrà popolato dinamicamente in seedEvent
  // Location details
  meetingPoint: 'Da definire',
  departureTime: 'Da definire',
  meetingTime: 'Mattina presto',
  parkingNotes: '',
  roadNotes: '',
  locationNotes: 'Zona Foligno — il posto esatto sarà comunicato a breve.',
  // Coordinates for weather (Foligno)
  latitude: 42.9492,
  longitude: 12.7114,
};

export const SEED_FOOD_ITEMS = [
  { name: 'Salsicce', quantity: '2 kg', category: 'Carne', notes: '' },
  { name: 'Bistecche', quantity: '1.5 kg', category: 'Carne', notes: 'Macellaio di fiducia' },
  { name: 'Costine', quantity: '1 kg', category: 'Carne', notes: '' },
  { name: 'Pane', quantity: '3-4 filoni', category: 'Pane', notes: '' },
  { name: 'Verdure grigliate', quantity: '', category: 'Verdure', notes: 'Zucchine, peperoni, melanzane' },
  { name: 'Insalata', quantity: '2 cespi', category: 'Verdure', notes: '' },
  { name: 'Acqua', quantity: '6 bottiglie', category: 'Bevande', notes: 'Naturale e frizzante' },
  { name: 'Birra', quantity: '2 casse', category: 'Bevande', notes: '' },
  { name: 'Vino', quantity: '3 bottiglie', category: 'Bevande', notes: 'Rosso, possibilmente umbro' },
  { name: 'Dolce', quantity: '1', category: 'Dolci', notes: 'Torta o crostate' },
];

export const SEED_GEAR_ITEMS = [
  { name: 'Griglia', quantity: '1', notes: '' },
  { name: 'Carbonella', quantity: '2 sacchi', notes: '' },
  { name: 'Legna', quantity: '', notes: 'Per accensione' },
  { name: 'Accendino / Diavolina', quantity: '', notes: '' },
  { name: 'Pinze', quantity: '2', notes: '' },
  { name: 'Coltelli e tagliere', quantity: '', notes: '' },
  { name: 'Piatti e posate', quantity: '~15 set', notes: 'Monouso o riutilizzabili' },
  { name: 'Bicchieri', quantity: '~15', notes: '' },
  { name: 'Tovaglie / telo', quantity: '2', notes: '' },
  { name: 'Sacchi spazzatura', quantity: '1 rotolo', notes: '' },
  { name: 'Carta e salviette', quantity: '', notes: '' },
  { name: 'Cassa bluetooth', quantity: '1', notes: '' },
  { name: 'Borsa frigo', quantity: '1', notes: '' },
  { name: 'Ghiaccio', quantity: '2 buste', notes: '' },
  { name: 'Sedie pieghevoli', quantity: '4-6', notes: '' },
];

export const SEED_TASKS = [
  { title: 'Comprare la carne', description: 'Salsicce, bistecche, costine dal macellaio', priority: 'important' },
  { title: 'Comprare carbonella', description: '', priority: 'important' },
  { title: 'Verificare posto', description: 'Controllare se la zona è libera e accessibile', priority: 'important' },
  { title: 'Fare la spesa bevande', description: 'Acqua, birra, vino', priority: 'normal' },
  { title: 'Organizzare le macchine', description: 'Chi guida? Quanti posti?', priority: 'normal' },
  { title: 'Controllare meteo', description: 'Il giorno prima verificare le previsioni', priority: 'normal' },
  { title: 'Portare la cassa', description: 'Controllare che sia carica', priority: 'normal' },
];

/**
 * Popola Firestore con i dati seed.
 * Restituisce l'ID dell'evento creato.
 * @param {string} userEmail - L'email dell'utente corrente (diverrà admin)
 */
export async function seedEvent(userEmail) {
  try {
    // Create event document with a specific ID for easy reference
    const eventId = 'grigliata-maggio-2026';
    const eventRef = doc(db, 'events', eventId);

    const email = userEmail || 'admin@example.com';

    await setDoc(eventRef, {
      ...INITIAL_EVENT,
      createdBy: email,
      admins: [email],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Seed food items
    for (const item of SEED_FOOD_ITEMS) {
      await addDoc(collection(db, 'events', eventId, 'foodItems'), {
        ...item,
        createdBy: 'seed',
        createdByName: 'GrigliaTron',
        assignedTo: null,
        assignedToName: null,
        status: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Seed gear items
    for (const item of SEED_GEAR_ITEMS) {
      await addDoc(collection(db, 'events', eventId, 'gearItems'), {
        ...item,
        createdBy: 'seed',
        createdByName: 'GrigliaTron',
        assignedTo: null,
        assignedToName: null,
        status: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Seed tasks
    for (const task of SEED_TASKS) {
      await addDoc(collection(db, 'events', eventId, 'tasks'), {
        ...task,
        dueDate: null,
        createdBy: 'seed',
        createdByName: 'GrigliaTron',
        assignedTo: null,
        assignedToName: null,
        status: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Evento seed creato con ID:', eventId);
    return eventId;
  } catch (error) {
    console.error('❌ Errore seed:', error);
    throw error;
  }
}
