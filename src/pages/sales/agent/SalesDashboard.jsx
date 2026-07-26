import { useEffect, useState } from "react";
import apiFetch from "../../../services/apiFetch";
import { toast } from "react-toastify";

export default function SalesDashboard() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await apiFetch("/agent/leads/stats", {
        method: "GET",
      });

      setStats(data);
    } catch (err) {
      toast.error("Erreur chargement du tableau de bord");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Tableau de bord commercial
          </h2>
          <p className="text-muted mb-0">
            Vue globale de votre activité
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={fetchStats}
        >
          Actualiser
        </button>
      </div>


      {/* KPI */}
      {stats && (
        <div className="row g-3 mb-4">

          <div className="col-md-3">
            <div className="bg-white border rounded-4 p-3 shadow-sm">
              <div className="text-muted small">Nouveaux leads</div>
              <div className="fs-3 fw-bold">{stats.new_leads}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="bg-white border rounded-4 p-3 shadow-sm">
              <div className="text-muted small">Mes leads</div>
              <div className="fs-3 fw-bold">{stats.my_leads}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="bg-white border rounded-4 p-3 shadow-sm">
              <div className="text-muted small">Devis envoyés</div>
              <div className="fs-3 fw-bold">{stats.quotes_sent}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="bg-white border rounded-4 p-3 shadow-sm">
              <div className="text-muted small">Applications</div>
              <div className="fs-3 fw-bold">{stats.applications}</div>
            </div>
          </div>

        </div>
      )}

      {/* ACTIONS RAPIDES */}
      <div className="row g-3">

        <div className="col-md-6">
          <div className="bg-white border rounded-4 p-4 h-100">

            <h5 className="fw-bold mb-3">
              Actions rapides
            </h5>

            <div className="d-grid gap-2">

              <a href="/sales/leads" className="btn btn-dark">
                Voir tous les leads
              </a>

              <a href="/sales/my-leads" className="btn btn-outline-dark">
                Mes leads
              </a>

              <a href="/sales/quotes" className="btn btn-outline-primary">
                Devis
              </a>

            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-white border rounded-4 p-4 h-100">

            <h5 className="fw-bold mb-3">
              Performance
            </h5>

            {stats && (
              <ul className="list-unstyled mb-0 text-muted">
                <li>Leads convertis : {stats.conversion_rate}%</li>
                <li>Leads non assignés : {stats.unassigned}</li>
                <li>Deals gagnés : {stats.won}</li>
                <li>Deals perdus : {stats.lost}</li>
              </ul>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}