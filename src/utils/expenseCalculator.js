/**
 * expenseCalculator.js — Logica calcolo quote, saldi e pagamenti consigliati.
 *
 * Principi dalla roadmap:
 * - Il numero di quote non coincide necessariamente con il numero di partecipanti
 * - Ogni partecipante ha un quoteCount (default 1, ma può essere 0, 0.5, 2 ecc.)
 * - L'admin può impostare un manualTotalShares per override totale
 * - Saldo > 0 → utente deve ricevere soldi
 * - Saldo < 0 → utente deve pagare soldi
 */

/**
 * Calcola quote, saldi e pagamenti consigliati.
 *
 * @param {Array} expenses - Lista spese [{id, amount, paidBy, paidByName, ...}]
 * @param {Array} participants - Lista partecipanti [{id, name, quoteCount, status, paypalLink, ...}]
 * @param {number|null} manualTotalShares - Override manuale del totale quote (opzionale)
 * @returns {Object} { totalExpenses, totalShares, shareAmount, balances, suggestedPayments }
 */
export function calculateExpenses(expenses, participants, manualTotalShares = null) {
  // 1. Totale spese
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 2. Calcola quote totali
  // Solo partecipanti che partecipano effettivamente (status 'partecipo' o 'forse')
  const payingParticipants = participants.filter(
    p => p.status === 'partecipo' || p.status === 'forse'
  );

  const totalShares = manualTotalShares != null && manualTotalShares > 0
    ? manualTotalShares
    : payingParticipants.reduce((sum, p) => sum + safeQuoteCount(p.quoteCount), 0);

  // 3. Quota singola
  const shareAmount = totalShares > 0 ? totalExpenses / totalShares : 0;

  // 4. Calcola saldi per ogni partecipante pagante
  const balances = payingParticipants.map(p => {
    const quoteCount = safeQuoteCount(p.quoteCount);
    const amountDue = shareAmount * quoteCount;
    const amountPaid = expenses
      .filter(e => e.paidBy === p.id)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const balance = amountPaid - amountDue;

    return {
      userId: p.id,
      userName: p.name,
      quoteCount,
      amountDue: round2(amountDue),
      amountPaid: round2(amountPaid),
      balance: round2(balance),
      paypalLink: p.paypalLink || null,
    };
  });

  // 5. Calcola pagamenti consigliati (algoritmo greedy)
  const suggestedPayments = calculateSuggestedPayments(balances);

  return {
    totalExpenses: round2(totalExpenses),
    totalShares: round2(totalShares),
    shareAmount: round2(shareAmount),
    balances,
    suggestedPayments,
  };
}

/**
 * Algoritmo greedy per minimizzare il numero di trasferimenti.
 * Input: balances con userId, userName, balance, paypalLink
 * Output: [{fromUserId, fromUserName, toUserId, toUserName, amount, paypalLink}]
 */
function calculateSuggestedPayments(balances) {
  // Separa debitori e creditori
  const debtors = balances
    .filter(b => b.balance < -0.01)
    .map(b => ({ ...b, remaining: Math.abs(b.balance) }))
    .sort((a, b) => b.remaining - a.remaining); // dal più grande

  const creditors = balances
    .filter(b => b.balance > 0.01)
    .map(b => ({ ...b, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining); // dal più grande

  const payments = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = round2(Math.min(debtor.remaining, creditor.remaining));

    if (amount > 0.01) {
      payments.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount,
        paypalLink: creditor.paypalLink,
      });
    }

    debtor.remaining = round2(debtor.remaining - amount);
    creditor.remaining = round2(creditor.remaining - amount);

    if (debtor.remaining < 0.01) di++;
    if (creditor.remaining < 0.01) ci++;
  }

  return payments;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Safely parse quoteCount. Returns 1 if undefined, null, NaN or negative.
 */
function safeQuoteCount(val) {
  if (val == null) return 1;
  const n = Number(val);
  return isNaN(n) || n < 0 ? 1 : n;
}
