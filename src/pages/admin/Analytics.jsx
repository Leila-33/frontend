import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  Cell,
} from "recharts";

import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

import {
  formatChartDate,
  formatMonth,
} from "../../utils/dateUtils";

import {
  APPLICATION_STATUSES,
} from "../../constants/applicationOptions";

import {
  ADMIN_ANALYTICS_STAT_CARDS,
  ANALYTICS_CHART_COLORS,
} from "../../constants/analyticsOptions";

// ==========================================================
// DONNÉES PAR DÉFAUT
// ==========================================================

const DEFAULT_ANALYTICS_DATA = {
  applications_by_day: [],
  status_distribution: [],
  revenue: [],
  stats: {
    total: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    draft: 0,
  },
};

// ==========================================================
// CARTE DE STATISTIQUE
// ==========================================================

/**
 * Affiche une statistique sous forme de carte.
 *
 * Le composant reste local à AdminAnalytics car il est
 * uniquement utilisé dans cette page et ne contient
 * aucune logique métier réutilisable.
 */
function StatCard({
  title,
  value,
  color = "dark",
}) {
  return (
    <div className="col-6 col-md">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body">
          <div className="text-muted small">
            {title}
          </div>

          <div
            className={`fs-3 fw-bold text-${color}`}
          >
            {value ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// NORMALISATION DES DONNÉES
// ==========================================================

/**
 * Sécurise les données reçues de l'API afin que le
 * composant puisse toujours travailler avec une structure
 * prévisible.
 */
const normalizeAnalyticsData = (response) => {
  const stats = response?.stats ?? {};

  return {
    applications_by_day: Array.isArray(
      response?.applications_by_day
    )
      ? response.applications_by_day
      : [],

    status_distribution: Array.isArray(
      response?.status_distribution
    )
      ? response.status_distribution
      : [],

    revenue: Array.isArray(response?.revenue)
      ? response.revenue
      : [],

    stats: {
      total: stats.total ?? 0,
      approved: stats.active ?? 0,
      rejected: stats.rejected ?? 0,
      submitted: stats.submitted ?? 0,
      draft: stats.draft ?? 0,
    },
  };
};

// ==========================================================
// COMPOSANT
// ==========================================================

export default function AdminAnalytics() {
  const [data, setData] = useState(
    DEFAULT_ANALYTICS_DATA
  );

  const [loading, setLoading] = useState(true);

  // ========================================================
  // CHARGEMENT DES ANALYTICS
  // ========================================================

  /**
   * Récupère les statistiques et données nécessaires
   * à l'affichage du dashboard analytics.
   */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch(
        "/admin/analytics"
      );

      setData(
        normalizeAnalyticsData(response)
      );
    } catch (error) {
      console.error(
        "fetchAnalytics error:",
        error
      );

      toast.error(
        error?.message ??
          "Erreur lors du chargement des statistiques"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // CHARGEMENT INITIAL
  // ========================================================

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ========================================================
  // PRÉPARATION DES STATUTS
  // ========================================================

  /**
   * Transforme les codes techniques renvoyés par
   * le backend en données directement exploitables
   * par le graphique circulaire.
   *
   * Exemple :
   * "processing" → "Pris en charge"
   * "approved"   → "Validé"
   */
  const statusData =
    data.status_distribution.map((item) => ({
      ...item,

      displayName:
        APPLICATION_STATUSES[item.name]?.label ??
        item.name,
    }));

  // ========================================================
  // RENDU
  // ========================================================

  return (
    <div className="container py-4">

      {/* ====================================================
          HEADER
      ==================================================== */}

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
              <i
                className="bi bi-arrow-clockwise me-2"
                aria-hidden="true"
              />

              Actualiser
            </>
          )}
        </button>

      </div>

      {/* ====================================================
          STATISTIQUES
      ==================================================== */}

      <div className="row g-3 mb-4">

        {ADMIN_ANALYTICS_STAT_CARDS.map(
          (stat) => {

            // Les statuts utilisent directement
            // la configuration centralisée de
            // applicationOptions.js.
            const color = stat.status
              ? APPLICATION_STATUSES[
                  stat.status
                ]?.color
              : stat.color;

            return (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={data.stats[stat.key]}
                color={color}
              />
            );
          }
        )}

      </div>

      {/* ====================================================
          GRAPHIQUES
      ==================================================== */}

      <div className="row g-4">

        {/* ==================================================
            DOSSIERS CRÉÉS
        ================================================== */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">

            <h5 className="fw-semibold mb-3">
              Dossiers créés
            </h5>

            {data.applications_by_day.length === 0 ? (
              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={
                    data.applications_by_day
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={
                      formatChartDate
                    }
                  />

                  <YAxis
                    allowDecimals={false}
                  />

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

        {/* ==================================================
            RÉPARTITION DES STATUTS
        ================================================== */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">

            <h5 className="fw-semibold mb-3">
              Statuts des dossiers
            </h5>

            {statusData.length === 0 ? (
              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="displayName"
                    outerRadius={100}
                    label
                  >
                    {statusData.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            ANALYTICS_CHART_COLORS[
                              index %
                                ANALYTICS_CHART_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* ==================================================
            REVENUS
        ================================================== */}

        <div className="col-12">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Revenus estimés / mois
            </h5>

            {data.revenue.length === 0 ? (
              <div className="text-muted text-center py-5">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={data.revenue}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                    tickFormatter={
                      formatMonth
                    }
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