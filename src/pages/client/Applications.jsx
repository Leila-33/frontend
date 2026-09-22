import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import { STATUS, VEHICLE_TYPE } from "../../utils/status";
import NumberedPagination from "../../components/common/NumberedPagination";

export default function AdminDossiers() {

  // Permet de naviguer vers la page de détail d'un dossier.
  const navigate = useNavigate();

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

  // Critère de tri utilisé lors de la récupération des dossiers.
  const [sort, setSort] = useState("createdAt_desc");


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
        if (filters.search?.trim()) {
          params.append(
            "search",
            filters.search.trim()
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
    [filters, sort, viewMode]
  );


  // ---------------- ACTUALISATION AUTOMATIQUE ----------------

  useEffect(() => {

    // Petit délai avant de lancer la recherche.
    // Cela évite d'effectuer une requête à chaque frappe
    // dans le champ de recherche.
    const timeout = setTimeout(() => {

      // Lorsqu'un filtre change, on revient à la première page.
      fetchApplications(1);

    }, 500);

    // Annule le précédent timer si l'utilisateur modifie
    // de nouveau les filtres avant les 500 ms.
    return () => clearTimeout(timeout);

  }, [filters, sort, viewMode, fetchApplications]);


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
          className={`btn btn-sm ${
            viewMode === "active"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setViewMode("active")}
        >
          Actifs
        </button>

        {/* Affichage des dossiers annulés. */}
        <button
          className={`btn btn-sm ${
            viewMode === "cancelled"
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

            {/* -------- RECHERCHE -------- */}

            <div className="col-lg-4 col-md-6">

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Rechercher (Véhicule...)"
                value={filters.search}

                // Met à jour la recherche à chaque saisie.
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })
                }
              />

            </div>


            {/* -------- FILTRE STATUT -------- */}

            {/* Le filtre de statut n'est affiché que
                pour les dossiers actifs. */}
            {viewMode === "active" && (

              <div className="col-lg-3 col-md-6">

                <select
                  className="form-select form-select-lg"
                  value={filters.status}

                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value
                    })
                  }
                >

                  <option value="all">
                    Tous statuts
                  </option>

                  <option value="draft">
                    Brouillon
                  </option>

                  <option value="submitted">
                    Soumis
                  </option>

                  <option value="processing">
                    En cours
                  </option>

                  <option value="approved">
                    Validé
                  </option>

                  <option value="paid">
                    Payé
                  </option>

                  <option value="completed">
                    Terminé
                  </option>

                  <option value="rejected">
                    Refusé
                  </option>

                </select>

              </div>
            )}


            {/* -------- FILTRE TYPE -------- */}

            <div className="col-lg-3 col-md-6">

              <select
                className="form-select form-select-lg"
                value={filters.type}

                onChange={(e) =>
                  setFilters({
                    ...filters,
                    type: e.target.value
                  })
                }
              >

                <option value="all">
                  Tous types
                </option>

                <option value="sale">
                  Vente
                </option>

                <option value="rent">
                  Location
                </option>

              </select>

            </div>


            {/* -------- TRI -------- */}

            <div className="col-lg-2 col-md-6">

              <select
                className="form-select form-select-lg"
                value={sort}

                onChange={(e) =>
                  setSort(e.target.value)
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
                    {d.created_at
                      ? new Date(
                          d.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>


                  {/* -------- DATE DE SOUMISSION -------- */}

                  <td>
                    {d.submitted_at
                      ? new Date(
                          d.submitted_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>


                  {/* -------- TYPE -------- */}

                  <td>

                    <span
                      className={`badge bg-${
                        VEHICLE_TYPE[d.type]?.color
                      }`}
                    >
                      {VEHICLE_TYPE[d.type]?.label}
                    </span>

                  </td>


                  {/* -------- VÉHICULE -------- */}

                  <td>
                    {d.vehicle}
                  </td>


                  {/* -------- STATUT -------- */}

                  <td>

                    <span
                      className={`badge bg-${
                        STATUS[d.status]?.color
                      }`}
                    >
                      {STATUS[d.status]?.label}
                    </span>

                  </td>


                  {/* -------- ACTIONS -------- */}

                  <td className="text-start">

                    <div className="d-flex gap-2 justify-content-start">

                      {/* Consulter le détail du dossier. */}
                      <button
                        className="btn btn-light btn-sm rounded-circle shadow-sm"

                        onClick={() =>
                          navigate(
                            `/applications/${d.id}`
                          )
                        }

                        title="Voir le dossier"
                      >
                        <i className="bi bi-search" />
                      </button>


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

        // Affiche ou masque la modal.
        open={modal.open}

        // Indique à la modal quelle action est concernée.
        type={modal.type}

        // Le titre dépend de l'action sélectionnée.
        title={
          modal.type === "delete"
            ? "Supprimer le dossier"
            : "Annuler le dossier"
        }

        // Le message d'avertissement dépend également
        // de l'action sélectionnée.
        description={
          modal.type === "delete"
            ? "Cette action est irréversible."
            : "Le dossier sera marqué comme annulé."
        }

        // Ferme la modal sans effectuer d'action.
        onCancel={() =>
          setModal({
            open: false,
            type: null,
            id: null
          })
        }

        // Exécute l'action après confirmation.
        onConfirm={handleConfirm}
      />

    </div>
  );
}
