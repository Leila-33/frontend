import { useCallback, useEffect, useState } from "react";
import apiFetch from "../../../services/apiFetch";
import { useDebounce } from "../../../hooks/debounce";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { updateSupportTicketStatus } from "../service/supportTicketService";
import TicketTabs from "../components/TicketTabs";
import TicketToolbar from "../components/TicketToolbar";
import TicketTable from "../components/TicketTable";
import Pagination from "../components/Pagination";

export default function SavTicketsPage() {
const location = useLocation();

const params = new URLSearchParams(location.search);
const filter = params.get("filter") || "all";

  const [activeTab, setActiveTab] = useState("ACTIVE");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "ALL",
    priority: "ALL",
    category: "ALL",
    sort: "created_at_desc",
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });

  const fetchTickets = useCallback(async () => {
    const query = new URLSearchParams({
      ...filters,
      search: debouncedSearch,
      archive: activeTab === "ARCHIVED",
      filter,
    }).toString();

    const res = await apiFetch(
      `/support-tickets?${query}`,
    );

    setData(res);

  }, [
    filters,
    debouncedSearch,
    activeTab,
    filter,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const archiveTicket = async (ticketId) => {
    try {
      await apiFetch(
        `/support-tickets/${ticketId}/archive`,
        {
          method: "PATCH",
        }
      );

      toast.success("Ticket archivé");

      fetchTickets();

    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateStatus = async (ticketId, status) => {
    try {
      await updateSupportTicketStatus(
        ticketId,
        status,
      );

      toast.success("Statut mis à jour");

      fetchTickets();

    } catch (err) {
      toast.error(err.message);
    }
  };
const showArchiveTabs = filter === "all";
  const takeOwnership = (ticketId) =>
    updateStatus(ticketId, "IN_PROGRESS");

  const TITLES = {
    all: "Tous les tickets",
    open: "Tickets ouverts",
    urgent: "Tickets urgents",
  };

  return (
    <div className="container py-4">

      <h2 className="fw-bold mb-4">
        {TITLES[filter]}
        <span className="ms-2 text-muted fs-6">
          ({data.total})
        </span>
      </h2>
{showArchiveTabs && (
  <TicketTabs
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    total={data.total}
  />
)}

      <TicketToolbar
        filters={filters}
        setFilters={setFilters}
      />

      <TicketTable
        tickets={data.items}
        basePath="/support-tickets"
        onArchive={archiveTicket}
        onTakeOwnership={takeOwnership}
      />

      <Pagination
        page={data.page}
        pages={data.pages}
        onPageChange={(page) =>
          setFilters((prev) => ({
            ...prev,
            page,
          }))
        }
      />

    </div>
  );
}