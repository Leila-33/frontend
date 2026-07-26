import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";

import ClientTicketsTable from "../../../components/sav/ClientTicketsTable";

export default function ClientTicketsPage() {


  const [tickets, setTickets] = useState([]);

  // =====================
  // FETCH TICKETS
  // =====================
  const fetchTickets = async () => {
    try {

      const data = await apiFetch("/support-tickets");

      setTickets(data.items || data || []);

    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold mb-0">
          Mes tickets
        </h2>

        <Link
          to="/support-tickets/create"
          className="btn btn-primary"
        >
          + Créer un ticket
        </Link>

      </div>

      {/* CONTENT */}
      
        <ClientTicketsTable tickets={tickets} />
      

    </div>
  );
}