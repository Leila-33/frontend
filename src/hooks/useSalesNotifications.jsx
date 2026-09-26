import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../services/apiFetch";

/**
 * Gère les indicateurs de notification du commercial.
 *
 * Récupère :
 * - le nombre de nouveaux leads non pris en charge ;
 * - le nombre de leads actuellement attribués au commercial.
 *
 * Le hook expose également `refetch` afin de permettre
 * une actualisation manuelle depuis le composant consommateur.
 *
 * @returns {{
 *   newLeadsCount: number,
 *   myLeadsCount: number,
 *   loading: boolean,
 *   refetch: () => Promise<void>
 * }}
 */
export default function useSalesNotifications() {
  /* ========================================================
     ÉTAT
  ======================================================== */

  // Nombre de nouveaux leads disponibles pour les commerciaux.
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  // Nombre de leads actuellement attribués au commercial connecté.
  const [myLeadsCount, setMyLeadsCount] = useState(0);

  // Indique si les statistiques sont en cours de chargement.
  const [loading, setLoading] = useState(true);

  /* ========================================================
     RÉCUPÉRATION DES STATISTIQUES
  ======================================================== */

  /**
   * Récupère les statistiques CRM du commercial connecté.
   *
   * `useCallback` permet de conserver une référence stable
   * à la fonction et d'éviter de recréer inutilement
   * la fonction lors de chaque rendu.
   */
  const fetchSalesStats = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/agent/leads/notifications", {
        method: "GET",
      });

      // Normalisation des valeurs reçues par l'API.
      //
      // `Number(...)` permet de garantir que les compteurs
      // sont bien numériques avant de les stocker dans l'état.
      const newLeadsCount = Number(data?.new_leads_count ?? 0);

      const myLeadsCount = Number(data?.my_leads_count ?? 0);

      setNewLeadsCount(
        Number.isFinite(newLeadsCount) ? Math.max(0, newLeadsCount) : 0
      );

      setMyLeadsCount(
        Number.isFinite(myLeadsCount) ? Math.max(0, myLeadsCount) : 0
      );
    } catch (error) {
      // L'erreur technique reste disponible dans la console
      // pour faciliter le diagnostic en développement.
      console.error("Erreur lors du chargement des statistiques CRM :", error);

      toast.error("Impossible de charger les données CRM.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ========================================================
     CHARGEMENT INITIAL
  ======================================================== */

  useEffect(() => {
    fetchSalesStats();
  }, [fetchSalesStats]);

  /* ========================================================
     EXPOSITION
  ======================================================== */

  return {
    newLeadsCount,
    myLeadsCount,
    loading,
    refetch: fetchSalesStats,
  };
}
