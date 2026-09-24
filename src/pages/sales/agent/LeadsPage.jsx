import { useLocation } from "react-router-dom";

import AvailableLeadsPage from "./AvailableLeadsPage";
import MyLeadsPage from "./MyLeadsPage";

/**
 * Page d'entrée du module des leads.
 *
 * La page affichée dépend du paramètre `filter` présent
 * dans l'URL :
 *
 * - `?filter=unassigned` → leads disponibles à prendre en charge ;
 * - absence de paramètre ou autre valeur → mes leads.
 *
 * Exemples :
 * `/sales/leads`
 * `/sales/leads?filter=my`
 * `/sales/leads?filter=unassigned`
 */
export default function LeadsPage() {
  // =====================================================
  // URL COURANTE
  // =====================================================

  const { search } = useLocation();

  // Récupère le filtre directement depuis la query string.
  const filter = new URLSearchParams(search).get("filter");

  // =====================================================
  // ROUTAGE SELON LE FILTRE
  // =====================================================

  if (filter === "unassigned") {
    return <AvailableLeadsPage />;
  }

  // Par défaut, on affiche les leads de l'agent connecté.
  return <MyLeadsPage />;
}