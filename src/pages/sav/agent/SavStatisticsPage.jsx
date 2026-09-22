import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import apiFetch from "../../../services/apiFetch";


// =====================================================
// COULEURS DU GRAPHIQUE
// =====================================================

/**
 * Couleurs utilisées successivement pour les différentes
 * catégories affichées dans le graphique.
 *
 * Le modulo permet de réutiliser les couleurs si le nombre
 * de catégories dépasse le nombre de couleurs disponibles.
 */
const CHART_COLORS = [
  "#0d6efd",
  "#198754",
  "#dc3545",
  "#ffc107",
  "#6f42c1",
  "#20c997",
  "#fd7e14",
];


// =====================================================
// LIBELLÉS DES CATÉGORIES
// =====================================================

/**
 * Correspondance entre les valeurs techniques utilisées
 * par le backend et les libellés affichés à l'utilisateur.
 */
const CATEGORY_LABELS = {
  GENERAL: "Général",
  FINANCING: "Financement",
  DELIVERY: "Livraison",
  WARRANTY: "Garantie",
  VEHICLE_ISSUE: "Problème véhicule",
  DOCUMENTS: "Documents",
  PAYMENT: "Paiement",
  OTHER: "Autre",
};


export default function SavStatisticsPage() {

  // =====================================================
  // ÉTAT DES STATISTIQUES
  // =====================================================

  /**
   * Contient les statistiques retournées par l'API.
   *
   * null signifie que les données n'ont pas encore
   * été chargées.
   */
  const [data, setData] = useState(null);


  // =====================================================
  // ÉTAT DE CHARGEMENT
  // =====================================================

  /**
   * Permet de différencier le chargement initial
   * d'un dashboard déjà chargé.
   */
  const [loading, setLoading] = useState(true);


  // =====================================================
  // CHARGEMENT DES STATISTIQUES
  // =====================================================

  /**
   * Récupère les statistiques globales du SAV.
   *
   * Les données sont fournies par le backend :
   *
   * - total des tickets ;
   * - tickets fermés ;
   * - tickets créés sur les 7 derniers jours ;
   * - tickets créés sur les 30 derniers jours ;
   * - taux de résolution ;
   * - répartition par catégorie.
   */
  const fetchStats = useCallback(async () => {

    try {

      setLoading(true);

      const response = await apiFetch(
        "/agent/support-tickets/statistics"
      );

      setData(response);

    } catch (err) {

      console.error(
        "Erreur lors du chargement des statistiques SAV :",
        err
      );

      toast.error(
        err?.message ||
        "Impossible de charger les statistiques SAV."
      );

    } finally {

      setLoading(false);
    }

  }, []);


  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  /**
   * Charge les statistiques lorsque la page
   * est affichée pour la première fois.
   */
  useEffect(() => {

    fetchStats();

  }, [fetchStats]);


  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading && !data) {

    return (
      <div
        className="text-center py-5 text-muted"
        aria-live="polite"
      >
        <span
          className="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        />

        Chargement des statistiques...
      </div>
    );
  }


  // =====================================================
  // DONNÉES PAR DÉFAUT
  // =====================================================

  /**
   * On utilise des valeurs par défaut afin d'éviter
   * l'affichage de "undefined" si une propriété n'est
   * pas présente dans la réponse du backend.
   */
  const statistics = {

    total: data?.total ?? 0,

    closed: data?.closed ?? 0,

    last_7_days: data?.last_7_days ?? 0,

    last_30_days: data?.last_30_days ?? 0,

    resolution_rate: data?.resolution_rate ?? 0,

    category_distribution:
      data?.category_distribution ?? [],
  };


  // =====================================================
  // DONNÉES DU GRAPHIQUE
  // =====================================================

  /**
   * Transforme les données du backend dans le format
   * attendu par Recharts.
   *
   * Exemple backend :
   *
   * {
   *   category: "FINANCING",
   *   count: 12
   * }
   *
   * devient :
   *
   * {
   *   name: "Financement",
   *   value: 12
   * }
   */
  const chartData =
    statistics.category_distribution.map(
      (item) => ({

        name:
          CATEGORY_LABELS[item.category]
          || item.category,

        value: item.count ?? 0,
      })
    );


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (

    <div className="container-fluid">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          Statistiques SAV
        </h2>

        <p className="text-muted mb-0">
          Suivi de l'activité et des performances du support client
        </p>

      </div>


      {/* =================================================
          INDICATEURS PRINCIPAUX
      ================================================= */}

      <div className="row g-3">

        {/* -------------------------------------------------
            TOTAL
        ------------------------------------------------- */}

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <span className="text-muted small">
                Total tickets
              </span>

              <h3 className="fw-bold mb-0 mt-1">
                {statistics.total}
              </h3>

            </div>

          </div>

        </div>


        {/* -------------------------------------------------
            TICKETS FERMÉS
        ------------------------------------------------- */}

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <span className="text-muted small">
                Tickets fermés
              </span>

              <h3 className="fw-bold mb-0 mt-1">
                {statistics.closed}
              </h3>

            </div>

          </div>

        </div>


        {/* -------------------------------------------------
            7 DERNIERS JOURS
        ------------------------------------------------- */}

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <span className="text-muted small">
                7 derniers jours
              </span>

              <h3 className="fw-bold mb-0 mt-1">
                {statistics.last_7_days}
              </h3>

            </div>

          </div>

        </div>


        {/* -------------------------------------------------
            TAUX DE RÉSOLUTION
        ------------------------------------------------- */}

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <span className="text-muted small">
                Taux de résolution
              </span>

              <h3 className="fw-bold mb-0 mt-1">
                {statistics.resolution_rate}%
              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ACTIVITÉ DES 30 DERNIERS JOURS
      ================================================= */}

      <div className="row g-3 mt-0">

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <span className="text-muted small">
                30 derniers jours
              </span>

              <h3 className="fw-bold mb-0 mt-1">
                {statistics.last_30_days}
              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RÉPARTITION PAR CATÉGORIE
      ================================================= */}

      <div className="card shadow-sm border-0 mt-4">

        {/* -------------------------------------------------
            EN-TÊTE
        ------------------------------------------------- */}

        <div className="card-header bg-white">

          <h5 className="mb-0 fw-semibold">
            Répartition des tickets par catégorie
          </h5>

        </div>


        {/* -------------------------------------------------
            GRAPHIQUE
        ------------------------------------------------- */}

        <div
          className="card-body"
          style={{
            height: 350,
          }}
        >

          {chartData.length === 0 ? (

            <div
              className="h-100 d-flex align-items-center justify-content-center text-muted"
            >
              Aucune donnée disponible.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >

                  {chartData.map(
                    (entry, index) => (

                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            index % CHART_COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>


                {/* -------------------------------------------------
                    INFOS AU SURVOL
                ------------------------------------------------- */}

                <Tooltip />


                {/* -------------------------------------------------
                    LÉGENDE
                ------------------------------------------------- */}

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

    </div>
  );
}