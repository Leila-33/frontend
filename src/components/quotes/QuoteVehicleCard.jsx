import { formatAmount } from "../../utils/priceUtils";

/**
 * Affiche les informations principales
 * du véhicule associé à une offre.
 */
export default function QuoteVehicleCard({ quote }) {
  const vehicle = quote?.vehicle;

  // ==========================================================
  // VÉHICULE
  // ==========================================================

  const vehicleName =
    [vehicle?.brand, vehicle?.model]
      .filter(Boolean)
      .join(" ") || "Véhicule non renseigné";

  // ==========================================================
  // PRIX CATALOGUE
  // ==========================================================

  const hasBasePrice = quote?.base_price != null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        <h2 className="h5 fw-semibold mb-3">
          Véhicule
        </h2>

        <div className="fw-semibold">
          {vehicleName}
        </div>

        <div className="text-muted">
          Prix catalogue :{" "}
          {hasBasePrice
            ? `${formatAmount(quote.base_price)}`
            : "Non renseigné"}
        </div>

      </div>
    </div>
  );
}