import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../../constants/supportTicketOptions";

/**
 * Barre de recherche et de filtrage des tickets SAV.
 *
 * Responsabilités :
 * - gérer la recherche ;
 * - gérer les filtres de statut, priorité et catégorie ;
 * - gérer le tri ;
 * - réinitialiser la pagination lors d'une modification.
 *
 * La récupération des données reste gérée par la page parente.
 */
export default function TicketToolbar({
  filters,
  setFilters,
  filter,
}) {
  // =====================================================
  // MISE À JOUR D'UN FILTRE
  // =====================================================

  /**
   * Met à jour un filtre et revient à la première page.
   *
   * La forme fonctionnelle de `setFilters` garantit que
   * la modification utilise toujours l'état le plus récent.
   */
  const updateFilter = (key, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [key]: value,
      page: 1,
    }));
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="card border-0 shadow-sm p-3 mb-3">

      {/* =================================================
          RECHERCHE
      ================================================= */}

      <div className="position-relative mb-3">
        <label
          htmlFor="ticket-search"
          className="visually-hidden"
        >
          Rechercher un ticket
        </label>

        <input
          id="ticket-search"
          type="search"
          className="form-control ps-5"
          placeholder="Rechercher un ticket..."
          value={filters.search ?? ""}
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value
            )
          }
          aria-label="Rechercher un ticket"
        />

        {/* -------------------------------------------------
            ICÔNE DE RECHERCHE
        ------------------------------------------------- */}

        <i
          className="
            bi
            bi-search
            position-absolute
            top-50
            start-0
            translate-middle-y
            ms-3
            text-muted
          "
          aria-hidden="true"
        />

        {/* -------------------------------------------------
            EFFACEMENT DE LA RECHERCHE
        ------------------------------------------------- */}

        {filters.search && (
          <button
            type="button"
            className="
              btn
              btn-sm
              btn-outline-secondary
              position-absolute
              top-50
              end-0
              translate-middle-y
              me-2
            "
            onClick={() =>
              updateFilter("search", "")
            }
            aria-label="Effacer la recherche"
            title="Effacer la recherche"
          >
            <i
              className="bi bi-x-lg"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="row g-2">

        {/* =================================================
            STATUT
        ================================================= */}

        {filter !== "open" && (
          <div className="col-md">
            <label
              htmlFor="ticket-status-filter"
              className="visually-hidden"
            >
              Statut
            </label>

            <select
              id="ticket-status-filter"
              className="form-select"
              value={filters.status ?? "ALL"}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value
                )
              }
            >
              <option value="ALL">
                Tous les statuts
              </option>

              {Object.entries(
                TICKET_STATUSES
              ).map(([value, option]) => (
                <option
                  key={value}
                  value={value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* =================================================
            PRIORITÉ
        ================================================= */}

        {filter !== "urgent" && (
          <div className="col-md">
            <label
              htmlFor="ticket-priority-filter"
              className="visually-hidden"
            >
              Priorité
            </label>

            <select
              id="ticket-priority-filter"
              className="form-select"
              value={filters.priority ?? "ALL"}
              onChange={(event) =>
                updateFilter(
                  "priority",
                  event.target.value
                )
              }
            >
              <option value="ALL">
                Toutes les priorités
              </option>

              {Object.entries(
                TICKET_PRIORITIES
              ).map(([value, option]) => (
                <option
                  key={value}
                  value={value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* =================================================
            CATÉGORIE
        ================================================= */}

        <div className="col-md">
          <label
            htmlFor="ticket-category-filter"
            className="visually-hidden"
          >
            Catégorie
          </label>

          <select
            id="ticket-category-filter"
            className="form-select"
            value={filters.category ?? "ALL"}
            onChange={(event) =>
              updateFilter(
                "category",
                event.target.value
              )
            }
          >
            <option value="ALL">
              Toutes les catégories
            </option>

            {Object.entries(
              TICKET_CATEGORIES
            ).map(([value, option]) => (
              <option
                key={value}
                value={value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            TRI
        ================================================= */}

        <div className="col-md">
          <label
            htmlFor="ticket-sort-filter"
            className="visually-hidden"
          >
            Trier les tickets
          </label>

          <select
            id="ticket-sort-filter"
            className="form-select"
            value={
              filters.sort ??
              "activity_desc"
            }
            onChange={(event) =>
              updateFilter(
                "sort",
                event.target.value
              )
            }
          >
            <option value="activity_desc">
              Dernière activité
            </option>

            <option value="created_at_desc">
              Plus récents
            </option>

            <option value="priority">
              Priorité
            </option>
          </select>
        </div>

      </div>
    </div>
  );
}