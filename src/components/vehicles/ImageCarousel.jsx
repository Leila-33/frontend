import { useEffect, useState } from "react";
import { BsImage } from "react-icons/bs";
/* ================= CAROUSEL ================= */

/**
 * Carrousel d'images utilisé pour afficher les photos d'un véhicule.
 *
 * Fonctionnement :
 * - Les valeurs nulles ou vides sont supprimées de la liste.
 * - Une image par défaut est affichée lorsqu'aucune image n'est disponible.
 * - Les boutons précédent/suivant permettent de naviguer entre les images.
 * - Le carrousel revient automatiquement à la première image
 *   lorsque la liste des images change.
 */
export function ImageCarousel({ images = [], height = 200 }) {
  /* =======================================================
     ÉTAT
  ======================================================= */

  // Index de l'image actuellement affichée.
  const [index, setIndex] = useState(0);

  /* =======================================================
     NORMALISATION DES IMAGES
  ======================================================= */

  /**
   * Les images peuvent être :
   *
   * - une simple URL
   * - un objet { key, url }
   *
   * On récupère uniquement l'URL nécessaire
   * pour l'affichage.
   */
  const safeImages = images
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);

  // Nombre total d'images disponibles.
  const imageCount = safeImages.length;

  // Indique si au moins une image est disponible.
  const hasImages = imageCount > 0;

  /* =======================================================
     SYNCHRONISATION AVEC LA LISTE DES IMAGES
  ======================================================= */

  /**
   * Lorsque la liste des images change, l'index courant
   * peut devenir invalide.
   *
   * Exemple :
   * - 3 images → index = 2
   * - les images sont ensuite remplacées par 1 seule image
   * - index = 2 n'existe plus
   *
   * On revient donc à la première image.
   */
  useEffect(() => {
    setIndex((currentIndex) => {
      if (imageCount === 0) {
        return 0;
      }

      return Math.min(currentIndex, imageCount - 1);
    });
  }, [imageCount]);

  /* =======================================================
     STYLE DES BOUTONS
  ======================================================= */

  /**
   * Génère le style commun des boutons de navigation.
   *
   * `side` permet de positionner le bouton à gauche ou à droite.
   */
  const getNavigationButtonStyle = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 10,
    transform: "translateY(-50%)",

    width: 32,
    height: 32,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 0,

    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",

    border: "none",
    borderRadius: "50%",

    cursor: "pointer",

    fontSize: 22,
    lineHeight: 1,

    zIndex: 2,
  });

  /* =======================================================
     NAVIGATION
  ======================================================= */

  /**
   * Affiche l'image suivante.
   */
  const next = (event) => {
    // Empêche le clic de remonter vers un éventuel parent cliquable.
    event.stopPropagation();

    setIndex((currentIndex) => (currentIndex + 1) % imageCount);
  };

  /**
   * Affiche l'image précédente.
   */
  const previous = (event) => {
    // Empêche le clic de remonter vers un éventuel parent cliquable.
    event.stopPropagation();

    setIndex((currentIndex) => (currentIndex - 1 + imageCount) % imageCount);
  };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <div
      className="position-relative overflow-hidden"
      style={{
        height,
        background: "#f5f5f5",
      }}
    >
      {/* ===================================================
          IMAGE
      =================================================== */}

      {hasImages ? (
        <img
          src={safeImages[index]}
          alt="Véhicule"
          className="w-100 h-100"
          style={{
            objectFit: "cover",
          }}
        />
      ) : (
        /* =================================================
           PLACEHOLDER SI AUCUNE IMAGE
        ================================================= */

        <div
          className="
            d-flex
            align-items-center
            justify-content-center
            h-100
            text-muted
          "
          aria-label="Aucune image disponible"
        >
          <BsImage size={30} />
        </div>
      )}

      {/* ===================================================
          BOUTONS DE NAVIGATION
      =================================================== */}

      {imageCount > 1 && (
        <>
          {/* Image précédente */}
          <button
            type="button"
            onClick={previous}
            style={getNavigationButtonStyle("left")}
            aria-label="Image précédente"
          >
            ‹
          </button>

          {/* Image suivante */}
          <button
            type="button"
            onClick={next}
            style={getNavigationButtonStyle("right")}
            aria-label="Image suivante"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
