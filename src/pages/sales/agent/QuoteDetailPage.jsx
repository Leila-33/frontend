import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import QuoteStatusBadge from "../../../components/quotes/QuoteStatusBadge";
import ConfirmActionModal from "../../../components/common/ConfirmActionModal";
import apiFetch from "../../../services/apiFetch";

import QuoteInfoItem from "../../../components/quotes/QuoteInfoItem";
import QuoteSectionCard from "../../../components/quotes/QuoteSectionCard";
import QuoteVehicleSection from "../../../components/quotes/QuoteVehicleSection";
import QuoteFinancialSection from "../../../components/quotes/QuoteFinancialSection";
import QuoteFinancingSection from "../../../components/quotes/QuoteFinancingSection";
import QuoteTradeInSection from "../../../components/quotes/QuoteTradeInSection";
import QuoteLifecycleSection from "../../../components/quotes/QuoteLifecycleSection";
import QuoteSummarySection from "../../../components/quotes/QuoteSummarySection";
import QuotePageFooter from "../../../components/quotes/QuotePageFooter";

import { formatDateLong } from "../../../utils/dateUtils";

import "../../../styles/QuoteDetailPage.css";

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

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CHARGEMENT DU DEVIS
  // =====================================================

  const fetchQuote = useCallback(async () => {
    if (!id) {
      setQuote(null);
      setError("Identifiant du devis manquant.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(`/agent/quotes/${id}`, {
        method: "GET",
      });

      setQuote(data);
    } catch (err) {
      setQuote(null);
      setError(err?.message || "Impossible de charger le devis.");
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
    if (!quote?.id || quote.status !== "DRAFT") {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(`/agent/quotes/${quote.id}`, {
        method: "DELETE",
      });

      toast.success("Devis supprimé.");

      if (quote.lead?.id) {
        navigate(`/sales/leads/${quote.lead.id}`);
      } else {
        navigate("/sales/quotes");
      }
    } catch (err) {
      toast.error(err?.message || "Impossible de supprimer le devis.");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  }, [navigate, quote]);

  // =====================================================
  // ENVOI AU CLIENT
  // =====================================================

  const handleSend = useCallback(async () => {
    if (!quote?.id || quote.status !== "DRAFT" || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(`/agent/quotes/${quote.id}/send`, {
        method: "POST",
      });

      toast.success("Devis envoyé au client.");

      // Récupère le statut et les données actualisés.
      await fetchQuote();
    } catch (err) {
      toast.error(err?.message || "Impossible d'envoyer le devis.");
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchQuote, quote]);

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  if (loading) {
    return (
      <main className="customer-quote-page">
        <div className="customer-quote-container">
          <div className="quote-loading" role="status" aria-live="polite">
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
            <span>Chargement du devis...</span>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // DEVIS INTROUVABLE
  // =====================================================

  if (!quote) {
    return (
      <main className="customer-quote-page">
        <div className="customer-quote-container">
          <div className="quote-inline-error" role="alert">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />
            <span>{error || "Devis introuvable."}</span>

            <button
              type="button"
              className="quote-button quote-button--outline"
              onClick={() => navigate("/sales/quotes")}
            >
              Retour aux devis
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // DONNÉES D'AFFICHAGE
  // =====================================================

  const clientName =
    [quote.lead?.first_name, quote.lead?.last_name].filter(Boolean).join(" ") ||
    "Client non renseigné";

  // Selon le mapper, le véhicule peut être à la racine
  // du devis ou rattaché au lead.
  const vehicle = quote.vehicle ?? quote.lead?.vehicle;

  const canEdit = quote.status === "DRAFT";
  const canSend = quote.status === "DRAFT";

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <main className="customer-quote-page">
      <div className="customer-quote-container">
        {/* Fil d'Ariane */}
        <nav className="quote-breadcrumb" aria-label="Fil d’Ariane">
          <Link to="/sales">Accueil commercial</Link>

          <i className="bi bi-chevron-right" aria-hidden="true" />

          <span aria-current="page">Devis #{quote.id}</span>
        </nav>

        {/* En-tête */}
        <header className="quote-page-header">
          <div className="quote-page-header__main">
            <button
              type="button"
              className="quote-back-link"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
              Retour
            </button>

            <div className="quote-page-header__title-row">
              <div>
                <p className="quote-eyebrow">GESTION COMMERCIALE</p>

                <h1>Détail du devis</h1>

                <p className="quote-reference">
                  Référence <strong>#{quote.id}</strong>
                </p>
              </div>

              <QuoteStatusBadge status={quote.status} role="agent" />
            </div>
          </div>

          <div className="quote-page-header__date">
            <i className="bi bi-calendar3" aria-hidden="true" />

            <span>Créé le {formatDateLong(quote.created_at)}</span>
          </div>
        </header>

        {/* Erreur d'action ou de rechargement */}
        {error && (
          <div className="quote-inline-error" role="alert">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Fermer le message d’erreur"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Actions commerciales */}
        <div className="quote-agent-actions">
          {canEdit && (
            <>
              <button
                type="button"
                className="quote-button quote-button--outline"
                onClick={() => navigate(`/sales/quotes/${quote.id}/edit`)}
                disabled={actionLoading}
              >
                <i className="bi bi-pencil" aria-hidden="true" />
                Modifier le devis
              </button>

              <button
                type="button"
                className="quote-button quote-button--outline-danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                <i className="bi bi-trash" aria-hidden="true" />
                Supprimer
              </button>
            </>
          )}

          {canSend && (
            <button
              type="button"
              className="quote-button quote-button--primary"
              onClick={handleSend}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-send" aria-hidden="true" />
                  Envoyer au client
                </>
              )}
            </button>
          )}
        </div>

        {/* Organisation du contenu */}
        <div className="quote-layout">
          {/* Colonne principale */}
          <div className="quote-layout__main">
            {/* Informations du client */}
            <QuoteSectionCard
              icon="bi-person"
              title="Client associé"
              description="Coordonnées du prospect auquel ce devis est destiné."
            >
              <div className="quote-info-grid">
                <QuoteInfoItem label="Nom du client" value={clientName} />

                <QuoteInfoItem
                  label="Adresse e-mail"
                  value={quote.lead?.email || "Non renseignée"}
                />

                <QuoteInfoItem
                  label="Téléphone"
                  value={quote.lead?.phone || "Non renseigné"}
                />
              </div>

              {quote.lead?.id && (
                <Link
                  to={`/sales/leads/${quote.lead.id}`}
                  className="quote-vehicle__link"
                >
                  Consulter la fiche du prospect
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
              )}
            </QuoteSectionCard>

            {/* Véhicule proposé */}
            <QuoteVehicleSection vehicle={vehicle} showVehicleLink={false} />

            {/* Détail financier */}
            <QuoteFinancialSection quote={quote} />

            {/* Financement */}
            <QuoteFinancingSection quote={quote} />

            {/* Reprise */}
            <QuoteTradeInSection quote={quote} />

            {/* Dates et décision du client */}
            <QuoteLifecycleSection quote={quote} />
          </div>

          {/* Colonne latérale */}
          <aside
            className="quote-layout__sidebar"
            aria-label="Récapitulatif du devis"
          >
            {/* Récapitulatif financier sans actions client */}
            <QuoteSummarySection quote={quote} showClientActions={false} />

            {/* État commercial */}
            <QuoteSectionCard
              icon="bi-clipboard-check"
              title="Suivi commercial"
              description="État actuel de la proposition."
            >
              {quote.status === "DRAFT" && (
                <div
                  className="quote-result-message quote-result-message--neutral"
                  role="status"
                >
                  <i className="bi bi-pencil-square" aria-hidden="true" />

                  <div>
                    <strong>Devis en préparation</strong>
                    <p>
                      Vérifiez les montants avant de transmettre la proposition
                      au client.
                    </p>
                  </div>
                </div>
              )}

              {quote.status === "SENT" && (
                <div
                  className="quote-result-message quote-result-message--warning"
                  role="status"
                >
                  <i className="bi bi-clock" aria-hidden="true" />

                  <div>
                    <strong>En attente de réponse</strong>
                    <p>Le devis a été envoyé au client.</p>
                  </div>
                </div>
              )}

              {quote.status === "ACCEPTED" && (
                <div
                  className="quote-result-message quote-result-message--success"
                  role="status"
                >
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />

                  <div>
                    <strong>Devis accepté</strong>
                    <p>Le client a accepté la proposition commerciale.</p>
                  </div>
                </div>
              )}

              {quote.status === "REJECTED" && (
                <div
                  className="quote-result-message quote-result-message--danger"
                  role="status"
                >
                  <i className="bi bi-x-circle-fill" aria-hidden="true" />

                  <div>
                    <strong>Devis refusé</strong>
                    <p>Le client a refusé la proposition commerciale.</p>
                  </div>
                </div>
              )}

              {quote.status === "EXPIRED" && (
                <div
                  className="quote-result-message quote-result-message--warning"
                  role="status"
                >
                  <i className="bi bi-clock-history" aria-hidden="true" />

                  <div>
                    <strong>Devis expiré</strong>
                    <p>La date de validité de la proposition est dépassée.</p>
                  </div>
                </div>
              )}
            </QuoteSectionCard>
          </aside>
        </div>

        {/* Pied de page partagé */}
        <QuotePageFooter />
      </div>

      {/* Confirmation de suppression */}
      <ConfirmActionModal
        open={showDeleteModal}
        type="delete"
        title="Supprimer ce devis ?"
        description={
          <>
            Cette action est définitive.
            <br />
            Le devis sera supprimé.
          </>
        }
        loading={actionLoading}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
