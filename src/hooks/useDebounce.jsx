import { useEffect, useState } from "react";

// ==========================================================
// HOOK DE DEBOUNCE
// ==========================================================

/**
 * Retarde la mise à jour d'une valeur jusqu'à ce qu'elle
 * reste inchangée pendant la durée définie.
 *
 * Utile notamment pour les champs de recherche afin
 * d'éviter de déclencher une requête à chaque frappe.
 *
 * Exemple :
 *
 * const debouncedSearch = useDebounce(search, 500);
 *
 * Si l'utilisateur tape rapidement :
 * "Jean"
 *
 * la valeur retournée ne sera mise à jour qu'après
 * 500 ms sans nouvelle modification.
 *
 * @param {*} value Valeur à temporiser.
 * @param {number} delay Délai en millisecondes.
 * @returns {*} Valeur après le délai de debounce.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Programme la mise à jour après le délai défini.
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annule le timer précédent lorsque la valeur change
    // avant la fin du délai.
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
