import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import DetailLayout from "../../layouts/DetailLayout";
import { testDriveStatusConfig } from "../../utils/status";

const eventIcons = {

  TEST_DRIVE_CREATED: "bi bi-calendar-plus",

  TEST_DRIVE_CONFIRMED: "bi bi-check-circle-fill",

  TEST_DRIVE_REJECTED: "bi bi-x-circle-fill",

  TEST_DRIVE_CANCELLED: "bi bi-calendar-x-fill",

  TEST_DRIVE_COMPLETED: "bi bi-flag-fill",

};

export default function TestDriveDetailsClient() {

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

const addToCalendar = () => {

 const startDate = new Date(
   testDrive.appointment_date
 );

 const endDate = new Date(
   startDate.getTime() + 60 * 60 * 1000
 );


 const formatGoogleDate = (date)=>
   date
   .toISOString()
   .replace(/-|:|\.\d+/g,"");


 const url =
 `https://calendar.google.com/calendar/render?action=TEMPLATE`
 +
 `&text=${encodeURIComponent(
   `Essai routier ${testDrive.vehicle.brand} ${testDrive.vehicle.model}`
 )}`
 +
 `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`
 +
 `&details=${encodeURIComponent(
   "Essai routier Mmotors"
 )}`
 +
 `&location=Mmotors`;


 window.open(url,"_blank");

};

const contactSupport = () => {

 const subject = encodeURIComponent(
   `Support essai routier ${testDrive.id}`
 );


 const body = encodeURIComponent(
 `Bonjour,

J’ai une question concernant mon essai routier du ${new Date(
 testDrive.appointment_date
 ).toLocaleString()}.

Merci.`
 );


 window.location.href =
 `mailto:support@mmotors.com?subject=${subject}&body=${body}`;

};

if (!testDrive) {
  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" />
      <p className="mt-3 text-muted">
        Chargement de l'essai routier...
      </p>
    </div>
  );
}
const status = testDriveStatusConfig[testDrive] || testDriveStatusConfig.pending;


return (

  <DetailLayout
    showBackButton
    breadcrumb={[
      {
        label: "Mes essais routiers",
        path: "/mytestdrives"
      },
      {
        label: `${testDrive.vehicle?.brand || ""} ${testDrive.vehicle?.model || ""}`
      }
    ]}
  >

    <div className="container py-4">

      <div className="row g-4">


        {/* =========================
            LEFT SIDE
        ========================= */}
        <div className="col-lg-8">


          {/* VEHICLE CARD */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">


            {/* IMAGE */}
            <div
              className="
                d-flex
                align-items-center
                justify-content-center
                bg-light
              "
              style={{

                height: "320px",

                backgroundImage:
                  testDrive.vehicle?.images?.[0]
                    ? `url(${testDrive.vehicle.images[0]})`
                    : "none",

                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >


              {!testDrive.vehicle?.images?.[0] && (

                <div className="text-center">

                  <div style={{fontSize:"64px"}}>
                    🚗
                  </div>

                  <div className="text-muted fw-semibold">
                    Aucune image disponible
                  </div>

                </div>

              )}

            </div>



            <div className="card-body p-4">


              <div className="
                d-flex
                justify-content-between
                align-items-start
                mb-3
              ">


                <div>

                  <h2 className="fw-bold mb-1">

                    {testDrive.vehicle?.brand}{" "}
                    {testDrive.vehicle?.model}

                  </h2>


                  <p className="text-muted mb-0">
                    Essai routier
                  </p>


                </div>



                <span
                  className={`badge ${status.className} px-3 py-2`}
                >
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
                  ).toLocaleString(
                    "fr-FR"
                  )}

                </div>

              </div>




              {/* COMMENT */}

              {testDrive.comment && (

                <div className="mb-4">

                  <small className="text-muted d-block mb-1">
                    Commentaire
                  </small>


                  <div className="
                    bg-light
                    rounded-3
                    p-3
                  ">
                    {testDrive.comment}
                  </div>


                </div>

              )}






              {/* PROGRESS */}

              <div>


                <div className="
                  d-flex
                  justify-content-between
                  mb-2
                ">

                  <small className="text-muted">
                    Progression
                  </small>


                  <small className="fw-semibold">
                    {status.progress}%
                  </small>


                </div>



                <div
                  className="progress"
                  style={{
                    height:"8px"
                  }}
                >

                  <div
                    className="progress-bar"
                    style={{
                      width:`${status.progress}%`
                    }}
                  />

                </div>


              </div>



            </div>


          </div>





          {/* TIMELINE */}

          <div className="
            card
            border-0
            shadow-sm
            rounded-4
            mt-4
          ">


            <div className="card-body p-4">


              <h4 className="fw-bold mb-4">
                Historique
              </h4>



              {
                testDrive.timeline?.length ? (

                  <div className="position-relative">


                    <div
                      style={{
                        position:"absolute",
                        left:"18px",
                        top:0,
                        bottom:0,
                        width:"2px",
                        background:"#e9ecef"
                      }}
                    />



                    {testDrive.timeline.map(
                      (event,index)=>(


                      <div
                        key={index}
                        className="
                          d-flex
                          mb-4
                          position-relative
                        "
                      >


                        <div
                          className="
                            rounded-circle
                            bg-white
                            border
                            shadow-sm
                            d-flex
                            align-items-center
                            justify-content-center
                          "
                          style={{
                            width:"38px",
                            height:"38px",
                            zIndex:2
                          }}
                        >

                          <i className={eventIcons[event.type] || "bi bi-info-circle"}></i>

                        </div>



                        <div className="ms-3">


                          <div className="fw-semibold">
                            {event.message}
                          </div>


                          <small className="text-muted">

                            {
                              new Date(
                                event.date
                              ).toLocaleString(
                                "fr-FR"
                              )
                            }

                          </small>


                        </div>



                      </div>


                    ))}



                  </div>


                ) : (

                  <p className="text-muted">
                    Aucun historique disponible.
                  </p>

                )
              }



            </div>


          </div>



        </div>





        {/* RIGHT SIDE */}

        <div className="col-lg-4">



          {/* USER */}

          <div className="
            card
            border-0
            shadow-sm
            rounded-4
            mb-4
          ">


            <div className="card-body p-4">


              <h5 className="fw-bold mb-3">
                Mes informations
              </h5>



              <small className="text-muted d-block">
                Nom
              </small>

              <div className="fw-semibold mb-3">

                {testDrive.user?.name}

              </div>



              <small className="text-muted d-block">
                Email
              </small>

              <div className="fw-semibold">

                {testDrive.user?.email}

              </div>



            </div>


          </div>





          {/* ACTIONS */}

          <div className="
            card
            border-0
            shadow-sm
            rounded-4
          ">


            <div className="card-body p-4">


              <h5 className="fw-bold mb-3">
                Actions
              </h5>




              {testDrive.status === "confirmed" && (

                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={addToCalendar}
                >
                  Ajouter au calendrier
                </button>

              )}






              <button
                className="
                  btn
                  btn-outline-dark
                  w-100
                  mb-2
                "
                onClick={contactSupport}
              >
                Contacter le support
              </button>





              {testDrive.status === "pending" && (

                <button
                  className="
                    btn
                    btn-outline-danger
                    w-100
                  "
                  onClick={cancelTestDrive}
                >
                  Annuler la demande
                </button>

              )}



            </div>


          </div>



        </div>


      </div>


    </div>


  </DetailLayout>

);}