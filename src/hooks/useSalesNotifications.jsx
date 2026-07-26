import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../services/apiFetch";

export default function useSalesNotifications() {

  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [myLeadsCount, setMyLeadsCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  const fetchSalesStats = async () => {
    try {
      const data = await apiFetch("/sales/notifications", {
        method: "GET",
      });

      setNewLeadsCount(data.new_leads_count ?? 0);
      setMyLeadsCount(data.my_leads_count ?? 0);
      setQuotesCount(data.quotes_count ?? 0);
      setApplicationsCount(data.applications_count ?? 0);

    } catch (err) {
      toast.error("Erreur chargement des données CRM");
    }
  };

  
  useEffect(() => {
    fetchSalesStats();
  }, []);

  return {
    newLeadsCount,
    myLeadsCount,
    quotesCount,
    applicationsCount,
    refetch: fetchSalesStats,
  };
}