import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";

/**
 * Tableau de bord commercial.
 *
 * Responsabilités :
 * - récupérer les statistiques commerciales ;
 * - afficher les principaux indicateurs (KPI) ;
 * - afficher les performances commerciales ;
 * - proposer les principales actions de navigation.
 *
 * Les données métier proviennent du backend.
 * Le composant est uniquement responsable de leur affichage.
 */
export default function SalesDashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // CONFIGURATION DES KPI
  // =====================================================

  /**
   * Configuration des indicateurs affichés dans
   * la première partie du tableau de bord.
   *
   * Les valeurs sont récupérées dynamiquement depuis
   * l'objet `stats` retourné par l'API.
   */
  const kpis = [
    {
      key: "new_leads",
      label: "Nouveaux leads",
      icon: "bi-person-plus",
    },

    {
      key: "my_leads",
      label: "Mes leads",
      icon: "bi-people",
    },

    {
      key: "quotes_sent",
      label: "Devis envoyés",
      icon: "bi-file-earmark-text",
    },

    {
      key: "applications",
      label: "Applications",
      icon: "bi-folder-check",
    },
  ];

  // =====================================================
  // FETCH STATISTIQUES
  // =====================================================

  /**
   * Récupère les statistiques du tableau de bord commercial.
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch(
        "/agent/leads/stats",
        {
          method: "GET",
        }
      );

      setStats(data);
    } catch (error) {
      toast.error(
        error?.message ||
        "Erreur lors du chargement du tableau de bord."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIALISATION
  // =====================================================

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="container py-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          d-flex
          flex-column
          flex-md-row
          justify-content-between
          align-items-md-center
          gap-3
          mb-4
        "
      >
        <div>
          <h1 className="h3 fw-bold mb-1">
            Tableau de bord commercial
          </h1>

          <p className="text-muted mb-0">
            Vue globale de votre activité commerciale.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="
                  spinner-border
                  spinner-border-sm
                  me-2
                "
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

      {/* =================================================
          KPI
      ================================================= */}

      <section
        aria-labelledby="sales-kpi-title"
        className="mb-4"
      >
        <h2
          id="sales-kpi-title"
          className="visually-hidden"
        >
          Indicateurs commerciaux
        </h2>

        <div className="row g-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.key}
              className="col-12 col-sm-6 col-xl-3"
            >
              <div
                className="
                  bg-white
                  border
                  rounded-4
                  p-3
                  shadow-sm
                  h-100
                "
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small mb-1">
                      {kpi.label}
                    </div>

                    <div className="fs-3 fw-bold">
                      {loading
                        ? "—"
                        : stats?.[kpi.key] ?? 0}
                    </div>
                  </div>

                  <i
                    className={`bi ${kpi.icon} fs-4 text-muted`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================
          CONTENU
      ================================================= */}

      <div className="row g-3">

        {/* =================================================
            ACTIONS RAPIDES
        ================================================= */}

        <div className="col-12 col-lg-6">
          <section
            className="
              bg-white
              border
              rounded-4
              p-4
              h-100
            "
            aria-labelledby="quick-actions-title"
          >
            <h2
              id="quick-actions-title"
              className="h5 fw-bold mb-3"
            >
              Actions rapides
            </h2>

            <div className="d-grid gap-2">

              <Link
                to="/sales/leads"
                className="btn btn-dark"
              >
                <i
                  className="bi bi-people me-2"
                  aria-hidden="true"
                />
                Voir tous les leads
              </Link>

              <Link
                to="/sales/my-leads"
                className="btn btn-outline-dark"
              >
                <i
                  className="bi bi-person-check me-2"
                  aria-hidden="true"
                />
                Mes leads
              </Link>

              <Link
                to="/sales/quotes"
                className="btn btn-outline-primary"
              >
                <i
                  className="bi bi-file-earmark-text me-2"
                  aria-hidden="true"
                />
                Devis
              </Link>

            </div>
          </section>
        </div>

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <div className="col-12 col-lg-6">
          <section
            className="
              bg-white
              border
              rounded-4
              p-4
              h-100
            "
            aria-labelledby="performance-title"
          >
            <h2
              id="performance-title"
              className="h5 fw-bold mb-3"
            >
              Performance
            </h2>

            {loading ? (
              <div
                className="text-muted"
                role="status"
                aria-live="polite"
              >
                <span
                  className="
                    spinner-border
                    spinner-border-sm
                    me-2
                  "
                  aria-hidden="true"
                />

                Chargement des performances...
              </div>
            ) : stats ? (
              <dl className="row mb-0">

                <dt className="col-8 fw-normal text-muted">
                  Leads convertis
                </dt>

                <dd className="col-4 text-end fw-semibold mb-3">
                  {stats.conversion_rate ?? 0}%
                </dd>

                <dt className="col-8 fw-normal text-muted">
                  Leads non assignés
                </dt>

                <dd className="col-4 text-end fw-semibold mb-3">
                  {stats.unassigned ?? 0}
                </dd>

                <dt className="col-8 fw-normal text-muted">
                  Deals gagnés
                </dt>

                <dd className="col-4 text-end fw-semibold mb-3">
                  {stats.won ?? 0}
                </dd>

                <dt className="col-8 fw-normal text-muted">
                  Deals perdus
                </dt>

                <dd className="col-4 text-end fw-semibold mb-0">
                  {stats.lost ?? 0}
                </dd>

              </dl>
            ) : (
              <p className="text-muted mb-0">
                Les statistiques sont indisponibles.
              </p>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}