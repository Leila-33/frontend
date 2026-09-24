import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import EventDetailModal from "../../components/events/EventDetailModal";
import EventFilters from "../../components/events/EventFilters";
import apiFetch from "../../services/apiFetch";
import Pagination from "../../components/common/Pagination";
import {
  getEventCategoryLabel,
  getEventTypeColor,
  getEventTypeLabel,
} from "../../utils/eventUtils";

/* =========================================================
   PAGE
========================================================= */

export default function AdminEventsPage() {

  /* =======================================================
     ÉTAT DE LA RÉPONSE
  ======================================================= */

  const [response, setResponse] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 1,
  });


  /* =======================================================
     ÉVÉNEMENT SÉLECTIONNÉ
  ======================================================= */

  const [selectedEvent, setSelectedEvent] =
    useState(null);


  /* =======================================================
     FILTRES
  ======================================================= */

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    date: "",
    page: 1,
    limit: 20,
  });


  /* =======================================================
     CHARGEMENT DES ÉVÉNEMENTS
  ======================================================= */
/**
 * Récupère les événements correspondant aux filtres actifs.
 *
 * La valeur `all` signifie qu'aucun filtre de catégorie
 * n'est appliqué et ne doit donc pas être envoyée à l'API.
 */
const fetchEvents = useCallback(
  async (page) => {

    try {

      const params = new URLSearchParams({
        page: String(page),
        limit: String(filters.limit),
      });

      // =====================================================
      // RECHERCHE
      // =====================================================

      if (filters.search.trim()) {
        params.set(
          "search",
          filters.search.trim()
        );
      }

      // =====================================================
      // CATÉGORIE
      // =====================================================

      if (filters.category !== "all") {
        params.set(
          "event_category",
          filters.category
        );
      }

      // =====================================================
      // DATE
      // =====================================================

      if (filters.date) {
        params.set(
          "date",
          filters.date
        );
      }

      // =====================================================
      // REQUÊTE API
      // =====================================================

      const data = await apiFetch(
        `/admin/events?${params.toString()}`
      );

      setResponse(data);

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors du chargement des événements"
      );

    }
  },
  [
    filters.limit,
    filters.search,
    filters.category,
    filters.date,
  ]
);


  /* =======================================================
     RECHARGEMENT AUTOMATIQUE
  ======================================================= */

  useEffect(() => {

    fetchEvents(filters.page);

  }, [
    fetchEvents,
    filters.page,
  ]);


  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (

    <div className="container-fluid">

      {/* =================================================
          TITRE
      ================================================= */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          Historique des événements
        </h2>

        <p className="text-muted mb-0">
          Consultez l'ensemble des événements enregistrés
          sur la plateforme.
        </p>

      </div>


      {/* =================================================
          FILTRES
      ================================================= */}

      <EventFilters
        filters={filters}
        setFilters={setFilters}
        onRefresh={() => fetchEvents(filters.page)}
      />


      {/* =================================================
          TABLEAU
      ================================================= */}

      <div className="
        card
        shadow-sm
        border-0
        rounded-4
        overflow-hidden
      ">

        <div className="table-responsive">

          <table className="
            table
            align-middle
            mb-0
          ">

            {/* =============================================
                EN-TÊTE
            ============================================= */}

            <thead className="table-light">

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Type
                </th>

                <th>
                  Catégorie
                </th>

                <th>
                  Message
                </th>

                <th>
                  Utilisateur
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            {/* =============================================
                CORPS
            ============================================= */}

            <tbody>

              {/* -----------------------------------------
                  AUCUN ÉVÉNEMENT
              ----------------------------------------- */}

              {response.items.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      text-center
                      py-5
                      text-muted
                    "
                  >

                    <i className="
                      bi bi-clock-history
                      fs-1
                      d-block
                      mb-3
                    "/>

                    Aucun événement trouvé.

                  </td>

                </tr>

              )}


              {/* -----------------------------------------
                  ÉVÉNEMENTS
              ----------------------------------------- */}

              {response.items.map((event) => (

                <tr key={event.id}>

                  {/* DATE */}

                  <td>

                    <div className="fw-semibold">

                      {new Date(
                        event.created_at
                      ).toLocaleDateString()}

                    </div>

                    <small className="text-muted">

                      {new Date(
                        event.created_at
                      ).toLocaleTimeString()}

                    </small>

                  </td>


                  {/* TYPE */}

                  <td>

                    <span
                      className={`badge bg-${getEventTypeColor(
                        event.type
                      )}`}
                    >

                      {getEventTypeLabel(event.type)}

                    </span>

                  </td>


                  {/* CATÉGORIE */}

                  <td>

                    <span className="text-muted">

                      {getEventCategoryLabel(event.type)}

                    </span>

                  </td>


                  {/* MESSAGE */}

                  <td>

                    <span>

                      {event.message || "-"}

                    </span>

                  </td>


                  {/* UTILISATEUR */}

                  <td>

                    {event.user_id ?? "-"}

                  </td>


                  {/* ACTIONS */}

                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      title="Voir les détails"
                      aria-label="Voir les détails"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <i
                        className="bi bi-file-earmark-text"
                        aria-hidden="true"
                      />
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="
          d-flex
          justify-content-between
          align-items-center
          flex-wrap
          gap-3
          px-3
          py-3
          border-top
        ">

          <div className="text-muted">

            {response.total} événement(s)

          </div>


          {/* =========================
          PAGINATION
      ========================= */}

          <Pagination
            page={filters.page}
            totalPages={response.total_pages}
            onPageChange={(newPage) =>
              setFilters((prev) => ({
                ...prev,
                page: newPage,
              }))
            }
          />

        </div>

      </div>


      {/* =================================================
          MODALE DE DÉTAIL
      ================================================= */}

      {selectedEvent && (

        <EventDetailModal
          event={selectedEvent}
          onClose={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>

  );
}