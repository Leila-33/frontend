export function getTicketBreadcrumb({
  role,
  ticketId,
  from,
  filter = null
}) {

  // =====================
  // SAV
  // =====================

  if (role === "sav_agent") {

    const labels = {
      all: "Tous les tickets",
      open: "Tickets ouverts",
      urgent: "Tickets urgents",
    };


    return [
      {
        label: labels[filter] || "Tickets",
        path: filter
          ? `/sav/tickets?filter=${filter}`
          : "/sav/tickets"
      },
      {
        label: `Ticket #${ticketId}`
      }
    ];
  }



  // =====================
  // CLIENT
  // =====================

  if (role === "client") {

    return [
      {
        label: "Mes tickets",
        path: "/support-tickets"
      },
      {
        label: `Ticket #${ticketId}`
      }
    ];
  }



  // =====================
  // DEFAULT
  // =====================

  return [
    {
      label: "Tickets"
    },
    {
      label: `Ticket #${ticketId}`
    }
  ];
}