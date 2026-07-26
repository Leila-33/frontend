export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onClose,
  loading = false,
}) {


  if (!show) {
    return null;
  }


  return (

    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,.5)"
      }}
    >

      <div className="modal-dialog modal-dialog-centered">

        <div className="modal-content">


          <div className="modal-header">

            <h5 className="modal-title">
              {title}
            </h5>


            <button
              className="btn-close"
              onClick={onClose}
            />

          </div>



          <div className="modal-body">

            {message}

          </div>



          <div className="modal-footer">


            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >

              {cancelText}

            </button>



            <button
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >

              {
                loading
                ? "Traitement..."
                : confirmText
              }

            </button>


          </div>


        </div>

      </div>

    </div>

  );

}