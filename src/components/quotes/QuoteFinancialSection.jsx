import QuoteInfoItem from "./QuoteInfoItem";
import QuoteSectionCard from "./QuoteSectionCard";
import { formatCurrency } from "../../utils/priceUtils";

export default function QuoteFinancialSection({
  quote,
  title = "Détail financier",
  description = "Récapitulatif des montants de votre proposition.",
}) {
  const currentQuote = quote || {};

  const discount = Number(currentQuote.discount ?? 0);
  const downPayment = Number(currentQuote.down_payment ?? 0);

  const tradeInValue = Number(
    currentQuote.trade_in_value ?? currentQuote.trade_in?.estimated_value ?? 0
  );

  const basePrice = Number(currentQuote.base_price);

  const financedAmount =
    currentQuote.financed_amount != null
      ? currentQuote.financed_amount
      : Number.isFinite(basePrice)
        ? Math.max(0, basePrice - discount - downPayment - tradeInValue)
        : null;

  const hasFinancing =
    currentQuote.duration_months != null ||
    currentQuote.monthly_payment != null;

  return (
    <QuoteSectionCard icon="bi-receipt" title={title} description={description}>
      <div className="quote-financial-list">
        <QuoteInfoItem
          label="Prix du véhicule"
          value={formatCurrency(currentQuote.base_price)}
        />

        {discount > 0 && (
          <QuoteInfoItem
            label="Remise commerciale"
            value={`− ${formatCurrency(discount)}`}
          />
        )}

        {downPayment > 0 && (
          <QuoteInfoItem
            label="Apport personnel"
            value={`− ${formatCurrency(downPayment)}`}
          />
        )}

        {tradeInValue > 0 && (
          <QuoteInfoItem
            label="Valeur de reprise estimée"
            value={`− ${formatCurrency(tradeInValue)}`}
          />
        )}

        <div className="quote-financial-total">
          <div>
            <span>
              {hasFinancing
                ? "Montant à financer"
                : "Montant de la proposition"}
            </span>

            <small>Selon les conditions indiquées dans le devis</small>
          </div>

          <strong>
            {financedAmount != null
              ? formatCurrency(financedAmount)
              : "Non renseigné"}
          </strong>
        </div>
      </div>
    </QuoteSectionCard>
  );
}
