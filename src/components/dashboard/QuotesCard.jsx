import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import { formatCurrency } from '../../utils/formatters';
import { calculateExpenses } from '../../utils/expenseCalculator';

/**
 * QuotesCard — Gestione quote, saldi e pagamenti consigliati.
 * Milestone 3 feature.
 *
 * UX: deve essere CHIARO chi deve pagare, quanto, e a chi.
 * I pagamenti consigliati sono la sezione più importante.
 */
export default function QuotesCard() {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { event, participants, expenses, updateEvent } = useEvent();
  const [editingManualShares, setEditingManualShares] = useState(false);
  const [manualSharesInput, setManualSharesInput] = useState('');

  if (!event || expenses.length === 0) return null;

  const manualTotalShares = event.manualTotalShares || null;
  const { totalExpenses, totalShares, shareAmount, balances, suggestedPayments } =
    calculateExpenses(expenses, participants, manualTotalShares);

  const handleSaveManualShares = async () => {
    const val = manualSharesInput.trim();
    if (val === '' || val === '0') {
      await updateEvent({ manualTotalShares: null });
    } else {
      await updateEvent({ manualTotalShares: Number(val) });
    }
    setEditingManualShares(false);
  };

  // Separa chi deve pagare, chi deve ricevere, chi è in pari
  const debtors = balances.filter(b => b.balance < -0.01);
  const creditors = balances.filter(b => b.balance > 0.01);
  const evenUsers = balances.filter(b => Math.abs(b.balance) <= 0.01);

  return (
    <Card
      title="Quote & Pagamenti"
      emoji="📊"
      id="quotes-card"
      className="quotes-card"
    >
      {/* ─── Riepilogo compatto ─────────────────────────────────────── */}
      <div className="quotes-summary">
        <div className="quotes-summary-row">
          <span>Totale spese</span>
          <strong>{formatCurrency(totalExpenses)}</strong>
        </div>
        <div className="quotes-summary-row">
          <span>
            Partecipanti paganti
            {manualTotalShares && <span className="quotes-override-badge">Override</span>}
          </span>
          <strong>{totalShares} quote</strong>
        </div>
        <div className="quotes-summary-row quotes-highlight">
          <span>💰 Ognuno deve pagare</span>
          <strong className="quotes-share-amount">{formatCurrency(shareAmount)}</strong>
        </div>
      </div>

      {/* ─── Override manuale (Admin) ──────────────────────────────── */}
      {isEventAdmin && (
        <div className="quotes-admin-override">
          {!editingManualShares ? (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setManualSharesInput(manualTotalShares || '');
                setEditingManualShares(true);
              }}
            >
              ⚙️ {manualTotalShares ? 'Modifica override quote' : 'Imposta quote manuali'}
            </button>
          ) : (
            <div className="quotes-manual-form">
              <label className="form-label">
                Totale quote manuale (lascia vuoto per automatico):
                <input
                  className="input input-sm"
                  type="number"
                  step="0.5"
                  min="0"
                  value={manualSharesInput}
                  onChange={e => setManualSharesInput(e.target.value)}
                  placeholder="Es. 8"
                  autoFocus
                />
              </label>
              <div className="add-item-buttons">
                <button className="btn btn-primary btn-sm" onClick={handleSaveManualShares}>Salva</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingManualShares(false)}>Annulla</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PAGAMENTI CONSIGLIATI (sezione principale) ────────────── */}
      {suggestedPayments.length > 0 && (
        <div className="quotes-payments">
          <h4 className="quotes-section-title">💸 Chi deve pagare chi</h4>
          <div className="quotes-payment-list">
            {suggestedPayments.map((p, idx) => (
              <div key={idx} className="quotes-payment-row">
                <div className="quotes-payment-flow">
                  <span className="quotes-payment-from">{p.fromUserName}</span>
                  <span className="quotes-payment-arrow">deve dare</span>
                  <strong className="quotes-payment-amount">{formatCurrency(p.amount)}</strong>
                  <span className="quotes-payment-arrow">a</span>
                  <span className="quotes-payment-to">{p.toUserName}</span>
                </div>
                {p.paypalLink && (
                  <a
                    href={p.paypalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-paypal"
                    title="Paga con PayPal"
                  >
                    💳 Paga con PayPal
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedPayments.length === 0 && balances.length > 0 && (
        <div className="quotes-all-clear">
          <span>✅</span>
          <p>Tutti i conti sono in pari! Nessun pagamento necessario.</p>
        </div>
      )}

      {/* ─── Dettaglio saldi ───────────────────────────────────────── */}
      {balances.length > 0 && (
        <div className="quotes-balances">
          <h4 className="quotes-section-title">Situazione per persona</h4>
          <div className="quotes-balance-list">

            {/* Chi deve ricevere soldi */}
            {creditors.map(b => (
              <div key={b.userId} className="quotes-balance-row balance-row-positive">
                <div className="quotes-balance-info">
                  <span className="quotes-balance-name">{b.userName}</span>
                  <span className="quotes-balance-detail">
                    Ha anticipato {formatCurrency(b.amountPaid)} • Doveva {formatCurrency(b.amountDue)}
                  </span>
                </div>
                <div className="quotes-balance-result">
                  <span className="quotes-balance-amount balance-positive">
                    Deve ricevere {formatCurrency(b.balance)}
                  </span>
                </div>
              </div>
            ))}

            {/* Chi deve pagare */}
            {debtors.map(b => (
              <div key={b.userId} className="quotes-balance-row balance-row-negative">
                <div className="quotes-balance-info">
                  <span className="quotes-balance-name">{b.userName}</span>
                  <span className="quotes-balance-detail">
                    Ha anticipato {formatCurrency(b.amountPaid)} • Doveva {formatCurrency(b.amountDue)}
                  </span>
                </div>
                <div className="quotes-balance-result">
                  <span className="quotes-balance-amount balance-negative">
                    Deve pagare {formatCurrency(Math.abs(b.balance))}
                  </span>
                </div>
              </div>
            ))}

            {/* Chi è in pari */}
            {evenUsers.map(b => (
              <div key={b.userId} className="quotes-balance-row balance-row-even">
                <div className="quotes-balance-info">
                  <span className="quotes-balance-name">{b.userName}</span>
                  <span className="quotes-balance-detail">
                    Ha anticipato {formatCurrency(b.amountPaid)} • Doveva {formatCurrency(b.amountDue)}
                  </span>
                </div>
                <div className="quotes-balance-result">
                  <span className="quotes-balance-amount balance-zero">✅ In pari</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
