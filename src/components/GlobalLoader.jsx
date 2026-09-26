import { useContext } from "react";

import { LoaderContext } from "../contexts/LoaderContext";

// =====================================================
// COMPOSANT : GLOBAL LOADER
// =====================================================

// Affiche un écran de chargement global par-dessus
// l'ensemble de l'application lorsque loading === true.
//
// Le chargement est contrôlé par LoaderContext.
// Cela permet de déclencher le loader depuis différents
// composants sans devoir le gérer individuellement.
export default function GlobalLoader() {
  // Récupération de l'état global du chargement.
  const { loading } = useContext(LoaderContext);

  // Si aucune requête globale n'est en cours,
  // aucun élément n'est ajouté au DOM.
  if (!loading) {
    return null;
  }

  // ===================================================
  // RENDU
  // ===================================================

  return (
    <div
      className="
        position-fixed
        top-0
        start-0
        w-100
        vh-100
        d-flex
        justify-content-center
        align-items-center
      "
      style={{
        // Place le loader au-dessus de l'application.
        zIndex: 9999,

        // Arrière-plan semi-transparent.
        backgroundColor: "rgba(15, 23, 42, 0.65)",

        // Effet de flou moderne derrière l'overlay.
        backdropFilter: "blur(3px)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Chargement en cours"
    >
      {/* =================================================
          CONTENEUR DU LOADER
      ================================================= */}

      <div
        className="
          bg-white
          rounded-4
          shadow-lg
          p-4
          d-flex
          flex-column
          align-items-center
          gap-3
        "
      >
        {/* -----------------------------------------------
            INDICATEUR DE CHARGEMENT
        ----------------------------------------------- */}

        <div
          className="spinner-border text-primary"
          style={{
            width: "2.5rem",
            height: "2.5rem",
          }}
          aria-hidden="true"
        />

        {/* -----------------------------------------------
            MESSAGE ACCESSIBLE ET VISIBLE
        ----------------------------------------------- */}

        <span className="text-muted small fw-medium">
          Chargement en cours...
        </span>
      </div>

      {/* Texte destiné aux lecteurs d'écran. */}
      <span className="visually-hidden">
        Veuillez patienter, chargement en cours.
      </span>
    </div>
  );
}
