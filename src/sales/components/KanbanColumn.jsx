import LeadCard from "./LeadCard";

const LABELS = {
  ASSIGNED: "Prospects assignés",
  CONTACTED: "Prospects contactés",
  QUOTE_SENT: "Offres envoyées",
  WON: "Ventes conclues",
  LOST: "Prospects perdus",
};

export default function KanbanColumn({
  status,
  leads,
  mode = "my-leads",
  onTakeLead,
}) {
  return (
    <div className="bg-light rounded p-2 h-100">

      <h6 className="text-center mb-3">
        {LABELS[status]}
      </h6>

      <div className="d-flex flex-column gap-2">

        {leads.length === 0 && (
          <small className="text-muted text-center">
            Aucun prospect
          </small>
        )}

        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            mode={mode}
            onTakeLead={onTakeLead}
          />
        ))}

      </div>

    </div>
  );
}