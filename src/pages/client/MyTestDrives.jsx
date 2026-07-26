import { useEffect, useState, useMemo } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { testDriveStatusConfig } from "../../utils/status";


export default function MyTestDrives() {
  const [testDrives, setTestDrives] = useState([]);
  const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("all");


const statusCounts = useMemo(() => {

  return testDrives.reduce(
    (acc, td) => {

      acc[td.status] =
        (acc[td.status] || 0) + 1;

      return acc;

    },
    {}
  );

}, [testDrives]);

const tabs = [
  { key: "all", label: "Tous" },
  { key: "pending", label: `En attente (${statusCounts.pending || 0})`},
  { key: "confirmed", label: `Confirmé (${statusCounts.confirmed || 0})` },
  { key: "completed", label: `Terminé (${statusCounts.completed || 0})` },
  { key: "cancelled", label: `Annulé (${statusCounts.cancelled || 0})` },
];

const filteredTestDrives = useMemo(() => {

  const filtered =
    activeTab === "all"
      ? [...testDrives]
      : testDrives.filter(
          (td) => td.status === activeTab
        );

  return filtered.sort(
    (a, b) =>
      new Date(b.appointment_date) -
      new Date(a.appointment_date)
  );

}, [testDrives, activeTab]);
  // =========================
  // FETCH
  // =========================
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await apiFetch("/test-drives/me", {
        method: "GET",
      });

      setTestDrives(data);
    } catch (err) {
      toast.error("Erreur chargement des essais routiers");
    }
  };

  fetchData();
}, []);



  const steps = ["Demandé", "Confirmé", "Terminé"];
const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffDays = Math.floor(
    (date - now) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (diffDays === 1) {
    return "Demain";
  }

  if (diffDays > 1) {
    return `Dans ${diffDays} jours`;
  }

  if (diffDays === -1) {
    return "Hier";
  }

  return `Il y a ${Math.abs(diffDays)} jours`;
};
  // =========================
  // UI
  // =========================
  return (
  <div className="container py-4">

    {/* HEADER */}
    <div className="mb-4">
      <h2 className="fw-bold">
        Mes essais routiers
      </h2>

      <p className="text-muted">
        Suivez vos demandes et vos rendez-vous
      </p>
    </div>


    {/* TABS */}
    <div className="mb-4">

      <div className="btn-group flex-wrap">

        {tabs.map((tab) => (

          <button
            key={tab.key}
            className={`btn ${
              activeTab === tab.key
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>

        ))}

      </div>

    </div>



    {/* EMPTY STATE */}
    {filteredTestDrives.length === 0 ? (

      <div className="text-center py-5">

        <h5>
          Aucun essai routier
        </h5>

        <p className="text-muted">
          Vous n'avez aucune demande pour le moment.
        </p>

      </div>


    ) : (


      /* LIST */

      <div className="row g-3">

        {filteredTestDrives.map((td) => {

const status = testDriveStatusConfig[td.status] || testDriveStatusConfig.pending;

          const progress =
            status.step < 0
              ? 0
              : (
                  status.step /
                  (steps.length - 1)
                ) * 100;

          return (

            <div
              className="col-md-6 col-lg-4"
              key={td.id}
            >

              <div className="
                card
                shadow-sm
                border-0
                rounded-4
                h-100
              ">


                {/* BODY */}

                <div className="card-body">


                  <div className="
                    d-flex
                    justify-content-between
                    align-items-start
                  ">


                    <div>

                      <h5 className="fw-bold mb-1">
                        {td.vehicle_name}
                      </h5>


                      <small className="text-muted">

                        {
                          [
                            "completed",
                            "cancelled",
                            "rejected"
                          ].includes(td.status)

                          ?

                          new Date(
                            td.appointment_date
                          ).toLocaleDateString(
                            "fr-FR"
                          )

                          :

                          formatAppointmentDate(
                            td.appointment_date
                          )
                        }

                      </small>


                    </div>



                    <span
                      className={`badge ${status.className}`}
                    >
                      {status.label}
                    </span>


                  </div>



                  {/* PROGRESS */}

                  <div className="mt-3">


                    <div className="
                      d-flex
                      justify-content-between
                      small
                      text-muted
                      mb-1
                    ">

                      {steps.map((s,i)=>(

                        <span key={i}>
                          {s}
                        </span>

                      ))}

                    </div>



                    <div
                      className="progress"
                      style={{
                        height:"6px"
                      }}
                    >

                      <div
                        className="progress-bar"
                        style={{
                          width:`${progress}%`
                        }}
                      />

                    </div>


                  </div>



                  {/* COMMENT */}

                  {td.comment && (

                    <div className="mt-3">

                      <small className="text-muted">
                        “{td.comment}”
                      </small>

                    </div>

                  )}


                </div>



                {/* FOOTER ACTION */}

                <div className="
                  card-footer
                  bg-white
                  border-0
                  px-3
                  pb-3
                ">

                  <button
                    className="
                      btn
                      btn-outline-primary
                      w-100
                    "
                    onClick={() =>
                      navigate(
                        `/test-drives/${td.id}`
                      )
                    }
                  >
                    Voir les détails
                  </button>


                </div>


              </div>


            </div>

          );

        })}


      </div>


    )}


  </div>
);}