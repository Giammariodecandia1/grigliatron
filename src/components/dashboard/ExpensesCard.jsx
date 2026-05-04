import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';
import { formatCurrency, formatTimestamp } from '../../utils/formatters';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '../../services/cloudinaryService';

/**
 * Card Costi & Scontrini.
 * V1.3: Upload scontrini con compressione automatica < 5MB,
 *        modifica chi ha pagato, preview miniatura, modal fullscreen.
 */
export default function ExpensesCard() {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, expenses, participants, addExpense, deleteExpense, updateItem } = useEvent();
  const theme = getTheme(event?.theme || event?.type);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', notes: '', paidBy: '' });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState('');

  // Receipt modal
  const [previewImage, setPreviewImage] = useState(null);

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', amount: '', notes: '', paidBy: '', paidByName: '' });
  const [editReceiptFile, setEditReceiptFile] = useState(null);
  const [editReceiptPreview, setEditReceiptPreview] = useState(null);
  const [editCompressionStatus, setEditCompressionStatus] = useState('');

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  if (!event) return null;

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Partecipanti attivi (per dropdown "chi ha pagato")
  const activeParticipants = participants.filter(
    p => p.status === 'partecipo' || p.status === 'forse'
  );

  const canManage = (expense) => {
    if (!user) return false;
    return isEventAdmin || expense.paidBy === user.uid;
  };

  // ─── Receipt file handling ──────────────────────────────────────
  const handleFileSelect = (file, setFile, setPreview) => {
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // ─── Create expense ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;

    setIsUploading(true);
    try {
      let uploadResult = null;
      if (receiptFile) {
        uploadResult = await uploadImageToCloudinary(receiptFile, setCompressionStatus);
      }

      // Chi ha pagato: se selezionato dal dropdown, usa quello; altrimenti l'utente corrente
      const selectedParticipant = form.paidBy
        ? activeParticipants.find(p => p.id === form.paidBy)
        : null;

      await addExpense({
        description: form.description.trim(),
        amount: Number(form.amount),
        notes: form.notes.trim(),
        paidBy: selectedParticipant ? selectedParticipant.id : user.uid,
        paidByName: selectedParticipant ? selectedParticipant.name : (user.displayName || 'Anonimo'),
        receiptUrl: uploadResult ? uploadResult.url : null,
        receiptPublicId: uploadResult ? uploadResult.publicId : null,
      });

      // Reset
      setForm({ description: '', amount: '', notes: '', paidBy: '' });
      setReceiptFile(null);
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
      setCompressionStatus('');
      setShowForm(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio. Riprova.');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Delete expense ─────────────────────────────────────────────
  const handleDelete = async (exp) => {
    if (window.confirm('Eliminare questa spesa?')) {
      // Nota: Non eliminiamo fisicamente il file da Cloudinary dal frontend (richiede auth backend)
      await deleteExpense(exp.id);
    }
  };

  // ─── Edit expense ──────────────────────────────────────────────
  const handleStartEdit = (exp) => {
    setEditForm({
      description: exp.description || '',
      amount: exp.amount || '',
      notes: exp.notes || '',
      paidBy: exp.paidBy || '',
      paidByName: exp.paidByName || '',
    });
    setEditingId(exp.id);
    setEditReceiptFile(null);
    setEditReceiptPreview(null);
    setEditCompressionStatus('');
  };

  const handleSaveEdit = async (exp) => {
    if (!editForm.description.trim() || !editForm.amount) return;

    setIsUploading(true);
    try {
      const updateData = {
        description: editForm.description.trim(),
        amount: Number(editForm.amount),
        notes: editForm.notes.trim(),
      };

      // Se l'admin ha cambiato chi ha pagato
      if (editForm.paidBy && editForm.paidBy !== exp.paidBy) {
        const selectedP = activeParticipants.find(p => p.id === editForm.paidBy);
        if (selectedP) {
          updateData.paidBy = selectedP.id;
          updateData.paidByName = selectedP.name;
        }
      }

      // Se è stato aggiunto/sostituito uno scontrino
      if (editReceiptFile) {
        const uploadResult = await uploadImageToCloudinary(editReceiptFile, setEditCompressionStatus);
        if (uploadResult) {
          updateData.receiptUrl = uploadResult.url;
          updateData.receiptPublicId = uploadResult.publicId;
        }
      }

      await updateItem('expenses', exp.id, updateData);

      // Cleanup
      setEditingId(null);
      setEditForm({ description: '', amount: '', notes: '', paidBy: '', paidByName: '' });
      if (editReceiptPreview) URL.revokeObjectURL(editReceiptPreview);
      setEditReceiptFile(null);
      setEditReceiptPreview(null);
      setEditCompressionStatus('');
    } catch (error) {
      console.error('Errore modifica spesa:', error);
      alert('Errore durante la modifica. Riprova.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ description: '', amount: '', notes: '', paidBy: '', paidByName: '' });
    if (editReceiptPreview) URL.revokeObjectURL(editReceiptPreview);
    setEditReceiptFile(null);
    setEditReceiptPreview(null);
    setEditCompressionStatus('');
  };

  return (
    <Card
      title="Costi & Scontrini"
      emoji={theme.sectionEmojis.expenses}
      id="expenses-card"
      className="expenses-card"
    >
      {expenses.length > 0 ? (
        <>
          <ul className="expenses-list">
            {expenses.map(exp => (
              <li key={exp.id} className="expense-row">
                {editingId === exp.id ? (
                  /* ─── Inline edit mode ──────────────────────────── */
                  <div className="expense-edit-form">
                    <input
                      className="input input-sm"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Descrizione"
                      autoFocus
                    />
                    <input
                      className="input input-sm"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.amount}
                      onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                      placeholder="Importo €"
                    />
                    <input
                      className="input input-sm"
                      value={editForm.notes}
                      onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Note (opzionale)"
                    />

                    {/* Chi ha pagato — modificabile */}
                    <div className="expense-paidby-row">
                      <label className="form-label-inline">Pagato da:</label>
                      <select
                        className="input input-sm expense-paidby-select"
                        value={editForm.paidBy}
                        onChange={e => setEditForm({ ...editForm, paidBy: e.target.value })}
                      >
                        <option value="">— seleziona —</option>
                        {activeParticipants.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Scontrino: mostra attuale + possibilità di cambiare */}
                    <div className="receipt-edit-section">
                      {exp.receiptUrl && !editReceiptPreview && (
                        <div className="receipt-current">
                          <img
                            src={exp.receiptUrl}
                            alt="Scontrino attuale"
                            className="receipt-thumbnail"
                            onClick={() => setPreviewImage(exp.receiptUrl)}
                          />
                          <span className="receipt-current-label">Scontrino attuale</span>
                        </div>
                      )}
                      {editReceiptPreview && (
                        <div className="receipt-current">
                          <img src={editReceiptPreview} alt="Nuovo scontrino" className="receipt-thumbnail" />
                          <span className="receipt-current-label">Nuovo scontrino</span>
                        </div>
                      )}
                      {isCloudinaryConfigured ? (
                        <label className="btn btn-sm btn-outline receipt-change-btn">
                          📸 {exp.receiptUrl ? 'Cambia scontrino' : 'Aggiungi scontrino'}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="input-file-hidden"
                            ref={editFileInputRef}
                            onChange={e => handleFileSelect(e.target.files[0], setEditReceiptFile, setEditReceiptPreview)}
                          />
                        </label>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8em' }}>Upload foto non configurato.</span>
                      )}
                      {editCompressionStatus && (
                        <span className="receipt-compression-status">{editCompressionStatus}</span>
                      )}
                    </div>

                    <div className="add-item-buttons">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveEdit(exp)}
                        disabled={isUploading}
                      >
                        {isUploading ? '⏳ Salvataggio...' : '💾 Salva'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit} disabled={isUploading}>
                        ✕ Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ─── Normal display mode ───────────────────────── */
                  <>
                    {/* Thumbnail scontrino */}
                    {exp.receiptUrl ? (
                      <img
                        src={exp.receiptUrl}
                        alt="Scontrino"
                        className="receipt-thumbnail receipt-thumbnail-clickable"
                        onClick={() => setPreviewImage(exp.receiptUrl)}
                        title="Clicca per ingrandire"
                      />
                    ) : exp.receiptArchived ? (
                      <div className="receipt-thumbnail receipt-thumbnail-archived" title="Scontrino archiviato nel PDF">
                        🧾
                      </div>
                    ) : null}
                    <div className="expense-info">
                      <span className="expense-desc">{exp.description}</span>
                      <span className="expense-meta">
                        Pagato da <strong>{exp.paidByName}</strong>
                        {exp.createdAt && ` · ${formatTimestamp(exp.createdAt)}`}
                      </span>
                      {exp.notes && <span className="expense-notes">📝 {exp.notes}</span>}
                      {exp.receiptUrl && (
                        <button
                          className="btn-link expense-receipt-link"
                          onClick={() => setPreviewImage(exp.receiptUrl)}
                        >
                          🧾 Apri scontrino
                        </button>
                      )}
                      {exp.receiptArchived && !exp.receiptUrl && (
                        <span className="expense-receipt-link archived-text">
                          🧾 Archiviato nel PDF
                        </span>
                      )}
                    </div>
                    <div className="expense-amount-col">
                      <span className="expense-amount">{formatCurrency(exp.amount)}</span>
                      {canManage(exp) && (
                        <div className="admin-actions">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleStartEdit(exp)}
                            title="Modifica"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-ghost btn-danger"
                            onClick={() => handleDelete(exp)}
                            title="Elimina"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="expenses-total">
            <span>Totale evento:</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
        </>
      ) : (
        <EmptyState message="Nessuna spesa registrata." emoji="💰" />
      )}

      {/* ─── Add expense button ─────────────────────────────────── */}
      {user && !showForm && (
        <button className="btn btn-add-item" onClick={() => {
          setForm({ ...form, paidBy: user.uid });
          setShowForm(true);
        }}>
          + Aggiungi spesa
        </button>
      )}

      {/* ─── Add expense form ───────────────────────────────────── */}
      {showForm && (
        <form className="add-item-form expense-add-form" onSubmit={handleSubmit}>
          <input
            className="input"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descrizione spesa"
            autoFocus
          />
          <input
            className="input input-sm"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Importo €"
          />
          <input
            className="input input-sm"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Note (opzionale)"
          />

          {/* Chi ha pagato */}
          <div className="expense-paidby-row">
            <label className="form-label-inline">💳 Chi ha pagato:</label>
            <select
              className="input input-sm expense-paidby-select"
              value={form.paidBy}
              onChange={e => setForm({ ...form, paidBy: e.target.value })}
            >
              <option value="">— io —</option>
              {activeParticipants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id === user?.uid ? `${p.name} (tu)` : p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload scontrino */}
          <div className="receipt-upload-container">
            {isCloudinaryConfigured ? (
              <>
                <label className="btn btn-outline btn-sm receipt-upload-btn">
                  📸 {receiptFile ? 'Cambia foto' : 'Allega scontrino'}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="input-file-hidden"
                    ref={fileInputRef}
                    onChange={e => handleFileSelect(e.target.files[0], setReceiptFile, setReceiptPreview)}
                  />
                </label>
                {receiptPreview && (
                  <div className="receipt-preview-container">
                    <img src={receiptPreview} alt="Preview scontrino" className="receipt-preview-img" />
                    <button
                      type="button"
                      className="receipt-preview-remove"
                      onClick={() => {
                        setReceiptFile(null);
                        URL.revokeObjectURL(receiptPreview);
                        setReceiptPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      title="Rimuovi"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {compressionStatus && (
                  <span className="receipt-compression-status">{compressionStatus}</span>
                )}
              </>
            ) : (
              <span className="text-muted" style={{ fontSize: '0.9em', display: 'block', margin: '10px 0' }}>📸 Upload foto non configurato.</span>
            )}
          </div>

          <div className="add-item-buttons">
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUploading}>
              {isUploading ? '⏳ Salvataggio...' : '✅ Aggiungi'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowForm(false);
                if (receiptPreview) URL.revokeObjectURL(receiptPreview);
                setReceiptFile(null);
                setReceiptPreview(null);
                setCompressionStatus('');
              }}
              disabled={isUploading}
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* ─── Modal Anteprima Scontrino (fullscreen via Portal) ──── */}
      {previewImage && createPortal(
        <div className="receipt-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="receipt-modal-content" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Scontrino" className="receipt-modal-img" />
            <button className="btn btn-primary receipt-modal-close" onClick={() => setPreviewImage(null)}>
              ✕ Chiudi
            </button>
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
}
