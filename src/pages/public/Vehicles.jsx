import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import NumberedPagination from "../../components/common/NumberedPagination";
import { VehicleCard } from "../../components/vehicles/VehicleCard";

export default function Vehicles() {
  // =========================
  // VÉHICULES
  // =========================

  const [vehicles, setVehicles] = useState([]);

  // =========================
  // FILTRES
  // =========================
  const [filters, setFilters] = useState({
    brand: "",
    model: "",

    type: "",

    engine_type: "",

    price_min: "",
    price_max: "",

    year_min: "",
    mileage_max: "",

    sort_by: "year",
    order: "desc",
  });

  // =========================
  // PAGINATION
  // =========================

  /*
   * Numéro de la page actuellement affichée.
   */
  const [page, setPage] = useState(1);

  /*
   * Nombre de véhicules affichés par page.
   */
  const size = 10;

  /*
   * Nombre total de véhicules correspondant
   * aux filtres.
   */
  const [total, setTotal] = useState(0);

  /*
   * Nombre total de pages retourné par le backend.
   */
  const [totalPages, setTotalPages] = useState(1);

  // =========================
  // FILTRES AVANCÉS
  // =========================

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // =========================
  // CHARGEMENT DES VÉHICULES
  // =========================

  const fetchVehicles = useCallback(
    async (customPage = page, customFilters = filters, shouldScroll = true) => {
      /*
       * On remonte en haut uniquement lorsqu'une
       * nouvelle page ou une recherche est demandée.
       *
       * Cela évite de faire défiler la page vers le haut
       * lors de simples modifications des champs.
       */
      if (shouldScroll) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      try {
        // =========================
        // PARAMÈTRES DE RECHERCHE
        // =========================
        const rawFilters = {
          // Pagination
          page: customPage,
          size,

          // Tri
          sort_by: customFilters.sort_by,
          order: customFilters.order,

          // Filtres
          brand: customFilters.brand,
          model: customFilters.model,
          type: customFilters.type,
          engine_type: customFilters.engine_type,

          price_min: customFilters.price_min,
          price_max: customFilters.price_max,

          year_min: customFilters.year_min,
          mileage_max: customFilters.mileage_max,
        };

        // =========================
        // NETTOYAGE DES PARAMÈTRES
        // =========================

        /*
         * Les champs laissés vides dans le formulaire
         * ne sont pas envoyés à l'API.
         */
        const cleanFilters = Object.fromEntries(
          Object.entries(rawFilters).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
          )
        );

        // =========================
        // QUERY STRING
        // =========================

        const params = new URLSearchParams(cleanFilters);

        // =========================
        // REQUÊTE API
        // =========================

        const data = await apiFetch(`/vehicles/?${params.toString()}`);

        // =========================
        // MISE À JOUR DES RÉSULTATS
        // =========================

        setVehicles(data.items || []);

        // Nombre total de résultats
        setTotal(data.total || 0);

        // Page réellement retournée par le backend
        setPage(data.page || customPage);

        /*
         * Le nombre total de pages est calculé
         * par le backend.
         */
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Erreur chargement véhicules :", err);

        toast.error(err.message || "Erreur lors du chargement des véhicules");
      }
    },
    [page, filters, size]
  );

  // =========================
  // CHARGEMENT INITIAL
  // =========================

  /*
   * Les véhicules sont chargés une seule fois
   * lors du montage du composant.
   *
   * Les modifications des filtres ne déclenchent
   * pas automatiquement une requête.
   *
   * La recherche est déclenchée par le bouton
   * "Rechercher".
   */
  useEffect(() => {
    fetchVehicles(1, filters, false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // MODIFICATION DES FILTRES
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // RÉINITIALISATION
  // =========================

  const handleResetFilters = () => {
    const resetFilters = {
      brand: "",
      model: "",

      type: "",

      engine_type: "",

      price_min: "",
      price_max: "",

      year_min: "",
      mileage_max: "",

      sort_by: "year",
      order: "desc",
    };

    /*
     * Mise à jour du formulaire.
     */
    setFilters(resetFilters);

    /*
     * Retour à la première page.
     */
    setPage(1);

    /*
     * On utilise directement resetFilters ici.
     *
     * Cela évite le problème du caractère asynchrone
     * de setFilters().
     */
    fetchVehicles(1, resetFilters);
  };

  // =========================
  // RECHERCHE
  // =========================

  const handleSearch = () => {
    /*
     * Une nouvelle recherche commence toujours
     * à la première page.
     */
    setPage(1);

    fetchVehicles(1, filters);
  };

  // =========================
  // RENDU
  // =========================

  return (
    <div className="container py-4">
      {/* =========================
          TITRE
      ========================= */}

      <h1 className="mb-4 fw-bold">🔎 Recherche de véhicules</h1>

      {/* =========================
          FILTRES
      ========================= */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          {/* =========================
              HEADER
          ========================= */}

          <div
            className="
            d-flex
            flex-column
            flex-lg-row
            justify-content-between
            align-items-lg-center
            gap-3
            mb-4
          "
          >
            <div>
              <h5 className="fw-semibold mb-1">Rechercher un véhicule</h5>

              <p className="text-muted small mb-0">
                Affinez votre recherche selon vos critères.
              </p>
            </div>

            {/* =========================
                TRI
            ========================= */}

            <div className="d-flex align-items-center gap-2">
              <label
                htmlFor="vehicle-sort"
                className="
                  text-muted
                  small
                  text-nowrap
                  mb-0
                "
              >
                Trier par
              </label>

              <select
                id="vehicle-sort"
                className="form-select form-select-sm"
                style={{
                  minWidth: "210px",
                }}
                value={`${filters.sort_by}_${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split("_");

                  setFilters((prev) => ({
                    ...prev,
                    sort_by: sortBy,
                    order: order,
                  }));
                }}
              >
                <option value="year_desc">Année : plus récente</option>

                <option value="year_asc">Année : plus ancienne</option>

                <option value="price_asc">Prix : croissant</option>

                <option value="price_desc">Prix : décroissant</option>

                <option value="mileage_asc">Kilométrage : croissant</option>

                <option value="mileage_desc">Kilométrage : décroissant</option>
              </select>
            </div>
          </div>

          {/* =========================
              FILTRES PRINCIPAUX
          ========================= */}

          <div className="row g-3">
            {/* =========================
                TYPE
            ========================= */}

            <div className="col-md-4">
              <label htmlFor="vehicle-type" className="form-label fw-medium">
                Type
              </label>

              <select
                id="vehicle-type"
                className="form-select"
                name="type"
                value={filters.type ?? ""}
                onChange={handleChange}
              >
                <option value="">Tous les types</option>

                <option value="sale">Vente</option>

                <option value="rent">Location</option>
              </select>
            </div>

            {/* =========================
                MARQUE
            ========================= */}

            <div className="col-md-4">
              <label htmlFor="vehicle-brand" className="form-label fw-medium">
                Marque
              </label>

              <input
                id="vehicle-brand"
                type="text"
                className="form-control"
                name="brand"
                placeholder="Ex. BMW"
                value={filters.brand ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* =========================
                MODÈLE
            ========================= */}

            <div className="col-md-4">
              <label htmlFor="vehicle-model" className="form-label fw-medium">
                Modèle
              </label>

              <input
                id="vehicle-model"
                type="text"
                className="form-control"
                name="model"
                placeholder="Ex. Série 3"
                value={filters.model ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* =========================
                MOTORISATION
            ========================= */}

            <div className="col-md-4">
              <label htmlFor="vehicle-engine" className="form-label fw-medium">
                Motorisation
              </label>

              <select
                id="vehicle-engine"
                className="form-select"
                name="engine_type"
                value={filters.engine_type ?? ""}
                onChange={handleChange}
              >
                <option value="">Toutes les motorisations</option>

                <option value="diesel">Diesel</option>

                <option value="petrol">Essence</option>

                <option value="electric">Électrique</option>

                <option value="hybrid">Hybride</option>
              </select>
            </div>
          </div>

          {/* =========================
              FILTRES AVANCÉS
          ========================= */}

          <div className="mt-3">
            <button
              type="button"
              className="
                btn
                btn-link
                text-decoration-none
                px-0
                fw-medium
              "
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
            >
              {showAdvancedFilters ? (
                <>
                  <i className="bi bi-chevron-up me-2" />
                  Masquer les filtres
                </>
              ) : (
                <>
                  <i className="bi bi-sliders me-2" />
                  Plus de filtres
                </>
              )}
            </button>
          </div>

          {showAdvancedFilters && (
            <div
              className="
              border-top
              pt-4
              mt-2
            "
            >
              <div className="row g-3">
                {/* =========================
                    PRIX MINIMUM
                ========================= */}

                <div className="col-md-4">
                  <label
                    htmlFor="vehicle-price-min"
                    className="form-label fw-medium"
                  >
                    Prix minimum
                  </label>

                  <div className="input-group">
                    <input
                      id="vehicle-price-min"
                      type="number"
                      min="0"
                      className="form-control"
                      name="price_min"
                      placeholder="Ex. 10 000"
                      value={filters.price_min ?? ""}
                      onChange={handleChange}
                    />

                    <span className="input-group-text">€</span>
                  </div>
                </div>

                {/* =========================
                    PRIX MAXIMUM
                ========================= */}

                <div className="col-md-4">
                  <label
                    htmlFor="vehicle-price-max"
                    className="form-label fw-medium"
                  >
                    Prix maximum
                  </label>

                  <div className="input-group">
                    <input
                      id="vehicle-price-max"
                      type="number"
                      min="0"
                      className="form-control"
                      name="price_max"
                      placeholder="Ex. 30 000"
                      value={filters.price_max ?? ""}
                      onChange={handleChange}
                    />

                    <span className="input-group-text">€</span>
                  </div>
                </div>

                {/* =========================
                    KILOMÉTRAGE
                ========================= */}

                <div className="col-md-4">
                  <label
                    htmlFor="vehicle-mileage"
                    className="form-label fw-medium"
                  >
                    Kilométrage maximum
                  </label>

                  <div className="input-group">
                    <input
                      id="vehicle-mileage"
                      type="number"
                      min="0"
                      className="form-control"
                      name="mileage_max"
                      placeholder="Ex. 100 000"
                      value={filters.mileage_max ?? ""}
                      onChange={handleChange}
                    />

                    <span className="input-group-text">km</span>
                  </div>
                </div>

                {/* =========================
                    ANNÉE MINIMUM
                ========================= */}

                <div className="col-md-4">
                  <label
                    htmlFor="vehicle-year"
                    className="form-label fw-medium"
                  >
                    Année minimum
                  </label>

                  <input
                    id="vehicle-year"
                    type="number"
                    min="1900"
                    className="form-control"
                    name="year_min"
                    placeholder="Ex. 2020"
                    value={filters.year_min ?? ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================
            ACTIONS
        ========================= */}

        <div
          className="
          card-footer
          bg-transparent
          border-0
          px-4
          pb-4
        "
        >
          <div
            className="
            d-flex
            flex-column
            flex-sm-row
            justify-content-end
            gap-2
          "
          >
            {/* =========================
                RÉINITIALISER
            ========================= */}

            <button
              type="button"
              className="
                btn
                btn-outline-secondary
                px-4
              "
              onClick={handleResetFilters}
            >
              <i
                className="
                bi
                bi-arrow-counterclockwise
                me-2
              "
              />
              Réinitialiser
            </button>

            {/* =========================
                RECHERCHER
            ========================= */}

            <button
              type="button"
              className="
                btn
                btn-primary
                px-4
              "
              onClick={handleSearch}
            >
              <i
                className="
                bi
                bi-search
                me-2
              "
              />
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          NOMBRE DE RÉSULTATS
      ========================= */}

      <div className="mb-3 text-muted">
        <strong>{total}</strong> {total <= 1 ? "véhicule" : "véhicules"}
      </div>

      {/* =========================
          LISTE DES VÉHICULES
      ========================= */}

      <div className="row g-3">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              v={vehicle}
              fetchVehicles={fetchVehicles}
            />
          ))
        ) : (
          <div
            className="
            text-center
            text-muted
            mt-4
            col-12
          "
          >
            Aucun véhicule trouvé
          </div>
        )}
      </div>

      {/* =========================
          PAGINATION
      ========================= */}

      <NumberedPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => fetchVehicles(newPage, filters)}
      />
    </div>
  );
}
