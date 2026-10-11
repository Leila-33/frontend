import QuoteInfoItem from "./QuoteInfoItem";
import QuoteSectionCard from "./QuoteSectionCard";
import { formatCurrency } from "../../utils/priceUtils";

export default function QuoteTradeInSection({ quote, hideWhenEmpty = true }) {
  const currentQuote = quote || {};
  const tradeIn = currentQuote.trade_in || null;

  // Détermine si des informations de reprise sont présentes.
  const hasTradeIn = tradeIn !== null || currentQuote.trade_in_value != null;

  if (hideWhenEmpty && !hasTradeIn) {
    return null;
  }

  const estimatedValue =
    currentQuote.trade_in_value ?? tradeIn?.estimated_value;

  return (
    <QuoteSectionCard
      icon="bi-arrow-left-right"
      title="Reprise de votre véhicule"
      description="Informations relatives au véhicule proposé en reprise."
    >
      <div className="quote-info-grid">
        <QuoteInfoItem
          label="Marque"
          value={tradeIn?.brand || "Non renseignée"}
        />

        <QuoteInfoItem
          label="Modèle"
          value={tradeIn?.model || "Non renseigné"}
        />

        <QuoteInfoItem
          label="Année"
          value={tradeIn?.year ?? "Non renseignée"}
        />

        <QuoteInfoItem
          label="Kilométrage"
          value={
            tradeIn?.mileage != null
              ? `${Number(tradeIn.mileage).toLocaleString("fr-FR")} km`
              : "Non renseigné"
          }
        />

        <QuoteInfoItem
          label="Estimation de reprise"
          value={formatCurrency(estimatedValue)}
          highlight
        />

        {tradeIn?.condition && (
          <QuoteInfoItem label="État du véhicule" value={tradeIn.condition} />
        )}
      </div>
    </QuoteSectionCard>
  );
}
