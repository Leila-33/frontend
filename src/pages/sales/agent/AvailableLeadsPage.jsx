import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";
import LeadCard from "../../../components/sales/LeadCard";

/**
 * Page des leads disponibles.
 *
 * Affiche les prospects qui ne sont actuellement assignés
 * à aucun commercial et permet à l'agent connecté de
 * prendre en charge un lead.
 *
 * Responsabilités :
 * - récupérer les leads non assignés ;
 * - afficher leur état de chargement ;
 * - permettre l'actualisation de la liste ;
 * - permettre la prise en charge d'un lead ;
 * - retirer immédiatement un lead de la liste après
 *   son attribution réussie.
 *
 * La logique métier reste gérée par l'API.
 */
export default function AvailableLeadsPage() {
  // =====================================================
  // ÉTAT
  // =====================================================

  /**
   * Leads actuellement disponibles.
   */
  const [leads, setLeads] = useState([]);

  /**
   * Indique si la liste est en cours de chargement.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Identifiant du lead actuellement pris en charge.
   *
   * Permet de n'afficher l'état de chargement que sur
   * le bouton du lead concerné.
   */
  const [takingLeadId, setTakingLeadId] =
    useState(null);

  // =====================================================
  // RÉCUPÉRATION DES LEADS
  // =====================================================

  /**
   * Récupère les leads actuellement non assignés.
   *
   * `useCallback` permet de conserver une référence stable
   * à la fonction utilisée par le `useEffect` et le bouton
   * d'actualisation.
   */
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch(
        "/agent/leads?scope=unassigned",
        {
          method: "GET",
        }
      );

      /**
       * Sécurise la récupération des données.
       *
       * Si l'API ne renvoie pas de tableau `items`,
       * on affiche simplement une liste vide.
       */
      setLeads(
        Array.isArray(data?.items)
          ? data.items
          : []
      );
    } catch (error) {
      toast.error(
        error?.message ||
        "Erreur lors du chargement des leads disponibles."
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
    fetchLeads();
  }, [fetchLeads]);

  // =====================================================
  // PRISE EN CHARGE D'UN LEAD
  // =====================================================

  /**
   * Permet à l'agent connecté de prendre en charge
   * un lead non assigné.
   *
   * Une fois l'opération réussie, le lead est retiré
   * localement de la liste afin d'éviter une nouvelle
   * requête HTTP inutile.
   */
  const handleTakeLead = async (leadId) => {
    try {
      setTakingLeadId(leadId);

      await apiFetch(
        `/agent/leads/${leadId}/assign-to-me`,
        {
          method: "PATCH",
        }
      );

      toast.success(
        "Lead ajouté à vos prospects."
      );

      // =================================================
      // MISE À JOUR LOCALE
      // =================================================

      /**
       * Le lead vient d'être assigné à l'agent connecté.
       * Il ne doit donc plus apparaître dans les leads
       * disponibles.
       */
      setLeads((previousLeads) =>
        previousLeads.filter(
          (lead) => lead.id !== leadId
        )
      );
    } catch (error) {
      toast.error(
        error?.message ||
        "Impossible de prendre en charge ce lead."
      );
    } finally {
      setTakingLeadId(null);
    }
  };

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
          <h1 className="h3 fw-bold mb-1">
            Leads disponibles
          </h1>

          <p className="text-muted mb-0">
            Prospects actuellement non assignés.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary flex-shrink-0"
          onClick={fetchLeads}
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
                className="bi bi-arrow-clockwise me-2"
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

          <p className="mb-0">
            Chargement des leads...
          </p>
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
              bi-inbox
              fs-1
              d-block
              mb-3
            "
            aria-hidden="true"
          />

          <h2 className="h5 fw-semibold mb-2">
            Aucun lead disponible
          </h2>

          <p className="mb-0">
            Tous les leads disponibles sont
            actuellement pris en charge.
          </p>
        </div>
      ) : (
        // -------------------------------------------------
        // LISTE DES LEADS
        // -------------------------------------------------

        <div className="row g-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="
                col-12
                col-md-6
                col-xl-4
              "
            >
              <LeadCard
                lead={lead}
                mode="available"
                onTakeLead={handleTakeLead}
                loading={
                  takingLeadId === lead.id
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}