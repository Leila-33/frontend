import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";
import QuoteFormPage from "../../../components/sales/QuoteForm";
export default function QuoteCreatePage() {

  const navigate = useNavigate();

  const handleCreate = async (payload) => {

    const result = await apiFetch(
      "/agent/quotes",
      {
        method: "POST",
        body: payload,
      }
    );

    toast.success(
      "Offre créée avec succès."
    );

    navigate(
      `/sales/quotes/${result.quote_id}`
    );

  };

  return (

    <QuoteFormPage

      mode="create"

      onSubmit={handleCreate}

    />

  );

}