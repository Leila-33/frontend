/**
 * Affiche les informations du véhicule repris
 * lorsqu'une reprise est présente dans l'offre.
 */
export default function QuoteTradeInCard({
  quote,
}) {
  const tradeIn = quote?.trade_in;

  const vehicleName =
    [tradeIn?.brand, tradeIn?.model]
      .filter(Boolean)
      .join(" ") || "Véhicule non renseigné";

  const estimatedValue =
    tradeIn?.estimated_value != null
      ? Number(tradeIn.estimated_value).toLocaleString(
          "fr-FR"
        )
      : null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        <h2 className="h5 fw-semibold mb-3">
          Reprise
        </h2>

        {!tradeIn ? (
          <div className="text-muted">
            Aucune reprise.
          </div>
        ) : (
          <>
            {/* =================================================
                VÉHICULE
            ================================================= */}

            <div className="fw-semibold">
              {vehicleName}
            </div>

            {/* =================================================
                ANNÉE
            ================================================= */}

            {tradeIn.year && (
              <div className="text-muted">
                {tradeIn.year}
              </div>
            )}

            {/* =================================================
                KILOMÉTRAGE
            ================================================= */}

            {tradeIn.mileage != null && (
              <div className="text-muted">
                {Number(tradeIn.mileage).toLocaleString(
                  "fr-FR"
                )}{" "}
                km
              </div>
            )}

            {/* =================================================
                ÉTAT
            ================================================= */}

            {tradeIn.condition && (
              <div className="text-muted">
                {tradeIn.condition}
              </div>
            )}

            <hr />

            {/* =================================================
                VALEUR ESTIMÉE
            ================================================= */}

            <div className="fw-bold">
              Valeur estimée :{" "}
              {estimatedValue
                ? `${estimatedValue} €`
                : "Non estimée"}
            </div>
          </>
        )}

      </div>
    </div>
  );
}