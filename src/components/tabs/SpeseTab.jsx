import ExpensesCard from '../dashboard/ExpensesCard';
import OffersCard from '../dashboard/OffersCard';
import QuotesCard from '../dashboard/QuotesCard';
import PostEventCard from '../dashboard/PostEventCard';

/**
 * SpeseTab — Spese, quote & pagamenti, offerte.
 * V1.3: Aggiunta QuotesCard con calcolo quote, saldi e pagamenti consigliati.
 * V1.4: Aggiunta PostEventCard (visibile solo a evento concluso).
 */
export default function SpeseTab() {
  return (
    <div className="tab-content spese-tab">
      <PostEventCard />
      <ExpensesCard />
      <QuotesCard />
      <OffersCard />
    </div>
  );
}
