import { useEffect, useState } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { STATUS } from "../../utils/status";

// =========================
// CONFIGURATION GRAPHIQUES
// =========================

const COLORS = [
  "#0d6efd",
  "#198754",
  "#ffc107",
  "#dc3545",
  "#6c757d"
];

// =========================
// FORMATTERS
// =========================

const formatChartDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit"
  });
};

const formatMonth = (month) => {
  if (!month) return "";

  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric"
  });
};

export default function AdminAnalytics() {

  const [data, setData] = useState({
    applications_by_day: [],
    status_distribution: [],
    revenue: [],
    stats: {
      total: 0,
      approved: 0,
      rejected: 0,
      submitted: 0,
      draft: 0
    }
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH ANALYTICS
  // =========================

  const fetchAnalytics = async () => {

    setLoading(true);

    try {

      const res = await apiFetch("/admin/analytics");

      setData({
        applications_by_day: Array.isArray(res?.applications_by_day)
          ? res.applications_by_day
          : [],

        status_distribution: Array.isArray(res?.status_distribution)
          ? res.status_distribution
          : [],

        revenue: Array.isArray(res?.revenue)
          ? res.revenue
          : [],

        stats: {
          total: res?.stats?.total ?? 0,
          approved: res?.stats?.approved ?? 0,
          rejected: res?.stats?.rejected ?? 0,
          submitted: res?.stats?.submitted ?? 0,
          draft: res?.stats?.draft ?? 0
        }
      });

    } catch (err) {

      console.error("fetchAnalytics error:", err);

      toast.error(
        err?.message || "Erreur lors du chargement des analytics"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =========================
  // PRÉPARATION DES STATUTS
  // =========================

  const statusData = data.status_distribution.map((item) => ({
    ...item,

    // Le backend conserve le code technique :
    // "paid", "cancelled", "processing", etc.
    //
    // STATUS fournit le libellé affiché :
    // "Payé", "Annulé", "Pris en charge", etc.
    displayName: STATUS[item.name]?.label || item.name
  }));

  return (

    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Statistiques
          </h2>

          <p className="text-muted mb-0">
            Performance globale du système
          </p>

        </div>

        <button
          type="button"
          className="btn btn-light border rounded-pill"
          onClick={fetchAnalytics}
          disabled={loading}
        >

          {loading ? (

            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />

              Actualisation...
            </>

          ) : (

            <>
              <i className="bi bi-arrow-clockwise me-2" />
              Actualiser
            </>

          )}

        </button>

      </div>

      {/* =========================
          STATISTIQUES
      ========================= */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-md">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Total dossiers
              </div>

              <div className="fs-3 fw-bold">
                {data.stats.total}
              </div>

            </div>

          </div>

        </div>

        {/* SOUMIS */}

        <div className="col-md">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Soumis
              </div>

              <div className={`fs-3 fw-bold text-${STATUS.submitted.color}`}>
                {data.stats.submitted}
              </div>

            </div>

          </div>

        </div>

        {/* VALIDÉS */}

        <div className="col-md">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Validés
              </div>

              <div className={`fs-3 fw-bold text-${STATUS.approved.color}`}>
                {data.stats.approved}
              </div>

            </div>

          </div>

        </div>

        {/* REFUSÉS */}

        <div className="col-md">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Refusés
              </div>

              <div className={`fs-3 fw-bold text-${STATUS.rejected.color}`}>
                {data.stats.rejected}
              </div>

            </div>

          </div>

        </div>

        {/* BROUILLONS */}

        <div className="col-md">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Brouillons
              </div>

              <div className={`fs-3 fw-bold text-${STATUS.draft.color}`}>
                {data.stats.draft}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================
          GRAPHIQUES
      ========================= */}

      <div className="row g-4">

        {/* =========================
            DOSSIERS CRÉÉS
        ========================= */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Dossiers créés
            </h5>

            {data.applications_by_day.length === 0 ? (

              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>

            ) : (

              <ResponsiveContainer width="100%" height={300}>

                <LineChart data={data.applications_by_day}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    dot
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* =========================
            RÉPARTITION DES STATUTS
        ========================= */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Statuts des dossiers
            </h5>

            {statusData.length === 0 ? (

              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>

            ) : (

              <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="displayName"
                    outerRadius={100}
                    label
                  >

                    {statusData.map((item, index) => (

                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* =========================
            REVENUS
        ========================= */}

        <div className="col-lg-12">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Revenus estimés / mois
            </h5>

            {data.revenue.length === 0 ? (

              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>

            ) : (

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={data.revenue}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="amount"
                    fill="#198754"
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}
