import React, { useEffect, useState } from "react";
import apiFetch from "../../services/apiFetch";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function getRoleColor(role) {
  const map = {
    admin: "danger",
    agent: "primary",
    client: "secondary",
  };

  return map[role] || "dark";
}
export function getRoleLabel(role) {
  const map = {
    admin: "Administrateur",
    agent: "Agent",
    client: "Client",
  };

  return map[role] || role;
}



export default function AdminUsersPage() {

  const navigate = useNavigate();

  // =====================
  // TABLE RESPONSE
  // =====================

  const [response, setResponse] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // =====================
  // FILTERS
  // =====================

  const [searchInput, setSearchInput] = useState("");

 const [filters, setFilters] = useState({
  search: "",
  role: "all",
  status: "all",
  sort: "created_at_desc"
});
  // =====================
  // UI
  // =====================

  const [editingRole, setEditingRole] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
const clean = (v) =>
  (v ?? "").toString().trim();
  // =====================
  // SEARCH DEBOUNCE
  // =====================

  useEffect(() => {

    const timer = setTimeout(() => {

      setFilters(prev => ({
        ...prev,
        search: searchInput,
      }));

    }, 400);

    return () => clearTimeout(timer);

  }, [searchInput]);

  // =====================
  // LOAD USERS
  // =====================

  useEffect(() => {

    fetchUsers(1);

  }, [filters]);

  // =====================
  // FETCH
  // =====================

const fetchUsers = async (page = response.page) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(response.limit),
      search: clean(filters.search),
      role: clean(filters.role),
      status: clean(filters.status),
      sort: clean(filters.sort),
    });

    const data = await apiFetch(`/admin/auth?${params.toString()}`, {
    });

    setResponse(data);
    setSelectedIds([]);

  } catch (err) {
    toast.error(err.message);
  }
};

  // =====================
  // CHANGE ROLE
  // =====================

  const updateRole = async (userId, role) => {

    try {

      await apiFetch(`/admin/auth/${userId}/role`, {

        method: "PATCH",

        body: {
          role,
        },

      });

      setResponse(prev => ({

        ...prev,

        items: prev.items.map(u =>
          u.id === userId
            ? { ...u, role }
            : u
        ),

      }));

      if (selectedUser?.id === userId) {

        setSelectedUser(prev => ({
          ...prev,
          role,
        }));

      }

      setEditingRole(null);

      toast.success("Rôle mis à jour");

    }

    catch (err) {

      toast.error(err.message);

    }

  };

  // =====================
  // TOGGLE ACTIVE
  // =====================

  const toggleActive = async (user) => {

    const newStatus = !user.is_active;

    const previous = response.items;

    // optimistic update

    setResponse(prev => ({

      ...prev,

      items: prev.items.map(u =>
        u.id === user.id
          ? {
              ...u,
              is_active: newStatus,
            }
          : u
      ),

    }));

    if (selectedUser?.id === user.id) {

      setSelectedUser(prev => ({
        ...prev,
        is_active: newStatus,
      }));

    }

    try {

      await apiFetch(`/admin/auth/${user.id}/active`, {

        method: "PATCH",

        body: {

          is_active: newStatus,

        }
      });

      toast.success("Statut mis à jour");

    }

    catch (err) {

      setResponse(prev => ({
        ...prev,
        items: previous,
      }));

      toast.error(err.message);

    }

  };

  // =====================
  // ARCHIVE USER
  // =====================

  const archiveUser = async () => {

    try {

      await apiFetch(

        `/admin/auth/${selectedUser.id}/archive`,

        {

          method: "PATCH"
        }

      );

      setResponse(prev => ({

        ...prev,

        items: prev.items.filter(

          u => u.id !== selectedUser.id

        ),

      }));

      setShowUserModal(false);

      toast.success("Utilisateur archivé");

    }

    catch (err) {

      toast.error(err.message);

    }

  };

  // =====================
  // BULK ARCHIVE
  // =====================

  const archiveSelected = async () => {

    if (selectedIds.length === 0)
      return;

    try {

      await apiFetch(

        "/admin/auth/archive/bulk",

        {

          method: "PATCH",

          body: {

            ids: selectedIds,

          }
        }

      );

      setResponse(prev => ({

        ...prev,

        items: prev.items.filter(

          u => !selectedIds.includes(u.id)

        ),

      }));

      setSelectedIds([]);

      toast.success("Utilisateurs archivés");

    }

    catch (err) {

      toast.error(err.message);

    }

  };

  // =====================
  // SELECT ONE
  // =====================

  const toggleSelected = (id) => {

    setSelectedIds(prev =>

      prev.includes(id)

        ? prev.filter(x => x !== id)

        : [...prev, id]

    );

  };

  // =====================
  // SELECT ALL
  // =====================

  const toggleSelectAll = () => {

    if (
      selectedIds.length === response.items.length
    ) {

      setSelectedIds([]);

    }

    else {

      setSelectedIds(

        response.items.map(

          u => u.id

        )

      );

    }

  };

  // =====================
  // OPEN MODAL
  // =====================

  const openUserModal = (user) => {

    setSelectedUser(user);

    setShowUserModal(true);

  };

  // =====================
  // CLOSE MODAL
  // =====================

  const closeModal = () => {

    setSelectedUser(null);

    setShowUserModal(false);

  };

    return (
  <div className="container py-4">

    {/* ===================== */}
    {/* HEADER */}
    {/* ===================== */}

    <div className="d-flex justify-content-between align-items-center mb-4">

      <div>

        <h2 className="fw-bold mb-1">
          Utilisateurs
        </h2>

        <p className="text-muted mb-0">
          Gestion des comptes administrateurs, agents et clients
        </p>

        <div className="mt-2">
          <span className="badge bg-light text-dark border px-3 py-2">
            {response.total} utilisateurs
          </span>
        </div>

      </div>

      <button
        className="btn btn-primary"
        onClick={() => navigate("/admin/users/create")}
      >
        <i className="bi bi-person-plus me-2" />
        Créer utilisateur
      </button>

    </div>

    {/* ===================== */}
    {/* BULK ACTION BAR */}
    {/* ===================== */}

    {selectedIds.length > 0 && (
      <div className="alert alert-light border d-flex justify-content-between align-items-center">

        <div>
          <strong>{selectedIds.length}</strong> sélectionné(s)
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={archiveSelected}
          >
            Archiver
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSelectedIds([])}
          >
            Annuler
          </button>

        </div>

      </div>
    )}

    {/* ===================== */}
    {/* FILTERS */}
    {/* ===================== */}

    <div className="card p-3 mb-4 shadow-sm border-0 rounded-4">

      <div className="row g-3 align-items-center">

        {/* SEARCH */}
        <div className="col-lg-5">

          <input
            className="form-control"
            placeholder="Rechercher nom ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

        </div>

        {/* ROLE FILTER */}
        <div className="col-lg-2">

          <select
            className="form-select"
            value={filters.role}
            onChange={(e) =>
  setFilters((f) => ({
    ...f,
    search: e.target.value.trimStart()
  }))
}
          >

            <option value="all">Tous rôles</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="client">Client</option>

          </select>

        </div>

        {/* STATUS FILTER */}
        <div className="col-lg-2">

          <select
            className="form-select"
            value={filters.status}
            onChange={(e) =>
              setFilters(prev => ({
                ...prev,
                status: e.target.value,
              }))
            }
          >

            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>

          </select>

        </div>

        {/* SORT */}
        <div className="col-lg-2">

          <select
            className="form-select"
            value={filters.sort}
            onChange={(e) =>
              setFilters(prev => ({
                ...prev,
                sort: e.target.value,
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

        {/* REFRESH */}
        <div className="col-lg-1">

          <button
            className="btn btn-outline-primary w-100"
            onClick={() => fetchUsers(response.page)}
          >
            <i className="bi bi-arrow-repeat" />
          </button>

        </div>

      </div>

    </div>

        {/* ===================== */}
    {/* TABLE */}
    {/* ===================== */}

    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">

      <div className="table-responsive">

        <table className="table align-middle mb-0">

          <thead className="table-light">

            <tr>

              {/* SELECT ALL */}
              <th>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={
                    selectedIds.length === response.items.length &&
                    response.items.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>

              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {/* EMPTY STATE */}
            {response.items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}

            {/* ROWS */}
            {response.items.map((u) => (
              <tr key={u.id}>

                {/* CHECKBOX */}
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleSelected(u.id)}
                  />
                </td>

                {/* NAME */}
                <td className="fw-semibold">
                  {u.first_name} {u.last_name}
                </td>

                {/* EMAIL */}
                <td className="text-muted">
                  {u.email}
                </td>

                {/* ROLE INLINE EDIT */}
                <td>
                  {editingRole === u.id ? (
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) =>
                        updateRole(u.id, e.target.value)
                      }
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  ) : (
                    <span
                      className={`badge bg-${getRoleColor(u.role)}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setEditingRole(u.id)}
                    >
                      {getRoleLabel(u.role)}
                    </span>
                  )}
                </td>

                {/* STATUS */}
                <td>
                  <button
                    className={`btn btn-sm ${
                      u.is_active ? "btn-success" : "btn-secondary"
                    }`}
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_active ? "Actif" : "Inactif"}
                  </button>
                </td>

                {/* CREATED AT */}
                <td className="text-muted">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTIONS */}
                <td className="d-flex gap-2">

                  {/* OPEN MODAL */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => openUserModal(u)}
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

    {/* ===================== */}
    {/* PAGINATION */}
    {/* ===================== */}

    <div className="d-flex justify-content-between align-items-center mt-4">

      <button
        className="btn btn-outline-secondary"
        disabled={response.page <= 1}
        onClick={() => fetchUsers(response.page - 1)}
      >
        ← Précédent
      </button>

      <div className="text-muted">
        Page {response.page} / {response.pages}
      </div>

      <button
        className="btn btn-outline-secondary"
        disabled={response.page >= response.pages}
        onClick={() => fetchUsers(response.page + 1)}
      >
        Suivant →
      </button>

    </div>

    
    {/* ===================== */}
    {/* USER MODAL */}
    {/* ===================== */}

    {showUserModal && selectedUser && (
      <>
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content rounded-4">

              {/* ===================== */}
              {/* HEADER */}
              {/* ===================== */}

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
                  className="btn-close"
                  onClick={closeModal}
                />

              </div>

              {/* ===================== */}
              {/* BODY */}
              {/* ===================== */}

              <div className="modal-body">

                {/* USER INFO */}
                <div className="mb-3">

                  <h6 className="fw-semibold mb-1">
                    {selectedUser.first_name}{" "}
                    {selectedUser.last_name}
                  </h6>

                  <span
                    className={`badge bg-${getRoleColor(
                      selectedUser.role
                    )}`}
                  >
                    {getRoleLabel(selectedUser.role)}
                  </span>

                </div>

                <hr />

                {/* STATUS INFO */}
                <div className="mb-3">

                  <div className="d-flex justify-content-between align-items-center">

                    <span>Statut du compte</span>

                    <span
                      className={`badge ${
                        selectedUser.is_active
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {selectedUser.is_active
                        ? "Actif"
                        : "Inactif"}
                    </span>

                  </div>

                </div>

                {/* ===================== */}
                {/* ACTIONS */}
                {/* ===================== */}

                <div className="d-grid gap-2">

                  {/* TOGGLE ACTIVE */}
                  <button
                    className={`btn ${
                      selectedUser.is_active
                        ? "btn-warning"
                        : "btn-success"
                    }`}
                    onClick={() =>
                      toggleActive(selectedUser)
                    }
                  >
                    <i
                      className={`bi ${
                        selectedUser.is_active
                          ? "bi-pause-circle"
                          : "bi-play-circle"
                      } me-2`}
                    />

                    {selectedUser.is_active
                      ? "Désactiver le compte"
                      : "Réactiver le compte"}
                  </button>

                  {/* ARCHIVE */}
                  {!selectedUser.is_deleted && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={archiveUser}
                    >
                      <i className="bi bi-archive me-2" />
                      Archiver l'utilisateur
                    </button>
                  )}

                </div>

              </div>

              {/* ===================== */}
              {/* FOOTER */}
              {/* ===================== */}

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Fermer
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* BACKDROP */}
        <div className="modal-backdrop fade show" />

      </>
    )}

  </div>
);
}