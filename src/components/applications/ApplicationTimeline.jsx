import EventItem from "./EventItem";

export default function ApplicationTimeline({
  events = []
}) {

  return (

    <div className="card border-0 shadow-sm rounded-4 mt-4">

      <div className="card-body p-4">

        <div className="d-flex align-items-center gap-2 mb-4">

          <i className="bi bi-clock-history fs-4 text-primary"></i>

          <h5 className="fw-semibold mb-0">
            Historique du dossier
          </h5>

        </div>

        {!events.length && (

          <div className="text-muted">
            Aucun événement enregistré
          </div>

        )}

        {events.map((event, index) => (

          <EventItem
            key={event.id}
            event={event}
            isLast={
              index === events.length - 1
            }
          />

        ))}

      </div>

    </div>
  );
}