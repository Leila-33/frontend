export default function TestDriveStatusModal({
  open,
  type,
  testDrive,
  onClose,
  onConfirm
}) {

  if (!open) return null;


  const config = {

    confirmed: {
      title: "Confirmer l'essai routier",
      icon: "bi bi-check-circle fs-4",
      color: "success",
      action: "Confirmation du rendez-vous",
      button: "Confirmer"
    },

    rejected: {
      title: "Refuser l'essai routier",
      icon: "bi bi-x-circle fs-4",
      color: "danger",
      action: "Refus de la demande",
      button: "Refuser"
    },

    cancelled: {
      title: "Annuler l'essai routier",
      icon: "bi bi-calendar-x fs-4",
      color: "danger",
      action: "Annulation du rendez-vous",
      button: "Annuler"
    },

    completed: {
      title: "Terminer l'essai routier",
      icon: "bi bi-flag fs-4",
      color: "success",
      action: "Essai routier terminé",
      button: "Terminer"
    }

  };


  const current = config[type];


  return (

    <div
      className="modal d-block"
      tabIndex="-1"
      style={{
        backgroundColor:"rgba(0,0,0,.5)"
      }}
    >

      <div className="modal-dialog modal-dialog-centered">

        <div className="modal-content border-0 shadow-lg rounded-4">


          {/* HEADER */}
          <div className="modal-header border-0">

            <div className="d-flex align-items-center gap-3">

              <div
                className={`
                  rounded-circle
                  bg-${current.color}-subtle
                  text-${current.color}
                  d-flex
                  align-items-center
                  justify-content-center
                `}
                style={{
                  width:"45px",
                  height:"45px"
                }}
              >
                <i className={current.icon}/>
              </div>


              <div>

                <h5 className="fw-bold mb-0">
                  {current.title}
                </h5>

                <small className="text-muted">
                  Vérifiez les informations avant validation
                </small>

              </div>

            </div>


            <button
              className="btn-close"
              onClick={onClose}
            />

          </div>



          {/* BODY */}
          <div className="modal-body p-4">


            <div className="bg-light rounded-4 p-3">


              <div className="mb-3">

                <small className="text-muted">
                  Client
                </small>

                <div className="fw-semibold">

                  <i className="bi bi-person-circle me-2 text-primary"/>

                  {testDrive.user_name}

                </div>

              </div>



              <div className="mb-3">

                <small className="text-muted">
                  Véhicule
                </small>

                <div className="fw-semibold">

                  <i className="bi bi-car-front me-2 text-primary"/>

                  {testDrive.vehicle_name}

                </div>

              </div>



              <div>

                <small className="text-muted">
                  Action
                </small>

                <div className="fw-semibold">

                  {current.action}

                </div>

              </div>


            </div>


          </div>



          {/* FOOTER */}
          <div className="modal-footer border-0">


            <button
              className="btn btn-light rounded-pill px-4"
              onClick={onClose}
            >
              <i className="bi bi-arrow-left me-2"/>
              Retour
            </button>



            <button
              className={`btn btn-${current.color} rounded-pill px-4`}
              onClick={onConfirm}
            >

              <i className="bi bi-check-lg me-2"/>

              {current.button}

            </button>


          </div>


        </div>

      </div>

    </div>

  );
}