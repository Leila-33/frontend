import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import ConfirmActionModal from "../../../components/common/ConfirmActionModal";
import apiFetch from "../../../services/apiFetch";
import QuoteVehicleCard from "../../../components/quotes/QuoteVehicleCard";
import QuoteFinancingCard from "../../../components/quotes/QuoteFinancingCard";
import QuoteTradeInCard from "../../../components/quotes/QuoteTradeInCard";
import QuoteStatusBadge from "../../../components/quotes/QuoteStatusBadge";

/**
 * Page de détail d'une offre commerciale.
 *
 * Permet au commercial de :
 * - consulter l'offre ;
 * - consulter le client et le véhicule ;
 * - consulter le financement ;
 * - consulter la reprise éventuelle ;
 * - modifier une offre en brouillon ;
 * - envoyer une offre au client ;
 * - supprimer une offre en brouillon.
 */
export default function QuoteDetailPage() {
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
   * - envoi ;
   * - suppression.
   */
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Contrôle d'ouverture de la modale de suppression.
   */
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // =====================================================
  // CHARGEMENT DE L'OFFRE
  // =====================================================

  const fetchQuote = useCallback(async () => {
    if (!id) {
      setQuote(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch(`/agent/quotes/${id}`, {
        method: "GET",
      });

      setQuote(data);
    } catch (error) {
      setQuote(null);

      toast.error(error?.message || "Impossible de charger l'offre.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // =====================================================
  // SUPPRESSION
  // =====================================================

  const handleDelete = useCallback(async () => {
    if (!quote?.id) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(`/agent/quotes/${quote.id}`, {
        method: "DELETE",
      });

      toast.success("Offre supprimée.");

      /**
       * Après suppression, retour vers le détail
       * du lead auquel l'offre était associée.
       */
      navigate(`/sales/leads/${quote.lead?.id}`);
    } catch (error) {
      toast.error(error?.message || "Impossible de supprimer l'offre.");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  }, [navigate, quote]);

  // =====================================================
  // ENVOI DE L'OFFRE
  // =====================================================

  const handleSend = useCallback(async () => {
    if (!quote?.id || quote.status !== "DRAFT") {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(`/agent/quotes/${quote.id}/send`, {
        method: "POST",
      });

      toast.success("Offre envoyée au client.");

      /**
       * Recharge l'offre afin de récupérer son nouveau statut
       * et les éventuelles données mises à jour par le backend.
       */
      await fetchQuote();
    } catch (error) {
      toast.error(error?.message || "Impossible d'envoyer l'offre.");
    } finally {
      setActionLoading(false);
    }
  }, [fetchQuote, quote]);

  // =====================================================
  // ÉTATS DE CHARGEMENT / ERREUR
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

  if (!quote) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Offre introuvable.</div>
      </div>
    );
  }

  // =====================================================
  // DONNÉES ASSOCIÉES
  // =====================================================

  const clientName =
    [quote.lead?.first_name, quote.lead?.last_name].filter(Boolean).join(" ") ||
    "Client non renseigné";

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container py-4">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Offre commerciale</h1>

          <div className="text-muted">#{quote.id}</div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Statut de l'offre */}
          <QuoteStatusBadge status={quote.status} role="agent" />

          {/* Actions disponibles uniquement pour un brouillon */}
          {quote.status === "DRAFT" && (
            <>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => navigate(`/sales/quotes/${quote.id}/edit`)}
                disabled={actionLoading}
              >
                <i className="bi bi-pencil me-2" aria-hidden="true" />
                Modifier
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                <i className="bi bi-trash me-2" aria-hidden="true" />
                Supprimer
              </button>
            </>
          )}

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2" aria-hidden="true" />
            Retour
          </button>
        </div>
      </div>

      {/* =====================================================
          INFORMATIONS PRINCIPALES
      ===================================================== */}
      <div className="row g-4">
        {/* ===================================================
      CLIENT
  =================================================== */}

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold mb-3">Client</h2>

              <div className="fw-semibold">{clientName}</div>

              {quote.lead?.email && (
                <div className="text-muted">{quote.lead.email}</div>
              )}

              {quote.lead?.phone && (
                <div className="text-muted">{quote.lead.phone}</div>
              )}
            </div>
          </div>
        </div>

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
      </div>

      {/* =====================================================
          ACTION COMMERCIALE
      ===================================================== */}

      <div className="mt-4">
        {quote.status === "DRAFT" && (
          <button
            type="button"
            className="btn btn-dark"
            onClick={handleSend}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
                Envoi...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2" aria-hidden="true" />
                Envoyer l'offre au client
              </>
            )}
          </button>
        )}

        {quote.status === "SENT" && (
          <div className="alert alert-info mb-0" role="status">
            <i className="bi bi-clock me-2" aria-hidden="true" />
            Offre envoyée au client. En attente de sa réponse.
          </div>
        )}

        {quote.status === "ACCEPTED" && (
          <div className="alert alert-success mb-0" role="status">
            <i className="bi bi-check-circle me-2" aria-hidden="true" />
            Offre acceptée par le client.
          </div>
        )}

        {quote.status === "REJECTED" && (
          <div className="alert alert-danger mb-0" role="status">
            <i className="bi bi-x-circle me-2" aria-hidden="true" />
            Offre refusée par le client.
          </div>
        )}

        {quote.status === "EXPIRED" && (
          <div className="alert alert-secondary mb-0" role="status">
            <i className="bi bi-clock-history me-2" aria-hidden="true" />
            Cette offre a expiré.
          </div>
        )}
      </div>

      {/* =====================================================
          MODALE DE SUPPRESSION
      ===================================================== */}

      <ConfirmActionModal
        open={showDeleteModal}
        type="delete"
        title="Supprimer cette offre ?"
        description={
          <>
            Cette action est définitive.
            <br />
            L'offre sera supprimée.
          </>
        }
        loading={actionLoading}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
