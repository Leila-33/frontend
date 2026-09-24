import {
  EVENT_CATEGORIES,
} from "../../constants/eventOptions";

/**
 * Filtres utilisés pour la recherche dans l'historique
 * des événements administratifs.
 *
 * La modification d'un filtre réinitialise automatiquement
 * la pagination à la première page.
 */
export default function EventFilters({
  filters,
  setFilters,
  onRefresh,
}) {
  // =====================================================
  // GESTION DES FILTRES
  // =====================================================

  /**
   * Met à jour un filtre et revient à la première page.
   */
  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
      page: 1,
    }));
  };

  // =====================================================
  // RENDU
  // =====================================================

  return (
    <section
      className="card p-3 mb-4 shadow-sm border-0 rounded-4"
      aria-label="Filtres des événements"
    >
      <div className="row g-3 align-items-end">

        {/* =================================================
            RECHERCHE
        ================================================= */}

        <div className="col-12 col-lg-5">
          <label
            htmlFor="event-search"
            className="form-label fw-semibold"
          >
            Recherche
          </label>

          <input
            id="event-search"
            type="search"
            className="form-control"
            placeholder="Rechercher un événement..."
            value={filters.search}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value
              )
            }
          />
        </div>

        {/* =================================================
            CATÉGORIE
        ================================================= */}

        <div className="col-12 col-lg-3">
          <label
            htmlFor="event-type"
            className="form-label fw-semibold"
          >
            Catégorie
          </label>

          <select
            id="event-type"
            className="form-select"
            value={filters.type}
            onChange={(event) =>
              updateFilter(
                "category",
                event.target.value
              )
            }
          >
            <option value="all">
              Tous les événements
            </option>

            {Object.entries(EVENT_CATEGORIES).map(
              ([value, category]) => (
                <option
                  key={value}
                  value={value}
                >
                  {category.label}
                </option>
              )
            )}
          </select>
        </div>

        {/* =================================================
            DATE
        ================================================= */}

        <div className="col-12 col-lg-2">
          <label
            htmlFor="event-date"
            className="form-label fw-semibold"
          >
            Date
          </label>

          <input
            id="event-date"
            type="date"
            className="form-control"
            value={filters.date}
            onChange={(event) =>
              updateFilter(
                "date",
                event.target.value
              )
            }
          />
        </div>

        {/* =================================================
            ACTUALISATION
        ================================================= */}

        <div className="col-12 col-lg-2">
          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={onRefresh}
            title="Actualiser les événements"
            aria-label="Actualiser les événements"
          >
            <i
              className="bi bi-arrow-repeat me-2"
              aria-hidden="true"
            />
            Actualiser
          </button>
        </div>

      </div>
    </section>
  );
}