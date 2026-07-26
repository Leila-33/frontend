import KanbanColumn from "./KanbanColumn";

const STATUSES = [
  "ASSIGNED",
  "CONTACTED",
  "QUOTE_SENT",
  "WON",
  "LOST",
];

export default function KanbanBoard({
  leads,
  mode = "my-leads",
  onTakeLead,
}) {
  const getLeadsByStatus = (status) =>
    leads.filter((lead) => lead.status === status);

  return (
    <div className="row g-3">
      {STATUSES.map((status) => (
        <div
          key={status}
          className="col-12 col-md-6 col-xl-3"
        >
          <KanbanColumn
            status={status}
            leads={getLeadsByStatus(status)}
            mode={mode}
            onTakeLead={onTakeLead}
          />
        </div>
      ))}
    </div>
  );
}