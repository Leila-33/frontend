import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";
import { formatAmount } from "../../utils/priceUtils";
import { ImageCarousel } from "../../components/vehicles/ImageCarousel";
// ==========================================================
// CONSTANTES
// ==========================================================

const VEHICLE_IMAGE_HEIGHT = 220;

// ==========================================================
// COMPOSANT
// ==========================================================

export default function FavoritesPage() {
  // ========================================================
  // ÉTAT
  // ========================================================

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingVehicleId, setRemovingVehicleId] = useState(null);

  // ========================================================
  // CHARGEMENT DES FAVORIS
  // ========================================================

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/favorites/me");

      setFavorites(Array.isArray(response?.items) ? response.items : []);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris :", error);

      toast.error("Impossible de charger vos favoris.");

      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // SUPPRESSION D'UN FAVORI
  // ========================================================

  const removeFavorite = async (vehicleId) => {
    if (!vehicleId || removingVehicleId !== null) {
      return;
    }

    try {
      setRemovingVehicleId(vehicleId);

      await apiFetch(`/favorites/${vehicleId}`, {
        method: "DELETE",
      });

      // Mise à jour locale après confirmation
      // de la suppression par l'API.
      setFavorites((previousFavorites) =>
        previousFavorites.filter(
          (favorite) => favorite?.vehicle?.id !== vehicleId
        )
      );

      toast.success("Véhicule retiré des favoris.");
    } catch (error) {
      console.error("Erreur lors de la suppression du favori :", error);

      toast.error("Impossible de retirer ce véhicule des favoris.");
    } finally {
      setRemovingVehicleId(null);
    }
  };

  // ========================================================
  // CHARGEMENT INITIAL
  // ========================================================

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ========================================================
  // CHARGEMENT
  // ========================================================

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5" aria-live="polite">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-hidden="true"
          />

          <p className="text-muted mt-3 mb-0">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // LISTE VIDE
  // ========================================================

  if (favorites.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5 border rounded-4 bg-light">
          <i className="bi bi-heart fs-1 text-muted" aria-hidden="true" />

          <h1 className="h3 fw-bold mt-3">Aucun favori</h1>

          <p className="text-muted mb-4">
            Ajoutez des véhicules à vos favoris pour les retrouver facilement.
          </p>

          <Link to="/vehicles" className="btn btn-dark">
            <i className="bi bi-car-front me-2" aria-hidden="true" />
            Explorer les véhicules
          </Link>
        </div>
      </div>
    );
  }

  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (
    <div className="container py-4">
      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Mes favoris</h1>

        <p className="text-muted mb-0">
          {favorites.length} véhicule
          {favorites.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* ====================================================
          LISTE DES FAVORIS
      ==================================================== */}

      <div className="row g-4">
        {favorites.map((favorite) => {
          const vehicle = favorite?.vehicle;

          // Ignore un favori dont le véhicule n'est plus
          // disponible dans la réponse API.
          if (!vehicle?.id) {
            return null;
          }

          const vehicleName =
            [vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
            "Véhicule";

          const isRemoving = removingVehicleId === vehicle.id;

          return (
            <div
              key={favorite.id ?? vehicle.id}
              className="col-12 col-md-6 col-lg-4"
            >
              <article className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                {/* ==========================================
                    IMAGE
                ========================================== */}

                <div
                  className="position-relative"
                  style={{
                    height: VEHICLE_IMAGE_HEIGHT,
                  }}
                >
                  <ImageCarousel images={vehicle.images} />

                  {/* ========================================
      BOUTON FAVORI
  ======================================== */}

                  <button
                    type="button"
                    className="btn btn-light rounded-circle shadow-sm position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 42,
                      height: 42,
                      zIndex: 3,
                    }}
                    onClick={() => removeFavorite(vehicle.id)}
                    disabled={isRemoving}
                    aria-label={`Retirer ${vehicleName} des favoris`}
                    aria-busy={isRemoving}
                  >
                    {isRemoving ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />
                    ) : (
                      <i
                        className="bi bi-heart-fill text-danger"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {/* ==========================================
                    INFORMATIONS DU VÉHICULE
                ========================================== */}

                <div className="card-body d-flex flex-column">
                  <h2 className="h5 fw-bold mb-2">{vehicleName}</h2>

                  {vehicle.year != null && (
                    <p className="text-muted mb-2">{vehicle.year}</p>
                  )}

                  {vehicle.price != null && (
                    <div className="fw-bold fs-5 mb-3">
                      {formatAmount(vehicle.price)}
                    </div>
                  )}

                  <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="btn btn-dark w-100 mt-auto"
                  >
                    Voir le véhicule
                  </Link>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
