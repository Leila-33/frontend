import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState([]);

  // =========================
  // LOAD FAVORITES
  // =========================
  const fetchFavorites = async () => {

    try {

      const res = await apiFetch("/favorites/me");

setFavorites(res.items || []);

    } catch (err) {

      toast.error(
        "Impossible de charger les favoris"
      );

    }
  };

  // =========================
  // REMOVE FAVORITE
  // =========================
  const removeFavorite = async (vehicleId) => {

    try {

      await apiFetch(`/favorites/${vehicleId}`, {
        method: "DELETE"
      });

 setFavorites((prev) => {
  const list = Array.isArray(prev) ? prev : [];

  return list.filter(
    (f) => f.vehicle.id !== vehicleId
  );
});

      toast.success(
        "Retiré des favoris"
      );

    } catch (err) {

      toast.error(
        "Erreur suppression favori"
      );
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);



  // =========================
  // EMPTY STATE
  // =========================
  if (favorites.length === 0) {

    return (
      <div className="container py-5">

        <div className="text-center py-5 border rounded-4 bg-light">

          <i className="bi bi-heart fs-1 text-muted"></i>

          <h3 className="fw-bold mt-3">
            Aucun favori
          </h3>

          <p className="text-muted">
            Ajoutez des véhicules à vos favoris
            pour les retrouver facilement.
          </p>

          <Link
            to="/search"
            className="btn btn-dark mt-2"
          >
            Explorer les véhicules
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Mes favoris
          </h2>

          <p className="text-muted mb-0">
            {favorites.length} véhicule(s)
          </p>

        </div>

      </div>

      {/* =========================
          GRID
      ========================= */}
      <div className="row g-4">

 {favorites.items?.map((fav) => {

  const vehicle = fav.vehicle;

  return (
    <div key={fav.id} className="col-12 col-md-6 col-lg-4">

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

        {/* IMAGE */}
        {vehicle.images?.[0] ? (

  <img
    src={vehicle.images[0]}
    className="w-100"
    style={{
      height: 220,
      objectFit: "cover"
    }}
    alt={vehicle.model}
  />

) : (

  <div
    className="d-flex flex-column align-items-center justify-content-center bg-light"
    style={{ height: 220 }}
  >

    <div style={{ fontSize: "64px" }}>
      🚗
    </div>

    <div className="text-muted fw-semibold">
      Aucune image disponible
    </div>

  </div>

)}
                  {/* FAVORITE BUTTON */}
                  <button
                    className="btn btn-light rounded-circle shadow-sm position-absolute top-0 end-0 m-3"
                    style={{
                      width: 42,
                      height: 42
                    }}
                    onClick={() =>
                      removeFavorite(vehicle.id)
                    }
                  >
                    <i className="bi bi-heart-fill text-danger"></i>
                  </button>

        {/* BODY */}
        <div className="card-body">

          <h5 className="fw-bold">
            {vehicle.brand} {vehicle.model}
          </h5>

          <p className="text-muted mb-1">
            {vehicle.year}
          </p>

          <div className="fw-bold fs-5 mb-3">
            {vehicle.price?.toLocaleString()} €
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="btn btn-dark w-100"
          >
            Voir le véhicule
          </Link>

        </div>

      </div>

    </div>
  );
})}
      </div>

    </div>
  );
}