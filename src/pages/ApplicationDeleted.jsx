import { useNavigate } from "react-router-dom";

export default function ApplicationDeleted() {

  const navigate = useNavigate();

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-7">

          {/* CARD */}
          <div className="card border-0 shadow-sm rounded-4 text-center p-5">

            {/* ICON */}
            <div className="mb-4">

              <div
                className="bg-light d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 90, height: 90 }}
              >
                <i className="bi bi-trash3 fs-1 text-danger"></i>
              </div>

            </div>

            {/* TITLE */}
            <h2 className="fw-bold mb-2">
              Application supprimée
            </h2>

            {/* SUBTITLE */}
            <p className="text-muted mb-4">
              Cette application n’est plus disponible.
              Elle a été supprimée ou archivée par l’administrateur.
            </p>

            {/* INFO BOX */}
            <div className="alert alert-light border rounded-3 text-start mb-4">

              <div className="fw-semibold mb-1">
                ℹ️ Informations
              </div>

              <ul className="mb-0 text-muted small">
                <li>Les données peuvent être conservées à des fins d’historique</li>
                <li>Vous ne pouvez plus modifier ce dossier</li>
                <li>Contactez le support si vous pensez qu’il s’agit d’une erreur</li>
              </ul>

            </div>

            {/* ACTIONS */}
            <div className="d-flex gap-2 justify-content-center flex-wrap">

              <button
                className="btn btn-primary px-4 rounded-pill"
                onClick={() => navigate("/admin/applications")}
              >
                <i className="bi bi-folder me-2"></i>
                Mes dossiers
              </button>

              <button
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={() => navigate("/admin")}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </button>

            </div>

          </div>

          {/* FOOT NOTE */}
          <p className="text-center text-muted small mt-3">
            Si vous pensez qu’il s’agit d’une erreur, contactez l’administration.
          </p>

        </div>

      </div>

    </div>
  );
}