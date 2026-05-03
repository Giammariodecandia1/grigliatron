import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';

/**
 * Card Offerte Spesa — link a volantini o promozioni supermercati.
 */
export default function OffersCard() {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, shoppingLinks, addShoppingLink, deleteShoppingLink, updateShoppingLink } = useEvent();
  const theme = getTheme(event?.theme || event?.type);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', storeName: '', url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', storeName: '', url: '' });

  if (!event) return null;

  const canManage = (link) => {
    if (!user) return false;
    return isEventAdmin || link.createdBy === user.uid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    let validUrl = form.url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    await addShoppingLink({
      title: form.title.trim(),
      storeName: form.storeName.trim() || 'Supermercato',
      url: validUrl,
      createdBy: user.uid,
      createdByName: user.displayName || 'Anonimo',
    });
    setForm({ title: '', storeName: '', url: '' });
    setShowForm(false);
  };

  const handleStartEdit = (link) => {
    setEditForm({
      title: link.title || '',
      storeName: link.storeName || '',
      url: link.url || '',
    });
    setEditingId(link.id);
  };

  const handleSaveEdit = async (link) => {
    if (!editForm.title.trim() || !editForm.url.trim()) return;

    let validUrl = editForm.url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    await updateShoppingLink(link.id, {
      title: editForm.title.trim(),
      storeName: editForm.storeName.trim(),
      url: validUrl,
    });
    setEditingId(null);
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Eliminare questo volantino/offerta?')) {
      await deleteShoppingLink(linkId);
    }
  };

  return (
    <Card
      title="Volantini & Offerte"
      emoji="🛒"
      count={shoppingLinks.length > 0 ? shoppingLinks.length : undefined}
      id="offers-card"
    >
      {user && !showForm && (
        <button className="btn btn-add-item" onClick={() => setShowForm(true)}>
          + Aggiungi offerta
        </button>
      )}

      {showForm && (
        <form className="add-item-form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Cosa? (es. Birra Moretti in offerta)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            autoFocus
          />
          <input
            className="input"
            placeholder="Dove? (es. Conad)"
            value={form.storeName}
            onChange={e => setForm({ ...form, storeName: e.target.value })}
          />
          <input
            className="input"
            placeholder="Link volantino o offerta"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
          />
          <div className="add-item-buttons">
            <button type="submit" className="btn btn-primary btn-sm">Aggiungi</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annulla</button>
          </div>
        </form>
      )}

      {shoppingLinks.length > 0 ? (
        <ul className="item-list">
          {shoppingLinks.map(link => (
            <li key={link.id} className="item-row">
              {editingId === link.id ? (
                <div className="item-edit-form update-edit-form">
                  <input
                    className="input input-sm"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  />
                  <input
                    className="input input-sm"
                    value={editForm.storeName}
                    onChange={e => setEditForm({ ...editForm, storeName: e.target.value })}
                  />
                  <input
                    className="input input-sm"
                    value={editForm.url}
                    onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                  />
                  <div className="item-edit-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(link)}>Salva</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Annulla</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-content">
                    <div className="item-name">
                      <strong>{link.storeName}:</strong> {link.title}
                    </div>
                    <div className="item-meta">
                      Aggiunto da {link.createdByName}
                    </div>
                  </div>
                  <div className="item-actions">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                      title="Apri link"
                    >
                      Apri ↗
                    </a>
                    {canManage(link) && (
                      <>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleStartEdit(link)}>✏️</button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => handleDelete(link.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !showForm && <EmptyState message="Nessuna offerta caricata." emoji="🛒" />
      )}
    </Card>
  );
}
