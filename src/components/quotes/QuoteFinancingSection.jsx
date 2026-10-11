import QuoteInfoItem from "./QuoteInfoItem";
import QuoteSectionCard from "./QuoteSectionCard";
import { formatCurrency } from "../../utils/priceUtils";

export default function QuoteFinancingSection({ quote, hideWhenEmpty = true }) {
  const currentQuote = quote || {};

  const hasFinancing =
    currentQuote.duration_months != null ||
    currentQuote.monthly_payment != null ||
    currentQuote.down_payment != null ||
    currentQuote.financed_amount != null;

  if (hideWhenEmpty && !hasFinancing) {
    return null;
  }

  return (
    <QuoteSectionCard
      icon="bi-bank"
      title="Financement"
      description="Modalités de financement proposées."
    >
      <div className="quote-info-grid">
        <QuoteInfoItem
          label="Durée"
          value={
            currentQuote.duration_months != null
              ? `${currentQuote.duration_months} mois`
              : "Non renseignée"
          }
        />

        <QuoteInfoItem
          label="Mensualité estimée"
          value={formatCurrency(currentQuote.monthly_payment)}
          highlight
        />

        <QuoteInfoItem
          label="Apport"
          value={formatCurrency(currentQuote.down_payment)}
        />

        <QuoteInfoItem
          label="Montant financé"
          value={formatCurrency(currentQuote.financed_amount)}
        />
      </div>

      <p className="quote-disclaimer">
        Les conditions définitives du financement restent soumises aux modalités
        contractuelles et, le cas échéant, à l'acceptation de l'organisme
        financeur.
      </p>
    </QuoteSectionCard>
  );
}
