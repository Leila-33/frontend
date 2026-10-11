import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/priceUtils";

export default function QuoteSummarySection({
  quote,
  canDecide = false,
  actionLoading = false,
  openDecision,
  showClientActions = true,
}) {
  if (!quote) return null;

  const discount = Number(quote.discount ?? 0);
  const downPayment = Number(quote.down_payment ?? 0);

  const tradeInValue = Number(
    quote.trade_in_value ?? quote.trade_in?.estimated_value ?? 0
  );

  const basePrice = Number(quote.base_price ?? 0);

  const financedAmount =
    quote.financed_amount != null
      ? Number(quote.financed_amount)
      : Math.max(0, basePrice - discount - downPayment - tradeInValue);

  const hasTradeIn = quote.trade_in != null || quote.trade_in_value != null;

  const status = quote.status;
  const applicationId = quote.application_id ?? quote.application?.id;

  return (
    <section className="quote-card quote-summary">
      <div className="quote-summary__top">
        <span className="quote-summary__label">RÉCAPITULATIF DU DEVIS</span>
        <i className="bi bi-file-earmark-check" aria-hidden="true" />
      </div>

      <h2>{formatCurrency(basePrice)}</h2>

      <p className="quote-summary__subtitle">Prix du véhicule proposé</p>

      <div className="quote-summary__divider" />

      <div className="quote-summary__line">
        <span>Remise</span>
        <strong>{formatCurrency(discount)}</strong>
      </div>

      <div className="quote-summary__line">
        <span>Apport</span>
        <strong>{formatCurrency(downPayment)}</strong>
      </div>

      {hasTradeIn && (
        <div className="quote-summary__line">
          <span>Reprise estimée</span>
          <strong>{formatCurrency(tradeInValue)}</strong>
        </div>
      )}

      <div className="quote-summary__total">
        <span>Montant à financer</span>
        <strong>{formatCurrency(financedAmount)}</strong>
      </div>

      {/* Actions et messages réservés au client */}
      {showClientActions && (
        <>
          {canDecide && (
            <div className="quote-summary__actions">
              <button
                type="button"
                className="quote-button quote-button--primary quote-button--full"
                onClick={() => openDecision?.("accept")}
                disabled={actionLoading}
              >
                <i className="bi bi-check-circle" aria-hidden="true" />
                Accepter le devis
              </button>

              <button
                type="button"
                className="quote-button quote-button--outline-danger quote-button--full"
                onClick={() => openDecision?.("refuse")}
                disabled={actionLoading}
              >
                Refuser le devis
              </button>
            </div>
          )}

          {status === "ACCEPTED" && (
            <div className="quote-result-message quote-result-message--success">
              <i className="bi bi-check-circle-fill" aria-hidden="true" />

              <div>
                <strong>Devis accepté</strong>
                <p>Votre décision a bien été enregistrée.</p>

                {applicationId && (
                  <Link to={`/applications/${applicationId}`}>
                    Consulter mon dossier
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="quote-result-message quote-result-message--danger">
              <i className="bi bi-x-circle-fill" aria-hidden="true" />

              <div>
                <strong>Devis refusé</strong>
                <p>Ce devis n’est plus en attente de décision.</p>
              </div>
            </div>
          )}

          {status === "EXPIRED" && (
            <div className="quote-result-message quote-result-message--warning">
              <i className="bi bi-clock-fill" aria-hidden="true" />

              <div>
                <strong>Devis expiré</strong>
                <p>
                  Contactez notre équipe commerciale pour étudier les
                  possibilités.
                </p>
              </div>
            </div>
          )}

          {status === "DRAFT" && (
            <div className="quote-result-message quote-result-message--neutral">
              <i className="bi bi-hourglass-split" aria-hidden="true" />

              <div>
                <strong>Devis en préparation</strong>
                <p>
                  Vous pourrez prendre une décision lorsque la proposition sera
                  envoyée.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
