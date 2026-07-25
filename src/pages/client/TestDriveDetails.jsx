import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";

export default function TestDriveDetails() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [testDrive, setTestDrive] = useState(null);

  // =========================
  // FETCH
  // =========================
  const fetchDetails = async () => {

    try {

      const data = await apiFetch(
        `/test-drives/${id}`,
        {
          method: "GET",
        }
      );

      setTestDrive(data);

    } catch (err) {

      toast.error(
        "Impossible de charger l’essai routier"
      );

      navigate("/mytestdrives");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);
const cancelTestDrive = async () => {

  try {

    await apiFetch(`/test-drives/${id}/cancel`, {
      method: "POST"
    });

    toast.success("Essai routier annulé avec succès");
    fetchDetails();


  } catch (err) {

    toast.error("Erreur dans l'annulation");
  }
};

  // =========================
  // STATUS UI
  // =========================
  const statusConfig = {

    pending: {
      label: "En attente",
      class: "bg-warning text-dark",
      progress: 25
    },

    confirmed: {
      label: "Confirmé",
      class: "bg-primary",
      progress: 60
    },

    completed: {
      label: "Terminé",
      class: "bg-success",
      progress: 100
    },

    cancelled: {
      label: "Annulé",
      class: "bg-danger",
      progress: 0
    },

    rejected: {
      label: "Refusé",
      class: "bg-danger",
      progress: 0
    }
  };

  // =========================
  // EVENT ICONS
  // =========================
  const eventIcons = {

    TEST_DRIVE_CREATED: "📝",

    TEST_DRIVE_CONFIRMED: "✅",

    TEST_DRIVE_REJECTED: "❌",

    TEST_DRIVE_CANCELLED: "⚠️",

    TEST_DRIVE_COMPLETED: "🏁",
  };

  if (!testDrive) return null;

  const status =
    statusConfig[testDrive.status];

  return (

    <div className="container py-4">

      {/* =========================
          BACK
      ========================= */}
      <button
        className="btn btn-light mb-4"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>

      <div className="row g-4">

        {/* =========================
            LEFT SIDE
        ========================= */}
        <div className="col-lg-8">

          {/* VEHICLE CARD */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {/* IMAGE */}
            <div
              className="d-flex align-items-center justify-content-center bg-light"
              style={{
                height: "320px",
                backgroundImage: testDrive.vehicle.images?.[0]
                  ? `url(${testDrive.vehicle.images[0]})`
                  : "none",

                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >

              {!testDrive.vehicle.images?.[0] && (

                <div className="text-center">

                  <div
                    style={{
                      fontSize: "64px"
                    }}
                  >
                    🚗
                  </div>

                  <div className="text-muted fw-semibold">
                    Aucune image disponible
                  </div>

                </div>

              )}

            </div>

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start mb-3">

                <div>

                  <h2 className="fw-bold mb-1">
                    {testDrive.vehicle.brand}{" "}
                    {testDrive.vehicle.model}
                  </h2>

                  <p className="text-muted mb-0">
                    Essai routier premium
                  </p>

                </div>

                <span className={`badge ${status.class} px-3 py-2`}>
                  {status.label}
                </span>

              </div>

              {/* DATE */}
              <div className="mb-4">

                <small className="text-muted d-block">
                  Date du rendez-vous
                </small>

                <div className="fw-semibold fs-5">

                  {new Date(
                    testDrive.appointment_date
                  ).toLocaleString()}

                </div>

              </div>

              {/* COMMENT */}
              {testDrive.comment && (

                <div className="mb-4">

                  <small className="text-muted d-block mb-1">
                    Commentaire
                  </small>

                  <div className="bg-light rounded-3 p-3">
                    {testDrive.comment}
                  </div>

                </div>

              )}

              {/* PROGRESS */}
              <div>

                <div className="d-flex justify-content-between mb-2">

                  <small className="text-muted">
                    Progression
                  </small>

                  <small className="fw-semibold">
                    {status.progress}%
                  </small>

                </div>

                <div
                  className="progress"
                  style={{ height: "8px" }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${status.progress}%`
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

          {/* =========================
              TIMELINE
          ========================= */}
          <div className="card border-0 shadow-sm rounded-4 mt-4">

            <div className="card-body p-4">

              <h4 className="fw-bold mb-4">
                Timeline
              </h4>

              <div className="position-relative">

                {/* LINE */}
                <div
                  style={{
                    position: "absolute",
                    left: "18px",
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    background: "#e9ecef"
                  }}
                />

                {testDrive.timeline.map((event, index) => (

                  <div
                    key={index}
                    className="d-flex mb-4 position-relative"
                  >

                    {/* ICON */}
                    <div
                      className="rounded-circle bg-white border shadow-sm d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                        zIndex: 2,
                        fontSize: "18px"
                      }}
                    >
                      {eventIcons[event.type] || "📌"}
                    </div>

                    {/* CONTENT */}
                    <div className="ms-3 flex-grow-1">

                      <div className="fw-semibold">
                        {event.message}
                      </div>

                      <small className="text-muted">
                        {new Date(
                          event.date
                        ).toLocaleString()}
                      </small>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}
        <div className="col-lg-4">

          {/* USER CARD */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Informations conducteur
              </h5>

              <div className="mb-3">

                <small className="text-muted d-block">
                  Nom
                </small>

                <div className="fw-semibold">
                  {testDrive.user.name}
                </div>

              </div>

              <div>

                <small className="text-muted d-block">
                  Email
                </small>

                <div className="fw-semibold">
                  {testDrive.user.email}
                </div>

              </div>

            </div>

          </div>

          {/* ACTIONS */}
          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Actions
              </h5>

              {/* CALENDAR */}
              {/* ADD TO CALENDAR */}
              {testDrive.status === "confirmed" && (

                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={() => {

                    const startDate = new Date(
                      testDrive.appointment_date
                    );

                    // +1h duration
                    const endDate = new Date(
                      startDate.getTime() + 60 * 60 * 1000
                    );

                    // GOOGLE FORMAT
                    const formatGoogleDate = (date) =>
                      date
                        .toISOString()
                        .replace(/-|:|\.\d+/g, "");

                    const calendarUrl =
                      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                      `&text=Essai+routier+-+${encodeURIComponent(
                        `${testDrive.vehicle.brand} ${testDrive.vehicle.model}`
                      )}` +
                      `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}` +
                      `&details=${encodeURIComponent(
                        `Essai routier avec ${testDrive.vehicle.brand} ${testDrive.vehicle.model}`
                      )}` +
                      `&location=${encodeURIComponent("Mmotors")}`;

                    window.open(calendarUrl, "_blank");
                  }}
                >
                  Ajouter au calendrier
                </button>

              )}

              {/* CONTACT SUPPORT */}
              <button
                className="btn btn-outline-dark w-100 mb-2"
                onClick={() => {

                  const subject = encodeURIComponent(
                    `Support essai routier ${testDrive.id}`
                  );

                  const body = encodeURIComponent(
                    `Bonjour,\n\nJ’ai une question concernant mon essai routier du ${new Date(
                      testDrive.appointment_date
                    ).toLocaleString()}.\n\nMerci.`
                  );

                  window.location.href =
                    `mailto:support@mmotors.com?subject=${subject}&body=${body}`;
                }}
              >
                Contacter le support
              </button>

              {/* CANCEL */}
              {testDrive.status === "pending" && (

                <button className="btn btn-outline-danger w-100"  onClick={cancelTestDrive}>
                  Annuler la demande
                </button>



              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}