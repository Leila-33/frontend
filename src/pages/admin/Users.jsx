import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import apiFetch from "../../services/apiFetch";


// ==========================================================
// CONFIGURATION DES RÔLES
// ==========================================================

/**
 * Retourne la couleur Bootstrap associée à un rôle.
 *
 * Cette fonction permet d'éviter de répéter
 * les classes Bootstrap directement dans le JSX.
 */
function getRoleColor(role) {

  const colors = {
    admin: "danger",
    sav_agent: "primary",
    sales_agent: "success",
    client: "secondary",
  };

  return colors[role] ?? "dark";
}


/**
 * Retourne le libellé français associé à un rôle.
 */
function getRoleLabel(role) {

  const labels = {
    admin: "Admin",
    sav_agent: "Agent SAV",
    sales_agent: "Commercial",
    client: "Client",
  };

  return labels[role] ?? role;
}


// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export default function AdminUsersPage() {

  const navigate = useNavigate();


  // ========================================================
  // RÉPONSE DE L'API
  // ========================================================
  //
  // Contient :
  // - les utilisateurs de la page courante ;
  // - la page actuelle ;
  // - le nombre total de pages ;
  // - le nombre total d'utilisateurs ;
  // - la limite d'utilisateurs par page.
  // ========================================================

  const [response, setResponse] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });


  // ========================================================
  // RECHERCHE
  // ========================================================
  //
  // searchInput contient la valeur saisie immédiatement
  // par l'utilisateur.
  //
  // La valeur est ensuite appliquée à filters.search
  // après un délai de 400 ms afin d'éviter d'envoyer
  // une requête API à chaque caractère saisi.
  // ========================================================

  const [searchInput, setSearchInput] = useState("");


  // ========================================================
  // FILTRES
  // ========================================================

  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    sort: "created_at_desc",
  });


  // ========================================================
  // ÉTAT DE L'INTERFACE
  // ========================================================

  // Identifiant de l'utilisateur dont le rôle
  // est actuellement modifié directement dans le tableau.
  const [editingRole, setEditingRole] = useState(null);

  // Liste des utilisateurs sélectionnés pour
  // les actions groupées.
  const [selectedIds, setSelectedIds] = useState([]);

  // Utilisateur actuellement sélectionné dans la modale.
  const [selectedUser, setSelectedUser] = useState(null);

  // Contrôle l'affichage de la modale utilisateur.
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Vue affichant seulement les archivés
  const isArchivedView = filters.status === "archived";

// Vider selectedIds avant le changement d'onglet
useEffect(() => {
  if (filters.status === "archived") {
    setSelectedIds([]);
  }
}, [filters.status]);

  // ========================================================
  // NETTOYAGE DES PARAMÈTRES
  // ========================================================

  /**
   * Convertit une valeur en chaîne et supprime
   * les espaces inutiles.
   *
   * Permet d'éviter d'envoyer "   " à l'API.
   */
  const clean = (value) =>
    (value ?? "")
      .toString()
      .trim();


  // ========================================================
  // RECHERCHE AVEC DEBOUNCE
  // ========================================================

  useEffect(() => {

    // Attend 400 ms après la dernière frappe
    // avant d'appliquer la recherche.
    const timer = setTimeout(() => {

      setFilters((previous) => ({
        ...previous,
        search: searchInput,
      }));

    }, 400);


    // Annule le timer précédent si l'utilisateur
    // continue à saisir du texte.
    return () => clearTimeout(timer);

  }, [searchInput]);


  // ========================================================
  // CHARGEMENT DES UTILISATEURS
  // ========================================================

const fetchUsers = useCallback(
  async (page = response.page) => {

    try {

      // ----------------------------------------------------
      // CONSTRUCTION DES PARAMÈTRES DE REQUÊTE
      // ----------------------------------------------------

      const params = new URLSearchParams({

        page: String(page),

        limit: String(
          response.limit
        ),

        search: clean(
          filters.search
        ),

        role: clean(
          filters.role
        ),

        status: clean(
          filters.status
        ),

        sort: clean(
          filters.sort
        )

      });


      // ----------------------------------------------------
      // APPEL DE L'API ADMINISTRATEUR
      // ----------------------------------------------------

      const data = await apiFetch(
        `/admin/auth?${params.toString()}`,
        {
          method: "GET"
        }
      );


      // ----------------------------------------------------
      // MISE À JOUR DE LA LISTE
      // ----------------------------------------------------

      setResponse(data);


      // Une nouvelle liste est chargée :
      // on supprime donc toute sélection précédente.
      setSelectedIds([]);

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors du chargement des utilisateurs"
      );
    }
  },
  [
    response.page,
    response.limit,
    filters.search,
    filters.role,
    filters.status,
    filters.sort
  ]
);


