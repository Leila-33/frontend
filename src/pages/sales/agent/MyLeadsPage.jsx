import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";
import KanbanBoard from "../../../components/sales/KanbanBoard";

/**
 * Page des prospects assignés à l'agent connecté.
 *
 * Responsabilités :
 * - récupérer les leads de l'agent connecté ;
 * - gérer l'état de chargement ;
 * - permettre l'actualisation de la liste ;
 * - afficher les leads dans un tableau Kanban.
 *
 * La logique métier reste gérée par l'API.
 * Cette page est uniquement responsable de l'orchestration
 * et de l'affichage.
 */
export default function MyLeadsPage() {
  // =====================================================
  // ÉTAT
  // =====================================================

  /**
   * Leads actuellement assignés à l'agent connecté.
   */
  const [leads, setLeads] = useState([]);

  /**
   * Indique si les leads sont en cours de chargement.
   */
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RÉCUPÉRATION DES LEADS
  // =====================================================

  /**
   * Récupère les leads assignés à l'agent connecté.
   *
   * `useCallback` permet de conserver une référence stable
   * pour le `useEffect` et le bouton d'actualisation.
   */
  const fetchMyLeads = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/agent/leads?scope=my", {
        method: "GET",
      });

      /**
       * Sécurise la récupération des données.
       *
       * Si l'API ne renvoie pas de tableau `items`,
       * la page affiche simplement une liste vide.
       */
      setLeads(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      toast.error(
        error?.message || "Erreur lors du chargement de vos prospects."
      );

      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  useEffect(() => {
    fetchMyLeads();
  }, [fetchMyLeads]);

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container py-4">
      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div
        className="
          d-flex
          flex-column
          flex-md-row
          justify-content-between
          align-items-md-center
          gap-3
          mb-4
        "
      >
        <div>
          <h1 className="h3 fw-bold mb-1">Mes prospects</h1>

          <p className="text-muted mb-0">Leads qui vous sont assignés.</p>
        </div>

        <button
          type="button"
          className="
            btn
            btn-outline-secondary
            flex-shrink-0
          "
          onClick={fetchMyLeads}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="
                  spinner-border
                  spinner-border-sm
                  me-2
                "
                aria-hidden="true"
              />
              Actualisation...
            </>
          ) : (
            <>
              <i
                className="
                  bi
                  bi-arrow-clockwise
                  me-2
                "
                aria-hidden="true"
              />
              Actualiser
            </>
          )}
        </button>
      </div>

      {/* =================================================
          CONTENU
      ================================================= */}

      {loading ? (
        // -------------------------------------------------
        // CHARGEMENT
        // -------------------------------------------------

        <div
          className="
            text-center
            text-muted
            py-5
          "
          role="status"
          aria-live="polite"
        >
          <div
            className="
              spinner-border
              mb-3
            "
            aria-hidden="true"
          />

          <p className="mb-0">Chargement de vos prospects...</p>
        </div>
      ) : leads.length === 0 ? (
        // -------------------------------------------------
        // AUCUN LEAD
        // -------------------------------------------------

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

          <h2 className="h5 fw-semibold mb-2">Aucun prospect assigné</h2>

          <p className="mb-0">
            Vous n'avez actuellement aucun lead dans votre portefeuille.
          </p>
        </div>
      ) : (
        // -------------------------------------------------
        // KANBAN
        // -------------------------------------------------

        <KanbanBoard leads={leads} mode="my-leads" />
      )}
    </div>
  );
}
