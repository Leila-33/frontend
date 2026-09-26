import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import apiFetch from "../../../services/apiFetch";

import TicketStatusBadge from "../../../components/sav/TicketStatusBadge";
import TicketPriorityBadge from "../../../components/sav/TicketPriorityBadge";
import { formatDateTime } from "../../../utils/dateUtils";

export default function SavDashboardPage() {
  // =====================================================
  // ÉTAT DU DASHBOARD
  // =====================================================

  /**
   * Contient les indicateurs du dashboard ainsi que
   * les derniers tickets à afficher dans le tableau.
   *
   * Les valeurs initiales permettent d'afficher un dashboard
   * vide correctement avant la première réponse de l'API.
   */
  const [data, setData] = useState({
    total: 0,
    open: 0,
    urgent: 0,
    recent_tickets: [],
  });

  // =====================================================
  // ÉTAT DE CHARGEMENT
  // =====================================================

  /**
   * Permet d'indiquer visuellement que les données
   * du dashboard sont en cours de récupération.
   */
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RÉCUPÉRATION DU DASHBOARD
  // =====================================================

  /**
   * Récupère les données du dashboard SAV :
   *
   * - nombre total de tickets ;
   * - nombre de tickets ouverts ;
   * - nombre de tickets urgents ;
   * - derniers tickets créés.
   *
   * useCallback permet de conserver une référence stable
   * à la fonction lorsqu'elle est utilisée dans useEffect.
   */
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/agent/support-tickets/dashboard");

      setData({
        total: response?.total ?? 0,
        open: response?.open ?? 0,
        urgent: response?.urgent ?? 0,
        recent_tickets: response?.recent_tickets ?? [],
      });
    } catch (err) {
      /*
       * L'erreur est affichée à l'utilisateur mais le dashboard
       * conserve ses valeurs initiales afin d'éviter un affichage
       * incohérent.
       */
      console.error("Erreur lors du chargement du dashboard SAV :", err);

      toast.error(err?.message || "Impossible de charger le dashboard SAV.");
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  /**
   * Charge les données du dashboard lors du montage
   * du composant.
   */
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container-fluid">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">
        <h2 className="fw-bold">Dashboard SAV</h2>

        <p className="text-muted mb-0">Vue globale du support client</p>
      </div>

      {/* =================================================
          INDICATEURS KPI
      ================================================= */}

      <div className="row g-3 mb-4">
        {/* -------------------------------------------------
            TOTAL DES TICKETS
        ------------------------------------------------- */}

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">Total tickets</div>

              <h3 className="fw-bold mb-0">
                {loading ? (
                  <span className="placeholder-glow" aria-label="Chargement">
                    <span className="placeholder col-3" />
                  </span>
                ) : (
                  data.total
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            TICKETS OUVERTS
        ------------------------------------------------- */}

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">Tickets ouverts</div>

              <h3 className="fw-bold text-primary mb-0">
                {loading ? (
                  <span className="placeholder-glow" aria-label="Chargement">
                    <span className="placeholder col-3" />
                  </span>
                ) : (
                  data.open
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            TICKETS URGENTS
        ------------------------------------------------- */}

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small">Tickets urgents</div>

              <h3 className="fw-bold text-danger mb-0">
                {loading ? (
                  <span className="placeholder-glow" aria-label="Chargement">
                    <span className="placeholder col-3" />
                  </span>
                ) : (
                  data.urgent
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          TICKETS RÉCENTS
      ================================================= */}

      <div className="card shadow-sm border-0">
        {/* -------------------------------------------------
            EN-TÊTE DU TABLEAU
        ------------------------------------------------- */}

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tickets récents</h5>

          <Link to="/sav/tickets" className="btn btn-sm btn-outline-dark">
            Voir tous
          </Link>
        </div>

        {/* -------------------------------------------------
            TABLEAU
        ------------------------------------------------- */}

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
              {/* -------------------------------------------------
                  CHARGEMENT
              ------------------------------------------------- */}

              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                    Chargement des tickets...
                  </td>
                </tr>
              ) : data.recent_tickets.length === 0 ? (
                /* -------------------------------------------------
                   AUCUN TICKET
                ------------------------------------------------- */

                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Aucun ticket
                  </td>
                </tr>
              ) : (
                /* -------------------------------------------------
                   LISTE DES TICKETS
                ------------------------------------------------- */

                data.recent_tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    {/* ---------------------------------------------
                        SUJET
                    --------------------------------------------- */}

                    <td>
                      <Link
                        to={`/sav/tickets/${ticket.id}`}
                        className="text-decoration-none fw-semibold"
                      >
                        {ticket.subject}
                      </Link>
                    </td>

                    {/* ---------------------------------------------
                        PRIORITÉ
                    --------------------------------------------- */}

                    <td>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>

                    {/* ---------------------------------------------
                        STATUT
                    --------------------------------------------- */}

                    <td>
                      <TicketStatusBadge status={ticket.status} />
                    </td>

                    {/* ---------------------------------------------
                        DATE DE CRÉATION
                    --------------------------------------------- */}

                    <td>{formatDateTime(ticket.created_at)}</td>
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
