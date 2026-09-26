/**
 * Page de gestion des tickets SAV pour les agents.
 *
 * Responsabilités :
 * - gérer les filtres et la recherche ;
 * - gérer les onglets actifs / archivés ;
 * - récupérer la liste paginée des tickets ;
 * - permettre la prise en charge d'un ticket ;
 * - permettre l'archivage d'un ticket ;
 * - afficher le tableau et la pagination.
 *
 * Les appels HTTP sont centralisés dans `supportTicketService`
 * lorsque ceux-ci correspondent à une action métier.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

import { toast } from "react-toastify";

import { useDebounce } from "../../../hooks/useDebounce";

import apiFetch from "../../../services/apiFetch";

import {
  archiveSupportTicket,
  updateSupportTicketStatus,
} from "../../../services/supportTicketService";

import TicketTabs from "../../../components/sav/TicketTabs";
import TicketToolbar from "../../../components/sav/TicketToolbar";
import TicketTable from "../../../components/sav/TicketTable";

import NumberedPagination from "../../../components/common/Pagination";

export default function SavTicketsPage() {
  // =====================================================
  // NAVIGATION
  // =====================================================

  /**
   * Permet de récupérer le filtre présent dans l'URL.
   *
   * Exemple :
   * /sav/tickets?filter=open
   *
   * Le filtre détermine la liste métier affichée :
   * - all
   * - open
   * - urgent
   */
  const location = useLocation();

  const filter = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return params.get("filter") || "all";
  }, [location.search]);

  // =====================================================
  // ÉTAT DES ONGLETS
  // =====================================================

  /**
   * Onglet actuellement affiché.
   *
   * ACTIVE    → tickets non archivés
   * ARCHIVED  → tickets archivés
   */
  const [activeTab, setActiveTab] = useState("ACTIVE");

  // =====================================================
  // FILTRES
  // =====================================================

  /**
   * Filtres appliqués à la liste des tickets.
   */
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "ALL",
    priority: "ALL",
    category: "ALL",
    sort: "created_at_desc",
  });

  /**
   * Temporise la recherche afin d'éviter d'effectuer
   * une requête API à chaque caractère saisi.
   */
  const debouncedSearch = useDebounce(filters.search, 400);

  // =====================================================
  // DONNÉES
  // =====================================================

  /**
   * Données retournées par l'API.
   */
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    total_pages: 1,
  });

  // =====================================================
  // CONSTRUCTION DES PARAMÈTRES
  // =====================================================

  /**
   * Construit les paramètres envoyés au backend.
   *
   * `archive` dépend de l'onglet actuellement sélectionné.
   * `search` utilise la valeur débouncée afin de limiter
   * le nombre de requêtes.
   */
  const query = useMemo(() => {
    return new URLSearchParams({
      ...filters,

      search: debouncedSearch,

      archive: String(activeTab === "ARCHIVED"),

      filter,
    }).toString();
  }, [filters, debouncedSearch, activeTab, filter]);

  // =====================================================
  // RÉCUPÉRATION DES TICKETS
  // =====================================================

  /**
   * Récupère la liste des tickets correspondant
   * aux filtres actuellement sélectionnés.
   */
  const fetchTickets = useCallback(async () => {
    try {
      const response = await apiFetch(`/support-tickets?${query}`);

      setData(response);
    } catch (error) {
      toast.error(error.message || "Impossible de récupérer les tickets.");
    }
  }, [query]);

  /**
   * Recharge automatiquement la liste lorsque :
   * - la recherche change ;
   * - un filtre change ;
   * - l'onglet change ;
   * - la page change ;
   * - le filtre métier change.
   */
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // =====================================================
  // ARCHIVAGE
  // =====================================================

  /**
   * Archive un ticket puis recharge la liste.
   */
  const archiveTicket = useCallback(
    async (ticketId) => {
      try {
        await archiveSupportTicket(ticketId);

        toast.success("Ticket archivé.");

        await fetchTickets();
      } catch (error) {
        toast.error(error.message || "Impossible d'archiver le ticket.");
      }
    },
    [fetchTickets]
  );

  // =====================================================
  // MODIFICATION DU STATUT
  // =====================================================

  /**
   * Modifie le statut d'un ticket puis recharge
   * la liste afin de conserver les données affichées
   * synchronisées avec le backend.
   */
  const updateStatus = useCallback(
    async (ticketId, status) => {
      try {
        await updateSupportTicketStatus(ticketId, status);

        toast.success("Statut mis à jour.");

        await fetchTickets();
      } catch (error) {
        toast.error(error.message || "Impossible de mettre à jour le statut.");
      }
    },
    [fetchTickets]
  );

  // =====================================================
  // PRISE EN CHARGE
  // =====================================================

  /**
   * Prend en charge un ticket ouvert.
   *
   * La prise en charge correspond au passage
   * du statut OPEN vers IN_PROGRESS.
   */
  const takeOwnership = useCallback(
    (ticketId) => {
      return updateStatus(ticketId, "IN_PROGRESS");
    },
    [updateStatus]
  );

  // =====================================================
  // PAGINATION
  // =====================================================

  /**
   * Change la page courante.
   *
   * Le changement de `filters.page` déclenche ensuite
   * automatiquement `fetchTickets` via le useEffect.
   */
  const handlePageChange = useCallback((page) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      page,
    }));
  }, []);

  // =====================================================
  // ONGLETS
  // =====================================================

  /**
   * Lorsqu'on change d'onglet, on revient à la première page.
   */
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);

    setFilters((previousFilters) => ({
      ...previousFilters,
      page: 1,
    }));
  }, []);

  // =====================================================
  // FILTRE D'AFFICHAGE
  // =====================================================

  /**
   * Les onglets d'archivage ne sont affichés
   * que depuis la vue générale des tickets.
   */
  const showArchiveTabs = filter === "all";

  // =====================================================
  // TITRE
  // =====================================================

  const titles = {
    all: "Tous les tickets",
    open: "Tickets ouverts",
    urgent: "Tickets urgents",
  };

  const pageTitle = titles[filter] || "Tickets SAV";

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container py-4">
      {/* =================================================
          TITRE
      ================================================= */}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold mb-0">
          {pageTitle}

          <span className="ms-2 text-muted fs-6 fw-normal">({data.total})</span>
        </h2>
      </div>

      {/* =================================================
          ONGLETS
      ================================================= */}

      {showArchiveTabs && (
        <TicketTabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          total={data.total}
        />
      )}

      {/* =================================================
          FILTRES
      ================================================= */}

      <TicketToolbar
        filters={filters}
        setFilters={setFilters}
        filter={filter}
      />

      {/* =================================================
          TABLEAU
      ================================================= */}

      <TicketTable
        tickets={data.items}
        basePath="/sav/tickets"
        filter={filter}
        onArchive={archiveTicket}
        onTakeOwnership={takeOwnership}
      />

      {/* =================================================
          PAGINATION
      ================================================= */}

      <NumberedPagination
        page={data.page}
        totalPages={data.total_pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
