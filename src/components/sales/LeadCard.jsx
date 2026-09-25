import { Link } from "react-router-dom";
import { formatAmount } from "../../utils/priceUtils";

/**
 * Carte représentant un lead commercial.
 *
 * Deux modes d'affichage sont disponibles :
 *
 * - `my-leads`
 *   Le lead appartient à l'agent connecté et la carte
 *   permet d'accéder à sa fiche détaillée.
 *
 * - `available`
 *   Le lead est disponible et l'agent peut le prendre
 *   en charge.
 *
 * La logique d'attribution reste gérée par le composant
 * parent via `onTakeLead`.
 */
export default function LeadCard({
  lead,
  mode = "my-leads",
  onTakeLead,
  loading = false,
}) {
  // =====================================================
  // DONNÉES D'AFFICHAGE
  // =====================================================

  /**
   * Nom complet du prospect.
   *
   * Le fallback évite d'afficher "undefined" si une
   * information manque dans la réponse de l'API.
   */
  const fullName =
    [
      lead?.first_name,
      lead?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Prospect sans nom";

  /**
   * Nom du véhicule associé au lead.
   */
  const vehicleName =
    [
      lead?.vehicle?.brand,
      lead?.vehicle?.model,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Véhicule non renseigné";

  /**
   * Formatage du prix selon les conventions françaises.
   */
  const formattedPrice =
    lead?.vehicle?.price != null
      ? formatAmount(lead.vehicle.price)
      : "Prix non renseigné";

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <article
      className="
        card
        border-0
        shadow-sm
        rounded-4
        h-100
      "
    >
      <div className="card-body p-4">

        {/* =================================================
            INFORMATIONS DU LEAD
        ================================================= */}

        {mode === "my-leads" ? (
          /*
           * Utilisation d'un Link plutôt que d'un div
           * cliquable :
           *
           * - navigation accessible au clavier ;
           * - comportement natif du navigateur ;
           * - meilleure sémantique ;
           * - compatible React Router.
           */
          <Link
            to={`/sales/leads/${lead.id}`}
            className="
              text-decoration-none
              text-dark
              d-block
            "
            aria-label={`Voir le lead ${fullName}`}
          >
            <LeadInformation
              fullName={fullName}
              vehicleName={vehicleName}
              formattedPrice={formattedPrice}
            />
          </Link>
        ) : (
          <LeadInformation
            fullName={fullName}
            vehicleName={vehicleName}
            formattedPrice={formattedPrice}
          />
        )}

        {/* =================================================
            ACTION
        ================================================= */}

        {mode === "available" && (
          <button
            type="button"
            className="
              btn
              btn-dark
              w-100
              mt-4
            "
            onClick={() =>
              onTakeLead?.(lead.id)
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="
                    spinner-border
                    spinner-border-sm
                    me-2
                  "
                  aria-hidden="true"
                />

                Attribution...
              </>
            ) : (
              <>
                <i
                  className="
                    bi
                    bi-arrow-right-circle
                    me-2
                  "
                  aria-hidden="true"
                />

                Prendre ce lead
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * Affiche les principales informations d'un lead.
 *
 * Composant interne volontairement simple :
 * il n'a pas besoin d'être exporté car il est uniquement
 * utilisé par `LeadCard`.
 */
function LeadInformation({
  fullName,
  vehicleName,
  formattedPrice,
}) {
  return (
    <div>

      {/* =================================================
          PROSPECT
      ================================================= */}

      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className="
    rounded-circle
    bg-light
    d-flex
    align-items-center
    justify-content-center
    flex-shrink-0
  "
          style={{
            width: "44px",
            height: "44px",
          }}
          aria-hidden="true"
        >
          <i className="bi bi-file-earmark-text text-muted" />
        </div>

        <div className="min-w-0">
          <h2
            className="
              h6
              fw-bold
              mb-1
              text-truncate
            "
            title={fullName}
          >
            {fullName}
          </h2>

          <span className="text-muted small">
            Prospect
          </span>
        </div>
      </div>

      {/* =================================================
          VÉHICULE
      ================================================= */}

      <div className="border-top pt-3">

        <div className="d-flex align-items-start gap-2 mb-2">
          <i
            className="
              bi
              bi-car-front
              text-muted
              mt-1
            "
            aria-hidden="true"
          />

          <div className="min-w-0">
            <div className="small text-muted">
              Véhicule recherché
            </div>

            <div
              className="
                fw-semibold
                text-break
              "
            >
              {vehicleName}
            </div>
          </div>
        </div>

        {/* =================================================
            PRIX
        ================================================= */}

        <div className="d-flex align-items-center gap-2">
          <i
            className="
              bi
              bi-tag
              text-muted
            "
            aria-hidden="true"
          />

          <span className="fw-semibold">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
}