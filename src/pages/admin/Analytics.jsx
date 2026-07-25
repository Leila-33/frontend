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

export default function AdminAnalytics() {


  const [data, setData] = useState({
    applications_by_day: [],
    status_distribution: [],
    conversion: [],
    revenue: []
  });

  // =========================
  // FETCH ANALYTICS
  // =========================
  const fetchAnalytics = async () => {

    try {

      const res = await apiFetch("/admin/analytics", {
      });

      setData(res);

    } catch (err) {
      console.error(err);
      toast.error("Erreur analytics");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =========================
  // COLORS PIE CHART
  // =========================
  const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6c757d"];

  return (

    <div className="container py-4">

      {/* HEADER */}
      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          Analytics Dashboard
        </h2>

        <p className="text-muted">
          Performance globale du système
        </p>

      </div>

      {/* GRID */}
      <div className="row g-4">

        {/* LINE CHART */}
        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Dossiers créés (30 jours)
            </h5>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={data.applications_by_day}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0d6efd"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* PIE CHART */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Statuts des dossiers
            </h5>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={data.status_distribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {data.status_distribution.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* BAR CHART */}
        <div className="col-lg-12">

          <div className="card border-0 shadow-sm rounded-4 p-3">

            <h5 className="fw-semibold mb-3">
              Revenus estimés / mois
            </h5>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={data.revenue}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="amount" fill="#198754" />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>

  );
}