import { useCallback, useEffect, useId, useState } from "react";
import { QUOTE_REFUSAL_REASONS } from "../../constants/quoteOptions";

/**
 * Modale permettant au client de confirmer
 * sa décision concernant une offre commerciale.
 *
 * Deux modes sont disponibles :
 * - accept : confirmation de l'acceptation ;
 * - refuse : saisie obligatoire d'un motif de refus
 *            et commentaire facultatif.
 */
export default function QuoteDecisionModal({
  show,
  mode,
  loading = false,
  onClose,
  onConfirm,
}) {
  // =====================================================
  // IDENTIFIANTS ACCESSIBILITÉ
  // =====================================================

  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  const commentId = useId();

  // =====================================================
  // ÉTAT DU FORMULAIRE
  // =====================================================

  /**
   * Motif sélectionné lors d'un refus.
   */
  const [reason, setReason] = useState("");

  /**
   * Commentaire facultatif.
   */
  const [comment, setComment] = useState("");

  // =====================================================
  // RÉINITIALISATION
  // =====================================================

  /**
   * Réinitialise les données du formulaire à chaque
   * ouverture de la modale.
   *
   * Cela évite notamment de conserver un ancien motif
   * lorsqu'une nouvelle décision est ouverte.
   */
  useEffect(() => {
    if (!show) {
      return;
    }

    setReason("");
    setComment("");
  }, [show, mode]);

  // =====================================================
  // FERMETURE
  // =====================================================

  /**
   * Empêche la fermeture pendant le traitement
   * de la requête.
   */
  const handleClose = useCallback(() => {
    if (loading) {
      return;
    }

    onClose?.();
  }, [loading, onClose]);

  // =====================================================
  // CONFIRMATION
  // =====================================================

  /**
   * Valide les données puis transmet la décision
   * au composant parent.
   */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      // Le mode refus nécessite obligatoirement
      // la sélection d'un motif.
      if (mode === "refuse" && !reason) {
        return;
      }

      await onConfirm?.({
        reason,
        comment: comment.trim(),
      });
    },
    [comment, mode, onConfirm, reason]
  );

  // =====================================================
  // AFFICHAGE
  // =====================================================

  if (!show) {
    return null;
  }

  const isAcceptMode = mode === "accept";
  const isRefuseMode = mode === "refuse";

  const title = isAcceptMode ? "Accepter cette offre" : "Refuser cette offre";

  const submitLabel = isAcceptMode ? "Accepter" : "Refuser";

  const loadingLabel = isAcceptMode ? "Acceptation..." : "Refus...";

  const description = isAcceptMode
    ? "Vous êtes sur le point d'accepter cette offre commerciale."
    : "Merci de préciser la raison de votre refus.";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* =================================================
              EN-TÊTE
          ================================================= */}

          <div className="modal-header">
            <h2 id={titleId} className="modal-title h5 mb-0">
              {title}
            </h2>

            <button
              type="button"
              className="btn-close"
              aria-label="Fermer"
              onClick={handleClose}
              disabled={loading}
            />
          </div>

          {/* =================================================
              CONTENU
          ================================================= */}

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p id={descriptionId} className="mb-3">
                {description}
              </p>

              {/* =================================================
                  ACCEPTATION
              ================================================= */}

              {isAcceptMode && (
                <p className="text-muted mb-0">
                  Votre conseiller sera informé de votre décision.
                </p>
              )}

              {/* =================================================
                  REFUS
              ================================================= */}

              {isRefuseMode && (
                <>
                  {/* =================================================
                      MOTIF
                  ================================================= */}

                  <div className="mb-3">
                    <label htmlFor={reasonId} className="form-label">
                      Motif du refus
                      <span className="text-danger ms-1" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <select
                      id={reasonId}
                      className="form-select"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      disabled={loading}
                      required
                      aria-required="true"
                    >
                      <option value="">Sélectionner un motif...</option>
                      {Object.entries(QUOTE_REFUSAL_REASONS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* =================================================
                      COMMENTAIRE
                  ================================================= */}

                  <div className="mb-0">
                    <label htmlFor={commentId} className="form-label">
                      Commentaire{" "}
                      <span className="text-muted">(facultatif)</span>
                    </label>

                    <textarea
                      id={commentId}
                      className="form-control"
                      rows="3"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      disabled={loading}
                      placeholder="Ajoutez un commentaire si vous le souhaitez..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Annuler
              </button>

              <button
                type="submit"
                className={isAcceptMode ? "btn btn-success" : "btn btn-danger"}
                disabled={loading || (isRefuseMode && !reason)}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />

                    {loadingLabel}
                  </>
                ) : (
                  <>
                    <i
                      className={
                        isAcceptMode
                          ? "bi bi-check-circle me-2"
                          : "bi bi-x-circle me-2"
                      }
                      aria-hidden="true"
                    />

                    {submitLabel}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
