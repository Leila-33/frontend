import { EVENT_CATEGORIES } from "../../constants/eventOptions";

/**
 * Filtres utilisés pour la recherche dans l'historique
 * des événements administratifs.
 *
 * Le composant ne gère pas directement l'état des filtres.
 * Les modifications sont remontées au composant parent
 * via les callbacks.
 */
export default function EventFilters({
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
  onRefresh,
}) {
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
          <label htmlFor="event-search" className="form-label fw-semibold">
            Recherche
          </label>

          <input
            id="event-search"
            type="search"
            className="form-control"
            placeholder="Rechercher un événement..."
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Rechercher un événement"
          />
        </div>

        {/* =================================================
            CATÉGORIE
        ================================================= */}

        <div className="col-12 col-lg-3">
          <label htmlFor="event-category" className="form-label fw-semibold">
            Catégorie
          </label>

          <select
            id="event-category"
            className="form-select"
            value={filters.category}
            onChange={(event) => onFilterChange("category", event.target.value)}
          >
            <option value="all">Tous les événements</option>

            {Object.entries(EVENT_CATEGORIES).map(([value, category]) => (
              <option key={value} value={value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            DATE
        ================================================= */}

        <div className="col-12 col-lg-2">
          <label htmlFor="event-date" className="form-label fw-semibold">
            Date
          </label>

          <input
            id="event-date"
            type="date"
            className="form-control"
            value={filters.date}
            onChange={(event) => onFilterChange("date", event.target.value)}
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
            <i className="bi bi-arrow-repeat me-2" aria-hidden="true" />
            Actualiser
          </button>
        </div>
      </div>
    </section>
  );
}
