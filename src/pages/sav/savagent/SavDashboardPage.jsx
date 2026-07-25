import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import apiFetch from "../../../services/apiFetch";

import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketPriorityBadge from "../components/TicketPriorityBadge";

export default function SavDashboardPage() {


  const [data, setData] = useState({
    total: 0,
    open: 0,
    urgent: 0,
    recent_tickets: [],
  });

  // =====================
  // FETCH DASHBOARD
  // =====================
  const fetchDashboard = async () => {
    try {

      const res = await apiFetch("/agent/support-tickets/dashboard");

      setData(res);

    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="container-fluid">

      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard SAV</h2>
        <p className="text-muted">
          Vue globale du support client
        </p>
      </div>

      {/* ===================== */}
      {/* KPI */}
      {/* ===================== */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="text-muted small">Total tickets</div>
              <h3 className="fw-bold">{data.total}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="text-muted small">Tickets ouverts</div>
              <h3 className="fw-bold text-primary">{data.open}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="text-muted small">Tickets urgents</div>
              <h3 className="fw-bold text-danger">{data.urgent}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* ===================== */}
      {/* RECENT TICKETS */}
      {/* ===================== */}
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tickets récents</h5>

          <Link
            to="/sav/tickets"
            className="btn btn-sm btn-outline-dark"
          >
            Voir tous
          </Link>
        </div>

        <div className="table-responsive">

          <table className="table align-middle mb-0">

            <thead className="table-light">

              <tr>
                <th>Sujet</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>

            </thead>

            <tbody>

              {data.recent_tickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Aucun ticket
                  </td>
                </tr>
              ) : (
                data.recent_tickets.map(ticket => (
                  <tr key={ticket.id}>

                    <td>
                      <Link
                        to={`/sav/tickets/${ticket.id}`}
                        className="text-decoration-none fw-semibold"
                      >
                        {ticket.subject}
                      </Link>
                    </td>

                    <td>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>

                    <td>
                      <TicketStatusBadge status={ticket.status} />
                    </td>

                    <td>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}