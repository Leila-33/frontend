import { formatDateTime } from "../../utils/dateUtils";
/**
 * Modale affichant le détail d'un événement CRM.
 *
 * Les informations présentées sont :
 * - le type de l'événement ;
 * - sa date de création ;
 * - son message ;
 * - ses métadonnées éventuelles.
 */
export default function EventDetailModal({ event, onClose }) {
  // =====================================================
  // FORMATAGE
  // =====================================================

  /**
   * Formate la date de création de l'événement.
   */
  const formattedDate = formatDateTime(event.created_at);

  /**
   * Prépare les métadonnées pour un affichage JSON lisible.
   */
  const formattedMetadata =
    event?.event_metadata && Object.keys(event.event_metadata).length > 0
      ? JSON.stringify(event.event_metadata, null, 2)
      : null;

  // =====================================================
  // RENDU
  // =====================================================

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-modal-title"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          {/* =================================================
              EN-TÊTE
          ================================================= */}

          <div className="modal-header">
            <h2 id="event-detail-modal-title" className="h5 fw-semibold mb-0">
              <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
              Détail de l'événement
            </h2>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Fermer"
            />
          </div>

          {/* =================================================
              CONTENU
          ================================================= */}

          <div className="modal-body">
            {/* Type */}

            <div className="mb-3">
              <div className="text-muted small mb-1">Type</div>

              <div className="fw-semibold">
                {event?.type || "Non renseigné"}
              </div>
            </div>

            {/* Date */}

            <div className="mb-3">
              <div className="text-muted small mb-1">Date</div>

              <div>{formattedDate}</div>
            </div>

            {/* Message */}

            <div className="mb-4">
              <div className="text-muted small mb-1">Message</div>

              <div className="bg-light rounded-3 p-3">
                {event?.message || (
                  <span className="text-muted">Aucun message.</span>
                )}
              </div>
            </div>

            <hr />

            {/* Métadonnées */}

            <h3 className="h6 fw-semibold mb-3">Métadonnées</h3>

            {formattedMetadata ? (
              <pre
                className="
                  bg-light
                  rounded-3
                  p-3
                  mb-0
                  small
                  overflow-auto
                "
                style={{
                  maxHeight: "300px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {formattedMetadata}
              </pre>
            ) : (
              <div className="text-muted">Aucune métadonnée.</div>
            )}
          </div>

          {/* =================================================
              PIED DE MODALE
          ================================================= */}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
