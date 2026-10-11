import QuoteStatusBadge from "../../../components/quotes/QuoteStatusBadge";
import { formatDateLong } from "../../../utils/dateUtils";
import DecisionModal from "../../../components/sales/DecisionModal";
import "../../../styles/QuoteDetailPage.css";
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
// ============================================================
// IMPORTS
// ============================================================

// Hooks React :
// - useState : stocke les données et l'état de la page.
// - useEffect : charge le devis au montage du composant.
// - useCallback : stabilise la fonction de chargement.
// - useMemo : mémorise le nom du véhicule calculé.
import { useCallback, useEffect, useState } from "react";

// Navigation React Router.
import { Link, useNavigate, useParams } from "react-router-dom";

// Notifications visuelles après une action.
import { toast } from "react-toastify";

// Fonction centralisée pour effectuer les appels à l'API.
import apiFetch from "../../../services/apiFetch";

// Styles modernes de la page.
import "../../../styles/QuoteDetailPage.css";

import QuoteVehicleSection from "../../../components/quotes/QuoteVehicleSection";
import QuoteFinancialSection from "../../../components/quotes/QuoteFinancialSection";
import QuoteFinancingSection from "../../../components/quotes/QuoteFinancingSection";
import QuoteTradeInSection from "../../../components/quotes/QuoteTradeInSection";
import QuoteLifecycleSection from "../../../components/quotes/QuoteLifecycleSection";
import QuoteSummarySection from "../../../components/quotes/QuoteSummarySection";
import QuotePageFooter from "../../../components/quotes/QuotePageFooter";
// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

// Récupère un message exploitable depuis une erreur API.
// Si aucun message n'est disponible, utilise un message générique.
const getErrorMessage = (error, fallback) => {
  return error?.message || fallback;
};

// ============================================================
// PAGE PRINCIPALE : DÉTAIL DU DEVIS CLIENT
// ============================================================

