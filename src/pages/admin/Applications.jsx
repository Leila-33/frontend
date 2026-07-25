import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import React from "react";
import ConfirmActionModal from "./ConfirmActionModal";
import { STATUS, VEHICLE_TYPE } from "../../utilis/status";

export default function AdminDossiers() {

  const navigate = useNavigate();




  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null
  });

  const [viewMode, setViewMode] = useState("active");

  const [applications, setApplications] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    });
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: ""
  });
  const [sort, setSort] = useState("createdAt_desc");


  const handleConfirm = async () => {

    try {

      const actions = {
  delete: () =>
    apiFetch(`/admin/applications/soft_delete/${modal.id}`, {
      method: "DELETE"
    }),

  archive: () =>
    apiFetch(`/admin/applications/${modal.id}/archive`, {
      method: "PATCH"
    }),

  restore: () =>
    apiFetch(`/admin/applications/${modal.id}/unarchive`, {
      method: "PATCH"
    }),

  restore_cancelled: () =>
    apiFetch(`/applications/${modal.id}/restore-cancelled`, {
      method: "PATCH"
    }),

  cancel: () =>
    apiFetch(`/applications/${modal.id}/cancel`, {
      method: "PATCH"
    })
};
      await actions[modal.type]?.();
      toast.success("Action effectuée");

      setModal({
        open: false,
        type: null,
        id: null
      });

      await fetchApplications();

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'action");
      
    }
  };

  // ---------------- FETCH APPLICATIONS ----------------


  const fetchApplications = useCallback(
    async (page = 1) => {

      try {

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", 10);

        params.append("view_mode", viewMode);

        if (
          filters.status &&
          filters.status !== "all"
        ) {
          params.append("status", filters.status);
        }

        if (
          filters.type &&
          filters.type !== "all"
        ) {
          params.append("type", filters.type);
        }

        if (filters.search?.trim()) {
          params.append(
            "search",
            filters.search.trim()
          );
        }

        if (sort) {
          params.append("sort", sort);
        }

        const data = await apiFetch(
          `/admin/applications?${params.toString()}`,
        );

        setApplications(data.items || []);

        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          pages: data.pages
        });

        return data;

      } catch (err) {

        console.error(err);

        toast.error(
          "Erreur lors du chargement des dossiers"
        );

        return null;
      }
    },
    [filters, sort, viewMode]
  );



  useEffect(() => {

    const timeout = setTimeout(() => {
      fetchApplications(1);
    }, 500);

    return () => clearTimeout(timeout);

  }, [filters, sort, viewMode, fetchApplications]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters, sort, viewMode]);



  // ---------------- UI ----------------
  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Gestion des dossiers
          </h2>

          <p className="text-muted mb-0">
            Administration des demandes clients
          </p>
        </div>

        <div className="badge bg-light text-dark border px-3 py-2">
          {pagination.total} dossier(s)
        </div>

      </div>

      <div className="d-flex gap-2 mb-3">

        <button
          className={`btn btn-sm ${viewMode === "active"
            ? "btn-primary"
            : "btn-outline-primary"
            }`}
          onClick={() => setViewMode("active")}
        >
          Actifs
        </button>

        <button
          className={`btn btn-sm ${viewMode === "cancelled"
            ? "btn-danger"
            : "btn-outline-danger"
            }`}
          onClick={() => setViewMode("cancelled")}
        >
          Annulés
        </button>

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
      {/* FILTERS */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body p-4">

          <div className="row g-3">

            {/* SEARCH */}
            <div className="col-lg-4">

              <input
                className="form-control form-control-lg"
                placeholder="Rechercher nom, prénom..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })
                }
              />

            </div>

            {/* STATUS */}
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
            {/* TYPE */}
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

            {/* SORT */}
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

      {/* TABLE */}
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

              {applications.map((d) => (

                <tr key={d.id}>

                  {/* ID */}
                  <td className="fw-semibold">
                    #{d.id.slice(0, 8)}
                  </td>

                  {/* CLIENT */}
                  <td>
                    {d.client}
                  </td>

                  {/* TYPE */}
                  <td>

                    <span
                      className={`badge bg-${VEHICLE_TYPE[d.type]?.color}`}
                    >
                      {VEHICLE_TYPE[d.type]?.label}

                    </span>

                  </td>

                  {/* VEHICLE */}
                  <td>

                    {d.vehicle}

                  </td>

                  {/* STATUS */}
                  <td>

                    <span
                      className={`badge bg-${STATUS[d.status]?.color}`}
                    >
                      {STATUS[d.status]?.label}
                    </span>

                  </td>

                  {/* SUBMITTED */}
                  <td>
                    {d.submitted_at
                      ? new Date(d.submitted_at).toLocaleDateString()
                      : "-"}
                  </td>
                  {/* ACTION */}
                  <td className="text-start">

                    <div className="d-flex gap-2 justify-content-start">

                      {/* VIEW (toujours disponible) */}
                      <button
                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                        onClick={() =>
                          navigate(`/admin/applications/${d.id}`)
                        }
                        title="Voir le dossier"
                      >
                        <i className="bi bi-search" />
                      </button>

                      {/* =========================
        ACTIVE MODE
    ========================= */}
                      {viewMode === "active" && (
                        <>
                          {/* ARCHIVE */}
                          <button
                            className="btn btn-warning btn-sm rounded-circle shadow-sm"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "archive",
                                id: d.id
                              })
                            }
                            title="Archiver le dossier"
                          >
                            <i className="bi bi-archive" />
                          </button>

                          {/* DELETE */}
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


                          {/* CANCEL */}
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
                        </>
                      )
                      }

                      {/* =========================
        ARCHIVED MODE
    ========================= */}
                      {viewMode === "archived" && (
                        <>
                          {/* RESTORE */}
                          <button
                            className="btn btn-success btn-sm rounded-circle shadow-sm"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "restore",
                                id: d.id
                              })
                            }
                            title="Restaurer le dossier"
                          >
                            <i className="bi bi-arrow-counterclockwise" />
                          </button>

                          {/* DELETE */}
                          <button
                            className="btn btn-danger btn-sm rounded-circle shadow-sm"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "delete",
                                id: d.id
                              })
                            }
                            title="Supprimer définitivement"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}
                      {viewMode === "cancelled" && (
                        <>
                          {/* RESTORE CANCELLED (business restore) */}
                          {d.can_restore_cancelled && (
                            <button
                              className="btn btn-success btn-sm rounded-circle shadow-sm"
                              onClick={() =>
                                setModal({
                                  open: true,
                                  type: "restore_cancelled",
                                  id: d.id
                                })
                              }
                              title="Restaurer le dossier annulé"
                            >
                              <i className="bi bi-arrow-counterclockwise" />
                            </button>
                          )}

                          {/* ARCHIVE */}
                          <button
                            className="btn btn-warning btn-sm rounded-circle shadow-sm"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "archive",
                                id: d.id
                              })
                            }
                            title="Archiver le dossier"
                          >
                            <i className="bi bi-archive" />
                          </button>

                          {/* DELETE */}
                          <button
                            className="btn btn-danger btn-sm rounded-circle shadow-sm"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "delete",
                                id: d.id
                              })
                            }
                            title="Supprimer définitivement"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-4">

        <div className="text-muted small">

          Page {pagination.page} sur{" "}
          {pagination.pages}

        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            disabled={pagination.page <= 1}
            onClick={() =>
              fetchApplications(
                pagination.page - 1
              )
            }
          >
            Précédent
          </button>

          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            disabled={
              pagination.page >= pagination.pages
            }
            onClick={() =>
              fetchApplications(
                pagination.page + 1
              )
            }
          >
            Suivant
          </button>

        </div>

      </div>
      <ConfirmActionModal
        open={modal.open}
        type={modal.type}
        title={
          modal.type === "delete"
            ? "Supprimer le dossier"
            : modal.type === "archive"
              ? "Archiver le dossier"
              : modal.type === "restore_cancelled"
                ? "Restaurer le dossier annulé"
                : "Restaurer le dossier"
        }
        description={
          modal.type === "delete"
            ? "Cette action est irréversible."
            : modal.type === "archive"
              ? "Le dossier sera masqué mais conservé."
              : modal.type === "restore_cancelled"
                ? "Le dossier annulé sera réactivé dans le workflow."
                : "Le dossier sera restauré."
        }
        onCancel={() =>
          setModal({ open: false, type: null, id: null })
        }
        onConfirm={handleConfirm}
      />
    </div>
  );
}