import QuoteSectionCard from "./QuoteSectionCard";

export default function QuoteVehicleSection({
  vehicle,
  showVehicleLink = true,
  vehiclePath,
}) {
  const currentVehicle = vehicle || {};

  // Construit le nom du véhicule sans espaces superflus.
  const vehicleName =
    [currentVehicle.brand, currentVehicle.model].filter(Boolean).join(" ") ||
    "Véhicule proposé";

  // Accepte les images sous forme d'URL ou d'objet { url }.
  const firstImage = currentVehicle.images?.[0];

  const imageUrl =
    typeof firstImage === "string" ? firstImage : firstImage?.url || null;

  const mileage =
    currentVehicle.mileage != null
      ? Number(currentVehicle.mileage).toLocaleString("fr-FR")
      : null;

  return (
    <QuoteSectionCard
      icon="bi-car-front"
      title="Véhicule proposé"
      description="Retrouvez les caractéristiques du véhicule concerné."
      className="quote-vehicle-card"
    >
      <div className="quote-vehicle">
        <div className="quote-vehicle__image">
          {imageUrl ? (
            <img src={imageUrl} alt={vehicleName} />
          ) : (
            <div className="quote-vehicle__placeholder">
              <i className="bi bi-car-front" aria-hidden="true" />
              <span>Aucune image disponible</span>
            </div>
          )}
        </div>

        <div className="quote-vehicle__details">
          <p className="quote-vehicle__eyebrow">VÉHICULE SÉLECTIONNÉ</p>

          <h3>{vehicleName}</h3>

          {currentVehicle.year != null && (
            <span className="quote-vehicle__tag">
              <i className="bi bi-calendar3" aria-hidden="true" />
              {currentVehicle.year}
            </span>
          )}

          <div className="quote-vehicle__specs">
            {currentVehicle.engine_type && (
              <span>
                <i className="bi bi-fuel-pump" aria-hidden="true" />
                {currentVehicle.engine_type}
              </span>
            )}

            {mileage !== null && (
              <span>
                <i className="bi bi-speedometer2" aria-hidden="true" />
                {mileage} km
              </span>
            )}
          </div>

          {showVehicleLink && currentVehicle.id != null && vehiclePath && (
            <a href={vehiclePath} className="quote-vehicle__link">
              Voir le véhicule
              <i className="bi bi-arrow-up-right" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </QuoteSectionCard>
  );
}
