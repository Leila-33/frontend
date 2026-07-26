import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/sales/ConfirmModal";
import { quoteStatusConfig } from "../../../utils/status";

import apiFetch from "../../../services/apiFetch";

export default function QuoteDetailPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [
    loading,
    setLoading
  ] = useState(false);

  const [quote, setQuote] = useState(null);
const [
  showDeleteModal,
  setShowDeleteModal
] = useState(false);
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

    } catch {

      toast.error("Impossible de charger l'offre.");

    }

  };
const handleDelete = async () => {


  try {

    setLoading(true);


    await apiFetch(
      `/agent/quotes/${id}`,
      {
        method:"DELETE",
      }
    );


    toast.success(
      "Offre supprimée."
    );


    navigate(
      `/sales/leads/${quote.lead.id}`
    );


  } catch(err){

    toast.error(
      err.message ||
      "Erreur suppression."
    );


  } finally {

    setLoading(false);

    setShowDeleteModal(false);

  }

};
  const handleSend = async () => {

    try {
      
      setLoading(true)

      await apiFetch(
        `/agent/quotes/${id}/send`,
        {
          method: "POST",
        }
      );

      toast.success("Offre envoyée.");

      fetchQuote();

    } catch (err) {

      toast.error(
        err.message || "Erreur lors de l'envoi."
      );

    }finally{


      setLoading(false);


    }

  };


  if (!quote) {

    return (
      <div className="container py-5">
        Offre introuvable.
      </div>
    );

  }

  return (

    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

  {/* TITRE */}
  <div>

    <h2 className="fw-bold mb-1">
      Offre commerciale
    </h2>

    <div className="text-muted">
      #{quote.id}
    </div>

  </div>


{/* ACTIONS */}
<div className="d-flex align-items-center gap-2">


<span
  className={
    `badge ${
      quoteStatusConfig[quote.status]?.className 
      ?? "bg-dark"
    }`
  }
>

  {
    quoteStatusConfig[quote.status]?.label
    ?? quote.status
  }

</span>



  {
    quote.status === "DRAFT" && (

      <>


        <button
          className="btn btn-outline-primary"
          onClick={() =>
            navigate(
              `/sales/quotes/edit/${quote.id}`
            )
          }
        >

          Modifier

        </button>



        <button
  className="btn btn-outline-danger"
  onClick={() =>
    setShowDeleteModal(true)
  }
>
  Supprimer
</button>


      </>

    )
  }



  <button
    className="btn btn-outline-secondary"
    onClick={() => navigate(-1)}
  >

    Retour

  </button>


</div>


</div>

      <div className="row g-4">

        {/* CLIENT */}

        <div className="col-lg-6">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Client
              </h5>

              <div>
                <strong>
                  {quote.lead.first_name} {quote.lead.last_name}
                </strong>
              </div>

              <div>
                {quote.lead.email}
              </div>

              <div>
                {quote.lead.phone}
              </div>

            </div>

          </div>

        </div>

        {/* VEHICULE */}

        <div className="col-lg-6">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Véhicule
              </h5>

              <div>

                <strong>

                  {quote.vehicle.brand}{" "}
                  {quote.vehicle.model}

                </strong>

              </div>

              <div>

                Prix catalogue :
                {" "}
                {quote.base_price} €

              </div>

            </div>

          </div>

        </div>

        {/* FINANCEMENT */}

        <div className="col-lg-8">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-4">
                Financement
              </h5>

              <div className="d-flex justify-content-between">

                <span>Prix véhicule</span>

                <strong>{quote.base_price} €</strong>

              </div>

              <div className="d-flex justify-content-between">

                <span>Remise</span>

                <strong>- {quote.discount} €</strong>

              </div>

              <div className="d-flex justify-content-between">

                <span>Apport</span>

                <strong>- {quote.down_payment} €</strong>

              </div>

              <div className="d-flex justify-content-between">

                <span>Reprise</span>

                <strong>- {quote.trade_in_value} €</strong>

              </div>

              <hr />

              <div className="d-flex justify-content-between">

                <span>Montant financé</span>

                <strong>
                  {quote.financed_amount} €
                </strong>

              </div>

              <div className="d-flex justify-content-between">

                <span>Durée</span>

                <strong>
                  {quote.duration_months} mois
                </strong>

              </div>

              <div className="d-flex justify-content-between">

                <span>Mensualité</span>

                <strong>
                  {quote.monthly_payment} €/mois
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* REPRISE */}

        <div className="col-lg-4">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Reprise
              </h5>

              {quote.trade_in ? (

                <>

                  <div>

                    <strong>

                      {quote.trade_in.brand}{" "}
                      {quote.trade_in.model}

                    </strong>

                  </div>

                  <div>

                    {quote.trade_in.year}

                  </div>

                  <div>

                    {quote.trade_in.mileage}
                    {" "}km

                  </div>

                  <div>

                    {quote.trade_in.condition}

                  </div>

                  <hr />

                  <div className="fw-bold">

                    Valeur estimée :
                    {" "}
                    {quote.trade_in.estimated_value} €

                  </div>

                </>

              ) : (

                <div className="text-muted">

                  Aucune reprise.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      <div className="mt-4 d-flex gap-2">

        {quote.status === "DRAFT" && (

          <button
            className="btn btn-dark"
            onClick={handleSend}
            disabled={loading}
          >
            Envoyer l'offre au client
          </button>

        )}
        {quote.status === "SENT" && (
  <div className="alert alert-info">
    Offre envoyée au client. En attente de réponse.
  </div>
)}
{quote.status === "ACCEPTED" && (
  <div className="alert alert-success">
    Offre acceptée par le client.
  </div>
)}
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          Retour
        </button>

      </div>
<ConfirmModal

  show={showDeleteModal}

  title="Supprimer cette offre ?"

  message="
  Cette action est définitive.
  Le devis sera supprimé.
  "

  confirmText="Supprimer"

  onClose={() =>
    setShowDeleteModal(false)
  }

  onConfirm={handleDelete}

  loading={loading}

/>
    </div>

  );

}