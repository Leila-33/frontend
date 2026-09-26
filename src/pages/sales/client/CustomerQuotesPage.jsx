import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";
import { formatAmount } from "../../../utils/priceUtils";
import { QUOTE_STATUSES } from "../../../constants/quoteOptions";

import QuoteStatusBadge from "../../../components/quotes/QuoteStatusBadge";

/**
 * Page permettant au client de consulter
 * ses offres commerciales.
 *
 * Les offres sont regroupées par statut :
 * - offres en attente de réponse ;
 * - offres acceptées ;
 * - offres refusées ;
 * - offres expirées.
 *
 * Les offres nécessitant une action du client
 * sont également identifiées visuellement.
 */
export default function CustomerQuotesPage() {
  // =====================================================
  // ÉTAT
  // =====================================================

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHARGEMENT DES OFFRES
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadQuotes = async () => {
      try {
        setLoading(true);

        const data = await apiFetch("/quotes", {
          method: "GET",
        });

        // Évite une mise à jour d'état si le composant
        // a été démonté pendant la requête.
        if (isMounted) {
          setQuotes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || "Impossible de charger vos offres.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadQuotes();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // REGROUPEMENT PAR STATUT
  // =====================================================

  /**
   * Regroupe les offres en un seul parcours du tableau.
   *
   * Cela évite de parcourir `quotes` quatre fois
   * avec quatre appels successifs à `filter()`.
   */
  const quotesByStatus = useMemo(() => {
    const groupedQuotes = {
      SENT: [],
      ACCEPTED: [],
      REJECTED: [],
      EXPIRED: [],
    };

    quotes.forEach((quote) => {
      if (Object.prototype.hasOwnProperty.call(groupedQuotes, quote.status)) {
        groupedQuotes[quote.status].push(quote);
      }
    });

    return groupedQuotes;
  }, [quotes]);

  // =====================================================
  // RENDU D'UNE SECTION
  // =====================================================

  const renderQuotes = (status) => {
    const statusQuotes = quotesByStatus[status];

    // Ne crée pas de section vide.
    if (!statusQuotes?.length) {
      return null;
    }

    const statusConfig = QUOTE_STATUSES[status];

    if (!statusConfig) {
      return null;
    }

    return (
      <section
        key={status}
        className="mb-5"
        aria-labelledby={`quotes-${status}`}
      >
        <h2 id={`quotes-${status}`} className="h4 fw-bold mb-3">
          {statusConfig.title}
        </h2>

        <div className="d-flex flex-column gap-3">
          {statusQuotes.map((quote) => {
            const vehicleName =
              [quote?.vehicle?.brand, quote?.vehicle?.model]
                .filter(Boolean)
                .join(" ") || "Véhicule non renseigné";

            return (
              <article
                key={quote.id}
                className="card border-0 shadow-sm rounded-4"
              >
                <div className="card-body p-4">
                  {/* =====================================
                      EN-TÊTE
                  ===================================== */}

                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div>
                      <h3 className="h5 fw-semibold mb-2">{vehicleName}</h3>

                      <p className="text-muted mb-1">
                        Prix :{" "}
                        <strong className="text-body">
                          {formatAmount(quote?.base_price)}
                        </strong>
                      </p>

                      <p className="mb-0">
                        Mensualité :{" "}
                        <strong>
                          {quote?.monthly_payment != null
                            ? `${formatAmount(quote.monthly_payment)}/mois`
                            : "Non renseignée"}
                        </strong>
                      </p>
                    </div>

                    {/* =================================
                        STATUTS
                    ================================= */}

                    <div className="d-flex flex-column align-items-md-end gap-2">
                      <QuoteStatusBadge status={quote.status} role="client" />

                      {quote.requires_action && (
                        <span className="badge bg-warning text-dark">
                          Action requise
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =====================================
                      ACTION REQUISE
                  ===================================== */}

                  {quote.requires_action && (
                    <div
                      className="alert alert-warning mt-4 mb-0"
                      role="status"
                    >
                      <i
                        className="bi bi-exclamation-circle me-2"
                        aria-hidden="true"
                      />
                      Votre réponse est attendue pour cette offre.
                    </div>
                  )}

                  {/* =====================================
                      ACTION
                  ===================================== */}

                  <div className="mt-4">
                    <Link
                      to={`/quotes/${quote.id}`}
                      className="btn btn-outline-primary"
                    >
                      <i
                        className="bi bi-file-earmark-text me-2"
                        aria-hidden="true"
                      />
                      Voir l'offre
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <main className="container mt-4 mb-5">
        <div
          className="d-flex justify-content-center align-items-center gap-2 py-5"
          role="status"
          aria-live="polite"
        >
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />

          <span>Chargement de vos offres...</span>
        </div>
      </main>
    );
  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <main className="container mt-4 mb-5">
      <h1 className="fw-bold mb-4">Mes offres commerciales</h1>

      {/* ===============================================
          AUCUNE OFFRE
      =============================================== */}

      {quotes.length === 0 && (
        <div className="alert alert-info">
          Vous n'avez aucune offre commerciale.
        </div>
      )}

      {/* ===============================================
          OFFRES PAR STATUT
      =============================================== */}

      {renderQuotes("SENT")}

      {renderQuotes("ACCEPTED")}

      {renderQuotes("REJECTED")}

      {renderQuotes("EXPIRED")}
    </main>
  );
}
