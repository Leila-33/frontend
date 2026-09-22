import { useNavigate } from "react-router-dom";

/**
 * Menu regroupant les actions disponibles pour un ticket.
 *
 * Le composant détermine les actions autorisées en fonction
 * du statut et de l'état d'archivage du ticket.
 *
 * Les opérations métier elles-mêmes restent gérées par le
 * composant parent via les callbacks `onArchive` et
 * `onTakeOwnership`.
 */
export default function TicketActions({
  ticket,
  basePath = "/sav/tickets",
  filter = "all",
  onArchive,
  onTakeOwnership,
}) {

  const navigate = useNavigate();


  // =====================================================
  // ACTIONS DISPONIBLES
  // =====================================================

  /**
   * Un ticket ouvert peut être pris en charge par un agent.
   */
  const canTakeOwnership =
    ticket.status === "OPEN";


  /**
   * Seuls les tickets résolus ou fermés peuvent être
   * archivés.
   *
   * `archived_at == null` permet de ne proposer l'action
   * que pour les tickets qui ne sont pas déjà archivés.
   */
  const canArchive =
    ["RESOLVED", "CLOSED"].includes(ticket.status) &&
    ticket.archived_at == null;


  // =====================================================
  // NAVIGATION
  // =====================================================

  /**
   * Ouvre la page de détail du ticket.
   *
   * Le filtre courant est conservé dans l'URL afin de
   * pouvoir revenir à la liste dans le même contexte.
   */
  const handleView = () => {

    navigate(
      `${basePath}/${ticket.id}?filter=${filter}`
    );

  };


  // =====================================================
  // ACTIONS
  // =====================================================

  /**
   * Prend en charge le ticket.
   *
   * L'opération est déléguée au composant parent afin
   * que celui-ci puisse gérer l'appel API, le chargement
   * et le rafraîchissement de la liste.
   */
  const handleTakeOwnership = () => {

    if (onTakeOwnership) {
      onTakeOwnership(ticket.id);
    }

  };


  /**
   * Archive le ticket.
   *
   * L'opération est déléguée au composant parent pour
   * conserver la gestion de l'état au niveau supérieur.
   */
  const handleArchive = () => {

    if (onArchive) {
      onArchive(ticket.id);
    }

  };


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="dropdown">

      {/* =================================================
          BOUTON DU MENU
      ================================================= */}

      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i
          className="bi bi-three-dots-vertical me-1"
          aria-hidden="true"
        />

        Actions
      </button>


      {/* =================================================
          MENU DES ACTIONS
      ================================================= */}

      <ul className="dropdown-menu dropdown-menu-end">

        {/* =================================================
            VOIR LE TICKET
        ================================================= */}

        <li>

          <button
            type="button"
            className="dropdown-item"
            onClick={handleView}
          >
            Voir le ticket
          </button>

        </li>


        {/* =================================================
            PRENDRE EN CHARGE
        ================================================= */}

        {canTakeOwnership && onTakeOwnership && (

          <li>

            <button
              type="button"
              className="dropdown-item text-primary"
              onClick={handleTakeOwnership}
            >
              Prendre en charge
            </button>

          </li>

        )}


        {/* =================================================
            ARCHIVER
        ================================================= */}

        {canArchive && onArchive && (

          <>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>

              <button
                type="button"
                className="dropdown-item text-warning"
                onClick={handleArchive}
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