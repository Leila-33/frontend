import { useEffect, useState } from "react";
import apiFetch from "../../../services/apiFetch";
import KanbanBoard from "../../../components/sales/KanbanBoard";
import { toast } from "react-toastify";

export default function MyLeadsPage() {
  const [leads, setLeads] = useState([]);

  const fetchMyLeads = async () => {
    try {
      const data = await apiFetch("/agent/leads?scope=my", {
        method: "GET",
      });

      setLeads(data.items);
    } catch (err) {
      toast.error("Erreur lors du chargement de mes prospects");
    }
  };

  useEffect(() => {
    fetchMyLeads();
  }, []);

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Mes prospects
          </h2>

          <p className="text-muted mb-0">
            Leads qui vous sont assignés
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={fetchMyLeads}
        >
          Actualiser
        </button>
      </div>

      {/* CONTENT */}
      { leads.length === 0 ? (
        <div className="alert alert-light border">
          Aucun lead assigné pour le moment.
        </div>
      ) : (
        <KanbanBoard
          leads={leads}
          mode="my-leads"
        />
      )}

    </div>
  );
}