import { QUOTE_STATUSES } from "../../constants/quoteOptions";

/**
 * Affiche le statut d'une offre commerciale.
 *
 * Le libellé affiché dépend du contexte :
 * - agent : libellé destiné au commercial ;
 * - client : libellé destiné au client.
 *
 * La configuration des statuts reste centralisée
 * dans `quoteOptions.js`.
 */
export default function QuoteStatusBadge({
  status,
  role = "agent",
}) {
  const statusConfig = QUOTE_STATUSES[status];

  if (!statusConfig) {
    return (
      <span className="badge bg-secondary">
        {status || "Statut inconnu"}
      </span>
    );
  }

  const label =
    role === "client"
      ? statusConfig.clientLabel || statusConfig.label
      : statusConfig.agentLabel || statusConfig.label;

  return (
    <span className={`badge ${statusConfig.className}`}>
      {label}
    </span>
  );
}