export default function ApplicationTimeline({
  events = []
}) {

  const getEventStyle = (type) => {

    const map = {

      APPLICATION_CREATED: {
        icon: "bi-plus-circle",
        color: "secondary"
      },

      APPLICATION_SUBMITTED: {
        icon: "bi-send",
        color: "primary"
      },

      APPLICATION_APPROVED: {
        icon: "bi-check-circle",
        color: "success"
      },

      APPLICATION_REJECTED: {
        icon: "bi-x-circle",
        color: "danger"
      },

      DOCUMENT_VALIDATED: {
        icon: "bi-file-check",
        color: "success"
      },

      DOCUMENT_REJECTED: {
        icon: "bi-file-x",
        color: "danger"
      },

      APPLICATION_ARCHIVED: {
        icon: "bi-archive",
        color: "warning"
      },

      APPLICATION_RESTORED: {
        icon: "bi-arrow-counterclockwise",
        color: "info"
      }
    };

    return map[type] || {
      icon: "bi-clock-history",
      color: "dark"
    };
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">

      <div className="card-body p-4">

        <h5 className="fw-bold mb-4">
          Historique du dossier
        </h5>

        <div className="d-flex flex-column gap-4">

          {events.map((event) => {

            const style = getEventStyle(event.type);

            return (

              <div
                key={event.id}
                className="d-flex gap-3"
              >

                {/* ICON */}
                <div>

                  <div
                    className={`bg-${style.color} text-white rounded-circle d-flex align-items-center justify-content-center`}
                    style={{
                      width: 42,
                      height: 42
                    }}
                  >
                    <i className={`bi ${style.icon}`} />
                  </div>

                </div>

                {/* CONTENT */}
                <div className="flex-grow-1">

                  <div className="fw-semibold">

                    {event.message}

                  </div>

                  <div className="text-muted small">

                    {new Date(
                      event.created_at
                    ).toLocaleString()}

                  </div>

                </div>

              </div>
            );
          })}

          {events.length === 0 && (

            <div className="text-muted text-center py-3">
              Aucun événement
            </div>

          )}

        </div>

      </div>

    </div>
  );
}