// ========================================================
// CHARGER LES UTILISATEURS LORSQU'UN FILTRE CHANGE
// ========================================================
//
// À chaque modification d'un filtre, on revient à la
// première page.
//
// fetchUsers est présent dans les dépendances afin de
// respecter la règle react-hooks/exhaustive-deps.
//
// ========================================================

useEffect(() => {

  fetchUsers(1);

}, [fetchUsers]);



  // ========================================================
  // MODIFIER LE RÔLE
  // ========================================================

  const updateRole = async (
    userId,
    role
  ) => {

    try {

      // Modification du rôle côté backend.
      await apiFetch(
        `/admin/auth/${userId}/role`,
        {
          method: "PATCH",

          body: {
            role,
          },
        }
      );


      // Mise à jour optimiste de la ligne
      // afin d'éviter de recharger toute la liste.
      setResponse((previous) => ({

        ...previous,

        items: previous.items.map(
          (user) =>
            user.id === userId
              ? {
                  ...user,
                  role,
                }
              : user
        ),

      }));


      // Synchronise également l'utilisateur
      // actuellement affiché dans la modale.
      if (
        selectedUser?.id === userId
      ) {

        setSelectedUser(
          (previous) => ({
            ...previous,
            role,
          })
        );

      }


      // Ferme le mode d'édition inline.
      setEditingRole(null);


      toast.success(
        "Rôle mis à jour"
      );

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors de la modification du rôle"
      );

    }

  };


  // ========================================================
  // ACTIVER / DÉSACTIVER UN UTILISATEUR
  // ========================================================

  const toggleActive = async (user) => {

    // Nouveau statut souhaité.
    const newStatus =
      !user.is_active;


    // Sauvegarde de l'ancien tableau.
    //
    // Elle permet de restaurer l'état précédent
    // si l'appel API échoue.
    const previousItems =
      response.items;


    // ------------------------------------------------------
    // MISE À JOUR OPTIMISTE
    // ------------------------------------------------------
    //
    // L'interface est immédiatement mise à jour
    // sans attendre la réponse du serveur.
    // ------------------------------------------------------

    setResponse((previous) => ({

      ...previous,

      items: previous.items.map(
        (currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                is_active: newStatus,
              }
            : currentUser
      ),

    }));


    // Synchronise également la modale
    // si elle affiche cet utilisateur.
    if (
      selectedUser?.id === user.id
    ) {

      setSelectedUser(
        (previous) => ({
          ...previous,
          is_active: newStatus,
        })
      );

    }


    try {

      // Mise à jour côté backend.
      await apiFetch(
        `/admin/auth/${user.id}/active`,
        {
          method: "PATCH",

          body: {
            is_active: newStatus,
          },
        }
      );


      toast.success(
        "Statut mis à jour"
      );

    } catch (err) {

      // L'appel API ayant échoué,
      // on restaure l'ancien état du tableau.
      setResponse((previous) => ({
        ...previous,
        items: previousItems,
      }));


      // Restaure également l'état dans la modale.
      if (
        selectedUser?.id === user.id
      ) {

        setSelectedUser(
          (previous) => ({
            ...previous,
            is_active:
              user.is_active,
          })
        );

      }


      toast.error(
        err?.message ||
        "Erreur lors de la mise à jour du statut"
      );

    }

  };


  // ========================================================
  // ARCHIVER UN UTILISATEUR
  // ========================================================

  const archiveUser = async () => {

    // Sécurité supplémentaire :
    // aucune action si aucun utilisateur n'est sélectionné.
    if (!selectedUser) {
      return;
    }


    try {

      // Archivage côté backend.
      await apiFetch(
        `/admin/auth/${selectedUser.id}/archive`,
        {
          method: "PATCH",
        }
      );


      // Retire l'utilisateur de la liste courante.
      setResponse((previous) => ({

        ...previous,

        items: previous.items.filter(
          (user) =>
            user.id !== selectedUser.id
        ),

      }));


      // Ferme la modale.
      closeModal();


      toast.success(
        "Utilisateur archivé"
      );

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors de l'archivage"
      );

    }

  };


  // ========================================================
  // ARCHIVAGE GROUPÉ
  // ========================================================

  const archiveSelected = async () => {

    // Rien à faire si aucun utilisateur
    // n'est sélectionné.
    if (
      selectedIds.length === 0
    ) {
      return;
    }


    try {

      // Archivage de plusieurs utilisateurs
      // en une seule requête.
      await apiFetch(
        "/admin/auth/archive",
        {
          method: "PATCH",

          body: {
            user_ids: selectedIds,
          },
        }
      );


      // Retire les utilisateurs archivés
      // de la liste affichée.
      setResponse((previous) => ({

        ...previous,

        items: previous.items.filter(
          (user) =>
            !selectedIds.includes(user.id)
        ),

      }));


      // Réinitialise la sélection.
      setSelectedIds([]);


      toast.success(
        "Utilisateurs archivés"
      );

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors de l'archivage"
      );

    }

  };


  // ========================================================
  // SÉLECTION D'UN UTILISATEUR
  // ========================================================

  const toggleSelected = (id) => {

    setSelectedIds((previous) =>

      previous.includes(id)

        // Si l'utilisateur est déjà sélectionné,
        // on le retire de la sélection.
        ? previous.filter(
            (selectedId) =>
              selectedId !== id
          )

        // Sinon, on l'ajoute.
        : [
            ...previous,
            id
          ]

    );

  };


  // ========================================================
  // SÉLECTIONNER / DÉSÉLECTIONNER TOUT
  // ========================================================

  const toggleSelectAll = () => {

    // Si tous les utilisateurs de la page
    // sont déjà sélectionnés, on désélectionne tout.
    if (
      selectedIds.length ===
      response.items.length
    ) {

      setSelectedIds([]);

      return;

    }


    // Sinon, sélectionne tous les utilisateurs
    // actuellement affichés sur la page.
    setSelectedIds(
      response.items.map(
        (user) => user.id
      )
    );

  };


  // ========================================================
  // OUVRIR LA MODALE UTILISATEUR
  // ========================================================

  const openUserModal = (user) => {

    setSelectedUser(user);

    setShowUserModal(true);

  };


  // ========================================================
  // FERMER LA MODALE
  // ========================================================

  const closeModal = () => {

    setSelectedUser(null);

    setShowUserModal(false);

  };


  // ========================================================
  // RENDU
  // ========================================================

  return (

    <div className="container py-4">


      {/* ==================================================
          HEADER
          ================================================== */}

      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >

        <div>

          <h2 className="fw-bold mb-1">
            Utilisateurs
          </h2>

          <p className="text-muted mb-0">
            Gestion des comptes administrateurs,
            agents et clients
          </p>

          <div className="mt-2">

            <span
              className="
                badge
                bg-light
                text-dark
                border
                px-3
                py-2
              "
            >
              {response.total} utilisateurs
            </span>

          </div>

        </div>


        {/* CRÉATION D'UN UTILISATEUR */}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate(
              "/admin/users/create"
            )
          }
        >

          <i className="bi bi-person-plus me-2" />

          Créer utilisateur

        </button>

      </div>


      {/* ==================================================
          ACTIONS GROUPÉES
          ================================================== */}

      {selectedIds.length > 0 && (

        <div
          className="
            alert
            alert-light
            border
            d-flex
            justify-content-between
            align-items-center
          "
        >

          <div>

            <strong>
              {selectedIds.length}
            </strong>{" "}
            sélectionné(s)

          </div>


          <div className="d-flex gap-2">

{!isArchivedView && selectedIds.length > 0 && (
  <button
    type="button"
    className="btn btn-danger"
    onClick={archiveSelected}
  >
    <i className="bi bi-archive me-1"></i>
    Archiver ({selectedIds.length})
  </button>
)}



            <button
              type="button"
              className="
                btn
                btn-outline-secondary
                btn-sm
              "
              onClick={() =>
                setSelectedIds([])
              }
            >
              Annuler
            </button>

          </div>

        </div>

      )}


      {/* ==================================================
          FILTRES
          ================================================== */}

      <div
        className="
          card
          p-3
          mb-4
          shadow-sm
          border-0
          rounded-4
        "
      >

        <div className="row g-3 align-items-center">


          {/* RECHERCHE */}

          <div className="col-lg-5">

            <div className="input-group">

              <span className="input-group-text bg-white">

                <i className="bi bi-search text-muted" />

              </span>

              <input
                type="search"
                className="form-control"
                placeholder="Rechercher un nom ou un email..."
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          {/* FILTRE RÔLE */}

          <div className="col-lg-2">

            <select
              className="form-select"
              value={filters.role}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  role: event.target.value,
                }))
              }
            >

              <option value="all">
                Tous rôles
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="sav_agent">
                Agent SAV
              </option>

              <option value="sales_agent">
                Commercial
              </option>

              <option value="client">
                Client
              </option>

            </select>

          </div>


          {/* FILTRE STATUT */}

          <div className="col-lg-2">

            <select
              className="form-select"
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
            >

              <option value="all">
                Tous statuts
              </option>

              <option value="active">
                Actifs
              </option>

              <option value="pending">
                En attente
              </option>

              <option value="inactive">
                Désactivés
              </option>

              <option value="archived">
                Archivés
              </option>

            </select>

          </div>


          {/* TRI */}

          <div className="col-lg-2">

            <select
              className="form-select"
              value={filters.sort}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  sort: event.target.value,
                }))
              }
            >

              <option value="created_at_desc">
                Plus récents
              </option>

              <option value="created_at_asc">
                Plus anciens
              </option>

              <option value="name_asc">
                Nom A → Z
              </option>

              <option value="name_desc">
                Nom Z → A
              </option>

            </select>

          </div>


          {/* ACTUALISER */}

          <div className="col-lg-1">

            <button
              type="button"
              className="
                btn
                btn-outline-primary
                w-100
              "
              title="Actualiser"
              onClick={() =>
                fetchUsers(
                  response.page
                )
              }
            >

              <i className="bi bi-arrow-repeat" />

            </button>

          </div>

        </div>

      </div>


      {/* ==================================================
          TABLEAU
          ================================================== */}

      <div
        className="
          card
          shadow-sm
          border-0
          rounded-4
          overflow-hidden
        "
      >

        <div className="table-responsive">

          <table
            className="
              table
              align-middle
              mb-0
            "
          >

            <thead className="table-light">

              <tr>

                {/* SÉLECTION GLOBALE */}

                <th>

