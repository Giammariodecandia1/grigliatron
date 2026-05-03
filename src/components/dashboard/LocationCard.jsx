import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import { getTheme } from '../../config/themes';
import { extractCoordinates } from '../../utils/locationUtils';

/**
 * Card Dove & Quando — info luogo, orari, Google Maps.
 */
export default function LocationCard() {
  const { isEventAdmin } = useEvent();
  const { event, updateEvent } = useEvent();
  const theme = getTheme(event?.theme || event?.type);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  if (!event) return null;

  const handleEdit = () => {
    setForm({
      date: event.date || '',
      time: event.time || '',
      locationName: event.locationName || '',
      locationAddress: event.locationAddress || '',
      mapsUrl: event.mapsUrl || '',
      meetingPoint: event.meetingPoint || '',
      meetingTime: event.meetingTime || '',
      departureTime: event.departureTime || '',
      parkingNotes: event.parkingNotes || '',
      roadNotes: event.roadNotes || '',
      locationNotes: event.locationNotes || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let updatedForm = { ...form };
    const locationChanged = form.locationName !== event.locationName || form.locationAddress !== event.locationAddress || form.mapsUrl !== event.mapsUrl;
    const missingCoords = !event.latitude || !event.longitude;

    if (locationChanged || missingCoords) {
      const coords = await extractCoordinates(form.locationName, form.locationAddress, form.mapsUrl);
      if (coords) {
        updatedForm.latitude = coords.latitude;
        updatedForm.longitude = coords.longitude;
      }
    }

    await updateEvent(updatedForm);
    setEditing(false);
    setSaving(false);
  };

  return (
    <Card
      title="Dove & Quando"
      emoji={theme.sectionEmojis.location}
      id="location-card"
      actions={isEventAdmin && !editing ? (
        <button className="btn btn-sm btn-ghost" onClick={handleEdit}>✏️ Modifica</button>
      ) : null}
    >
      {editing ? (
        <div className="location-edit-form">
          <div className="form-row">
            <label className="form-label">
              📅 Data evento
              <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </label>
            <label className="form-label">
              🕐 Orario evento
              <input className="input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="mattina, 09:00, ecc." />
            </label>
          </div>
          <label className="form-label">
            Luogo
            <input className="input" value={form.locationName} onChange={e => setForm({...form, locationName: e.target.value})} />
          </label>
          <label className="form-label">
            Indirizzo
            <input className="input" value={form.locationAddress} onChange={e => setForm({...form, locationAddress: e.target.value})} />
          </label>
          <label className="form-label">
            Link Google Maps
            <input className="input" value={form.mapsUrl} onChange={e => setForm({...form, mapsUrl: e.target.value})} placeholder="https://maps.google.com/..." />
          </label>
          <label className="form-label">
            Punto di ritrovo
            <input className="input" value={form.meetingPoint} onChange={e => setForm({...form, meetingPoint: e.target.value})} />
          </label>
          <label className="form-label">
            Orario ritrovo
            <input className="input" value={form.meetingTime} onChange={e => setForm({...form, meetingTime: e.target.value})} />
          </label>
          <label className="form-label">
            Orario partenza
            <input className="input" value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} />
          </label>
          <label className="form-label">
            Note parcheggio
            <input className="input" value={form.parkingNotes} onChange={e => setForm({...form, parkingNotes: e.target.value})} />
          </label>
          <label className="form-label">
            Note strada
            <input className="input" value={form.roadNotes} onChange={e => setForm({...form, roadNotes: e.target.value})} />
          </label>
          <label className="form-label">
            Note luogo
            <textarea className="input textarea" value={form.locationNotes} onChange={e => setForm({...form, locationNotes: e.target.value})} />
          </label>
          <div className="add-item-buttons">
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={saving}>Annulla</button>
          </div>
        </div>
      ) : (
        <div className="location-info">
          <div className="location-detail-grid">
            {event.locationName && (
              <div className="location-detail">
                <span className="location-icon">📍</span>
                <div>
                  <strong>{event.locationName}</strong>
                  {event.locationAddress && <span className="location-sub">{event.locationAddress}</span>}
                </div>
              </div>
            )}

            {event.meetingTime && (
              <div className="location-detail">
                <span className="location-icon">🕐</span>
                <div>
                  <strong>Ritrovo:</strong> {event.meetingTime}
                </div>
              </div>
            )}

            {event.departureTime && event.departureTime !== 'Da definire' && (
              <div className="location-detail">
                <span className="location-icon">🚗</span>
                <div>
                  <strong>Partenza:</strong> {event.departureTime}
                </div>
              </div>
            )}

            {event.meetingPoint && event.meetingPoint !== 'Da definire' && (
              <div className="location-detail">
                <span className="location-icon">🏁</span>
                <div>
                  <strong>Punto incontro:</strong> {event.meetingPoint}
                </div>
              </div>
            )}

            {event.parkingNotes && (
              <div className="location-detail">
                <span className="location-icon">🅿️</span>
                <div>{event.parkingNotes}</div>
              </div>
            )}

            {event.roadNotes && (
              <div className="location-detail">
                <span className="location-icon">🛣️</span>
                <div>{event.roadNotes}</div>
              </div>
            )}

            {event.locationNotes && (
              <div className="location-detail location-notes-block">
                <span className="location-icon">ℹ️</span>
                <div>{event.locationNotes}</div>
              </div>
            )}
          </div>

          {event.mapsUrl && (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-maps"
            >
              🗺️ Apri in Google Maps
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
