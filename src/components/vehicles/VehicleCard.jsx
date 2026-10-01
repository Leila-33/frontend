import { ImageCarousel } from "./ImageCarousel";
import { useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import {
  BsCalendar3,
  BsCarFront,
  BsCheckCircle,
  BsCheckCircleFill,
  BsFuelPump,
  BsPencil,
  BsPlusCircle,
  BsShieldCheck,
  BsSpeedometer2,
  BsTrash,
  BsXCircle,
  BsCalendarCheck,
} from "react-icons/bs";
import { formatAmount } from "../../utils/priceUtils";
import AvailabilityModal from "./AvailabilityModal";

/**
 * Carte représentant un véhicule.
 *
 * Responsabilités :
 * - afficher les informations principales du véhicule ;
 * - afficher les images du véhicule ;
 * - afficher sa disponibilité ;
 * - permettre à un administrateur de modifier sa disponibilité ;
 * - permettre de vérifier la disponibilité d'une location ;
 * - permettre de modifier ou supprimer le véhicule ;
 * - rediriger vers la page de détail du véhicule.
 */
export function VehicleCard({ v, fetchVehicles, openModal }) {
  /* =======================================================
     CONTEXTE / NAVIGATION
  ======================================================= */

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  /* =======================================================
     ÉTAT - SUPPRESSION
  ======================================================= */

  /**
   * Véhicule actuellement sélectionné pour une suppression.
   *
   * Cet état permet d'ouvrir la modale de confirmation
   * avec les informations du véhicule concerné.
   */
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // =======================================================
  // ÉTAT - MODALE DE DISPONIBILITÉ
  // =======================================================

  const [availabilityVehicle, setAvailabilityVehicle] = useState(null);

  /* =======================================================
     NAVIGATION VERS LE DÉTAIL
  ======================================================= */

  /**
   * Redirige vers la page de détail du véhicule.
   *
   * L'administrateur utilise la route d'administration.
   * Les autres utilisateurs utilisent la route publique.
   */
  const goToDetail = () => {
    navigate(isAdmin ? `/admin/vehicle/${v.id}` : `/vehicle/${v.id}`);
  };

  /* =======================================================
     PRIX DU VÉHICULE
  ======================================================= */

  const totalPrice = Number(v.price || 0);

  /* =======================================================
     OUVERTURE DE LA MODALE DE DISPONIBILITÉ (VEHICULE EN LOCATION)
  ======================================================= */

  /**
   * Ouvre la modale de vérification avec le véhicule courant.
   */

  const openAvailabilityModal = (event, vehicle) => {
    event.stopPropagation();

    setAvailabilityVehicle(vehicle);
  };

  /**
   * Ferme la modale de disponibilité et réinitialise
   * son état.
   */
  // =======================================================
  // FERMETURE DE LA MODALE DE DISPONIBILITÉ
  // =======================================================

  const closeAvailabilityModal = () => {
    setAvailabilityVehicle(null);
  };

  /* =======================================================
     AFFICHAGE DE LA DISPONIBILITÉ D'UN VEHICULE (VISIBILITE CLIENT)
  ======================================================= */

  /**
   * Affiche l'état de disponibilité d'un véhicule.
   *
   * Pour un utilisateur non administrateur :
   * → affichage uniquement de l'information.
   *
   * Pour un administrateur :
   * → affichage de l'information + interrupteur permettant
   *   de modifier la disponibilité.
   *
   */
  const renderAvailability = (vehicle) => {
    const isAvailable = vehicle.is_available;

    /* -------------------------------------------------------
       BADGE DE DISPONIBILITÉ
    ------------------------------------------------------- */

    const badge = (
      <span className="d-flex align-items-center gap-2">
        {isAvailable ? (
          <span className="text-success d-flex align-items-center">
            <BsCheckCircle className="me-1" />
            Disponible
          </span>
        ) : (
          <span className="text-danger d-flex align-items-center">
            <BsXCircle className="me-1" />
            Indisponible
          </span>
        )}
      </span>
    );

    /*
     * Seul l'administrateur peut modifier
     * la disponibilité commerciale.
     */
    if (!isAdmin) {
      return badge;
    }

    /* -------------------------------------------------------
       AFFICHAGE ADMINISTRATEUR
    ------------------------------------------------------- */

    return (
      <div
        className="d-flex align-items-center gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        {badge}

        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={isAvailable}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              handleAvailabilityChange(vehicle, event.target.checked);
            }}
            aria-label={
              isAvailable
                ? "Désactiver la disponibilité"
                : "Activer la disponibilité"
            }
          />
        </div>
      </div>
    );
  };

  /* =======================================================
     MODIFICATION DE LA DISPONIBILITÉ ADMIN (VISIBILITE CLIENT)
  ======================================================= */

  /**
   * Modifie la disponibilité commerciale d'un véhicule.
   *
   * Cette action est réservée à l'administration.
   */
  const handleAvailabilityChange = async (vehicle, value) => {
    try {
      await apiFetch(`/admin/vehicles/${vehicle.id}/availability`, {
        method: "PATCH",
        body: {
          value,
        },
      });

      // Recharge la liste afin d'afficher la nouvelle valeur.
      await fetchVehicles(undefined, false);

      toast.success(value ? "Véhicule activé" : "Véhicule désactivé");
    } catch (err) {
      toast.error(
        err.message || "Erreur lors de la modification de la disponibilité"
      );
    }
  };

  /* ================= DELETE VEHICLE ================= */

  const handleDelete = async (vehicle) => {
    try {
      await apiFetch(`/admin/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });

      toast.success("Véhicule supprimé ✅");
      await fetchVehicles(undefined, false);
    } catch (err) {
      toast.error(err.message);
    }
  };
  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <div className="col-md-4 mb-4">
      {/* ===================================================
          MODALE DE VÉRIFICATION DE DISPONIBILITÉ
      =================================================== */}

      {availabilityVehicle && (
        <AvailabilityModal
          vehicle={availabilityVehicle}
          onClose={closeAvailabilityModal}
        />
      )}

      {/* ===================================================
          CARTE DU VÉHICULE
      =================================================== */}

      <div
        className="
          card
          border-0
          shadow-sm
          rounded-4
          h-100
          vehicle-card
        "
        style={{
          cursor: "pointer",
          transition: "all .25s ease",
        }}
        onClick={goToDetail}
      >
        {/* ------------------------------------------------
            IMAGES
        ------------------------------------------------ */}
        <div className="position-relative">
          <ImageCarousel images={v.images} />

          {/* =========================
      TYPE DU VÉHICULE
  ========================= */}

          <span
            className={`
      badge
      position-absolute
      top-0
      start-0
      m-2
      px-3
      py-2
      rounded-pill
      ${v.type === "sale" ? "bg-success" : "bg-primary"}
    `}
          >
            {v.type === "sale" ? "Vente" : "Location"}
          </span>
        </div>

        <div className="card-body d-flex flex-column">
          {/* =================================================
              TYPE + DISPONIBILITÉ
          ================================================= */}
          <div className="d-flex justify-content-end mb-3">
            {renderAvailability(v)}
          </div>

          {/* =================================================
              TITRE
          ================================================= */}

          <div className="mb-3">
            <h5 className="fw-bold mb-0">{v.brand}</h5>

            <div className="text-muted">{v.model}</div>
          </div>

          {/* =================================================
              INFORMATIONS PRINCIPALES
          ================================================= */}

          <div className="d-flex flex-wrap gap-2 mb-3">
            {/* Année */}
            <span className="badge bg-light text-dark border">
              <BsCalendar3 className="me-1" />
              {v.year}
            </span>

            {/* Kilométrage */}
            <span className="badge bg-light text-dark border">
              <BsSpeedometer2 className="me-1" />
              {Number(v.mileage || 0).toLocaleString("fr-FR")} km
            </span>

            {/* Motorisation */}
            {v.engine_type && (
              <span className="badge bg-light text-dark border">
                <BsFuelPump className="me-1" />
                {v.engine_type}
              </span>
            )}

            {/* État */}
            <span className="badge bg-light text-dark border">
              <BsShieldCheck className="me-1" />

              {v.condition === "new" ? "Neuf" : "Occasion"}
            </span>
          </div>

          {/* =================================================
              GARANTIE
          ================================================= */}

          {v.warranty_plan && (
            <div className="mb-3">
              <span
                className="
        badge
        bg-warning-subtle
        text-warning-emphasis
        border
        px-3
        py-2
        rounded-pill
      "
                title="Garantie incluse"
              >
                <BsShieldCheck className="me-1" />
                {v.warranty_plan.name}
              </span>
            </div>
          )}

          {/* =================================================
              OPTIONS DE LOCATION
          ================================================= */}

          {v.type === "rent" && (
            <>
              {/* ------------------------------------------------
                  OPTIONS INCLUSES
              ------------------------------------------------ */}

              {v.included_options?.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted fw-semibold d-block mb-2">
                    Inclus
                  </small>

                  <div className="d-flex flex-wrap gap-2">
                    {v.included_options.map((option) => (
                      <span
                        key={option.id}
                        className="
                          badge
                          bg-success-subtle
                          text-success
                          border
                        "
                      >
                        <BsCheckCircleFill className="me-1" />
                        {option.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------
                  OPTIONS FACULTATIVES
              ------------------------------------------------ */}

              {v.optional_options?.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted fw-semibold d-block mb-2">
                    Options disponibles
                  </small>

                  <div className="d-flex flex-wrap gap-2">
                    {v.optional_options.map((option) => {
                      const price = Number(option.price || 0);
                      const isDaily = option.billing_type === "daily";

                      return (
                        <span
                          key={option.id}
                          className="
                            badge
                            bg-light
                            text-dark
                            border
                          "
                        >
                          <BsPlusCircle className="me-1" />

                          {option.name}

                          {price > 0 && (
                            <>
                              {" "}
                              (+{formatAmount(price)}
                              {isDaily && "/jour"})
                            </>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* =================================================
              PRIX
          ================================================= */}

          <div className="mt-auto pt-3 border-top">
            <div className="mb-3">
              <div className="fs-3 fw-bold text-dark">
                {formatAmount(totalPrice)}

                {v.type === "rent" && (
                  <span className="fs-6 text-muted fw-normal ms-2">/ jour</span>
                )}
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="d-flex justify-content-between align-items-center">
              {/* Immatriculation */}
              <div className="text-muted small">
                <BsCarFront className="me-1" />
                {v.license_plate || "—"}
              </div>

              <div className="d-flex gap-2">
                {/* ---------------------------------------------
                    VÉRIFIER LA DISPONIBILITÉ
                --------------------------------------------- */}

                {v.type === "rent" && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm border"
                    onClick={(event) => {
                      openAvailabilityModal(event, v);
                    }}
                    title="Vérifier la disponibilité"
                    aria-label={`Vérifier la disponibilité de ${v.brand} ${v.model}`}
                  >
                    <BsCalendarCheck />
                  </button>
                )}

                {/* ---------------------------------------------
                    MODIFIER
                --------------------------------------------- */}
                {isAdmin &&
                  window.location.pathname.includes("/admin/vehicles") && (
                    <>
                      {/* ---------------------------------------------
          MODIFIER
      --------------------------------------------- */}

                      <button
                        type="button"
                        className="btn btn-light btn-sm border"
                        onClick={(event) => {
                          event.stopPropagation();
                          openModal(v);
                        }}
                        title="Modifier"
                        aria-label={`Modifier ${v.brand} ${v.model}`}
                      >
                        <BsPencil />
                      </button>

                      {/* ---------------------------------------------
          SUPPRIMER
      --------------------------------------------- */}

                      <button
                        type="button"
                        className="
          btn
          btn-light
          btn-sm
          border
          text-danger
        "
                        onClick={(event) => {
                          event.stopPropagation();
                          setVehicleToDelete(v);
                        }}
                        title="Supprimer"
                        aria-label={`Supprimer ${v.brand} ${v.model}`}
                      >
                        <BsTrash />
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          MODALE DE CONFIRMATION DE SUPPRESSION
      =================================================== */}

      <ConfirmActionModal
        open={!!vehicleToDelete}
        type="delete"
        title="Supprimer ce véhicule ?"
        description={
          vehicleToDelete
            ? `Vous êtes sur le point de supprimer ${vehicleToDelete.brand} ${vehicleToDelete.model}. Cette action est définitive.`
            : ""
        }
        onCancel={() => {
          setVehicleToDelete(null);
        }}
        onConfirm={async () => {
          if (!vehicleToDelete) {
            return;
          }

          /*
           * On conserve le véhicule sélectionné pendant
           * l'exécution de la suppression.
           */
          await handleDelete(vehicleToDelete);

          /*
           * Ferme la modale après la suppression.
           *
           * Si askDelete gère déjà cette fermeture dans
           * le composant parent, cette ligne peut être retirée.
           */
          setVehicleToDelete(null);
        }}
      />
    </div>
  );
}
