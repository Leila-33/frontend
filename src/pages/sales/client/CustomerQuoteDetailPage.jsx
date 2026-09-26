import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import QuoteDecisionModal from "../../../components/sales/QuoteDecisionModal";
import QuoteFinancingCard from "../../../components/quotes/QuoteFinancingCard";
import QuoteStatusBadge from "../../../components/quotes/QuoteStatusBadge";
import QuoteTradeInCard from "../../../components/quotes/QuoteTradeInCard";
import QuoteVehicleCard from "../../../components/quotes/QuoteVehicleCard";
import { formatDate } from "../../../utils/dateUtils";

import apiFetch from "../../../services/apiFetch";

/**
 * Page de détail d'une offre commerciale côté client.
 *
 * Le client peut :
 * - consulter son offre ;
 * - consulter le véhicule proposé ;
 * - consulter les conditions financières ;
 * - consulter une éventuelle reprise ;
 * - consulter son conseiller ;
 * - accepter l'offre ;
 * - refuser l'offre ;
 * - accéder à son dossier après acceptation.
 *
 * Les composants de présentation communs aux offres
 * sont réutilisés depuis `components/quotes`.
 */
export default function CustomerQuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ÉTAT
  // =====================================================

  /**
   * Offre actuellement chargée.
   */
  const [quote, setQuote] = useState(null);

  /**
   * Chargement initial de l'offre.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Chargement d'une action :
   * - acceptation ;
   * - refus.
   */
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Contrôle d'ouverture de la modale de décision.
   */
  const [showDecision, setShowDecision] = useState(false);

  /**
   * Action sélectionnée dans la modale :
   * - accept ;
   * - refuse.
   */
  const [decisionMode, setDecisionMode] = useState(null);

  /**
   * Message d'erreur de chargement.
   */
  const [error, setError] = useState(null);

  // =====================================================
  // CHARGEMENT DE L'OFFRE
  // =====================================================

  /**
   * Récupère l'offre depuis l'API.
   *
   * `useCallback` permet de conserver une référence stable
   * utilisée par `useEffect`.
   */
  const fetchQuote = useCallback(async () => {
    if (!id) {
      setQuote(null);
      setError("Offre introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch(`/quotes/${id}`, {
        method: "GET",
      });

      setQuote(data);
    } catch (error) {
      setQuote(null);

      const message = error?.message || "Impossible de charger cette offre.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // =====================================================
  // ACCEPTATION
  // =====================================================

  /**
   * Accepte l'offre commerciale.
   *
   * L'API crée le dossier associé puis retourne
   * son identifiant.
   */
  const acceptQuote = useCallback(async () => {
    if (!id) {
      return false;
    }

    try {
      setActionLoading(true);

      const data = await apiFetch(`/quotes/${id}/accept`, {
        method: "POST",
      });

      toast.success(data?.message || "Votre offre a été acceptée.");

      /**
       * Le dossier ayant été créé par l'API,
       * on redirige directement le client vers celui-ci.
       */
      if (data?.application_id) {
        navigate(`/applications/${data.application_id}`);
      } else {
        /**
         * Sécurité si l'API ne retourne pas
         * immédiatement l'identifiant du dossier.
         */
        await fetchQuote();
      }

      return true;
    } catch (error) {
      toast.error(error?.message || "Impossible d'accepter cette offre.");

      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchQuote, id, navigate]);

  // =====================================================
  // REFUS
  // =====================================================

  /**
   * Refuse l'offre commerciale.
   *
   * `data` provient de la modale et contient :
   * - reason ;
   * - comment.
   */
  const refuseQuote = useCallback(
    async (data) => {
      if (!id) {
        return false;
      }

      try {
        setActionLoading(true);

        await apiFetch(`/quotes/${id}/refuse`, {
          method: "POST",
          body: {
            reason: data?.reason,
            comment: data?.comment,
          },
        });

        toast.success("Votre refus a été enregistré.");

        /**
         * On recharge l'offre afin d'afficher
         * immédiatement son nouveau statut.
         */
        await fetchQuote();

        return true;
      } catch (error) {
        toast.error(error?.message || "Impossible de refuser cette offre.");

        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchQuote, id]
  );

  // =====================================================
  // DÉCISION
  // =====================================================

  /**
   * Ouvre la modale d'acceptation.
   */
  const handleAcceptClick = useCallback(() => {
    setDecisionMode("accept");
    setShowDecision(true);
  }, []);

  /**
   * Ouvre la modale de refus.
   */
  const handleRefuseClick = useCallback(() => {
    setDecisionMode("refuse");
    setShowDecision(true);
  }, []);

  /**
   * Ferme la modale de décision.
   *
   * Une action en cours empêche sa fermeture afin
   * d'éviter une interaction pendant la requête.
   */
  const handleCloseDecision = useCallback(() => {
    if (actionLoading) {
      return;
    }

    setShowDecision(false);
    setDecisionMode(null);
  }, [actionLoading]);

  /**
   * Exécute la décision sélectionnée dans la modale.
   *
   * La modale ne se ferme que lorsque l'action
   * a réellement réussi.
   */
  const handleDecisionConfirm = useCallback(
    async (data) => {
      let success = false;

      if (decisionMode === "accept") {
        success = await acceptQuote();
      }

      if (decisionMode === "refuse") {
        success = await refuseQuote(data);
      }

      if (success) {
        setShowDecision(false);
        setDecisionMode(null);
      }
    },
    [acceptQuote, decisionMode, refuseQuote]
  );

  // =====================================================
  // ÉTAT DE CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center gap-2 text-muted"
          role="status"
          aria-live="polite"
        >
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />

          <span>Chargement de l'offre...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ÉTAT D'ERREUR
  // =====================================================

  if (error || !quote) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || "Offre introuvable."}
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Retour
        </button>
      </div>
    );
  }

  // =====================================================
  // DONNÉES D'AFFICHAGE
  // =====================================================

  const applicationId = quote.application_id;

  const salesAgentName =
    [quote.sales_agent?.first_name, quote.sales_agent?.last_name]
      .filter(Boolean)
      .join(" ") || "Conseiller non renseigné";

  const createdAt = formatDate(quote.created_at);

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container py-4 pb-5">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Votre offre commerciale</h1>

          <div className="text-muted">Offre #{quote.id}</div>

          <div className="text-muted small">Créée le {createdAt}</div>
        </div>

        <div className="d-flex flex-column align-items-lg-end gap-3">
          <QuoteStatusBadge status={quote.status} role="client" />

          {/* =================================================
              DOSSIER APRÈS ACCEPTATION
          ================================================= */}

          {quote.status === "ACCEPTED" && applicationId && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => navigate(`/applications/${applicationId}`)}
            >
              <i className="bi bi-folder2-open me-2" aria-hidden="true" />
              Voir mon dossier
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          MESSAGE SELON LE STATUT
      ===================================================== */}

      {quote.status === "ACCEPTED" && (
        <div className="alert alert-success mb-4" role="status">
          <div className="d-flex gap-2">
            <i className="bi bi-check-circle mt-1" aria-hidden="true" />

            <div>
              <strong>Offre acceptée</strong>

              <div>
                Vous avez accepté cette offre.
                {applicationId && (
                  <> Votre dossier de financement a été créé.</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {quote.status === "REJECTED" && (
        <div className="alert alert-danger mb-4" role="status">
          <div className="d-flex gap-2">
            <i className="bi bi-x-circle mt-1" aria-hidden="true" />

            <div>
              <strong>Offre refusée</strong>

              <div>Vous avez refusé cette offre.</div>
            </div>
          </div>
        </div>
      )}

      {quote.status === "EXPIRED" && (
        <div className="alert alert-warning mb-4" role="status">
          <div className="d-flex gap-2">
            <i className="bi bi-clock-history mt-1" aria-hidden="true" />

            <div>
              <strong>Offre expirée</strong>

              <div>
                Cette offre n'est plus valable et ne peut plus être acceptée.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INFORMATIONS DE L'OFFRE
      ===================================================== */}

      <div className="row g-4">
        {/* ===================================================
            VÉHICULE
        =================================================== */}

        <div className="col-lg-6">
          <QuoteVehicleCard quote={quote} />
        </div>

        {/* ===================================================
            FINANCEMENT
        =================================================== */}

        <div className="col-lg-8">
          <QuoteFinancingCard quote={quote} />
        </div>

        {/* ===================================================
            REPRISE
        =================================================== */}

        <div className="col-lg-4">
          <QuoteTradeInCard quote={quote} />
        </div>

        {/* ===================================================
            CONSEILLER
        =================================================== */}

        {quote.sales_agent && (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-3">
                  <i className="bi bi-headset me-2" aria-hidden="true" />
                  Votre conseiller
                </h2>

                <div className="fw-semibold">{salesAgentName}</div>

                {quote.sales_agent.email && (
                  <div className="text-muted">{quote.sales_agent.email}</div>
                )}

                {quote.sales_agent.phone && (
                  <div className="text-muted">{quote.sales_agent.phone}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ACTIONS CLIENT
      ===================================================== */}

      {quote.status === "SENT" && (
        <div className="d-flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleAcceptClick}
            disabled={actionLoading}
          >
            <i className="bi bi-check-circle me-2" aria-hidden="true" />
            Accepter l'offre
          </button>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleRefuseClick}
            disabled={actionLoading}
          >
            <i className="bi bi-x-circle me-2" aria-hidden="true" />
            Refuser l'offre
          </button>
        </div>
      )}

      {/* =====================================================
          RETOUR
      ===================================================== */}

      <div className="mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
          disabled={actionLoading}
        >
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Retour
        </button>
      </div>

      {/* =====================================================
          MODALE DE DÉCISION
      ===================================================== */}

      <QuoteDecisionModal
        show={showDecision}
        mode={decisionMode}
        loading={actionLoading}
        onClose={handleCloseDecision}
        onConfirm={handleDecisionConfirm}
      />
    </div>
  );
}
