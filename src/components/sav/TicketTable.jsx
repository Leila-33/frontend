import TicketRow from "./TicketRow";

export default function TicketTable({ tickets = [], basePath, filter, onArchive, onTakeOwnership}) {
  if (!tickets.length) {
    return <div className="text-center text-muted py-4">Aucun ticket</div>;
  }

  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Sujet</th>
          <th>Client</th>
          <th>Catégorie</th>
          <th>Priorité</th>
          <th>Statut</th>
          <th>Dernière activité</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {tickets.map((t) => (
          <TicketRow
    key={t.id}
    ticket={t}
    basePath={basePath}
    filter={filter}
    onArchive={onArchive}
    onTakeOwnership={onTakeOwnership}
/>
        ))}
      </tbody>
    </table>
  );
}