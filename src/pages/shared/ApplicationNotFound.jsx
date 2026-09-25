import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

/**
 * Affiche une page lorsque le dossier demandé
 * n'existe pas ou n'est plus accessible.
 */
export default function ApplicationNotFound() {
  const navigate = useNavigate();

  const { user } = useAuth();

  // ==========================================================
  // DESTINATION SELON LE RÔLE
  // ==========================================================

  const isAdmin = user?.role === "admin";

  const applicationsPath = isAdmin ? "/admin/applications" : "/applications";

  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 text-center">
            <div className="card-body p-5">
              {/* ==================================================
                  ICÔNE
              ================================================== */}

              <div className="mb-4">
                <i
                  className="bi bi-file-earmark-x text-secondary"
                  style={{ fontSize: "4rem" }}
                  aria-hidden="true"
                />
              </div>

              {/* ==================================================
                  TITRE
              ================================================== */}

              <h1 className="h3 fw-semibold mb-3">Dossier introuvable</h1>

              {/* ==================================================
                  MESSAGE
              ================================================== */}

              <p className="text-muted mb-4">
                Le dossier que vous recherchez n'existe pas ou n'est plus
                disponible.
              </p>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(applicationsPath)}
                >
                  <i className="bi bi-folder me-2" aria-hidden="true" />

                  {isAdmin ? "Gérer les dossiers" : "Mes dossiers"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(dashboardPath)}
                >
                  <i className="bi bi-house me-2" aria-hidden="true" />
                  Tableau de bord
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
