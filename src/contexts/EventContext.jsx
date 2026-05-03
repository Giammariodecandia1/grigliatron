import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { db, storage } from '../config/firebase';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getTemplate } from '../config/templates';
import { isGlobalAdmin } from '../config/adminEmails';

const EventContext = createContext(null);

/**
 * EventProvider gestisce lo stato dell'evento corrente e tutte le sue sub-collection.
 * Ogni sub-collection usa un listener real-time per aggiornamenti live.
 *
 * @param {string} eventId - ID dell'evento Firestore
 * @param {object} currentUser - Utente autenticato (da AuthContext) o guest
 * @param {React.ReactNode} children
 */
export function EventProvider({ eventId, currentUser, children }) {
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [gearItems, setGearItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [shoppingLinks, setShoppingLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Event document listener ─────────────────────────────────────
  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'events', eventId), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, ...snap.data() });
      } else {
        setEvent(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [eventId]);

  // ─── Sub-collection listeners ──────────────────────────────────
  // Helper (non è un hook): crea un listener Firestore e restituisce la funzione unsubscribe
  const createSubListener = (subPath, setter, orderField) => {
    if (!eventId) return () => {};
    const colRef = collection(db, 'events', eventId, subPath);
    const q = query(colRef, orderBy(orderField, 'asc'));
    return onSnapshot(q, (snap) => {
      setter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  };

  // Ogni sub-collection ha il proprio useEffect — nessuna violazione hook rules
  useEffect(() => { if (!eventId) return; const u = createSubListener('participants', setParticipants, 'joinedAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('foodItems', setFoodItems, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('gearItems', setGearItems, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('tasks', setTasks, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('expenses', setExpenses, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('updates', setUpdates, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('reviews', setReviews, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('polls', setPolls, 'createdAt'); return () => u(); }, [eventId]);
  useEffect(() => { if (!eventId) return; const u = createSubListener('shoppingLinks', setShoppingLinks, 'createdAt'); return () => u(); }, [eventId]);

  // ─── Per-event admin check ───────────────────────────────────────
  const isEventAdmin = useMemo(() => {
    if (!currentUser || !event) return false;
    const email = currentUser.email;
    if (!email) return false; // Guest non può essere admin
    // Check per-event admins array
    if (Array.isArray(event.admins) && event.admins.includes(email)) return true;
    // Fallback: createdBy (per eventi legacy senza admins[])
    if (event.createdBy === email) return true;
    // Super-admin globale (opzionale, da env var)
    if (isGlobalAdmin(email)) return true;
    return false;
  }, [currentUser, event]);

  // ─── Event CRUD ──────────────────────────────────────────────────
  const updateEvent = useCallback(async (data) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  // ─── Participants ────────────────────────────────────────────────
  const joinEvent = useCallback(async (user, status = 'partecipo', notes = '') => {
    if (!eventId || !user) return;
    const docId = user.uid || user.guestId;
    if (!docId) return;
    await setDoc(doc(db, 'events', eventId, 'participants', docId), {
      name: user.displayName || user.name || 'Anonimo',
      email: user.email || null,
      photoURL: user.photoURL || '',
      status,
      notes,
      isGuest: user.isGuest || false,
      joinedAt: serverTimestamp(),
    });
  }, [eventId]);

  const updateParticipant = useCallback(async (userId, data) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId, 'participants', userId), data);
  }, [eventId]);

  const removeParticipant = useCallback(async (userId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'participants', userId));
  }, [eventId]);

  const addGuestParticipant = useCallback(async (name) => {
    if (!eventId) return;
    // Genera un ID univoco per il guest (es: guest_16843..._a1b2c)
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    await setDoc(doc(db, 'events', eventId, 'participants', guestId), {
      id: guestId,
      name: name,
      status: 'partecipo',
      isGuest: true,
      quoteCount: 1,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  // ─── Generic item operations (food, gear, tasks) ────────────────
  const addItem = useCallback(async (subCollection, data) => {
    if (!eventId) return;
    const colRef = collection(db, 'events', eventId, subCollection);
    await addDoc(colRef, {
      ...data,
      volunteers: [],
      status: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const updateItem = useCallback(async (subCollection, itemId, data) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId, subCollection, itemId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const deleteItem = useCallback(async (subCollection, itemId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, subCollection, itemId));
  }, [eventId]);

  /**
   * Multi-volunteer claim: aggiunge l'utente alla lista volunteers.
   * Non blocca gli altri — tutti possono aggiungersi.
   */
  const claimItem = useCallback(async (subCollection, itemId, user) => {
    if (!eventId || !user) return;
    const volunteerEntry = {
      uid: user.uid || user.guestId,
      name: user.displayName || user.name || 'Anonimo',
    };
    await updateDoc(doc(db, 'events', eventId, subCollection, itemId), {
      volunteers: arrayUnion(volunteerEntry),
      status: 'claimed',
      // Mantieni retrocompatibilità con campi legacy
      assignedTo: user.uid || user.guestId,
      assignedToName: user.displayName || user.name || 'Anonimo',
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  /**
   * Rimuove un singolo volontario dalla lista.
   * Se la lista rimane vuota, torna a 'free'.
   */
  const releaseItem = useCallback(async (subCollection, itemId, user = null, currentVolunteers = []) => {
    if (!eventId) return;
    const docRef = doc(db, 'events', eventId, subCollection, itemId);
    const userId = user?.uid || user?.guestId;

    if (userId) {
      // Rimuovi questo specifico utente
      const volunteerEntry = currentVolunteers.find(v => v.uid === userId);
      if (volunteerEntry) {
        const remaining = currentVolunteers.filter(v => v.uid !== userId);
        await updateDoc(docRef, {
          volunteers: arrayRemove(volunteerEntry),
          status: remaining.length > 0 ? 'claimed' : 'free',
          assignedTo: remaining.length > 0 ? remaining[0].uid : null,
          assignedToName: remaining.length > 0 ? remaining[0].name : null,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      // Admin: libera tutto
      await updateDoc(docRef, {
        volunteers: [],
        assignedTo: null,
        assignedToName: null,
        status: 'free',
        updatedAt: serverTimestamp(),
      });
    }
  }, [eventId]);

  const completeItem = useCallback(async (subCollection, itemId) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId, subCollection, itemId), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  // ─── Updates (bacheca) ───────────────────────────────────────────
  const addUpdate = useCallback(async (data) => {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'updates'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }, [eventId]);

  const deleteUpdate = useCallback(async (updateId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'updates', updateId));
  }, [eventId]);

  // ─── Reviews ─────────────────────────────────────────────────────
  const addReview = useCallback(async (data) => {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'reviews'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }, [eventId]);

  const deleteReview = useCallback(async (reviewId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'reviews', reviewId));
  }, [eventId]);

  // ─── Expenses ────────────────────────────────────────────────────
  const addExpense = useCallback(async (data) => {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'expenses'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }, [eventId]);

  const deleteExpense = useCallback(async (expenseId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'expenses', expenseId));
  }, [eventId]);

  // ─── Polls ───────────────────────────────────────────────────────
  const addPoll = useCallback(async (data) => {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'polls'), {
      ...data,
      status: 'open',
      votes: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const updatePoll = useCallback(async (pollId, data) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId, 'polls', pollId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const deletePoll = useCallback(async (pollId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'polls', pollId));
  }, [eventId]);

  const votePoll = useCallback(async (pollId, user, selectedOptionIds) => {
    if (!eventId || !user) return;
    const oderId = user.uid || user.guestId;
    const votePath = `votes.${oderId}`;
    await updateDoc(doc(db, 'events', eventId, 'polls', pollId), {
      [votePath]: {
        selectedOptionIds,
        userName: user.displayName || user.name || 'Anonimo',
        updatedAt: serverTimestamp(),
      },
    });
  }, [eventId]);

  // ─── Shopping Links ──────────────────────────────────────────────
  const addShoppingLink = useCallback(async (data) => {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'shoppingLinks'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const updateShoppingLink = useCallback(async (linkId, data) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId, 'shoppingLinks', linkId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [eventId]);

  const deleteShoppingLink = useCallback(async (linkId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'shoppingLinks', linkId));
  }, [eventId]);

  // ─── Templates ───────────────────────────────────────────────────
  /**
   * Carica un template aggiungendo items al contenuto esistente.
   * Non sovrascrive mai — aggiunge e basta.
   */
  const loadTemplate = useCallback(async (templateId, user) => {
    if (!eventId || !user) return;
    const template = getTemplate(templateId);
    if (!template) return;

    const uid = user.uid || user.guestId;
    const baseItem = {
      createdBy: uid,
      createdByName: user.displayName || user.name || 'Anonimo',
      assignedTo: null,
      assignedToName: null,
      volunteers: [],
      status: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add food items
    for (const item of (template.foodItems || [])) {
      await addDoc(collection(db, 'events', eventId, 'foodItems'), {
        ...item,
        ...baseItem,
      });
    }

    // Add gear items
    for (const item of (template.gearItems || [])) {
      await addDoc(collection(db, 'events', eventId, 'gearItems'), {
        ...item,
        ...baseItem,
      });
    }

    // Add tasks
    for (const task of (template.tasks || [])) {
      await addDoc(collection(db, 'events', eventId, 'tasks'), {
        ...task,
        dueDate: null,
        ...baseItem,
      });
    }
  }, [eventId]);

  // ─── Email Notifications (Milestone 4) ──────────────────────────
  /**
   * Invia notifica email ai partecipanti tramite collection `mail`.
   * Compatibile con Firebase Extension "Trigger Email from Firestore".
   */
  const sendEmailNotification = useCallback(async (updateData) => {
    if (!eventId) return;
    const emails = participants
      .filter(p => p.email && (p.status === 'partecipo' || p.status === 'forse'))
      .map(p => p.email);

    if (emails.length === 0) return;

    const eventTitle = event?.title || 'Evento';
    const typeBadge = updateData.type === 'urgente' ? '🚨 URGENTE' : updateData.type === 'cambio' ? '🔄 Cambio' : 'ℹ️ Info';

    await addDoc(collection(db, 'mail'), {
      to: emails,
      message: {
        subject: `[GrigliaTron] ${typeBadge} — ${eventTitle}`,
        text: `${updateData.authorName} ha pubblicato un aggiornamento: ${updateData.text}`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#FF6B35;">🔥 GrigliaTron</h2>
          <h3>${eventTitle}</h3>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;border-left:4px solid ${updateData.type === 'urgente' ? '#f44336' : updateData.type === 'cambio' ? '#FF9800' : '#2196F3'};">
            <p style="margin:0 0 8px;"><strong>${updateData.authorName}</strong> · ${typeBadge}</p>
            <p style="margin:0;font-size:16px;">${updateData.text}</p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:16px;">Ricevi questa email perché partecipi all'evento su GrigliaTron.</p>
        </div>`,
      },
    });
  }, [eventId, participants, event]);

  // ─── Cover Image (Post-evento) ──────────────────────────────────
  const uploadCoverImage = useCallback(async (file) => {
    if (!eventId || !storage || !file) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const coverPath = `events/${eventId}/cover/event-cover.${ext}`;
    const fileRef = ref(storage, coverPath);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, 'events', eventId), {
      coverImageUrl: url,
      coverImagePath: coverPath,
      postEventPhotoUploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return url;
  }, [eventId]);

  // ─── Cleanup Receipts (libera Storage) ──────────────────────────
  /**
   * Cancella tutti i file scontrino da Firebase Storage e pulisce
   * i campi receiptUrl/receiptPath dai documenti expense.
   * Imposta receiptArchived = true per indicare che lo scontrino
   * è stato archiviato nel PDF.
   */
  const cleanupReceipts = useCallback(async () => {
    if (!eventId || !storage) return;
    const expensesWithReceipts = expenses.filter(e => e.receiptPath);
    for (const exp of expensesWithReceipts) {
      try {
        await deleteObject(ref(storage, exp.receiptPath));
      } catch (err) {
        console.warn(`Non riesco a cancellare ${exp.receiptPath}:`, err.message);
      }
      await updateDoc(doc(db, 'events', eventId, 'expenses', exp.id), {
        receiptUrl: null,
        receiptPath: null,
        receiptArchived: true,
        updatedAt: serverTimestamp(),
      });
    }
  }, [eventId, expenses]);

  const value = {
    event,
    eventId,
    loading,
    isEventAdmin,
    participants,
    foodItems,
    gearItems,
    tasks,
    expenses,
    updates,
    reviews,
    polls,
    shoppingLinks,
    // Event
    updateEvent,
    // Participants
    joinEvent,
    updateParticipant,
    removeParticipant,
    addGuestParticipant,
    // Items (food/gear/tasks)
    addItem,
    updateItem,
    deleteItem,
    claimItem,
    releaseItem,
    completeItem,
    // Updates
    addUpdate,
    deleteUpdate,
    // Reviews
    addReview,
    deleteReview,
    // Expenses
    addExpense,
    deleteExpense,
    // Polls
    addPoll,
    updatePoll,
    deletePoll,
    votePoll,
    // Shopping Links
    addShoppingLink,
    updateShoppingLink,
    deleteShoppingLink,
    // Templates
    loadTemplate,
    // Email notifications (M4)
    sendEmailNotification,
    // Post-evento
    uploadCoverImage,
    cleanupReceipts,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent deve essere usato dentro EventProvider');
  }
  return context;
}
