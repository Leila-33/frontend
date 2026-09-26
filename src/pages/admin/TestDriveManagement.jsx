import { useEffect, useState, useCallback } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import TestDriveStatusModal from "../../components/test-drives/TestDriveStatusModal";
import Pagination from "../../components/common/Pagination";

import {
  TEST_DRIVE_ADMIN_ACTIONS,
  TEST_DRIVE_ADMIN_ACTION_CONFIG,
  DEFAULT_TEST_DRIVE_STATS,
  TEST_DRIVE_STATUSES,
  TEST_DRIVE_TABS,
  TEST_DRIVE_STAT_CARD_COLORS,
} from "../../constants/testDriveOptions";

import { formatDateTime, isToday } from "../../utils/dateUtils";

import {
  getAdminTestDrives,
  updateTestDriveStatus,
} from "../../services/testDriveService";
import { useDebounce } from "../../hooks/useDebounce";
import {
  getTestDriveStatusClassName,
  getTestDriveStatusLabel,
} from "../../utils/testDriveUtils";

export default function AdminTestDrives() {
  const navigate = useNavigate();

  // =========================
  // ÉTAT DE LA PAGE
  // =========================

  // Liste des essais routiers récupérés depuis l'API
  const [testDrives, setTestDrives] = useState([]);

  // Essai routier actuellement sélectionné
  // pour effectuer une action
  const [selected, setSelected] = useState(null);

  // État du modal de changement de statut
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
  });

  // Statistiques globales retournées par le backend.
  // Elles ne sont pas limitées à la page courante.
  const [stats, setStats] = useState(DEFAULT_TEST_DRIVE_STATS);

  // =========================
  // FILTRES
  // =========================

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    date: "",
  });

  // ==========================================================
  // RECHERCHE AVEC DEBOUNCE
  // ==========================================================

  // Valeur de recherche mise à jour après une courte pause
  // afin d'éviter une requête à chaque frappe.
  const debouncedSearch = useDebounce(filters.search, 400);
  // =========================
  // TRI
  // =========================

  // Par défaut, les rendez-vous les plus proches
  // sont affichés en premier.
  const [sort, setSort] = useState({
    field: "appointment_date",
    direction: "asc",
  });

  // =========================
  // PAGINATION
  // =========================

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
  });

  // =========================
  // CHARGEMENT DES ESSAIS
  // =========================

  const fetchTestDrives = useCallback(async () => {
    try {
      // Création des paramètres de requête
      // à partir des filtres, du tri et de la pagination.
      const params = new URLSearchParams();

      // -------------------------
      // FILTRE PAR STATUT
      // -------------------------

      if (filters.status) {
        params.append("status", filters.status);
      }

      // -------------------------
      // RECHERCHE
      // -------------------------

      if (debouncedSearch?.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      // -------------------------
      // FILTRE PAR DATE
      // -------------------------

      if (filters.date) {
        params.append("date", filters.date);
      }

      // -------------------------
      // TRI
      // -------------------------

      params.append("sort_by", sort.field);

      params.append("sort_order", sort.direction);

      // -------------------------
      // PAGINATION
      // -------------------------

      params.append("page", pagination.page);

      params.append("limit", pagination.limit);

      // Appel du service centralisé
      const data = await getAdminTestDrives(params);

      // Mise à jour de la liste
      setTestDrives(data.items);

      // Récupération des statistiques globales
      setStats(data.stats || DEFAULT_TEST_DRIVE_STATS);

      // Mise à jour des informations de pagination
      setPagination((prev) => ({
        ...prev,
        page: data.page,
        limit: data.limit,
        total: data.total,
        total_pages: data.total_pages,
      }));
    } catch (err) {
      toast.error("Erreur chargement des essais routiers");
    }
  }, [
    filters.status,
    debouncedSearch,
    filters.date,
    sort.field,
    sort.direction,
    pagination.page,
    pagination.limit,
  ]);

  // Recharge les essais lorsque :
  // - un filtre change
  // - le tri change
  // - la page change
  useEffect(() => {
    fetchTestDrives();
  }, [fetchTestDrives]);

  // =========================
  // GESTION DES FILTRES
  // =========================

  const handleFilterChange = (field, value) => {
    // Mise à jour du filtre concerné
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Lorsqu'un filtre change,
    // on revient automatiquement à la première page.
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // =========================
  // RÉINITIALISATION DES FILTRES
  // =========================

  const resetFilters = () => {
    // Réinitialise tous les filtres
    setFilters({
      status: "",
      search: "",
      date: "",
    });

    // Réinitialise également le tri
    setSort({
      field: "appointment_date",
      direction: "asc",
    });

    // Retour à la première page
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Permet de savoir si au moins un filtre est actif
  const hasActiveFilters = filters.status || filters.search || filters.date;

  // =========================
  // GESTION DU TRI
  // =========================

  const handleSort = (field) => {
    setSort((prev) => ({
      field,

      // Si on clique une nouvelle fois
      // sur la même colonne, on inverse le tri.
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));

    // Retour à la première page après changement du tri
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Retourne l'icône correspondant au sens du tri
  const getSortIcon = (field) => {
    // Aucune icône si cette colonne n'est pas triée
    if (sort.field !== field) {
      return "";
    }

    // Flèche vers le haut = ordre croissant
    // Flèche vers le bas = ordre décroissant
    return sort.direction === "asc" ? " ↑" : " ↓";
  };

  // =========================
  // OUVERTURE DU MODAL D'ACTION
  // =========================

  const openActionModal = (testDrive, action) => {
    // Mémorise l'essai concerné
    setSelected(testDrive);

    // Ouvre le modal avec l'action demandée
    setActionModal({
      open: true,
      type: action,
    });
  };

  // =========================
  // FERMETURE DU MODAL
  // =========================

  const closeActionModal = () => {
    setActionModal({
      open: false,
      type: null,
    });

    setSelected(null);
  };

  // =========================
  // CHANGEMENT DE STATUT
  // =========================

  const handleAction = async () => {
    // Sécurité : aucune action si aucun essai
    // ou aucune action n'est sélectionné.
    if (!selected || !actionModal.type) {
      return;
    }

    try {
      // Envoie le nouveau statut au backend
      // via le service centralisé.
      await updateTestDriveStatus(selected.id, actionModal.type);

      // Message correspondant à l'action effectuée.
      toast.success(
        TEST_DRIVE_ADMIN_ACTION_CONFIG[actionModal.type].message ||
          "Statut mis à jour avec succès"
      );

      // Ferme le modal
      closeActionModal();

      // Recharge la liste
      // pour afficher le nouveau statut
      // et mettre à jour les statistiques.
      await fetchTestDrives();
    } catch (err) {
      // Affiche le message d'erreur retourné
      // par le backend si disponible.
      toast.error(
        err?.data?.detail || err?.message || "Erreur lors de l'action"
      );
    }
  };

  // =========================
  // RENDU DE LA PAGE
  // =========================

  return (
    <div className="container-fluid py-4">
      {/* =========================
          EN-TÊTE DE LA PAGE
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Essais routiers</h1>

          <p className="text-muted mb-0">
            Gestion des demandes d'essais routiers
          </p>
        </div>
      </div>

      {/* =========================
          CARTES STATISTIQUES
      ========================= */}

      <div className="row g-3 mb-4">
        {TEST_DRIVE_TABS.filter((tab) => tab.key !== "all").map((tab) => (
          <div key={tab.key} className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">{tab.label}</p>

                    <h2 className="mb-0 fw-bold">{stats[tab.key] ?? 0}</h2>
                  </div>

                  <i
                    className={`bi ${tab.icon} fs-2 text-${
                      TEST_DRIVE_STAT_CARD_COLORS[tab.key]
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          FILTRES
      ========================= */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* -------------------------
                RECHERCHE
            ------------------------- */}

            <div className="col-md-4">
              <label
                htmlFor="test-drive-search"
                className="form-label fw-semibold"
              >
                Recherche
              </label>

              <input
                id="test-drive-search"
                type="search"
                className="form-control"
                placeholder="Client, véhicule..."
                value={filters.search}
                onChange={(event) =>
                  handleFilterChange("search", event.target.value)
                }
                aria-label="Rechercher un essai routier"
              />
            </div>

            {/* -------------------------
                FILTRE PAR STATUT
            ------------------------- */}

            <div className="col-md-3">
              <label
                htmlFor="test-drive-status"
                className="form-label fw-semibold"
              >
                Statut
              </label>

              <select
                id="test-drive-status"
                className="form-select"
                value={filters.status}
                onChange={(event) =>
                  handleFilterChange("status", event.target.value)
                }
              >
                <option value="">Tous les statuts</option>

                {Object.entries(TEST_DRIVE_STATUSES).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* -------------------------
                FILTRE PAR DATE
            ------------------------- */}

            <div className="col-md-3">
              <label className="form-label">Date du rendez-vous</label>

              <select
                className="form-select"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              >
                <option value="">Toutes les dates</option>

                <option value="today">Aujourd'hui</option>

                <option value="week">Cette semaine</option>

                <option value="month">Ce mois</option>
              </select>
            </div>

            {/* -------------------------
                RÉINITIALISATION
            ------------------------- */}

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          TABLEAU DES ESSAIS
      ========================= */}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              {/* =========================
                  EN-TÊTE DU TABLEAU
              ========================= */}

              <thead className="table-light">
                <tr>
                  <th>Client</th>

                  <th>Véhicule</th>

                  {/* Colonne triable */}
                  <th
                    role="button"
                    onClick={() => handleSort("appointment_date")}
                  >
                    Rendez-vous
                    {getSortIcon("appointment_date")}
                  </th>

                  <th>Statut</th>

                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              {/* =========================
                  CORPS DU TABLEAU
              ========================= */}

              <tbody>
                {/* =========================
                    ÉTAT VIDE
                ========================= */}

                {testDrives.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="fs-1 mb-2">🚗</div>

                      <h5>Aucun essai routier trouvé</h5>

                      <p className="text-muted mb-0">
                        Aucun essai ne correspond aux critères sélectionnés.
                      </p>
                    </td>
                  </tr>
                )}

                {/* =========================
                    LISTE DES ESSAIS
                ========================= */}

                {testDrives.map((td) => {
                  // Vérifie si le rendez-vous
                  // a lieu aujourd'hui.
                  const today = isToday(td.appointment_date);

                  // Récupère les actions autorisées
                  // pour le statut actuel.
                  const actions = TEST_DRIVE_ADMIN_ACTIONS[td.status] || [];

                  return (
                    <tr
                      key={td.id}

                      // Mise en évidence légère
                      // des rendez-vous du jour.
                      className={today ? "table-warning" : ""}
                    >
                      {/* =========================
                          CLIENT
                      ========================= */}

                      <td>
                        <div className="fw-semibold">{td.user_name}</div>
                      </td>

                      {/* =========================
                          VÉHICULE
                      ========================= */}

                      <td>
                        <div className="fw-semibold">{td.vehicle_name}</div>
                      </td>

                      {/* =========================
                          DATE DU RENDEZ-VOUS
                      ========================= */}

                      <td>
                        <div className="fw-semibold">
                          {formatDateTime(td.appointment_date)}
                        </div>

                        {/* Badge supplémentaire
                            pour les rendez-vous du jour */}

                        {today && (
                          <span className="badge bg-warning text-dark mt-1">
                            Aujourd'hui
                          </span>
                        )}
                      </td>

                      {/* =========================
                          STATUT
                      ========================= */}

                      <td>
                        <span
                          className={getTestDriveStatusClassName(td.status)}
                        >
                          {getTestDriveStatusLabel(td.status)}
                        </span>
                      </td>

                      {/* =========================
                          ACTIONS
                      ========================= */}

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {/* -------------------------
                              VOIR LE DÉTAIL
                          ------------------------- */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(`/admin/test-drives/${td.id}`)
                            }
                          >
                            Voir
                          </button>

                          {/* =========================
                              ACTIONS ADMIN
                          ========================= */}

                          {actions.map((action) => {
                            const config =
                              TEST_DRIVE_ADMIN_ACTION_CONFIG[action];

                            // Sécurité : ignore une action
                            // dont la configuration serait absente.
                            if (!config) {
                              return null;
                            }

                            return (
                              <button
                                key={action}
                                type="button"
                                className={`btn btn-sm ${config.buttonClass}`}
                                onClick={() => openActionModal(td, action)}
                              >
                                <i className={`${config.icon} me-1`} />

                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        {pagination.total > 0 && (
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              {/* Nombre total de résultats */}

              <span className="text-muted">
                {pagination.total} essai
                {pagination.total > 1 ? "s" : ""} au total
              </span>

              {/* Boutons de pagination */}

              <Pagination
                page={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={(newPage) =>
                  setPagination((prev) => ({
                    ...prev,
                    page: newPage,
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* =========================
          MODAL DE CHANGEMENT
          DE STATUT
      ========================= */}

      <TestDriveStatusModal
        open={actionModal.open}
        type={actionModal.type}
        testDrive={selected}

        // Confirmation de l'action
        onConfirm={handleAction}

        // Fermeture du modal
        onClose={closeActionModal}
      />
    </div>
  );
}
