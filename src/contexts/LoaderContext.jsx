import { createContext, useState, useEffect } from "react";

import { registerLoader } from "../services/loaderService";

// ============================================================
// CONTEXTE DU LOADER
// ============================================================
// Le contexte permet de rendre l'état "loading" accessible
// aux composants React de l'application.
//
// Exemple : un composant pourra récupérer :
//
// const { loading } = useContext(LoaderContext);
//
// et afficher un loader lorsque loading === true.
export const LoaderContext = createContext();

// ============================================================
// LOADER PROVIDER
// ============================================================
// LoaderProvider fournit l'état du loader à tous ses
// composants enfants.
//
// Exemple :
//
// <LoaderProvider>
//     <App />
// </LoaderProvider>
export const LoaderProvider = ({ children }) => {
  // ==========================================================
  // ÉTAT DU LOADER
  // ==========================================================
  // "loading" indique si au moins une requête est actuellement
  // en cours.
  //
  // false → aucune requête en cours
  // true  → au moins une requête en cours
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // ENREGISTREMENT DU CALLBACK
  // ==========================================================
  // Ce useEffect est exécuté une seule fois au montage
  // du LoaderProvider grâce au tableau de dépendances [].
  //
  // On transmet setLoading au loaderService.
  //
  // Le loaderService pourra alors modifier directement
  // l'état React "loading" lorsqu'une requête démarre
  // ou lorsqu'elle se termine.
  useEffect(() => {
    // Enregistre setLoading comme callback global.
    //
    // Dans loaderService :
    //
    // loaderCallback = setLoading
    //
    // Ensuite, lorsque startLoading() est appelé :
    //
    // loaderCallback(true)
    //
    // et lorsque toutes les requêtes sont terminées :
    //
    // loaderCallback(false).
    registerLoader(setLoading);
  }, []);

  // ==========================================================
  // CONTEXT PROVIDER
  // ==========================================================
  // On rend l'état "loading" disponible pour tous les
  // composants enfants.
  //
  // Les composants n'ont donc pas besoin de connaître
  // l'existence de loaderService.
  return (
    <LoaderContext.Provider
      value={{
        loading,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
