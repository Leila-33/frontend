import TicketTable from "./TicketTable";

export default function ClientTicketsTable({ tickets = [] }) {

  // =====================
  // ADAPTATION DATA CLIENT
  // =====================
  const adaptedTickets = tickets.map((t) => ({
    ...t,

    user_id: "Moi",
    user_name: "Moi"

  }));

  return (
    <TicketTable
  tickets={adaptedTickets}
  basePath="/support-tickets"
/>
  );
}