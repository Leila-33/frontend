import { useEffect, useState, useCallback } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import {useNavigate} from "react-router-dom";
import TestDriveStatusModal from "../../components/test-drives/TestDriveStatusModal";
import { testDriveStatusConfig } from "../../utils/status";


export default function AdminTestDrives() {
  const navigate = useNavigate();

  const [testDrives, setTestDrives] = useState([]);

  const [selected, setSelected] = useState(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null // confirm | reject | cancel | complete
  });
const [filters, setFilters] = useState({
  status: "",
  search: ""
});

const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0
});
  // =========================
  // FETCH DATA
  // =========================
const fetchTestDrives = useCallback(async () => {

  try {

    const params = new URLSearchParams();


    if (filters.status) {
      params.append(
        "status",
        filters.status
      );
    }


    if (filters.search) {
      params.append(
        "search",
        filters.search
      );
    }


    params.append(
      "page",
      pagination.page
    );


    params.append(
      "limit",
      pagination.limit
    );


    const data = await apiFetch(
      `/admin/test-drives?${params.toString()}`,
      {
        method: "GET"
      }
    );


    setTestDrives(data.items);


    setPagination(prev => ({
      ...prev,
      page: data.page,
      limit: data.limit,
      total: data.total
    }));


  } catch (err) {

    toast.error(
      "Erreur chargement des essais routiers"
    );

  }

}, [
  filters.status,
  filters.search,
  pagination.page,
  pagination.limit
]);

useEffect(() => {

  fetchTestDrives();

}, [fetchTestDrives]);

const totalPages = Math.ceil(
  pagination.total / pagination.limit
);

  // =========================
  // ACTION HANDLER
  // =========================
  const handleAction = async () => {

    if (!selected) return;

    try {

      await apiFetch(
        `/admin/test-drives/${selected.id}/status`,
        {
          method: "POST",
          body: {
            status: actionModal.type // "confirm" | "reject" | etc
          }
        }
      );

      toast.success("Action effectuée ✔");

      setActionModal({ open: false, type: null });
      setSelected(null);

      fetchTestDrives();

    } catch (err) {
      toast.error(err?.data?.detail || "Erreur action");
    }
  };

  // =========================
  // STATUS BADGE
  // =========================
  const getBadge = (status) => {

    const map = {
      pending: "badge bg-warning text-dark",
      confirmed: "badge bg-primary",
      cancelled: "badge bg-danger",
      completed: "badge bg-success"
    };

    return map[status] || "badge bg-secondary";
  };

  return (
    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h3 className="fw-bold">
          Essai routiers admin
        </h3>

      </div>
<div className="row g-3 mb-4">


  {/* SEARCH */}
  <div className="col-md-6">

    <input
      type="text"
      className="form-control"
      placeholder="Rechercher utilisateur ou véhicule..."
      value={filters.search}
      onChange={(e) => {

        setPagination(prev => ({
          ...prev,
          page: 1
        }));

        setFilters(prev => ({
          ...prev,
          search: e.target.value
        }));

      }}
    />

  </div>


  {/* STATUS */}
  <div className="col-md-3">

    <select
      className="form-select"
      value={filters.status}
      onChange={(e)=>{

        setPagination(prev => ({
          ...prev,
          page:1
        }));

        setFilters(prev=>({
          ...prev,
          status:e.target.value
        }));

      }}
    >

      <option value="">
        Tous les statuts
      </option>

      <option value="pending">
        En attente
      </option>

      <option value="confirmed">
        Confirmés
      </option>

      <option value="completed">
        Terminés
      </option>

      <option value="cancelled">
        Annulés
      </option>

      <option value="rejected">
        Refusés
      </option>


    </select>

  </div>


  {/* RESET */}
  <div className="col-md-3">

    <button
      className="btn btn-outline-secondary w-100"
      onClick={()=>{

        setFilters({
          status:"",
          search:""
        });

        setPagination(prev=>({
          ...prev,
          page:1
        }));

      }}
    >
      Réinitialiser
    </button>

  </div>


</div>
      {/* =========================
          TABLE
      ========================= */}
      <div className="card shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Véhicule</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {testDrives.map((td) => (

                <tr key={td.id}>

                  <td>
                    {td.user_name}
                  </td>

                  <td>
                    {td.vehicle_name}
                  </td>

                  <td>
                    {new Date(td.appointment_date)
                      .toLocaleString()}
                  </td>

 <td>

  {(() => {

    const status =
      testDriveStatusConfig[td.status] || testDriveStatusConfig.pending;

    return (
      <span className={status.className}>
        {status.label}
      </span>
    );

  })()}

</td>

                  <td className="d-flex gap-2">

                    {/* VIEW */}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        navigate(`/admin/test-drives/${td.id}`)
                      }
                    >
                      Voir
                    </button>

                    {/* CONFIRM */}
                    {td.status === "pending" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "confirmed"
                          });
                        }}
                      >
                        Confirmer
                      </button>
                    )}

                    {/* REJECT */}
                    {td.status === "pending" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "rejected"
                          });
                        }}
                      >
                        Refuser
                      </button>
                    )}

                    {/* CANCEL */}
                    {td.status === "confirmed" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "cancelled"
                          });
                        }}
                      >
                        Annuler
                      </button>
                    )}

                    {/* COMPLETE */}
                    {td.status === "confirmed" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "completed"
                          });
                        }}
                      >
                        Terminer
                      </button>
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          
<div className="d-flex justify-content-between align-items-center mt-3">

  <span className="text-muted">
    Page {pagination.page} / {totalPages}
  </span>


  <div className="btn-group">

    <button
      className="btn btn-outline-primary"
      disabled={pagination.page === 1}
      onClick={() =>
        setPagination(prev => ({
          ...prev,
          page: prev.page - 1
        }))
      }
    >
      ← Précédent
    </button>


    <button
      className="btn btn-outline-primary"
      disabled={pagination.page === totalPages}
      onClick={() =>
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1
        }))
      }
    >
      Suivant →
    </button>

  </div>

</div>
        </div>

      </div>

<TestDriveStatusModal
  open={actionModal.open}
  type={actionModal.type}
  testDrive={selected}
  onClose={() =>
    setActionModal({
      open:false,
      type:null
    })
  }
  onConfirm={handleAction}
/>
    </div>
  );
}