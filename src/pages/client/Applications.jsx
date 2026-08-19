import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import { STATUS, VEHICLE_TYPE } from "../../utils/status";

export default function AdminDossiers() {

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("active");

  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null
  });


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


  // ---------------- FETCH APPLICATIONS ----------------
  const handleConfirm = async () => {
    try {

      // =========================
      // DELETE
      // =========================
      if (modal.type === "delete") {

        await apiFetch(
          `/applications/${modal.id}`,
          {
            method: "DELETE"
          }
        );

        toast.success(
          "Dossier supprimé"
        );
      }

      // =========================
      // CANCEL
      // =========================
      else if (modal.type === "cancel") {

        await apiFetch(
          `/applications/${modal.id}/cancel`,
          {
            method: "PATCH"
          }
        );

        toast.success(
          "Dossier annulé"
        );
      }

      setModal({
        open: false,
        type: null,
        id: null
      });

      await fetchApplications();

    } catch (err) {

      console.error(err);

      toast.error(
        modal.type === "delete"
          ? "Erreur lors de la suppression"
          : "Erreur lors de l'annulation"
      );
    }
  };





  const fetchApplications = useCallback(
    async (page = 1) => {

      try {

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", 10);

        params.append("view_mode", viewMode);

        if (
          filters.status &&
          filters.status !== "all" &&
          viewMode === "active"
        ) {
          params.append("status", filters.status);
        }

        if (
          filters.type &&
          filters.type !== "all"
        ) {
          params.append("application_type", filters.type);
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
          `/applications/me?${params.toString()}`,
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
            Suivi de vos demandes de financement
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
            ? "btn-warning"
            : "btn-outline-warning"
            }`}
          onClick={() => setViewMode("cancelled")}
        >
          Annulés
        </button>


      </div>
      {/* FILTERS */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body p-4">

          <div className="row g-3 align-items-center">

            {/* SEARCH */}
            <div className="col-lg-4 col-md-6">

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Rechercher (Véhicule...)"
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
      <option value="all">Tous statuts</option>

      <option value="draft">Brouillon</option>
      <option value="submitted">Soumis</option>
      <option value="processing">En cours</option>
      <option value="approved">Validé</option>
      <option value="paid">Payé</option>
      <option value="completed">Terminé</option>
      <option value="rejected">Refusé</option>
    </select>

  </div>
)}

            {/* TYPE */}
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
                <option value="all">Tous types</option>
                <option value="sale">Vente</option>
                <option value="rent">Location</option>
              </select>

            </div>

            {/* SORT */}
            <div className="col-lg-2 col-md-6">

              <select
                className="form-select form-select-lg"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
              >
                <option value="created_at_desc">Date ↓</option>
                <option value="created_at_asc">Date ↑</option>
                <option value="status">Statut</option>
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
                <th>Création</th>
                <th>Soumission</th>
                <th>Type</th>
                <th>Véhicule</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {applications.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
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

                  {/* CREATED */}
                  <td>
                    {d.created_at
                      ? new Date(d.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* SUBMITTED */}
                  <td>
                    {d.submitted_at
                      ? new Date(d.submitted_at).toLocaleDateString()
                      : "-"}
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

                  {/* ACTION */}
                  <td className="text-start">

                    <div className="d-flex gap-2 justify-content-start">

                      {/* VIEW */}
                      <button
                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                        onClick={() =>
                          navigate(`/applications/${d.id}`)
                        }
                        title="Voir le dossier"
                      >
                        <i className="bi bi-search" />
                      </button>

                      {/* DELETE */}
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
            : "Annuler le dossier"
        }
        description={
          modal.type === "delete"
            ? "Cette action est irréversible."
            : "Le dossier sera marqué comme annulé."
        }
        onCancel={() =>
          setModal({
            open: false,
            type: null,
            id: null
          })
        }
        onConfirm={handleConfirm}
      />
    </div>




  );
}