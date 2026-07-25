import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";
import QuoteFormPage from "../components/QuoteForm";

export default function QuoteEditPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [quote, setQuote] = useState(null);


  useEffect(() => {

    fetchQuote();

  }, [id]);


  const fetchQuote = async () => {

    try {

      const data = await apiFetch(
        `/agent/quotes/${id}`,
        {
          method: "GET",
        }
      );

      setQuote(data);

    } catch (err) {

      toast.error(
        err.message ||
        "Impossible de charger l'offre."
      );

      navigate(-1);

    } finally {

      setLoading(false);

    }

  };


  const handleUpdate = async (payload) => {

    await apiFetch(
      `/agent/quotes/${id}`,
      {
        method: "PUT", // ou PATCH selon ton API
        body: payload,
      }
    );

    toast.success(
      "Offre modifiée avec succès."
    );

    navigate(
      `/sales/quotes/${id}`
    );

  };


  if (loading) {

    return (

      <div className="container py-5">

        Chargement...

      </div>

    );

  }


  if (!quote) {

    return (

      <div className="container py-5">

        Offre introuvable.

      </div>

    );

  }


  return (

    <QuoteFormPage

      mode="edit"

      initialValues={quote}

      onSubmit={handleUpdate}

    />

  );

}