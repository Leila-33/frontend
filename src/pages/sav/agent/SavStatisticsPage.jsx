import { useEffect, useState } from "react";
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

export default function SavStatisticsPage() {
const COLORS = [
  "#0d6efd",
  "#198754",
  "#dc3545",
  "#ffc107",
  "#6f42c1",
  "#20c997",
  "#fd7e14",
];
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {

     try {

      const res = await apiFetch("/agent/support-tickets/statistics");

      setData(res);

    } catch (err) {
      toast.error(err.message);
    }
    };

    fetchStats();
  }, []);
const chartData = data.category_distribution.map(item => ({
  name: item.category,
  value: item.count,
}));
  if (!data) return <div>Chargement...</div>;

  return (
    <div className="container-fluid">

      <h2 className="mb-4 fw-bold">Statistiques SAV</h2>

      {/* ===================== */}
      {/* KPI SIMPLE */}
      {/* ===================== */}
      <div className="row g-3">

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <div>Total tickets</div>
            <h3>{data.total}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <div>Tickets fermés</div>
            <h3>{data.closed}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <div>7 derniers jours</div>
            <h3>{data.last_7_days}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <div>Taux de résolution</div>
            <h3>{data.resolution_rate}%</h3>
          </div>
        </div>

      </div>

      {/* ===================== */}
      {/* CATEGORY DISTRIBUTION */}
      {/* ===================== */}
      <div className="mt-4">
        <div className="mt-4">
  <div className="card shadow-sm">

    <div className="card-header bg-white">
      <h5 className="mb-0">
        Répartition des tickets par catégorie
      </h5>
    </div>

    <div
      className="card-body"
      style={{ height: 350 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>
    </div>

  </div>
</div>
      </div>

    </div>
  );
}