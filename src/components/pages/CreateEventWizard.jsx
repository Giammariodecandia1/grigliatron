import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getThemeList } from '../../config/themes';
import { extractCoordinates } from '../../utils/locationUtils';

const STEPS = ['info', 'quando', 'dove', 'tema', 'conferma'];
const STEP_LABELS = ['Informazioni', 'Quando', 'Dove', 'Tema e accesso', 'Conferma'];

const TIME_SLOTS = [
  { value: '', label: 'Seleziona...' },
  { value: 'mattina', label: '🌅 Mattina' },
  { value: 'pomeriggio', label: '☀️ Pomeriggio' },
  { value: 'sera', label: '🌙 Sera' },
  { value: 'giornata intera', label: '📅 Giornata intera' },
];

/**
 * Wizard "Crea nuovo evento" in 5 step.
 */
export default function CreateEventWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'grigliata',
    description: '',
    date: '',
    time: '',
    timeSlot: '',
    locationName: '',
    locationAddress: '',
    mapsUrl: '',
    locationNotes: '',
    theme: 'grigliata',
    allowGuests: true,
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const themes = getThemeList();
  const currentTheme = themes.find(t => t.id === form.theme) || themes[0];

  const generateSlug = (title) => {
    const slug = title
      .normalize('NFD')                    // Scompone accenti: è → e + combining accent
      .replace(/[\u0300-\u036f]/g, '')     // Rimuove combining accents
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')        // Rimuove caratteri speciali
      .replace(/\s+/g, '-')                // Spazi → trattini
      .replace(/-+/g, '-')                 // Trattini multipli → singolo
      .replace(/^-|-$/g, '')               // Rimuove trattini iniziali/finali
      .substring(0, 35);
    // Entropia: timestamp base36 + 5 char random
    const entropy = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    // Se lo slug è vuoto (es. titolo tutto emoji), usa un fallback
    return (slug || 'evento') + '-' + entropy;
  };

  const canProceed = () => {
    if (step === 0) return form.title.trim().length >= 3;
    if (step === 1) return form.date !== '';
    return true;
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);

    try {
      const eventId = generateSlug(form.title);

      // Extract coords
      let lat = null;
      let lon = null;
      const coords = await extractCoordinates(form.locationName, form.locationAddress, form.mapsUrl);
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
      }

      await setDoc(doc(db, 'events', eventId), {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        date: form.date,
        time: form.time || form.timeSlot,
        theme: form.theme,
        status: 'active',
        allowGuests: form.allowGuests,
        // Location
        locationName: form.locationName.trim(),
        locationAddress: form.locationAddress.trim(),
        mapsUrl: form.mapsUrl.trim(),
        locationNotes: form.locationNotes.trim(),
        // Coordinates
        latitude: lat,
        longitude: lon,
        // Admin: the creator
        createdBy: user.email,
        createdByName: user.displayName || 'Organizzatore',
        admins: [user.email],
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Auto-join as participant
      await setDoc(doc(db, 'events', eventId, 'participants', user.uid), {
        name: user.displayName || 'Organizzatore',
        email: user.email,
        photoURL: user.photoURL || '',
        status: 'partecipo',
        isGuest: false,
        quoteCount: 1,
        joinedAt: serverTimestamp(),
      });

      // Save in visited events
      const visited = JSON.parse(localStorage.getItem('grigliatron_visited_events') || '[]');
      if (!visited.includes(eventId)) {
        visited.push(eventId);
        localStorage.setItem('grigliatron_visited_events', JSON.stringify(visited));
      }

      navigate(`/event/${eventId}`);
    } catch (err) {
      alert('Errore nella creazione: ' + err.message);
      setCreating(false);
    }
  };

  return (
    <div className="wizard-page">
      <div className="wizard-container">
        {/* Header */}
        <div className="wizard-header">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Indietro</button>
          <h1>🔥 Crea nuovo evento</h1>
        </div>

        {/* Progress */}
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`wizard-step-dot ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}>
              <span className="wizard-step-num">{i + 1}</span>
              <span className="wizard-step-label">{STEP_LABELS[i]}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="wizard-body">

          {/* Step 1: Info base */}
          {step === 0 && (
            <div className="wizard-step-content">
              <h2>Di cosa si tratta?</h2>
              <label className="form-label">
                Titolo evento *
                <input className="input" value={form.title} onChange={set('title')} placeholder="Es: Grigliata di maggio" autoFocus />
              </label>
              <label className="form-label">
                Tipo evento
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, theme: e.target.value })}>
                  {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                Descrizione breve
                <textarea className="input textarea" value={form.description} onChange={set('description')} rows={3} placeholder="Cosa c'è da sapere sull'evento?" />
              </label>
            </div>
          )}

          {/* Step 2: Quando */}
          {step === 1 && (
            <div className="wizard-step-content">
              <h2>Quando si fa?</h2>
              <label className="form-label">
                Data *
                <input type="date" className="input" value={form.date} onChange={set('date')} />
              </label>
              <label className="form-label">
                Ora (opzionale)
                <input className="input" value={form.time} onChange={set('time')} placeholder="Es: 12:30, pomeriggio..." />
              </label>
              <label className="form-label">
                Fascia oraria
                <select className="input" value={form.timeSlot} onChange={set('timeSlot')}>
                  {TIME_SLOTS.map(ts => (
                    <option key={ts.value} value={ts.value}>{ts.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Step 3: Dove */}
          {step === 2 && (
            <div className="wizard-step-content">
              <h2>Dove ci troviamo?</h2>
              <label className="form-label">
                Nome del luogo
                <input className="input" value={form.locationName} onChange={set('locationName')} placeholder="Es: Parco del lago, Casa di Marco..." />
              </label>
              <label className="form-label">
                Indirizzo
                <input className="input" value={form.locationAddress} onChange={set('locationAddress')} placeholder="Via/piazza e numero civico" />
              </label>
              <label className="form-label">
                Link Google Maps
                <input className="input" value={form.mapsUrl} onChange={set('mapsUrl')} placeholder="https://maps.google.com/..." />
              </label>
              <label className="form-label">
                Note (parcheggio, percorso...)
                <textarea className="input textarea" value={form.locationNotes} onChange={set('locationNotes')} rows={2} placeholder="Indicazioni utili per chi arriva" />
              </label>
            </div>
          )}

          {/* Step 4: Tema e accesso */}
          {step === 3 && (
            <div className="wizard-step-content">
              <h2>Stile e accesso</h2>
              <label className="form-label">
                Tema grafico
                <select className="input" value={form.theme} onChange={set('theme')}>
                  {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </label>
              <div className="wizard-theme-preview" style={{ background: themes.find(t => t.id === form.theme)?.gradient || '' }}>
                <span className="wizard-theme-emoji">{currentTheme.emoji}</span>
                <span className="wizard-theme-name">{form.title || 'Il tuo evento'}</span>
              </div>
              <label className="form-label wizard-checkbox-label">
                <input type="checkbox" checked={form.allowGuests} onChange={(e) => setForm({ ...form, allowGuests: e.target.checked })} />
                <span>Consenti accesso senza Google</span>
              </label>
              <p className="wizard-hint">
                Utile se vuoi far partecipare amici che non vogliono fare login. Potranno inserire il proprio nome.
              </p>
            </div>
          )}

          {/* Step 5: Conferma */}
          {step === 4 && (
            <div className="wizard-step-content">
              <h2>Riepilogo</h2>
              <div className="wizard-summary">
                <div className="wizard-summary-row">
                  <span className="wizard-summary-label">Titolo</span>
                  <span className="wizard-summary-value">{form.title}</span>
                </div>
                <div className="wizard-summary-row">
                  <span className="wizard-summary-label">Tipo</span>
                  <span className="wizard-summary-value">{currentTheme.emoji} {currentTheme.label}</span>
                </div>
                <div className="wizard-summary-row">
                  <span className="wizard-summary-label">Data</span>
                  <span className="wizard-summary-value">{form.date ? formatDate(form.date) : '—'}</span>
                </div>
                {(form.time || form.timeSlot) && (
                  <div className="wizard-summary-row">
                    <span className="wizard-summary-label">Ora</span>
                    <span className="wizard-summary-value">{form.time || form.timeSlot}</span>
                  </div>
                )}
                {form.locationName && (
                  <div className="wizard-summary-row">
                    <span className="wizard-summary-label">Luogo</span>
                    <span className="wizard-summary-value">{form.locationName}</span>
                  </div>
                )}
                <div className="wizard-summary-row">
                  <span className="wizard-summary-label">Accesso ospiti</span>
                  <span className="wizard-summary-value">{form.allowGuests ? '✅ Attivo' : '🔒 Solo Google'}</span>
                </div>
                <div className="wizard-summary-row">
                  <span className="wizard-summary-label">Admin</span>
                  <span className="wizard-summary-value">{user?.displayName} ({user?.email})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="wizard-nav">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Indietro</button>
          )}
          <div className="wizard-nav-spacer"></div>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Avanti →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={creating}>
              {creating ? '⏳ Creazione...' : '🔥 Crea evento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
