import { useNavigate } from "react-router-dom";

import Breadcrumb from "../components/navigation/Breadcrumb";

/**
 * Layout utilisé pour les pages de détail.
 *
 * Responsabilités :
 * - afficher le bouton de retour ;
 * - afficher le fil d'Ariane ;
 * - afficher les actions éventuelles ;
 * - afficher le contenu de la page.
 */
export default function DetailLayout({
  breadcrumb = [],
  actions,
  children,
}) {
  const navigate = useNavigate();

  return (
    <div className="container py-4">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        {/* Navigation + breadcrumb */}
        <div className="d-flex align-items-center min-w-0">

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle me-3 shadow-sm flex-shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <i
              className="bi bi-arrow-left"
              aria-hidden="true"
            />
          </button>

          <Breadcrumb items={breadcrumb} />

        </div>

        {/* =================================================
            ACTIONS
            ================================================= */}

        {actions && (
          <div className="d-flex gap-2 flex-shrink-0">
            {actions}
          </div>
        )}

      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      {children}

    </div>
  );
}