/**
 * Modale de confirmation générique utilisée avant
 * l'exécution d'une action.
 *
 * Les actions disponibles sont définies dans l'objet
 * `config` en fonction de la valeur de `type`.
 *
 * Le composant peut être utilisé pour différents
 * types de ressources : dossiers, leads, tickets, etc.
 */
export default function ConfirmActionModal({
  open,
  type,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
  children,
}) {
  // Si la modale n'est pas ouverte, aucun élément n'est rendu.
  if (!open) return null;

  /**
   * Configuration des différentes actions disponibles.
   *
   * Chaque type d'action possède :
   * - une classe Bootstrap pour la couleur du bouton ;
   * - une icône Bootstrap Icons ;
   * - le texte affiché dans le bouton de confirmation.
   */
  const config = {
    // Validation d'un dossier.
    validate: {
      className: "btn-success",
      icon: "bi-check-lg",
      label: "Valider",
    },

    // Refus d'un dossier.
    refuse: {
      className: "btn-danger",
      icon: "bi-x-lg",
      label: "Refuser",
    },

    // Prise en charge d'une ressource par un administrateur.
    process: {
      className: "btn-primary",
      icon: "bi-check2-circle",
      label: "Prendre en charge",
    },

    // Suppression définitive d'une ressource.
    delete: {
      className: "btn-danger",
      icon: "bi-trash",
      label: "Supprimer",
    },

    // Archivage d'une ressource.
    archive: {
      className: "btn-warning",
      icon: "bi-archive",
      label: "Archiver",
    },

    // Désactivation d'une ressource.
    disable: {
      className: "btn-danger",
      icon: "bi-toggle-off",
      label: "Désactiver",
    },

    // Restauration d'une ressource archivée.
    restore: {
      className: "btn-success",
      icon: "bi-arrow-counterclockwise",
      label: "Désarchiver",
    },

    // Restauration d'une ressource précédemment annulée.
    restore_cancelled: {
      className: "btn-success",
      icon: "bi-arrow-counterclockwise",
      label: "Restaurer",
    },

    // Annulation d'une ressource.
    cancel: {
      className: "btn-secondary",
      icon: "bi-x-circle",
      label: "Annuler",
    },
  }[type];

  /**
   * Sécurité supplémentaire :
   * si un type d'action inconnu est transmis,
   * aucune modale n'est affichée.
   */
  if (!config) return null;

  return (
    <div
      className="modal d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow">
          {/* ==========================================================
              EN-TÊTE DE LA MODALE
          ========================================================== */}

          <div className="modal-header border-0">
            <h5 className="modal-title fw-semibold">
              <i className={`bi ${config.icon} me-2`} aria-hidden="true" />

              {title}
            </h5>

            {/* Bouton permettant de fermer la modale */}
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              disabled={loading}
              aria-label="Fermer"
            />
          </div>

          {/* ==========================================================
              CORPS DE LA MODALE
          ========================================================== */}

          <div className="modal-body pt-0">
            {/* Description de l'action */}
            {description && <p className="text-muted mb-3">{description}</p>}

            {/* Contenu personnalisé éventuel */}
            {children}
          </div>

          {/* ==========================================================
              PIED DE LA MODALE
          ========================================================== */}

          <div className="modal-footer border-0">
            {/* Annulation de l'action */}
            <button
              type="button"
              className="btn btn-light"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>

            {/* Confirmation de l'action */}
            <button
              type="button"
              className={`btn ${config.className}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  {/* Indicateur pendant le traitement */}
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    aria-hidden="true"
                  />
                  Traitement...
                </>
              ) : (
                <>
                  <i className={`bi ${config.icon} me-1`} aria-hidden="true" />

                  {config.label}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
