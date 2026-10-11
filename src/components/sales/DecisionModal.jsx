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
export default function DecisionModal({
  type,
  loading,
  onClose,
  onConfirm,
  reason,
  setReason,
  comment,
  setComment,
}) {
  if (!type) {
    return null;
  }

  const isAccept = type === "accept";

  // Identifiants uniques pour associer chaque label à son champ.
  const reasonId = "quote-refusal-reason";
  const commentId = "quote-refusal-comment";

  // Le refus ne peut être confirmé sans motif.
  const isRefusalInvalid = !isAccept && !reason;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading || isRefusalInvalid) {
      return;
    }

    onConfirm();
  };

  return (
    <div
      className="quote-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="quote-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        {/* Icône adaptée à la décision */}
        <div
          className={`quote-modal__icon ${
            isAccept
              ? "quote-modal__icon--success"
              : "quote-modal__icon--danger"
          }`}
        >
          <i
            className={`bi ${isAccept ? "bi-check-lg" : "bi-x-lg"}`}
            aria-hidden="true"
          />
        </div>

        {/* Titre et explication */}
        <h2 id="quote-modal-title" className="quote-modal__title">
          {isAccept ? "Accepter ce devis ?" : "Refuser ce devis ?"}
        </h2>

        <p className="quote-modal__description">
          {isAccept
            ? "En confirmant votre choix, vous acceptez la proposition commerciale. Votre dossier sera accessible après validation."
            : "Vous êtes sur le point de refuser cette proposition. Veuillez sélectionner un motif et ajoutez un commentaire si nécessaire."}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Champs affichés uniquement lors d'un refus */}
          {!isAccept && (
            <div className="quote-modal__fields">
              {/* MOTIF DU REFUS */}
              <div className="quote-modal__field mb-3">
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

              {/* COMMENTAIRE FACULTATIF */}
              <div className="quote-modal__field mb-0">
                <label htmlFor={commentId} className="form-label">
                  Commentaire <span className="text-muted">(facultatif)</span>
                </label>

                <textarea
                  id={commentId}
                  className="form-control"
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={loading}
                  placeholder="Ajoutez un commentaire si vous le souhaitez..."
                />
              </div>
            </div>
          )}

          {/* Boutons de décision */}
          <div className="quote-modal__actions">
            <button
              type="button"
              className="quote-button quote-button--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              className={`quote-button ${
                isAccept ? "quote-button--success" : "quote-button--danger"
              }`}
              disabled={loading || isRefusalInvalid}
            >
              {loading ? (
                <>
                  <span className="quote-spinner quote-spinner--small" />
                  Traitement...
                </>
              ) : isAccept ? (
                "Confirmer l’acceptation"
              ) : (
                "Confirmer le refus"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