{!isArchivedView && (
  <input
    type="checkbox"
    checked={
      response.items.length > 0 &&
      selectedIds.length === response.items.length
    }
    onChange={toggleSelectAll}
  />
)}


                </th>


                <th>
                  Nom
                </th>

                <th>
                  Email
                </th>

                <th>
                  Rôle
                </th>

                <th>
                  Statut
                </th>

                <th>
                  Créé le
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>


              {/* ÉTAT VIDE */}

              {response.items.length === 0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      text-center
                      py-5
                      text-muted
                    "
                  >

                    <i
                      className="
                        bi
                        bi-people
                        fs-2
                        d-block
                        mb-2
                      "
                    />

                    Aucun utilisateur trouvé

                  </td>

                </tr>

              )}


              {/* UTILISATEURS */}

              {response.items.map((user) => (

                <tr key={user.id}>


                  {/* SÉLECTION */}

                  <td>

{!isArchivedView && (
  <input
    type="checkbox"
    checked={selectedIds.includes(user.id)}
    onChange={() => toggleSelected(user.id)}
  />
)}

                  </td>


                  {/* NOM */}

                  <td className="fw-semibold">

                    {user.first_name}{" "}
                    {user.last_name}

                  </td>


                  {/* EMAIL */}

                  <td className="text-muted">

                    {user.email}

                  </td>


                  {/* RÔLE */}

                  <td>

                    {editingRole ===
                    user.id ? (

                      <select
                        className="
                          form-select
                          form-select-sm
                        "
                        value={user.role}
                        onChange={(event) =>
                          updateRole(
                            user.id,
                            event.target.value
                          )
                        }
                        onBlur={() =>
                          setEditingRole(null)
                        }
                        autoFocus
                      >

                        <option value="admin">
                          Admin
                        </option>

                        <option value="sav_agent">
                          Agent SAV
                        </option>

                        <option value="sales_agent">
                          Commercial
                        </option>

                        <option value="client">
                          Client
                        </option>

                      </select>

                    ) : (

                      <span
                        className={`
                          badge
                          bg-${getRoleColor(
                            user.role
                          )}
                        `}
                        role="button"
                        title="Modifier le rôle"
                        onClick={() =>
                          setEditingRole(
                            user.id
                          )
                        }
                      >

                        {getRoleLabel(
                          user.role
                        )}

                      </span>

                    )}

                  </td>


                  {/* STATUT */}

                  <td>

                    {user.is_deleted ? (

                      <span className="badge bg-dark">
                        Archivé
                      </span>

                    ) : !user.is_verified ? (

                      <span
                        className="
                          badge
                          bg-warning
                          text-dark
                        "
                      >
                        En attente
                      </span>

                    ) : user.is_active ? (

                      <span className="badge bg-success">
                        Actif
                      </span>

                    ) : (

                      <span className="badge bg-secondary">
                        Désactivé
                      </span>

                    )}

                  </td>


                  {/* DATE DE CRÉATION */}

                  <td className="text-muted">

                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}

                  </td>


                  {/* ACTIONS */}

                  <td>

                    <button
                      type="button"
                      className="
                        btn
                        btn-outline-secondary
                        btn-sm
                      "
                      title="Gérer l'utilisateur"
                      onClick={() =>
                        openUserModal(user)
                      }
                    >

                      <i className="bi bi-gear" />

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

<div className="d-flex justify-content-between align-items-center mt-4">

  {/* =========================
      NOMBRE TOTAL D'INSCRITS
  ========================= */}

  <span className="text-muted">
    <strong>{response.total}</strong>{" "}
  {response.total <= 1 ? "inscrit" : "inscrits"}
  </span>


  {/* =========================
      PAGINATION
  ========================= */}

  <Pagination
    page={response.page}
    totalPages={response.pages}
    onPageChange={fetchUsers}
  />

</div>


      {/* ==================================================
          MODALE UTILISATEUR
          ================================================== */}

      {showUserModal &&
        selectedUser && (

        <>

          {/* CONTENU DE LA MODALE */}

          <div
            className="
              modal
              fade
              show
              d-block
            "
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >

            <div
              className="
                modal-dialog
                modal-dialog-centered
              "
            >

              <div
                className="
                  modal-content
                  rounded-4
                "
              >


                {/* ========================================
                    HEADER DE LA MODALE
                    ======================================== */}

                <div className="modal-header">

                  <div>

                    <h5 className="modal-title">
                      Gestion utilisateur
                    </h5>

                    <small className="text-muted">
                      {selectedUser.email}
                    </small>

                  </div>


                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />

                </div>


                {/* ========================================
                    CORPS DE LA MODALE
                    ======================================== */}

                <div className="modal-body">


                  {/* INFORMATIONS UTILISATEUR */}

                  <div className="mb-3">

                    <h6 className="fw-semibold mb-1">

                      {selectedUser.first_name}{" "}
                      {selectedUser.last_name}

                    </h6>


                    <span
                      className={`
                        badge
                        bg-${getRoleColor(
                          selectedUser.role
                        )}
                      `}
                    >

                      {getRoleLabel(
                        selectedUser.role
                      )}

                    </span>

                  </div>


                  <hr />


                  {/* STATUT DU COMPTE */}

                  <div className="mb-3">

                    <div
                      className="
                        d-flex
                        justify-content-between
                        align-items-center
                      "
                    >

                      <span>
                        Statut du compte
                      </span>


                      {selectedUser.is_deleted ? (

                        <span className="badge bg-dark">
                          Archivé
                        </span>

                      ) : selectedUser.is_active ? (

                        <span className="badge bg-success">
                          Actif
                        </span>

                      ) : (

                        <span className="badge bg-secondary">
                          Inactif
                        </span>

                      )}

                    </div>

                  </div>


                  {/* ======================================
                      ACTIONS
                      ====================================== */}

                  <div className="d-grid gap-2">


                    {/* ACTIVER / DÉSACTIVER */}

                    {!selectedUser.is_deleted && (

                      <button
                        type="button"
                        className={`
                          btn
                          ${
                            selectedUser.is_active
                              ? "btn-warning"
                              : "btn-success"
                          }
                        `}
                        onClick={() =>
                          toggleActive(
                            selectedUser
                          )
                        }
                      >

                        <i
                          className={`
                            bi
                            ${
                              selectedUser.is_active
                                ? "bi-pause-circle"
                                : "bi-play-circle"
                            }
                            me-2
                          `}
                        />

                        {selectedUser.is_active
                          ? "Désactiver le compte"
                          : "Réactiver le compte"}

                      </button>

                    )}


                    {/* ARCHIVER */}

                    {!selectedUser.is_deleted && (

                      <button
                        type="button"
                        className="
                          btn
                          btn-outline-danger
                        "
                        onClick={archiveUser}
                      >

                        <i
                          className="
                            bi
                            bi-archive
                            me-2
                          "
                        />

                        Archiver l'utilisateur

                      </button>

                    )}

                  </div>

                </div>


                {/* ========================================
                    FOOTER
                    ======================================== */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Fermer
                  </button>

                </div>

              </div>

            </div>

          </div>


          {/* ============================================
              BACKDROP
              ============================================ */}

          <div
            className="
              modal-backdrop
              fade
              show
            "
            onClick={closeModal}
          />

        </>

      )}

    </div>
  );
}
