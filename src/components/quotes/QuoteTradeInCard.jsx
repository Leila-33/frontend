import { formatAmount } from "../../utils/priceUtils";

/**
 * Affiche les informations du véhicule repris
 * lorsqu'une reprise est présente dans l'offre.
 */
export default function QuoteTradeInCard({ quote }) {
  const tradeIn = quote?.trade_in;

  if (!tradeIn) {
    return (
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4">
          <h2 className="h5 fw-semibold mb-3">
            Reprise
          </h2>

          <p className="text-muted mb-0">
            Aucune reprise.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VÉHICULE
  // ==========================================================

  const vehicleName =
    [tradeIn.brand, tradeIn.model]
      .filter(Boolean)
      .join(" ") || "Véhicule non renseigné";

  // ==========================================================
  // VALEUR ESTIMÉE
  // ==========================================================

  const hasEstimatedValue =
    tradeIn.estimated_value != null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        <h2 className="h5 fw-semibold mb-3">
          Reprise
        </h2>

        {/* ==================================================
            VÉHICULE
        ================================================== */}

        <div className="fw-semibold">
          {vehicleName}
        </div>

        {/* ==================================================
            ANNÉE
        ================================================== */}

        {tradeIn.year != null && (
          <div className="text-muted">
            {tradeIn.year}
          </div>
        )}

        {/* ==================================================
            KILOMÉTRAGE
        ================================================== */}

        {tradeIn.mileage != null && (
          <div className="text-muted">
            {Number(tradeIn.mileage).toLocaleString("fr-FR")}{" "}
            km
          </div>
        )}

        {/* ==================================================
            ÉTAT
        ================================================== */}

        {tradeIn.condition && (
          <div className="text-muted">
            {tradeIn.condition}
          </div>
        )}

        <hr />

        {/* ==================================================
            VALEUR ESTIMÉE
        ================================================== */}

        <div className="fw-bold">
          Valeur estimée :{" "}
          {hasEstimatedValue
            ? formatAmount(tradeIn.estimated_value)
            : "Non estimée"}
        </div>

      </div>
    </div>
  );
}