/**
 * Affiche les informations principales
 * du véhicule associé à une offre.
 */
export default function QuoteVehicleCard({
  quote,
}) {
  const vehicleName =
    [
      quote?.vehicle?.brand,
      quote?.vehicle?.model,
    ]
      .filter(Boolean)
      .join(" ") || "Véhicule non renseigné";

  const basePrice =
    quote?.base_price != null
      ? Number(quote.base_price).toLocaleString("fr-FR")
      : "Non renseigné";

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
          Prix catalogue : {basePrice} €
        </div>

      </div>
    </div>
  );
}