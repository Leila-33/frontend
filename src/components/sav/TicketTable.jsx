/**
 * Tableau permettant d'afficher la liste des tickets.
 *
 * Le composant est responsable uniquement de la structure
 * du tableau et délègue l'affichage d'un ticket à
 * `TicketRow`.
 */
import TicketRow from "./TicketRow";

export default function TicketTable({
  tickets = [],
  basePath,
  filter,
  onArchive,
  onTakeOwnership,
}) {

  // =====================================================
  // LISTE VIDE
  // =====================================================

  /**
   * Aucun ticket à afficher.
   *
   * On retourne directement un message informatif plutôt
   * qu'un tableau vide.
   */
  if (!tickets.length) {
    return (
      <div className="text-center text-muted py-4">
        Aucun ticket
      </div>
    );
  }


  // =====================================================
  // AFFICHAGE DU TABLEAU
  // =====================================================

  return (
    <div className="table-responsive">

      <table className="table table-hover align-middle">

        {/* =================================================
            EN-TÊTE DU TABLEAU
        ================================================= */}

        <thead>

          <tr>

            {/* Indicateur "Nouveau" */}
            <th scope="col"></th>

            {/* Sujet du ticket */}
            <th scope="col">
              Sujet
            </th>

            {/* Client associé */}
            <th scope="col">
              Client
            </th>

            {/* Catégorie */}
            <th scope="col">
              Catégorie
            </th>

            {/* Priorité */}
            <th scope="col">
              Priorité
            </th>

            {/* Statut */}
            <th scope="col">
              Statut
            </th>

            {/* Dernière activité */}
            <th scope="col">
              Dernière activité
            </th>

            {/* Actions */}
            <th scope="col"></th>

          </tr>

        </thead>


        {/* =================================================
            CORPS DU TABLEAU
        ================================================= */}

        <tbody>

          {tickets.map((ticket) => (

            <TicketRow
              key={ticket.id}
              ticket={ticket}
              basePath={basePath}
              filter={filter}
              onArchive={onArchive}
              onTakeOwnership={onTakeOwnership}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}