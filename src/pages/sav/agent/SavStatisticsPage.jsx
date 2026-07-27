import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../../services/apiFetch";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";



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


  const [data, setData] = useState(null);


  useEffect(() => {

    const fetchStats = async () => {

      try {

        const res = await apiFetch(
          "/agent/support-tickets/statistics"
        );

        setData(res);

      } catch (err) {

        toast.error(err.message);

      }
    };


    fetchStats();

  }, []);



  if (!data) {
    return (
      <div className="text-center py-5 text-muted">
        Chargement...
      </div>
    );
  }



  const chartData = (
    data.category_distribution ?? []
  ).map(item => ({
    name:
      CATEGORY_LABELS[item.category]
      || item.category,

    value: item.count,
  }));



  return (

    <div className="container-fluid">


      <h2 className="mb-4 fw-bold">
        Statistiques SAV
      </h2>



      {/* KPI */}

      <div className="row g-3">


        <div className="col-md-3">
          <div className="card shadow-sm p-3">

            <span>Total tickets</span>

            <h3>
              {data.total}
            </h3>

          </div>
        </div>



        <div className="col-md-3">
          <div className="card shadow-sm p-3">

            <span>Tickets fermés</span>

            <h3>
              {data.closed}
            </h3>

          </div>
        </div>



        <div className="col-md-3">
          <div className="card shadow-sm p-3">

            <span>7 derniers jours</span>

            <h3>
              {data.last_7_days}
            </h3>

          </div>
        </div>



        <div className="col-md-3">
          <div className="card shadow-sm p-3">

            <span>Taux de résolution</span>

            <h3>
              {data.resolution_rate}%
            </h3>

          </div>
        </div>


      </div>



      {/* DERNIERS 30 JOURS */}

      <div className="row mt-3">

        <div className="col-md-3">

          <div className="card shadow-sm p-3">

            <span>30 derniers jours</span>

            <h3>
              {data.last_30_days}
            </h3>

          </div>

        </div>

      </div>




      {/* PIE CHART */}

      <div className="card shadow-sm mt-4">


        <div className="card-header bg-white">

          <h5 className="mb-0">
            Répartition des tickets par catégorie
          </h5>

        </div>



        <div
          className="card-body"
          style={{
            height:350
          }}
        >

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

                {
                  chartData.map(
                    (entry,index)=>(
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    )
                  )
                }

              </Pie>


              <Tooltip />

              <Legend />


            </PieChart>


          </ResponsiveContainer>


        </div>


      </div>


    </div>

  );
}