import { useMemo } from "react";

import { LEAD_STATUSES } from "../../constants/leadOptions";

import KanbanColumn from "./KanbanColumn";

/**
 * Tableau Kanban du pipeline commercial.
 *
 * Responsabilités :
 * - organiser les leads par statut ;
 * - afficher les différentes étapes du pipeline ;
 * - transmettre les leads à chaque colonne.
 *
 * Le composant ne modifie pas directement les leads.
 * Les actions restent gérées par les composants parents.
 */

// =====================================================
// STATUTS DU PIPELINE
// =====================================================

/**
 * Récupère les statuts dans l'ordre défini
 * par la configuration centralisée.
 */
const LEAD_STATUS_KEYS = Object.keys(LEAD_STATUSES);

export default function KanbanBoard({
  leads = [],
  mode = "my-leads",
  onTakeLead,
}) {
  // =====================================================
  // ORGANISATION DES LEADS
  // =====================================================

  /**
   * Regroupe les leads par statut en une seule passe.
   *
   * Cette approche évite d'exécuter un `filter()` pour
   * chaque colonne du Kanban.
   */
  const leadsByStatus = useMemo(() => {
    const groupedLeads = Object.fromEntries(
      LEAD_STATUS_KEYS.map((status) => [status, []])
    );

    leads.forEach((lead) => {
      if (groupedLeads[lead.status]) {
        groupedLeads[lead.status].push(lead);
      }
    });

    return groupedLeads;
  }, [leads]);

  // =====================================================
  // AFFICHAGE : AUCUN LEAD
  // =====================================================

  if (!leads.length) {
    return (
      <div
        className="
          text-center
          border
          rounded-4
          p-5
          text-muted
        "
      >
        <i
          className="
            bi
            bi-kanban
            fs-1
            d-block
            mb-3
          "
          aria-hidden="true"
        />

        <h2 className="h5 fw-semibold mb-2">Aucun prospect</h2>

        <p className="mb-0">
          Aucun lead ne se trouve actuellement dans votre pipeline.
        </p>
      </div>
    );
  }

  // =====================================================
  // AFFICHAGE DU KANBAN
  // =====================================================

  return (
    <div className="row g-3" aria-label="Pipeline commercial">
      {LEAD_STATUS_KEYS.map((status) => (
        <div
          key={status}
          className="
            col-12
            col-md-6
            col-xl
          "
        >
          <KanbanColumn
            status={status}
            leads={leadsByStatus[status]}
            mode={mode}
            onTakeLead={onTakeLead}
          />
        </div>
      ))}
    </div>
  );
}
