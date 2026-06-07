import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import { generateEventPDF } from '../../utils/pdfGenerator';
import { compressImage } from '../../utils/imageCompressor';

/**
 * Card mostrata solo a evento concluso.
 * Permette all'admin di:
 * - Caricare foto ricordo (diventa la copertina)
 * - Generare il PDF Report dell'evento
 * - Archiviare gli scontrini
 */
export default function PostEventCard() {
  const { user } = useAuth();
  const context = useEvent();
  const { event, isEventAdmin, expenses, uploadCoverImage, cleanupReceipts } = context;

  const [loadingMsg, setLoadingMsg] = useState('');
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const fileInputRef = useRef(null);

  if (!event || (event.status !== 'completed' && event.status !== 'archived')) {
    return null;
  }

  const receiptsCount = expenses.filter(e => e.receiptUrl).length;

  const handleGeneratePDF = async () => {
    try {
      await generateEventPDF(context, setLoadingMsg);
    } catch (err) {
      console.error(err);
      alert('Errore durante la generazione del PDF.');
      setLoadingMsg('');
    }
  };

  const handleCleanup = async () => {
    if (!confirmCleanup) {
      alert('Devi confermare di aver salvato il PDF prima di archiviare gli scontrini.');
      return;
    }
    if (!window.confirm('Sei sicuro? Questa operazione nasconderà definitivamente le foto degli scontrini dalla bacheca.')) {
      return;
    }

    setLoadingMsg('Archiviazione scontrini in corso...');
    try {
      await cleanupReceipts();
      setLoadingMsg('Scontrini archiviati con successo!');
      setTimeout(() => setLoadingMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Errore durante la pulizia.');
      setLoadingMsg('');
    }
  };

  const handlePhotoSelect = async (file) => {
    if (!file) return;

    setLoadingMsg('Elaborazione foto...');
    try {
      // Usiamo lo stesso compressore degli scontrini per ottimizzare la foto
      const { blob } = await compressImage(file, setLoadingMsg);

      setLoadingMsg('Caricamento foto ricordo...');
      await uploadCoverImage(blob);

      setLoadingMsg('Foto caricata!');
      setTimeout(() => setLoadingMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Errore caricamento foto.');
      setLoadingMsg('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card
      title="Evento Concluso 🎉"
      emoji="🎊"
      id="post-event-card"
      className="post-event-card"
    >
      <div className="post-event-content">
        <p className="post-event-desc">
          L'evento è concluso! Ora puoi generare il report finale e archiviare gli scontrini.
        </p>

        {loadingMsg && (
          <div className="post-event-loading">
            <span className="spinner">⏳</span> {loadingMsg}
          </div>
        )}

        {/* ADMIN ACTIONS */}
        {isEventAdmin && (
          <div className="post-event-admin-actions">
            <label className="btn btn-primary post-action-btn">
              📸 {event.coverImageUrl ? 'Cambia foto ricordo' : 'Carica foto ricordo'}
              <input
                type="file"
                accept="image/*"
                className="input-file-hidden"
                ref={fileInputRef}
                onChange={e => handlePhotoSelect(e.target.files[0])}
                disabled={!!loadingMsg}
              />
            </label>

            <button
              className="btn btn-outline post-action-btn btn-pdf"
              onClick={handleGeneratePDF}
              disabled={!!loadingMsg}
            >
              📄 Genera PDF Report
            </button>

            {receiptsCount > 0 && (
              <div className="cleanup-section">
                <h4>Archiviare gli scontrini? ({receiptsCount} scontrini)</h4>
                <p>Genera prima il PDF (che li include in miniatura), poi archiviali per nasconderli dalla bacheca principale.</p>
                <label className="cleanup-confirm-label">
                  <input
                    type="checkbox"
                    checked={confirmCleanup}
                    onChange={e => setConfirmCleanup(e.target.checked)}
                  />
                  Confermo di aver salvato il PDF
                </label>
                <button
                  className="btn btn-danger post-action-btn"
                  onClick={handleCleanup}
                  disabled={!confirmCleanup || !!loadingMsg}
                >
                  📦 Archivia scontrini
                </button>
              </div>
            )}
          </div>
        )}

        {/* USER VIEW */}
        {!isEventAdmin && (
          <div className="post-event-user-actions">
            <button
              className="btn btn-outline post-action-btn btn-pdf"
              onClick={handleGeneratePDF}
              disabled={!!loadingMsg}
            >
              📄 Scarica PDF Ricordo
            </button>
            {receiptsCount > 0 && (
              <p className="post-event-hint">Ci sono ancora {receiptsCount} scontrini salvati.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
