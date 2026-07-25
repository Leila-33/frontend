import { eventConfig } from "./eventConfig";

export default function EventItem({
  event,
  isLast
}) {

  const config =
    eventConfig[event.type] || {
      color: "dark",
      icon: "bi-clock-history",
      label: event.type
    };

  return (

    <div
      className={`d-flex gap-3 ${
        !isLast ? "mb-4" : ""
      }`}
    >

      {/* ICON */}
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-${config.color}-subtle text-${config.color}`}
        style={{
          width: "42px",
          height: "42px"
        }}
      >

        <i className={`bi ${config.icon}`} />

      </div>

      {/* CONTENT */}
      <div className="flex-grow-1">

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">

          <div>

            <div className="fw-semibold">
              {config.label}
            </div>

            <div className="small text-muted">
              {event.message}
            </div>

          </div>

          <div className="small text-muted">

            {new Date(
              event.created_at
            ).toLocaleString("fr-FR")}

          </div>

        </div>

      </div>

    </div>
  );
}