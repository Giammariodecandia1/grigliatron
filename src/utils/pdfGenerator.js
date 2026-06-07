/**
 * pdfGenerator.js — Generazione PDF report evento con scontrini embedded.
 *
 * Usa un iframe nascosto con HTML formattato per la stampa.
 * Gli scontrini vengono convertiti in data URL base64 per embedding.
 * Approccio window.print() — zero dipendenze esterne.
 */

/**
 * Converte un URL immagine in data URL base64.
 * Necessario per embedding scontrini nel PDF.
 */
async function imageToDataUrl(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Formatta un importo in euro.
 */
function fmtCurrency(amount) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

/**
 * Genera e apre il PDF report dell'evento.
 *
 * @param {Object} params - Tutti i dati dell'evento
 * @param {Function} [onProgress] - Callback(message) per aggiornare la UI
 */
export async function generateEventPDF({
  event,
  participants,
  foodItems,
  gearItems,
  tasks,
  expenses,
  polls,
  updates,
  reviews,
}, onProgress = () => {}) {

  onProgress('Preparazione dati...');

  // ─── Pre-fetch scontrini come data URL ──────────────────────────
  const receiptDataUrls = {};
  const expensesWithReceipts = expenses.filter(e => e.receiptUrl);
  for (let i = 0; i < expensesWithReceipts.length; i++) {
    const exp = expensesWithReceipts[i];
    onProgress(`Scaricamento scontrino ${i + 1}/${expensesWithReceipts.length}...`);
    receiptDataUrls[exp.id] = await imageToDataUrl(exp.receiptUrl);
  }

  onProgress('Generazione PDF...');

  // ─── Calcoli spese ──────────────────────────────────────────────
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const payingParticipants = participants.filter(p => p.status === 'partecipo' || p.status === 'forse');
  const totalShares = payingParticipants.reduce((s, p) => s + (p.quoteCount ?? 1), 0);
  const shareAmount = totalShares > 0 ? totalExpenses / totalShares : 0;

  // ─── Build HTML ─────────────────────────────────────────────────
  const now = new Date().toLocaleDateString('it-IT', { dateStyle: 'full' });

  let html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Report ${event.title || 'Evento'}</title>
<style>
  @page { margin: 20mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', -apple-system, sans-serif;
    color: #1a1a2e;
    line-height: 1.6;
    font-size: 13px;
    background: white;
  }
  .cover {
    text-align: center;
    padding: 60px 20px;
    page-break-after: always;
  }
  .cover h1 {
    font-size: 32px;
    color: #FF6B35;
    margin-bottom: 8px;
  }
  .cover .meta {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
  }
  .cover .brand {
    font-size: 14px;
    color: #999;
    margin-top: 40px;
  }
  .cover-img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 12px;
    margin: 20px auto;
    display: block;
  }
  h2 {
    font-size: 18px;
    color: #FF6B35;
    border-bottom: 2px solid #FF6B35;
    padding-bottom: 4px;
    margin: 24px 0 12px;
    page-break-after: avoid;
  }
  h3 { font-size: 14px; color: #333; margin: 12px 0 6px; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 12px;
  }
  th, td {
    padding: 6px 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  th { background: #f5f5f5; font-weight: 600; }
  .amount { text-align: right; font-weight: 600; }
  .total-row { background: #fff3e0; font-weight: 700; }
  .receipt-img {
    max-width: 100%;
    max-height: 400px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 8px 0;
    page-break-inside: avoid;
  }
  .receipt-block {
    page-break-inside: avoid;
    margin-bottom: 20px;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  .receipt-block h4 { margin-bottom: 8px; font-size: 13px; }
  .poll-option {
    padding: 4px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .poll-winner { font-weight: 700; color: #4CAF50; }
  .review-block {
    padding: 8px 12px;
    background: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid #FFB74D;
  }
  .update-block {
    padding: 6px 12px;
    border-left: 3px solid #2196F3;
    margin-bottom: 6px;
    background: #f5f9ff;
    border-radius: 4px;
  }
  .update-urgent { border-left-color: #f44336; background: #fff5f5; }
  .update-cambio { border-left-color: #FF9800; background: #fff8f0; }
  .footer {
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    text-align: center;
    font-size: 11px;
    color: #999;
  }
  .section { page-break-inside: avoid; }
</style>
</head>
<body>`;

  // ─── COPERTINA ──────────────────────────────────────────────────
  html += `<div class="cover">
    <h1>🔥 ${event.title || 'Evento'}</h1>
    <p class="meta">${event.date || ''} ${event.time ? '— ' + event.time : ''}</p>
    <p class="meta">${event.locationName || ''}</p>`;

  if (event.coverImageUrl) {
    const coverData = await imageToDataUrl(event.coverImageUrl);
    if (coverData) {
      html += `<img src="${coverData}" class="cover-img" alt="Foto evento" />`;
    }
  }

  html += `<p class="meta">${participants.filter(p => p.status === 'partecipo').length} partecipanti · ${fmtCurrency(totalExpenses)} totale spese</p>
    <p class="brand">Generato da GrigliaTron · ${now}</p>
  </div>`;

  // ─── PARTECIPANTI ───────────────────────────────────────────────
  html += `<div class="section"><h2>👥 Partecipanti</h2>
  <table><tr><th>Nome</th><th>Stato</th><th>Quote</th></tr>`;
  for (const p of participants) {
    const statusEmoji = p.status === 'partecipo' ? '✅' : p.status === 'forse' ? '🤔' : '❌';
    html += `<tr><td>${p.name}</td><td>${statusEmoji} ${p.status}</td><td>${p.quoteCount ?? 1}</td></tr>`;
  }
  html += `</table></div>`;

  // ─── CIBO & BEVANDE ─────────────────────────────────────────────
  if (foodItems.length > 0) {
    html += `<div class="section"><h2>🥩 Cibo & Bevande</h2>
    <table><tr><th>Cosa</th><th>Quantità</th><th>Chi ci pensa</th><th>Stato</th></tr>`;
    for (const item of foodItems) {
      const vols = (item.volunteers || []).map(v => v.name).join(', ') || '—';
      const status = item.status === 'completed' ? '✅' : item.status === 'claimed' ? '🔄' : '⏳';
      html += `<tr><td>${item.name}</td><td>${item.quantity || '—'}</td><td>${vols}</td><td>${status}</td></tr>`;
    }
    html += `</table></div>`;
  }

  // ─── ATTREZZATURA ───────────────────────────────────────────────
  if (gearItems.length > 0) {
    html += `<div class="section"><h2>⛺ Attrezzatura</h2>
    <table><tr><th>Cosa</th><th>Chi ci pensa</th><th>Stato</th></tr>`;
    for (const item of gearItems) {
      const vols = (item.volunteers || []).map(v => v.name).join(', ') || '—';
      const status = item.status === 'completed' ? '✅' : item.status === 'claimed' ? '🔄' : '⏳';
      html += `<tr><td>${item.name}</td><td>${vols}</td><td>${status}</td></tr>`;
    }
    html += `</table></div>`;
  }

  // ─── COSE DA FARE ───────────────────────────────────────────────
  if (tasks.length > 0) {
    html += `<div class="section"><h2>📋 Cose da fare</h2>
    <table><tr><th>Task</th><th>Chi ci pensa</th><th>Stato</th></tr>`;
    for (const t of tasks) {
      const vols = (t.volunteers || []).map(v => v.name).join(', ') || '—';
      const status = t.status === 'completed' ? '✅' : t.status === 'claimed' ? '🔄' : '⏳';
      html += `<tr><td>${t.title || t.name}</td><td>${vols}</td><td>${status}</td></tr>`;
    }
    html += `</table></div>`;
  }

  // ─── SPESE & QUOTE ──────────────────────────────────────────────
  if (expenses.length > 0) {
    html += `<div class="section"><h2>💶 Spese & Quote</h2>
    <table><tr><th>Descrizione</th><th>Pagato da</th><th>Note</th><th class="amount">Importo</th></tr>`;
    for (const exp of expenses) {
      html += `<tr><td>${exp.description}</td><td>${exp.paidByName}</td><td>${exp.notes || ''}</td><td class="amount">${fmtCurrency(exp.amount)}</td></tr>`;
    }
    html += `<tr class="total-row"><td colspan="3">Totale spese</td><td class="amount">${fmtCurrency(totalExpenses)}</td></tr>`;
    html += `</table>`;

    html += `<p><strong>Quota singola:</strong> ${fmtCurrency(shareAmount)} (${totalShares} quote)</p>`;
    html += `</div>`;
  }

  // ─── SCONTRINI ──────────────────────────────────────────────────
  if (expensesWithReceipts.length > 0) {
    html += `<div class="section"><h2>🧾 Scontrini</h2>`;
    for (const exp of expensesWithReceipts) {
      const dataUrl = receiptDataUrls[exp.id];
      html += `<div class="receipt-block">
        <h4>${exp.description} — ${fmtCurrency(exp.amount)} (${exp.paidByName})</h4>`;
      if (dataUrl) {
        html += `<img src="${dataUrl}" class="receipt-img" alt="Scontrino ${exp.description}" />`;
      } else {
        html += `<p style="color:#999;">⚠️ Impossibile caricare l'immagine dello scontrino.</p>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  }

  // ─── SONDAGGI ───────────────────────────────────────────────────
  if (polls.length > 0) {
    html += `<div class="section"><h2>📊 Sondaggi</h2>`;
    for (const poll of polls) {
      html += `<h3>${poll.question} ${poll.status === 'closed' ? '(chiuso)' : '(aperto)'}</h3>`;
      const votes = poll.votes || {};
      const allVotes = Object.values(votes);
      for (const opt of (poll.options || [])) {
        const count = allVotes.filter(v => (v.selectedOptionIds || []).includes(opt.id)).length;
        const maxCount = Math.max(...(poll.options || []).map(o =>
          allVotes.filter(v => (v.selectedOptionIds || []).includes(o.id)).length
        ), 0);
        const isWinner = count > 0 && count === maxCount;
        html += `<div class="poll-option ${isWinner ? 'poll-winner' : ''}">
          ${isWinner ? '🏆 ' : ''}${opt.text}: ${count} voti
        </div>`;
      }
    }
    html += `</div>`;
  }

  // ─── AGGIORNAMENTI ──────────────────────────────────────────────
  const importantUpdates = updates.filter(u => u.type === 'urgente' || u.type === 'cambio');
  if (importantUpdates.length > 0) {
    html += `<div class="section"><h2>📢 Aggiornamenti importanti</h2>`;
    for (const upd of importantUpdates) {
      html += `<div class="update-block update-${upd.type}">
        <strong>${upd.authorName}</strong>: ${upd.text}
      </div>`;
    }
    html += `</div>`;
  }

  // ─── RECENSIONI ─────────────────────────────────────────────────
  if (reviews.length > 0) {
    html += `<div class="section"><h2>⭐ Recensioni</h2>`;
    const avgRating = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
    html += `<p><strong>Media:</strong> ${'⭐'.repeat(Math.round(avgRating))} (${avgRating}/5)</p>`;
    for (const rev of reviews) {
      html += `<div class="review-block">
        <strong>${rev.authorName}</strong> ${'⭐'.repeat(rev.rating || 0)}<br/>
        ${rev.comment}
      </div>`;
    }
    html += `</div>`;
  }

  // ─── FOOTER ─────────────────────────────────────────────────────
  html += `<div class="footer">
    <p>🔥 GrigliaTron — Report generato il ${now}</p>
    <p>grigliatron.netlify.app</p>
  </div>`;

  html += `</body></html>`;

  // ─── Apri in nuova finestra per stampa/PDF ──────────────────────
  onProgress('Apertura anteprima stampa...');

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Popup bloccato dal browser. Abilita i popup per generare il PDF.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Aspetta che le immagini si carichino, poi stampa
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  onProgress('');
}
