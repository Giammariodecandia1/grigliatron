import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Modal from '../shared/Modal';
import { getThemeList } from '../../config/themes';
import { getTemplateList } from '../../config/templates';
import { seedEvent } from '../../utils/seedData';

const EVENT_STATUSES = [
  { value: 'draft', label: '📝 Bozza' },
  { value: 'open', label: '🟢 Aperto' },
  { value: 'active', label: '🟡 In corso' },
  { value: 'completed', label: '🔵 Concluso' },
  { value: 'archived', label: '⚪ Archiviato' },
];

/**
 * Editor evento per admin — apre un modal con form completo.
 * Include selettore template per caricare set pre-compilati.
 */
export default function EventEditor() {
  const { user } = useAuth();
  const { event, isEventAdmin, updateEvent, loadTemplate, foodItems, gearItems, tasks } = useEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(null);
  const [form, setForm] = useState({});

  if (!isEventAdmin) return null;

  const handleOpen = () => {
    if (!event) return;
    setForm({
      title: event.title || '',
      type: event.type || 'grigliata',
      date: event.date || '',
      time: event.time || '',
      description: event.description || '',
      theme: event.theme || event.type || 'grigliata',
      status: event.status || 'open',
      latitude: event.latitude || '',
      longitude: event.longitude || '',
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    await updateEvent({
      ...form,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    });
    setIsOpen(false);
  };

  const handleSeed = async () => {
    if (!window.confirm('Creare l\'evento seed "Grigliata in montagna"? Sovrascriverà dati esistenti.')) return;
    setSeeding(true);
    try {
      await seedEvent(user?.email);
      window.location.reload();
    } catch (err) {
      alert('Errore: ' + err.message);
    }
    setSeeding(false);
  };

  const handleLoadTemplate = async (templateId) => {
    const hasItems = foodItems.length > 0 || gearItems.length > 0 || tasks.length > 0;
    const msg = hasItems
      ? 'Ci sono già degli elementi. Vuoi AGGIUNGERE quelli del template alla lista attuale?'
      : 'Caricare il template? Verranno aggiunti cibo, attrezzatura e cose da fare.';

    if (!window.confirm(msg)) return;

    setLoadingTemplate(templateId);
    try {
      await loadTemplate(templateId, user);
    } catch (err) {
      alert('Errore: ' + err.message);
    }
    setLoadingTemplate(null);
    setTemplateOpen(false);
  };

  const themeList = getThemeList();
  const templateList = getTemplateList();

  return (
    <>
      <div className="admin-toolbar">
        <button className="btn btn-admin" onClick={handleOpen} disabled={!event}>
          ⚙️ Modifica evento
        </button>
        <button className="btn btn-admin btn-template" onClick={() => setTemplateOpen(true)} disabled={!event}>
          📋 Carica template
        </button>
        <button className="btn btn-admin btn-seed" onClick={handleSeed} disabled={seeding}>
          {seeding ? '⏳ Creazione...' : '🌱 Seed evento iniziale'}
        </button>
      </div>

      {/* Template selector modal */}
      <Modal isOpen={templateOpen} onClose={() => setTemplateOpen(false)} title="📋 Scegli un template">
        <div className="template-selector">
          <p className="template-hint">
            Seleziona un template base. Gli elementi verranno <strong>aggiunti</strong> alla lista attuale, senza cancellare nulla.
          </p>
          <div className="template-grid">
            {templateList.map(t => (
              <button
                key={t.id}
                className={`template-card ${loadingTemplate === t.id ? 'template-loading' : ''}`}
                onClick={() => handleLoadTemplate(t.id)}
                disabled={loadingTemplate !== null}
              >
                <span className="template-emoji">{t.emoji}</span>
                <span className="template-name">{t.label}</span>
                <span className="template-desc">{t.description}</span>
                {loadingTemplate === t.id && <span className="template-spinner">⏳</span>}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Event editor modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modifica evento">
        <div className="event-editor-form">
          <label className="form-label">
            Titolo
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </label>

          <label className="form-label">
            Tipo evento
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, theme: e.target.value })}>
              {themeList.map(t => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Tema grafico
            <select className="input" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })}>
              {themeList.map(t => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label className="form-label">
              Data
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="form-label">
              Orario
              <input className="input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="mattina, 09:00, ecc." />
            </label>
          </div>

          <label className="form-label">
            Stato evento
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {EVENT_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Descrizione
            <textarea className="input textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>

          <div className="form-row">
            <label className="form-label">
              Latitudine
              <input type="number" step="any" className="input" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="42.9492" />
            </label>
            <label className="form-label">
              Longitudine
              <input type="number" step="any" className="input" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="12.7114" />
            </label>
          </div>

          <div className="add-item-buttons" style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave}>💾 Salva modifiche</button>
            <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Annulla</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
