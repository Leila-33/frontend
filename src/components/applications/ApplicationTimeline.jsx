import {
  EVENT_TYPE_CONFIG,
  DEFAULT_EVENT_TYPE_CONFIG,
} from "../../constants/eventOptions";

import { formatDateTime } from "../../utils/dateUtils";

// ==========================================================
// HISTORIQUE DU DOSSIER
// ==========================================================

/**
 * Affiche l'historique des événements associés au dossier.
 */
export default function ApplicationTimeline({
  events = [],
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4">

      <div className="card-body p-4">

        <h5 className="fw-bold mb-4">
          Historique du dossier
        </h5>

        <div className="d-flex flex-column gap-4">

          {events.length > 0 ? (

            events.map((event) => {

              // Récupère la configuration visuelle
              // correspondant au type d'événement.
              const eventConfig =
                EVENT_TYPE_CONFIG[event.type] ??
                DEFAULT_EVENT_TYPE_CONFIG;

              return (
                <div
                  key={event.id}
                  className="d-flex gap-3"
                >

                  {/* ==================================================
                      ICÔNE
                      ================================================== */}

                  <div
                    className={`bg-${eventConfig.color} text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                    style={{
                      width: 42,
                      height: 42,
                    }}
                  >
                    <i
                      className={`bi ${eventConfig.icon}`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* ==================================================
                      CONTENU
                      ================================================== */}

                  <div className="flex-grow-1 min-width-0">

                    <div className="fw-semibold">
                      {event.message || "Événement"}
                    </div>

                    <div className="text-muted small">
                      {formatDateTime(event.created_at)}
                    </div>

                  </div>

                </div>
              );
            })

          ) : (

            <div className="text-muted text-center py-3">
              Aucun événement
            </div>

          )}

        </div>

      </div>

    </div>
  );
}