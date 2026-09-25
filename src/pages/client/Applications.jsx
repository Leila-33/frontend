import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import NumberedPagination from "../../components/common/NumberedPagination";
import { APPLICATION_ACTION_MODAL_CONFIG, APPLICATION_STATUSES } from "../../constants/applicationOptions";
import { VEHICLE_TYPES } from "../../constants/vehicleOptions";
import { formatDate } from "../../utils/dateUtils";
import { useDebounce } from "../../hooks/useDebounce";

export default function Applications() {

  // Détermine si l'utilisateur consulte les dossiers actifs ou annulés.
  const [viewMode, setViewMode] = useState("active");

  // État de la fenêtre de confirmation.
  // type permet de savoir quelle action doit être exécutée :
  // "delete" pour une suppression ou "cancel" pour une annulation.
  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null
  });

  // Liste des dossiers récupérés depuis l'API.
  const [applications, setApplications] = useState([]);

  // Informations nécessaires à la pagination.
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  });

  // Filtres appliqués à la recherche des dossiers.
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: ""
  });

  // Fermeture de la modale
  const closeModal = () => {
  setModal({
    open: false,
    type: null,
    id: null,
  });
};
  // ==========================================================
// CONFIGURATION DE LA MODALE
// ==========================================================

// Récupère le titre et la description correspondant
// à l'action sélectionnée.
const modalConfig =
  APPLICATION_ACTION_MODAL_CONFIG[modal.type];

// ==========================================================
// RECHERCHE AVEC DEBOUNCE
// ==========================================================

// Valeur de recherche mise à jour après une courte pause
// afin d'éviter une requête à chaque frappe.
const debouncedSearch = useDebounce(
  filters.search,
  400
);

  // Critère de tri utilisé lors de la récupération des dossiers.
const [sort, setSort] = useState("created_at_desc");

  // ---------------- ACTIONS DE CONFIRMATION ----------------

  // Exécute l'action demandée après confirmation dans la modal.
  const handleConfirm = async () => {

    try {

      // =========================
      // SUPPRESSION
      // =========================
      if (modal.type === "delete") {

        // Suppression du dossier via l'API.
        await apiFetch(
          `/applications/${modal.id}`,
          {
            method: "DELETE"
          }
        );

        toast.success("Dossier supprimé");
      }

      // =========================
      // ANNULATION
      // =========================
      else if (modal.type === "cancel") {

        // Passage du dossier à l'état "annulé".
        await apiFetch(
          `/applications/${modal.id}/cancel`,
          {
            method: "PATCH"
          }
        );

        toast.success("Dossier annulé");
      }

      // Fermeture et réinitialisation de la modal.
      setModal({
        open: false,
        type: null,
        id: null
      });

      // Recharge la liste afin d'afficher les données à jour.
      await fetchApplications();

    } catch (err) {

      console.error(err);

      // Affiche un message différent selon l'action effectuée.
      toast.error(
        modal.type === "delete"
          ? "Erreur lors de la suppression"
          : "Erreur lors de l'annulation"
      );
    }
  };


  // ---------------- RÉCUPÉRATION DES DOSSIERS ----------------

  // useCallback permet de conserver la même fonction tant que
  // les filtres utilisés par celle-ci ne changent pas.
  const fetchApplications = useCallback(
    async (page = 1) => {

      try {

        // Construction des paramètres de requête.
        const params = new URLSearchParams();

        // Pagination.
        params.append("page", page);
        params.append("limit", 10);

        // Mode d'affichage : actifs ou annulés.
        params.append("view_mode", viewMode);

        // Le filtre de statut est uniquement disponible
        // pour les dossiers actifs.
        if (
          filters.status &&
          filters.status !== "all" &&
          viewMode === "active"
        ) {
          params.append("status", filters.status);
        }

        // Filtre sur le type de dossier :
        // vente ou location.
        if (
          filters.type &&
          filters.type !== "all"
        ) {
          params.append("application_type", filters.type);
        }

        // Recherche textuelle.
        // trim() permet de supprimer les espaces inutiles.
if (debouncedSearch?.trim()) {

  params.append(
    "search",
    debouncedSearch.trim()
  );
}

        // Critère de tri.
        if (sort) {
          params.append("sort", sort);
        }

        // Appel de l'API avec tous les paramètres construits.
        const data = await apiFetch(
          `/applications/me?${params.toString()}`,
        );

        // Mise à jour de la liste des dossiers.
        setApplications(data.items || []);

        // Mise à jour des informations de pagination.
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          total_pages: data.total_pages
        });

        return data;

      } catch (err) {

        console.error(err);

        // Message affiché si la récupération échoue.
        toast.error(
          "Erreur lors du chargement des dossiers"
        );

        return null;
      }
    },

    // La fonction est recréée lorsque ces valeurs changent.
