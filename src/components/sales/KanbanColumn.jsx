import LeadCard from "./LeadCard";
import { LEAD_STATUSES } from "../../constants/leadOptions";
/**
 * Affiche une colonne du pipeline commercial.
 *
 * Responsabilités :
 * - afficher le nom de l'étape ;
 * - afficher le nombre de leads ;
 * - afficher les cartes associées au statut ;
 * - transmettre les actions éventuelles aux cartes.
 */
export default function KanbanColumn({
  status,
  leads = [],
  mode = "my-leads",
  onTakeLead,
}) {
  // =====================================================
  // DONNÉES D'AFFICHAGE
  // =====================================================

const label =
  LEAD_STATUSES[status]?.columnLabel || status;

  const leadCount = leads.length;

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <section
      className="
        bg-light
        border
        rounded-4
        p-3
        h-100
      "
      aria-labelledby={`kanban-column-${status}`}
    >
      {/* =================================================
          EN-TÊTE DE COLONNE
      ================================================= */}

      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          gap-2
          mb-3
        "
      >
        <h2
          id={`kanban-column-${status}`}
          className="
            h6
            fw-bold
            mb-0
            text-break
          "
        >
          {label}
        </h2>

        <span
          className="
            badge
            bg-white
            text-dark
            border
            rounded-pill
            flex-shrink-0
          "
          aria-label={`${leadCount} prospect${
            leadCount > 1 ? "s" : ""
          }`}
        >
          {leadCount}
        </span>
      </div>

      {/* =================================================
          LEADS
      ================================================= */}

      {leadCount === 0 ? (
        <div
          className="
            d-flex
            flex-column
            align-items-center
            justify-content-center
            text-center
            text-muted
            py-4
          "
        >
          <i
            className="
              bi
              bi-inbox
              fs-4
              mb-2
            "
            aria-hidden="true"
          />

          <small>
            Aucun prospect
          </small>
        </div>
      ) : (
        <div
          className="
            d-flex
            flex-column
            gap-3
          "
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              mode={mode}
              onTakeLead={onTakeLead}
            />
          ))}
        </div>
      )}
    </section>
  );
}