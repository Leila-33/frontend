import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";

import ClientTicketsTable from "../../../components/sav/ClientTicketsTable";

/**
 * Page listant les tickets SAV du client connecté.
 *
 * Responsabilités :
 * - récupérer les tickets du client ;
 * - gérer les états de chargement et d'erreur ;
 * - transmettre les tickets au composant d'affichage ;
 * - permettre la création d'un nouveau ticket.
 *
 * La page ne contient aucune logique métier :
 * celle-ci reste gérée par l'API et les composants/services dédiés.
 */
export default function ClientTicketsPage() {
  // =========================
  // STATE
  // =========================

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH TICKETS
  // =========================

  /**
   * Récupère les tickets associés au client connecté.
   */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/support-tickets");

      // Le backend peut retourner :
      // { items: [...] }
      // ou directement [...]
      setTickets(
        Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : []
      );
    } catch (error) {
      toast.error(error.message || "Impossible de récupérer vos tickets.");

      // Évite de conserver d'anciennes données
      // lorsque la requête échoue.
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // INITIALISATION
  // =========================

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container py-4">
      {/* =========================
          HEADER
          ========================= */}

      <div
        className="
          d-flex
          flex-column
          flex-sm-row
          justify-content-between
          align-items-sm-center
          gap-3
          mb-4
        "
      >
        <div>
          <h1 className="h3 fw-bold mb-1">Mes tickets</h1>

          <p className="text-muted mb-0">
            Consultez vos demandes auprès du service après-vente.
          </p>
        </div>

        <Link
          to="/support-tickets/create"
          className="btn btn-primary flex-shrink-0"
        >
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Créer un ticket
        </Link>
      </div>

      {/* =========================
          CONTENT
          ========================= */}

      {loading ? (
        <div
          className="text-center text-muted py-5"
          role="status"
          aria-live="polite"
        >
          <div
            className="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          Chargement de vos tickets...
        </div>
      ) : (
        <ClientTicketsTable tickets={tickets} />
      )}
    </div>
  );
}
