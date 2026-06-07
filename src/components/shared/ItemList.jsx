import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';

/**
 * Lista generica con supporto multi-volontario "Ci penso io".
 * Più persone possono assegnarsi allo stesso item.
 * Include indicatore visivo rosso/giallo/verde per stato immediato.
 * 
 * V1.1: Aggiunto modifica/cancellazione per autore + admin.
 * V1.3: Admin può ri-assegnare items ad altri partecipanti.
 *
 * @param {{ items, subCollection, showCategory, showPriority }} props
 */
export default function ItemList({ items, subCollection, showCategory = false, showPriority = false }) {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { participants, claimItem, releaseItem, completeItem, deleteItem, updateItem } = useEvent();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [assigningId, setAssigningId] = useState(null); // ID dell'item in fase di ri-assegnazione

  const getVolunteers = (item) => item.volunteers || [];

  const isVolunteer = (item) => {
    return getVolunteers(item).some(v => v.uid === user?.uid);
  };

  // Check if current user is the author of the item
  const isAuthor = (item) => {
    if (!user) return false;
    return item.createdBy === user.uid;
  };

  // Can this user edit/delete this item?
  const canManage = (item) => {
    return isEventAdmin || isAuthor(item);
  };

  const handleClaim = async (item) => {
    if (!user) return;
    if (isVolunteer(item)) {
      await releaseItem(subCollection, item.id, user, getVolunteers(item));
    } else {
      await claimItem(subCollection, item.id, user);
    }
  };

  const handleComplete = async (item) => {
    await completeItem(subCollection, item.id);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Eliminare "${item.name || item.title}"?`)) {
      await deleteItem(subCollection, item.id);
    }
  };

  const handleReleaseAll = async (item) => {
    await releaseItem(subCollection, item.id, null, []);
  };

  // ─── Admin: assegna item ad un altro partecipante ───────────────
  const activeParticipants = participants.filter(
    p => p.status === 'partecipo' || p.status === 'forse'
  );

  const handleAssignTo = async (item, participantId) => {
    if (!participantId) return;
    const p = activeParticipants.find(pp => pp.id === participantId);
    if (!p) return;

    // Aggiungi come volontario (simula "ci penso io" per conto di un altro)
    const fakeUser = { uid: p.id, displayName: p.name };
    await claimItem(subCollection, item.id, fakeUser);
    setAssigningId(null);
  };

  // ─── Inline editing ───────────────────────────────────────────
  const handleStartEdit = (item) => {
    setEditForm({
      name: item.name || item.title || '',
      quantity: item.quantity || '',
      notes: item.notes || '',
      description: item.description || '',
      category: item.category || '',
      priority: item.priority || 'normal',
    });
    setEditingId(item.id);
  };

  const handleSaveEdit = async (item) => {
    const data = {};
    // For tasks, field is 'title' not 'name'
    if (subCollection === 'tasks') {
      data.title = editForm.name.trim();
      if (editForm.description !== undefined) data.description = editForm.description.trim();
      if (editForm.priority !== undefined) data.priority = editForm.priority;
    } else {
      data.name = editForm.name.trim();
      if (editForm.quantity !== undefined) data.quantity = editForm.quantity.trim();
      if (editForm.notes !== undefined) data.notes = editForm.notes.trim();
      if (editForm.category !== undefined) data.category = editForm.category;
    }

    if (!data.name && !data.title) return; // Don't save empty

    await updateItem(subCollection, item.id, data);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="item-list">
      {items.map((item) => {
        const volunteers = getVolunteers(item);
        const iAmVolunteer = isVolunteer(item);
        const isFree = !item.status || item.status === 'free';
        const isClaimed = item.status === 'claimed';
        const isCompleted = item.status === 'completed' || item.status === 'done';
        const hasVolunteers = volunteers.length > 0;
        const isEditing = editingId === item.id;
        const isAssigning = assigningId === item.id;

        // ─── Inline edit mode ─────────────────────────────────────
        if (isEditing) {
          return (
            <li key={item.id} className="item-list-row item-editing">
              <div className="item-edit-form">
                <input
                  className="input input-sm"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nome"
                  autoFocus
                />
                {subCollection !== 'tasks' && (
                  <input
                    className="input input-sm"
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    placeholder="Quantità"
                  />
                )}
                {subCollection === 'tasks' && (
                  <input
                    className="input input-sm"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Descrizione"
                  />
                )}
                {subCollection !== 'tasks' && (
                  <input
                    className="input input-sm"
                    value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Note (opzionale)"
                  />
                )}
                <div className="item-edit-buttons">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(item)}>
                    💾 Salva
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>
                    Annulla
                  </button>
                </div>
              </div>
            </li>
          );
        }

        // ─── Normal display mode ──────────────────────────────────
        return (
          <li
            key={item.id}
            className={`item-list-row ${isCompleted ? 'item-completed' : ''} ${iAmVolunteer ? 'item-claimed' : ''} ${isClaimed && !iAmVolunteer ? 'item-others-claimed' : ''}`}
          >
            {/* Status indicator dot */}
            <span className={`item-status-dot ${isCompleted ? 'dot-green' : isClaimed ? 'dot-yellow' : 'dot-red'}`}
                  title={isCompleted ? 'Fatto' : isClaimed ? 'Qualcuno ci pensa' : 'Serve ancora!'}
            />

            <div className="item-info">
              <div className="item-name-row">
                <span className={`item-name ${isCompleted ? 'strikethrough' : ''}`}>
                  {item.name || item.title}
                </span>
                {showPriority && item.priority === 'important' && (
                  <span className="badge badge-important">❗</span>
                )}
                {showCategory && item.category && (
                  <span className="badge badge-category">{item.category}</span>
                )}
              </div>

              {item.quantity && (
                <span className="item-quantity">{item.quantity}</span>
              )}
              {item.description && (
                <span className="item-description">{item.description}</span>
              )}
              {item.notes && (
                <span className="item-notes">{item.notes}</span>
              )}

              {/* Mostra tutti i volontari */}
              {hasVolunteers && !isCompleted && (
                <div className="item-volunteers">
                  <span className="item-volunteers-label">
                    {volunteers.length === 1 ? 'Ci pensa:' : `Ci pensano in ${volunteers.length}:`}
                  </span>
                  <span className="item-volunteers-names">
                    {volunteers.map((v, i) => (
                      <span key={v.uid} className={`volunteer-name ${v.uid === user?.uid ? 'volunteer-me' : ''}`}>
                        {v.uid === user?.uid ? 'Tu' : v.name}{i < volunteers.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {isCompleted && (
                <span className="item-status-done">Fatto ✅</span>
              )}

              {/* Admin: ri-assegnazione rapida */}
              {isAssigning && (
                <div className="item-assign-dropdown">
                  <select
                    className="input input-sm"
                    defaultValue=""
                    onChange={e => handleAssignTo(item, e.target.value)}
                    autoFocus
                  >
                    <option value="">— Scegli partecipante —</option>
                    {activeParticipants
                      .filter(p => !volunteers.some(v => v.uid === p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    }
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAssigningId(null)}>✕</button>
                </div>
              )}
            </div>

            <div className="item-actions">
              {/* Chiunque può aggiungersi (anche se altri si sono già offerti) */}
              {!isCompleted && user && !iAmVolunteer && (
                <button
                  className="btn btn-claim"
                  onClick={() => handleClaim(item)}
                >
                  🙋 Ci penso io
                </button>
              )}

              {/* Se sono volontario, posso uscire o segnare fatto */}
              {!isCompleted && iAmVolunteer && (
                <>
                  <button
                    className="btn btn-done"
                    onClick={() => handleComplete(item)}
                    title="Segna come fatto"
                  >
                    ✅ Fatto
                  </button>
                  <button
                    className="btn btn-release"
                    onClick={() => handleClaim(item)}
                    title="Ritira la tua offerta"
                  >
                    Lascia
                  </button>
                </>
              )}

              {/* Author or Admin: edit/delete */}
              {canManage(item) && (
                <div className="admin-actions">
                  {!isCompleted && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleStartEdit(item)}
                      title="Modifica"
                    >
                      ✏️
                    </button>
                  )}
                  {isEventAdmin && !isCompleted && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setAssigningId(isAssigning ? null : item.id)}
                      title="Assegna ad un partecipante"
                    >
                      👤+
                    </button>
                  )}
                  {isEventAdmin && hasVolunteers && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleReleaseAll(item)}
                      title="Libera tutti"
                    >
                      🔓
                    </button>
                  )}
                  {isEventAdmin && !isCompleted && hasVolunteers && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleComplete(item)}
                      title="Segna completato"
                    >
                      ✅
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-ghost btn-danger"
                    onClick={() => handleDelete(item)}
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