export default function CustomerQuoteDetailPage() {
  // Récupère l'identifiant du devis depuis l'URL.
  // Exemple : /quotes/123 -> id = "123".
  const { id } = useParams();

  // Permet de naviguer vers une autre page.
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // ÉTATS DE LA PAGE
  // ----------------------------------------------------------

  // Données du devis renvoyées par l'API.
  const [quote, setQuote] = useState(null);

  // Indique si le chargement initial est en cours.
  const [loading, setLoading] = useState(true);

  // Indique si une acceptation ou un refus est en cours.
  const [actionLoading, setActionLoading] = useState(false);

  // Contient un éventuel message d'erreur de chargement.
  const [error, setError] = useState("");

  // Vaut "accept", "refuse" ou null selon la modale affichée.
  const [decision, setDecision] = useState(null);

  // Stocke le motif et le commentaire facultatifs du refus.
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  // ----------------------------------------------------------
  // CHARGEMENT DU DEVIS
  // ----------------------------------------------------------

  // Interroge l'API pour obtenir les données détaillées du devis.
  // useCallback stabilise la fonction afin de pouvoir la réutiliser
  // dans useEffect et dans le bouton « Réessayer ».
  const loadQuote = useCallback(async () => {
    // Vérifie la présence de l'identifiant dans l'URL.
    if (!id) {
      setError("Identifiant du devis manquant.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // L'URL est encodée afin de limiter les problèmes liés
      // aux caractères particuliers dans l'identifiant.
      const data = await apiFetch(`/quotes/${encodeURIComponent(id)}`);

      setQuote(data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Impossible de charger les détails du devis.")
      );
    } finally {
      // Le chargement se termine même si l'appel échoue.
      setLoading(false);
    }
  }, [id]);

  // Charge les informations lorsque le composant est monté
  // et recharge le devis si l'identifiant change.
  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  // ----------------------------------------------------------
  // DONNÉES DÉRIVÉES
  // ----------------------------------------------------------

  // Statut du devis transmis par le backend.
  const status = quote?.status;

  // Seul un devis envoyé peut être accepté ou refusé.
  const canDecide = status === "SENT";

  // Référence du devis : référence métier, identifiant du devis,
  // puis identifiant provenant de l'URL comme solution de repli.
  const quoteReference = quote?.id || id;

  // ----------------------------------------------------------
  // OUVERTURE ET FERMETURE DE LA MODALE
  // ----------------------------------------------------------

  // Ouvre la modale uniquement si le statut du devis permet
  // encore une décision et qu'aucune action n'est en cours.
  const openDecision = (type) => {
    if (!canDecide || actionLoading) {
      return;
    }

    // Réinitialise le motif à chaque nouvelle décision.
    setReason("");
    setComment("");
    setDecision(type);
  };

  // Ferme la modale si aucune action n'est en cours.
  const closeDecision = () => {
    if (actionLoading) {
      return;
    }

    setDecision(null);
  };

  // ----------------------------------------------------------
  // ACCEPTATION OU REFUS DU DEVIS
  // ----------------------------------------------------------

  const handleDecision = async () => {
    // Vérifie que le choix et le devis sont disponibles.
    if (!decision || !quote || actionLoading) {
      return;
    }

    const currentDecision = decision;

    // Sélectionne la route correspondant à la décision.
    // Vérifie les routes exactes avec ton backend.
    const endpoint =
      currentDecision === "accept"
        ? `/quotes/${encodeURIComponent(id)}/accept`
        : `/quotes/${encodeURIComponent(id)}/refuse`;

    setActionLoading(true);

    try {
      // La méthode POST transmet la décision au backend.
      const options = {
        method: "POST",
      };

      // Le motif n'est envoyé que pour un refus.
      if (currentDecision === "refuse") {
        options.headers = {
          "Content-Type": "application/json",
        };

        options.body = JSON.stringify({
          reason: reason.trim() || null,
          comment: comment.trim() || null,
        });
      }

      // L'API reste responsable de valider la décision
      // et de modifier réellement le statut du devis.
      const result = await apiFetch(endpoint, options);

      setDecision(null);

      if (currentDecision === "accept") {
        // Confirmation visuelle après réponse réussie de l'API.
        toast.success("Votre devis a été accepté.");

        // Si l'API renvoie l'identifiant du dossier associé,
        // redirige le client vers ce dossier.
        const applicationId = result?.application_id || quote?.application_id;

        if (applicationId) {
          navigate(`/applications/${applicationId}`, { replace: true });

          return;
        }

        // Si l'identifiant du dossier n'est pas disponible,
        // recharge le devis pour actualiser son statut.
        await loadQuote();
      } else {
        // Après un refus, recharge les données du devis.
        toast.success("Votre refus a bien été enregistré.");

        await loadQuote();
      }
    } catch (err) {
      // Affiche une erreur sans simuler la réussite de l'action.
      toast.error(
        getErrorMessage(
          err,
          currentDecision === "accept"
            ? "Impossible d’accepter le devis."
            : "Impossible de refuser le devis."
        )
      );
    } finally {
      // Réactive les boutons même si l'API renvoie une erreur.
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------------
  // ÉTAT : CHARGEMENT INITIAL
  // ----------------------------------------------------------

  if (loading) {
    return (
      <main className="customer-quote-page">
        <div className="quote-loading" role="status" aria-live="polite">
          <span className="quote-spinner" />
          <p>Chargement de votre devis...</p>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------
  // ÉTAT : ERREUR DE CHARGEMENT
  // ----------------------------------------------------------

  // Si aucun devis n'a été obtenu, affiche une page d'erreur
  // avec la possibilité de relancer l'appel API.
  if (error && !quote) {
    return (
      <main className="customer-quote-page">
        <div className="quote-error">
          <div className="quote-error__icon">
            <i className="bi bi-exclamation-triangle" />
          </div>

          <h1>Devis indisponible</h1>

          <p>{error}</p>

          <div className="quote-error__actions">
            <button
              type="button"
              className="quote-button quote-button--primary"
              onClick={loadQuote}
            >
              <i className="bi bi-arrow-clockwise" />
              Réessayer
            </button>

            <button
              type="button"
              className="quote-button quote-button--secondary"
              onClick={() => navigate(-1)}
            >
              Retour
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Protection supplémentaire si aucune donnée n'est disponible.
  if (!quote) {
    return null;
  }

  // ==========================================================
  // AFFICHAGE PRINCIPAL
  // ==========================================================

  return (
    <main className="customer-quote-page">
      <div className="customer-quote-container">
        {/* Fil d'Ariane */}
        <nav className="quote-breadcrumb" aria-label="Fil d’Ariane">
          <Link to="/">Accueil</Link>

          <i className="bi bi-chevron-right" aria-hidden="true" />

          <Link to="/quotes">Mes devis</Link>

          <i className="bi bi-chevron-right" aria-hidden="true" />

          <span aria-current="page">Détail du devis</span>
        </nav>

        {/* En-tête du devis */}
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
                <p className="quote-eyebrow">PROPOSITION COMMERCIALE</p>

                <h1>Votre devis</h1>

                <p className="quote-reference">
                  Référence <strong>#{quoteReference}</strong>
                </p>
              </div>

              <QuoteStatusBadge status={status} />
            </div>
          </div>

          <div className="quote-page-header__date">
            <i className="bi bi-calendar3" aria-hidden="true" />
            <span>Créé le {formatDateLong(quote.created_at)}</span>
          </div>
        </header>

        {/* Erreur de rechargement */}
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

        {/* Contenu principal et colonne latérale */}
        <div className="quote-layout">
          {/* Colonne principale */}
          <div className="quote-layout__main">
            <QuoteVehicleSection
              vehicle={quote.vehicle}
              vehiclePath={
                quote.vehicle?.id ? `/vehicle/${quote.vehicle.id}` : undefined
              }
            />

            <QuoteFinancialSection quote={quote} />

            <QuoteFinancingSection quote={quote} />

            <QuoteTradeInSection quote={quote} />

            <QuoteLifecycleSection quote={quote} />
          </div>

          {/* Colonne latérale */}
          <aside
            className="quote-layout__sidebar"
            aria-label="Récapitulatif et assistance"
          >
            <QuoteSummarySection
              quote={quote}
              canDecide={canDecide}
              actionLoading={actionLoading}
              openDecision={openDecision}
            />

            <section className="quote-help-card">
              <div className="quote-help-card__icon">
                <i className="bi bi-headset" aria-hidden="true" />
              </div>

              <h3>Besoin d’aide ?</h3>

              <p>
                Une question sur votre devis ou ses conditions ? Notre équipe
                est là pour vous accompagner.
              </p>

              <Link to="/support-tickets" className="quote-help-card__link">
                Contacter le support
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            </section>

            <p className="quote-security-note">
              <i className="bi bi-shield-check" aria-hidden="true" />
              Vos informations sont traitées de manière sécurisée.
            </p>
          </aside>
        </div>

        {/* Pied de page */}
        <QuotePageFooter />
      </div>

      {/* Modale de confirmation */}
      <DecisionModal
        type={decision}
        loading={actionLoading}
        onClose={closeDecision}
        onConfirm={handleDecision}
        reason={reason}
        setReason={setReason}
        comment={comment}
        setComment={setComment}
      />
    </main>
  );
}
