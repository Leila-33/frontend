import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import { STATUS, VEHICLE_TYPE } from "../../utils/status";
import ApplicationActions from "../../components/applications/ApplicationActions";
import Pagination from "../../components/common/Pagination";

export default function AdminDossiers() {

  // Permet de naviguer vers la page de détail d'un dossier.
  const navigate = useNavigate();


  // ---------------- MODALE DE CONFIRMATION ----------------

  // Contient les informations nécessaires à la modale :
  // - open : indique si la modale est affichée
  // - type : indique l'action à effectuer
  // - id : identifiant du dossier concerné
  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null
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
    pages: 1
  });


  // Filtres appliqués à la liste des dossiers.
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: ""
  });


  // Critère de tri utilisé pour la récupération des dossiers.
  const [sort, setSort] = useState("createdAt_desc");


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
            body: JSON.stringify({ status: "processing" })
          }),
        // Suppression définitive du dossier.
        delete: () =>
          apiFetch(`/admin/applications/${modal.id}`, {
            method: "DELETE"
          }),

        // Archive le dossier sans le supprimer de la base.
        archive: () =>
          apiFetch(`/admin/applications/${modal.id}/archive`, {
            method: "PATCH"
          }),

        // Restaure un dossier précédemment archivé.
        restore: () =>
          apiFetch(`/admin/applications/${modal.id}/unarchive`, {
            method: "PATCH"
          }),

        // Restaure un dossier qui avait été annulé.
        restore_cancelled: () =>
          apiFetch(
            `/admin/applications/${modal.id}/restore-cancelled`,
            {
              method: "PATCH"
            }
          ),

        // Annule un dossier.
        cancel: () =>
          apiFetch(`/applications/${modal.id}/cancel`, {
            method: "PATCH"
          })
      };


      // Exécute l'action correspondant au type sélectionné.
      await actions[modal.type]?.();


      // Informe l'administrateur que l'action a réussi.
      toast.success("Action effectuée");


      // Ferme et réinitialise la modale.
      setModal({
        open: false,
        type: null,
        id: null
      });


      // Recharge la liste afin d'afficher les données mises à jour.
      await fetchApplications();

    } catch (err) {

      console.error(err);

      // Affiche le message retourné par l'API lorsqu'il existe.
      toast.error(
        err.message || "Erreur lors de l'action"
      );
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
        if (
          filters.status &&
          filters.status !== "all"
        ) {
          params.append(
            "status",
            filters.status
          );
        }


        // Ajoute le filtre sur le type de dossier :
        // vente ou location.
        if (
          filters.type &&
          filters.type !== "all"
        ) {
          params.append(
            "type",
            filters.type
          );
        }


        // Ajoute la recherche uniquement si elle contient
        // un texte après suppression des espaces inutiles.
        if (filters.search?.trim()) {

          params.append(
            "search",
            filters.search.trim()
          );
        }


        // Ajoute le critère de tri.
        if (sort) {
          params.append("sort", sort);
        }


        // Appel de l'endpoint réservé à l'administration.
        const data = await apiFetch(
          `/admin/applications?${params.toString()}`,
        );


        // Met à jour la liste affichée dans le tableau.
        setApplications(data.items || []);


        // Met à jour les informations de pagination
        // retournées par le backend.
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          pages: data.pages
        });


        return data;

      } catch (err) {

        console.error(err);

        // Informe l'utilisateur en cas d'échec de la requête.
        toast.error(
          "Erreur lors du chargement des dossiers"
        );

        return null;
      }
    },

    // La fonction dépend de ces valeurs :
    // lorsqu'une valeur change, useCallback recrée la fonction.
    [filters, sort, viewMode]
  );


  // ---------------- ACTUALISATION DES DONNÉES ----------------

  useEffect(() => {

    // Délai de 500 ms avant d'effectuer la recherche.
    // Cela évite d'envoyer une requête à chaque caractère
    // lorsque l'administrateur saisit une recherche.
    const timeout = setTimeout(() => {

      // Lorsqu'un filtre change, on recommence à la première page.
      fetchApplications(1);

    }, 500);


    // Annule le précédent timer si les dépendances
    // changent avant la fin des 500 ms.
    return () => clearTimeout(timeout);

  }, [
    filters,
    sort,
    viewMode,
    fetchApplications
  ]);


  // Lorsque les filtres, le tri ou le mode d'affichage changent,
  // la pagination est également réinitialisée à la première page.
  useEffect(() => {

    setPagination(prev => ({
      ...prev,
      page: 1
    }));

  }, [
    filters,
    sort,
    viewMode
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
            Administration des demandes clients
          </p>

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
            ? "btn-danger"
            : "btn-outline-danger"
            }`}
          onClick={() => setViewMode("cancelled")}
        >
          Annulés
        </button>


        {/* Affichage des dossiers archivés. */}
        <button
          className={`btn btn-sm ${viewMode === "archived"
            ? "btn-dark"
            : "btn-outline-dark"
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


            {/* -------- RECHERCHE -------- */}

            <div className="col-lg-4">

              <input
                className="form-control form-control-lg"
                placeholder="Rechercher nom, prénom..."
                value={filters.search}

                // Met à jour la recherche saisie par
                // l'administrateur.
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })
                }
              />

            </div>


            {/* -------- FILTRE STATUT -------- */}

            {/* Le filtre de statut n'est pas affiché
                dans la vue des dossiers annulés. */}
            {viewMode !== "cancelled" && (

              <div className="col-lg-3">

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

                  <option value="rejected">
                    Refusé
                  </option>

                </select>

              </div>
            )}


            {/* -------- FILTRE TYPE -------- */}

            <div className="col-lg-3">

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

            <div className="col-lg-2">

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

                  <td
                    colSpan={7}
                    className="text-center py-5 text-muted"
                  >
                    Aucun dossier trouvé
                  </td>

                </tr>
              )}


              {/* Parcours des dossiers récupérés depuis l'API. */}
              {applications.map((d) => (

                <tr key={d.id}>


                  {/* -------- IDENTIFIANT -------- */}

                  <td className="fw-semibold">
                    #{d.id.slice(0, 8)}
                  </td>


                  {/* -------- CLIENT -------- */}

                  <td>
                    {d.client}
                  </td>


                  {/* -------- TYPE -------- */}

                  <td>

                    {/* Le libellé et la couleur sont déterminés
                        à partir de la constante VEHICLE_TYPE. */}
                    <span
                      className={`badge bg-${VEHICLE_TYPE[d.type]?.color
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

                    {/* Le libellé et la couleur du statut
                        sont centralisés dans STATUS. */}
                    <span
                      className={`badge bg-${STATUS[d.status]?.color
                        }`}
                    >
                      {STATUS[d.status]?.label}
                    </span>

                  </td>


                  {/* -------- DATE DE SOUMISSION -------- */}

                  <td>

                    {d.submitted_at
                      ? new Date(
                        d.submitted_at
                      ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* -------- ACTIONS -------- */}

                  <td className="text-start">
                    <div className="d-flex gap-2 justify-content-start">

                      {/* Consultation du dossier */}
                      <button
                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                        onClick={() =>
                          navigate(`/admin/applications/${d.id}`)
                        }
                        title="Voir le dossier"
                      >
                        <i className="bi bi-search" />
                      </button>

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
  totalPages={pagination.pages}
  onPageChange={fetchApplications}
/>


      {/* =========================
          MODALE DE CONFIRMATION
          ========================= */}

      <ConfirmActionModal

        // Contrôle l'affichage de la modale.
        open={modal.open}

        // Permet à la modale de connaître l'action concernée.
        type={modal.type}


        // Le titre de la modale dépend de l'action sélectionnée.
        title={
          modal.type === "delete"
            ? "Supprimer le dossier"

            : modal.type === "archive"
              ? "Archiver le dossier"

              : modal.type === "restore_cancelled"
                ? "Restaurer le dossier annulé"

                : "Restaurer le dossier"
        }


        // Le message de confirmation est adapté
        // à l'action sélectionnée.
        description={
          modal.type === "delete"
            ? "Cette action est irréversible."

            : modal.type === "archive"
              ? "Le dossier sera masqué mais conservé."

              : modal.type === "restore_cancelled"
                ? "Le dossier annulé sera réactivé dans le workflow."

                : "Le dossier sera restauré."
        }


        // Ferme la modale sans exécuter l'action.
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
