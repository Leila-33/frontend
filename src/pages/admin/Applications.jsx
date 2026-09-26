import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import ApplicationActions from "../../components/applications/ApplicationActions";
import Pagination from "../../components/common/Pagination";
import {
  APPLICATION_ACTION_MODAL_CONFIG,
  APPLICATION_STATUSES,
} from "../../constants/applicationOptions";
import { VEHICLE_TYPES } from "../../constants/vehicleOptions";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/dateUtils";

export default function AdminApplications() {
  // ---------------- MODALE DE CONFIRMATION ----------------

  // Contient les informations nécessaires à la modale :
  // - open : indique si la modale est affichée
  // - type : indique l'action à effectuer
  // - id : identifiant du dossier concerné
  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null,
  });

  // Mode d'affichage des dossiers :
  // active = dossiers actifs
  // cancelled = dossiers annulés
  // archived = dossiers archivés
  const [viewMode, setViewMode] = useState("active");

  // Liste des dossiers récupérés depuis l'API.
  const [applications, setApplications] = useState([]);

  // Informations utilisées pour gérer la pagination.
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  // Filtres appliqués à la liste des dossiers.
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });

  // ==========================================================
  // RECHERCHE AVEC DEBOUNCE
  // ==========================================================

  // Valeur de recherche mise à jour après une courte pause
  // afin d'éviter une requête à chaque frappe.
  const debouncedSearch = useDebounce(filters.search, 400);

  // Critère de tri utilisé pour la récupération des dossiers.
  const [sort, setSort] = useState("created_at_desc");

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
  const modalConfig = APPLICATION_ACTION_MODAL_CONFIG[modal.type];

  // ---------------- CONFIRMATION D'UNE ACTION ----------------

  const handleConfirm = async () => {
    try {
      // Chaque type d'action est associé à l'appel API correspondant.
      // Cela permet de centraliser les différentes actions
      // dans une seule fonction de confirmation.
      const actions = {
        process: () =>
          apiFetch(`/admin/applications/${modal.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "processing" }),
          }),
        // Suppression définitive du dossier.
        delete: () =>
          apiFetch(`/admin/applications/${modal.id}`, {
            method: "DELETE",
          }),

        // Archive le dossier sans le supprimer de la base.
        archive: () =>
          apiFetch(`/admin/applications/${modal.id}/archive`, {
            method: "PATCH",
          }),

        // Restaure un dossier précédemment archivé.
        restore: () =>
          apiFetch(`/admin/applications/${modal.id}/unarchive`, {
            method: "PATCH",
          }),

        // Restaure un dossier qui avait été annulé.
        restore_cancelled: () =>
          apiFetch(`/admin/applications/${modal.id}/restore-cancelled`, {
            method: "PATCH",
          }),

        // Annule un dossier.
        cancel: () =>
          apiFetch(`/applications/${modal.id}/cancel`, {
            method: "PATCH",
          }),
      };

      // Exécute l'action correspondant au type sélectionné.
      const action = actions[modal.type];

      if (!action) {
        throw new Error("Action administrative inconnue.");
      }

      await action();

      toast.success("Action effectuée");

      // Ferme et réinitialise la modale.
      setModal({
        open: false,
        type: null,
        id: null,
      });

      // Recharge la liste afin d'afficher les données mises à jour.
      await fetchApplications();
    } catch (err) {
      console.error(err);

      // Affiche le message retourné par l'API lorsqu'il existe.
      toast.error(err.message || "Erreur lors de l'action");
    }
  };

  // ---------------- RÉCUPÉRATION DES DOSSIERS ----------------

  // Récupère les dossiers depuis l'API avec les filtres,
  // le mode d'affichage, le tri et la pagination.
  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        // URLSearchParams permet de construire proprement
        // la chaîne de paramètres de la requête HTTP.
        const params = new URLSearchParams();

        // Paramètres de pagination.
        params.append("page", page);
        params.append("limit", 10);

        // Indique au backend quels dossiers doivent être retournés :
        // actifs, annulés ou archivés.
        params.append("view_mode", viewMode);

        // Ajoute le filtre de statut lorsqu'un statut précis
        // a été sélectionné.
        if (filters.status && filters.status !== "all") {
          params.append("status", filters.status);
        }

        // Ajoute le filtre sur le type de dossier :
        // vente ou location.
        if (filters.type && filters.type !== "all") {
          params.append("application_type", filters.type);
        }

        // Ajoute la recherche uniquement si elle contient
        // un texte après suppression des espaces inutiles.
        if (debouncedSearch?.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        // Ajoute le critère de tri.
        if (sort) {
          params.append("sort", sort);
        }

        // Appel de l'endpoint réservé à l'administration.
        const data = await apiFetch(`/admin/applications?${params.toString()}`);

        // Met à jour la liste affichée dans le tableau.
        setApplications(data.items || []);

        // Met à jour les informations de pagination
        // retournées par le backend.
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          total_pages: data.total_pages,
        });

        return data;
      } catch (err) {
        console.error(err);

        // Informe l'utilisateur en cas d'échec de la requête.
        toast.error("Erreur lors du chargement des dossiers");

        return null;
      }
    },

    // La fonction dépend de ces valeurs :
    // lorsqu'une valeur change, useCallback recrée la fonction.
    [filters.status, filters.type, debouncedSearch, sort, viewMode]
  );

  // ---------------- ACTUALISATION DES DONNÉES ----------------

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
          <h2 className="fw-bold mb-1">Gestion des dossiers</h2>

          <p className="text-muted mb-0">Administration des demandes clients</p>
        </div>

        {/* Affiche le nombre total de dossiers
            correspondant aux critères actuels. */}
        <div className="badge bg-light text-dark border px-3 py-2">
          {pagination.total} dossier(s)
        </div>
      </div>

      {/* =========================
          MODES D'AFFICHAGE
          ========================= */}

      <div className="d-flex gap-2 mb-3">
        {/* Affichage des dossiers actifs. */}
        <button
          className={`btn btn-sm ${
            viewMode === "active" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setViewMode("active")}
        >
          Actifs
        </button>

        {/* Affichage des dossiers annulés. */}
        <button
          className={`btn btn-sm ${
            viewMode === "cancelled" ? "btn-danger" : "btn-outline-danger"
          }`}
          onClick={() => setViewMode("cancelled")}
        >
          Annulés
        </button>

        {/* Affichage des dossiers archivés. */}
        <button
          className={`btn btn-sm ${
            viewMode === "archived" ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => setViewMode("archived")}
        >
          Archivés
        </button>
      </div>

      {/* =========================
          FILTRES
          ========================= */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            {/* =====================================================
          RECHERCHE
          ===================================================== */}

            <div className="col-lg-4">
              <label htmlFor="application-search" className="visually-hidden">
                Rechercher un dossier
              </label>

              <input
                id="application-search"
                type="search"
                className="form-control form-control-lg"
                placeholder="Rechercher nom, prénom..."
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

            {viewMode !== "cancelled" && (
              <div className="col-lg-3">
                <label htmlFor="application-status" className="visually-hidden">
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
                  <option value="all">Tous statuts</option>

                  {Object.entries(APPLICATION_STATUSES)
                    .filter(
                      ([status]) =>
                        status !== "cancelled" && status !== "archived"
                    )
                    .map(([status, config]) => (
                      <option key={status} value={status}>
                        {config.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* =====================================================
          FILTRE TYPE
          ===================================================== */}

            <div className="col-lg-3">
              <label htmlFor="application-type" className="visually-hidden">
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
                <option value="all">Tous types</option>

                {Object.entries(VEHICLE_TYPES).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* =====================================================
          TRI
          ===================================================== */}

            <div className="col-lg-2">
              <label htmlFor="application-sort" className="visually-hidden">
                Trier les dossiers
              </label>

              <select
                id="application-sort"
                className="form-select form-select-lg"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="created_at_desc">Date ↓</option>

                <option value="created_at_asc">Date ↑</option>

                <option value="status">Statut</option>
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
                <th>Client</th>
                <th>Type</th>
                <th>Véhicule</th>
                <th>Statut</th>
                <th>Soumission</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* Message affiché lorsqu'aucun dossier
                  ne correspond aux critères. */}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    Aucun dossier trouvé
                  </td>
                </tr>
              )}

              {/* Parcours des dossiers récupérés depuis l'API. */}
              {applications.map((d) => (
                <tr key={d.id}>
                  {/* -------- IDENTIFIANT -------- */}

                  <td className="fw-semibold">#{d.id.slice(0, 8)}</td>

                  {/* -------- CLIENT -------- */}

                  <td>{d.client}</td>

                  {/* -------- TYPE -------- */}

                  <td>
                    {/* Le libellé et la couleur sont déterminés
                        à partir de la constante VEHICLE_TYPE. */}
                    <span
                      className={`badge bg-${VEHICLE_TYPES[d.type]?.color}`}
                    >
                      {VEHICLE_TYPES[d.type]?.label}
                    </span>
                  </td>

                  {/* -------- VÉHICULE -------- */}

                  <td>{d.vehicle}</td>

                  {/* -------- STATUT -------- */}

                  <td>
                    {/* Le libellé et la couleur du statut
                        sont centralisés dans STATUS. */}
                    <span
                      className={`badge bg-${
                        APPLICATION_STATUSES[d.status]?.color
                      }`}
                    >
                      {APPLICATION_STATUSES[d.status]?.label}
                    </span>
                  </td>

                  {/* -------- DATE DE SOUMISSION -------- */}

                  <td>{formatDate(d.submitted_at)}</td>

                  {/* -------- ACTIONS -------- */}

                  <td className="text-start">
                    <div className="d-flex gap-2 justify-content-start">
                      {/* Consultation du dossier */}
                      <Link
                        to={`/admin/applications/${d.id}`}
                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                        title="Voir le dossier"
                        aria-label="Voir le dossier"
                      >
                        <i className="bi bi-search" aria-hidden="true" />
                      </Link>

                      {/* Actions métier du dossier */}
                      <ApplicationActions
                        application={d}
                        viewMode={viewMode}
                        onAction={setModal}
                      />
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

      <Pagination
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
