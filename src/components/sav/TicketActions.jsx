import { useNavigate } from "react-router-dom";


export default function TicketActions({
  ticket,
  basePath = "/sav/tickets",
  filter = "all",
  onArchive,
  onTakeOwnership,
}) {

  const navigate = useNavigate();


  const canTakeOwnership =
    ticket.status === "OPEN";


const canArchive =
  ["RESOLVED", "CLOSED"].includes(ticket.status) &&
  ticket.archived_at == null;



  return (

    <div className="dropdown">


      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >

        <i className="bi bi-three-dots-vertical me-1" />

        Actions

      </button>



      <ul className="dropdown-menu dropdown-menu-end">


        {/* OUVRIR */}

        <li>

          <button

            className="dropdown-item"

            onClick={() =>
              navigate(
                `${basePath}/${ticket.id}?filter=${filter}`
              )
            }

          >

            Voir le ticket

          </button>

        </li>



        {/* PRISE EN CHARGE */}

        {canTakeOwnership && onTakeOwnership && (

          <li>

            <button

              className="dropdown-item text-primary"

              onClick={() =>
                onTakeOwnership(ticket.id)
              }

            >


              Prendre en charge

            </button>


          </li>

        )}



        {/* ARCHIVE */}

        {canArchive && onArchive && (

          <>

            <li>

              <hr className="dropdown-divider" />

            </li>


            <li>

              <button

                className="dropdown-item text-warning"

                onClick={() =>
                  onArchive(ticket.id)
                }

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