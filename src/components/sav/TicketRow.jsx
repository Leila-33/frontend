import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketActions from "./TicketActions";
import TicketCategoryBadge from "./TicketCategoryBadge";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketRow({
  ticket,
  basePath,
  filter,
  onArchive,
  onTakeOwnership,
}) {

  // =====================================================
  // ÉTAT DU TICKET
  // =====================================================

  /**
   * Le ticket est considéré comme nouveau lorsqu'il
   * contient au moins un message ou une activité que
   * l'utilisateur n'a pas encore consulté.
   *
   * Le backend fournit cette information via `unread`.
   */
  const isNew = ticket.unread === true;


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (

    <tr className={isNew ? "fw-bold" : ""}>

      {/* =================================================
          NOUVEAU
          
          Le badge permet d'identifier rapidement les tickets
          contenant une nouvelle activité.
      ================================================= */}

      <td>

        {isNew && (

          <span className="badge bg-danger">
            Nouveau
          </span>

        )}

      </td>


      {/* =================================================
          SUJET
          
          Le sujet est affiché avec l'identifiant du ticket
          afin de pouvoir l'identifier facilement.
      ================================================= */}

      <td>

        <div>
          {ticket.subject || "Sans sujet"}
        </div>

        <small className="text-muted">
          #{ticket.id}
        </small>

      </td>


      {/* =================================================
          CLIENT
          
          On privilégie le nom du client fourni par le
          backend.
          
          Si celui-ci n'est pas disponible, on utilise
          l'identifiant utilisateur comme solution de secours.
      ================================================= */}

      <td>
        {ticket.user_name || ticket.user_id || "—"}
      </td>


      {/* =================================================
          CATÉGORIE
      ================================================= */}

      <td>

        <TicketCategoryBadge
          category={ticket.category}
        />

      </td>


      {/* =================================================
          PRIORITÉ
      ================================================= */}

      <td>

        <TicketPriorityBadge
          priority={ticket.priority}
        />

      </td>


      {/* =================================================
          STATUT
      ================================================= */}

      <td>

        <TicketStatusBadge
          status={ticket.status}
        />

      </td>


      {/* =================================================
          DERNIÈRE ACTIVITÉ
          
          Le backend fournit :
          - last_actor : auteur de la dernière activité ;
          - last_message_preview : aperçu du dernier message.
          
          Le dernier message peut être absent, par exemple
          pour un ticket qui vient juste d'être créé.
      ================================================= */}

      <td>

        <div className="d-flex flex-column">

          <small>
            {ticket.last_actor || "—"}
          </small>

          <small
            className="text-muted text-truncate"
            style={{
              maxWidth: "250px",
            }}
            title={
              ticket.last_message_preview || ""
            }
          >
            {ticket.last_message_preview || "Aucune activité"}
          </small>

        </div>

      </td>


      {/* =================================================
          ACTIONS
          
          TicketActions centralise les différentes actions
          disponibles pour le ticket :
          - consulter ;
          - archiver ;
          - prendre en charge ;
          - etc.
          
          Les callbacks sont transmis depuis le composant
          parent afin que celui-ci conserve la gestion de
          l'état et du rafraîchissement de la liste.
      ================================================= */}

      <td>

        <TicketActions
          ticket={ticket}
          basePath={basePath}
          filter={filter}
          onArchive={onArchive}
          onTakeOwnership={onTakeOwnership}
        />

      </td>

    </tr>
  );
}