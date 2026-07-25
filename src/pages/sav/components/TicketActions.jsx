import { useNavigate } from "react-router-dom";

export default function TicketActions({
  ticket,
  basePath = "/sav/tickets",
  onArchive,
  onTakeOwnership,
}) {
  const navigate = useNavigate();

  const canTakeOwnership = ticket.status === "OPEN";

  const canArchive =
    ticket.status === "RESOLVED" ||
    ticket.status === "CLOSED";

  return (
    <div className="dropdown">

      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        Actions
      </button>

      <ul className="dropdown-menu dropdown-menu-end">

        <li>
          <button
            className="dropdown-item"
            onClick={() =>
              navigate(`${basePath}/${ticket.id}`)
            }
          >
            Ouvrir
          </button>
        </li>

        {canTakeOwnership && onTakeOwnership && (
          <li>
            <button
              className="dropdown-item"
              onClick={() => onTakeOwnership(ticket.id)}
            >
              Prendre en charge
            </button>
          </li>
        )}

        {canArchive && onArchive && (
          <>
            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                className="dropdown-item text-warning"
                onClick={() => onArchive(ticket.id)}
              >
                Archiver
              </button>
            </li>
          </>
        )}

      </ul>

    </div>
  );
}