[
  filters.status,
  filters.type,
  debouncedSearch,
  sort,
  viewMode,
]  );


  // ---------------- ACTUALISATION AUTOMATIQUE ----------------
useEffect(() => {
  setPagination((current) => ({
    ...current,
    page: 1,
  }));

  fetchApplications(1);
}, [
  filters.status,
  filters.type,
  debouncedSearch,
  sort,
  viewMode,
  fetchApplications,
]);


  // ---------------- INTERFACE ----------------

  return (
    <div className="container py-4">

      {/* =========================
          EN-TÊTE
          ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Gestion des dossiers
          </h2>

          <p className="text-muted mb-0">
            Suivi de vos demandes de financement
          </p>

        </div>

        {/* Nombre total de dossiers correspondant aux filtres. */}
        <div className="badge bg-light text-dark border px-3 py-2">
          {pagination.total} dossier(s)
        </div>

      </div>


      {/* =========================
          MODE D'AFFICHAGE
          ========================= */}

      <div className="d-flex gap-2 mb-3">

        {/* Affichage des dossiers actifs. */}
        <button
          className={`btn btn-sm ${viewMode === "active"
              ? "btn-primary"
              : "btn-outline-primary"
            }`}
          onClick={() => setViewMode("active")}
        >
          Actifs
        </button>

        {/* Affichage des dossiers annulés. */}
        <button
          className={`btn btn-sm ${viewMode === "cancelled"
              ? "btn-warning"
              : "btn-outline-warning"
            }`}
          onClick={() => setViewMode("cancelled")}
        >
          Annulés
        </button>

      </div>


      {/* =========================
          FILTRES
          ========================= */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">

            {/* =====================================================
          RECHERCHE
          ===================================================== */}

            <div className="col-lg-4 col-md-6">
              <label
                htmlFor="application-search"
                className="visually-hidden"
              >
                Rechercher un dossier
              </label>

              <input
                id="application-search"
                type="search"
                className="form-control form-control-lg"
                placeholder="Rechercher (véhicule...)"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
              />
            </div>

            {/* =====================================================
          FILTRE STATUT
          ===================================================== */}

            {viewMode === "active" && (
              <div className="col-lg-3 col-md-6">
                <label
                  htmlFor="application-status"
                  className="visually-hidden"
                >
                  Filtrer par statut
                </label>

                <select
                  id="application-status"
                  className="form-select form-select-lg"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="all">
                    Tous statuts
                  </option>

                  {Object.entries(APPLICATION_STATUSES)
                    .filter(
                      ([status]) =>
                        status !== "archived" &&
                        status !== "cancelled"
                    )
                    .map(([status, config]) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {config.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* =====================================================
          FILTRE TYPE
          ===================================================== */}

            <div className="col-lg-3 col-md-6">
              <label
                htmlFor="application-type"
                className="visually-hidden"
              >
                Filtrer par type
              </label>

              <select
                id="application-type"
                className="form-select form-select-lg"
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <option value="all">
                  Tous types
                </option>

                {Object.entries(VEHICLE_TYPES).map(
                  ([type, config]) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {config.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =====================================================
          TRI
          ===================================================== */}

            <div className="col-lg-2 col-md-6">
              <label
                htmlFor="application-sort"
                className="visually-hidden"
              >
                Trier les dossiers
              </label>

              <select
                id="application-sort"
                className="form-select form-select-lg"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
              >
                <option value="created_at_desc">
                  Date ↓
                </option>

                <option value="created_at_asc">
                  Date ↑
                </option>

                <option value="status">
                  Statut
                </option>
              </select>
            </div>

          </div>
        </div>
      </div>


      {/* =========================
          TABLEAU DES DOSSIERS
          ========================= */}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

        <div className="table-responsive">

          <table className="table align-middle mb-0">

            <thead className="table-light">

              <tr>
                <th>Dossier</th>
                <th>Création</th>
                <th>Soumission</th>
                <th>Type</th>
                <th>Véhicule</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {/* Message affiché lorsqu'aucun dossier
                  ne correspond aux critères. */}
              {applications.length === 0 && (

                <tr>

                  <td
                    colSpan={8}
                    className="text-center py-5 text-muted"
                  >
                    Aucun dossier trouvé
                  </td>

                </tr>
              )}


              {/* Parcours des dossiers récupérés. */}
              {applications.map((d) => (

                <tr key={d.id}>

                  {/* -------- IDENTIFIANT -------- */}

                  <td className="fw-semibold">
                    #{d.id.slice(0, 8)}
                  </td>


                  {/* -------- DATE DE CRÉATION -------- */}

                  <td>
                    {formatDate(d.created_at)
                      }
                  </td>


                  {/* -------- DATE DE SOUMISSION -------- */}

                  <td>
                    {formatDate(d.submitted_at)}
                  </td>


                  {/* -------- TYPE -------- */}

                  <td>

                    <span
                      className={`badge bg-${VEHICLE_TYPES[d.type]?.color
                        }`}
                    >
                      {VEHICLE_TYPES[d.type]?.label}
                    </span>

                  </td>


                  {/* -------- VÉHICULE -------- */}

                  <td>
                    {d.vehicle}
                  </td>


                  {/* -------- STATUT -------- */}

                  <td>

                    <span
                      className={`badge bg-${APPLICATION_STATUSES[d.status]?.color
                        }`}
                    >
                      {APPLICATION_STATUSES[d.status]?.label}
                    </span>

                  </td>


                  {/* -------- ACTIONS -------- */}

                  <td className="text-start">

                    <div className="d-flex gap-2 justify-content-start">

                      {/* Consulter le détail du dossier. */}
                     <Link
  to={`/applications/${d.id}`}
  className="btn btn-light btn-sm rounded-circle shadow-sm"
  title="Voir le dossier"
  aria-label="Voir le dossier"
>
  <i
    className="bi bi-search"
    aria-hidden="true"
  />
</Link>


                      {/* Supprimer uniquement un dossier
                          qui est encore en brouillon. */}
                      {d.status === "draft" && (

                        <button
                          className="btn btn-danger btn-sm rounded-circle shadow-sm"

                          onClick={() =>
                            setModal({
                              open: true,
                              type: "delete",
                              id: d.id
                            })
                          }

                          title="Supprimer le dossier"
                        >
                          <i className="bi bi-trash" />
                        </button>

                      )}


                      {/* Affiche l'action d'annulation lorsque
                          le backend indique que le dossier peut être annulé. */}
                      {d.can_cancel && (

                        <button
                          className="btn btn-warning btn-sm rounded-circle shadow-sm"

                          onClick={() =>
                            setModal({
                              open: true,
                              type: "cancel",
                              id: d.id
                            })
                          }

                          title="Annuler le dossier"
                        >
                          <i className="bi bi-x-circle" />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          PAGINATION
          ========================= */}

      <NumberedPagination
        page={pagination.page}
        totalPages={pagination.total_pages}
        onPageChange={fetchApplications}
      />


      {/* =========================
          MODALE DE CONFIRMATION
          ========================= */}

  <ConfirmActionModal
  open={modal.open}
  type={modal.type}
  title={modalConfig?.title}
  description={modalConfig?.description}
  onCancel={closeModal}
  onConfirm={handleConfirm}
/>

    </div>
  );
}
