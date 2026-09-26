/**
 * Bouton d'action réutilisable.
 *
 * Ce composant permet d'afficher les différentes actions
 * disponibles sur un élément, par exemple :
 * - prendre en charge un dossier ;
 * - archiver ;
 * - supprimer ;
 * - restaurer, etc.
 */
export default function ActionButton({
  // Couleur Bootstrap du bouton.
  // "primary" est utilisée par défaut.
  color = "primary",

  // Nom de l'icône Bootstrap Icons à afficher.
  icon,

  // Texte affiché au survol du bouton
  // et utilisé comme libellé d'accessibilité.
  title,

  // Fonction exécutée lorsque l'utilisateur clique sur le bouton.
  onClick,

  // Permet de désactiver le bouton.
  disabled = false,

  className = "",
}) {
  return (
    <button
      type="button"

      className={`btn btn-${color} btn-sm rounded-circle shadow-sm ${className}`}

      // Fonction exécutée lors du clic.
      onClick={onClick}

      disabled={disabled}

      title={title}

      aria-label={title}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}
