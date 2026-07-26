import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";


import apiFetch from "../../../services/apiFetch"
import QuoteDecisionModal from "../../../components/sales/QuoteDecisionModal";

import {
  toast
} from "react-toastify";



export default function CustomerQuoteDetailPage() {


  const {
    id
  } = useParams();


  const navigate = useNavigate();
  const [ loading, setLoading ] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  const [decisionMode, setDecisionMode] = useState(null);

  const [
    quote,
    setQuote
  ] = useState(null);



  const [
    error,
    setError
  ] = useState(null);



  const statusConfig = {


    SENT: {

      label:
        "En attente de votre réponse",

      className:
        "bg-primary",

    },


    ACCEPTED: {

      label:
        "Offre acceptée",

      className:
        "bg-success",

    },


    REJECTED : {

      label:
        "Offre refusée",

      className:
        "bg-danger",

    },


    EXPIRED: {

      label:
        "Offre expirée",

      className:
        "bg-secondary",

    },

  };



  // =========================
  // LOAD QUOTE
  // =========================


  const fetchQuote = async () => {


    try {



      const data = await apiFetch(

        `/quotes/${id}`,

        {
        }

      );


      setQuote(data);


    }
    catch (err) {


      console.error(err);

      toast.error(err.message || "Impossible de charger cette offre.")

      setError(
        "Impossible de charger cette offre."
      );


    }
  };



  useEffect(() => {


    fetchQuote();


  }, [id]);






  // =========================
  // ACCEPT
  // =========================


  const acceptQuote = async () => {

    try {


      setLoading(true);

      const data = await apiFetch(

        `/quotes/${id}/accept`,

        {
          method: "POST",
        }

      );





toast.success(
  data.message
);


navigate(
  `/applications/${data.application_id}`
);



      fetchQuote();



    }
    catch (err) {


      toast.error(

        "Impossible d'accepter cette offre."

      );


    } finally {


      setLoading(false);


    }

  };




  // =========================
  // REFUSE
  // =========================


  const refuseQuote = async (data) => {


    try {

      setLoading(true);


      await apiFetch(

        `/quotes/${id}/refuse`,

        {

          method: "POST",

          body: {

            reason: data.reason,

            comment: data.comment,

          }

        }

      );



      toast.success(

        "Votre refus a été enregistré."

      );



      fetchQuote();



    }
    catch (err) {


      toast.error(

        "Impossible de refuser cette offre."

      );


    } finally {


      setLoading(false);


    }

  };




  // =========================
  // ERROR
  // =========================


  if (error) {


    return (

      <div className="container mt-4">


        <div className="alert alert-danger">

          {error}

        </div>


        <button

          className="btn btn-outline-secondary"

          onClick={() => navigate(-1)}

        >

          Retour

        </button>


      </div>

    );

  }





  if (!quote)
    return null;



  const status =
    statusConfig[quote.status]
    ??
    {
      label: quote.status,
      className: "bg-secondary",
    };



    return (

  <div className="container mt-4 mb-5">

    {/* HEADER */}

    <div className="d-flex justify-content-between align-items-start mb-4">

      <div>

        <h2 className="fw-bold">
          Votre offre commerciale
        </h2>

        <div className="text-muted">
          Offre #{quote.id}
        </div>

        <div className="text-muted small">
          Créée le{" "}
          {new Date(quote.created_at).toLocaleDateString()}
        </div>

        {quote.status === "ACCEPTED" && (
          <div className="mt-3 text-success">

            <h5 className="fw-bold mb-1">
              ✓ Offre acceptée
            </h5>

            <p className="mb-0">
              Vous avez accepté cette offre.
              <br />
              Votre dossier de financement a été créé.
            </p>

          </div>
        )}

        {quote.status === "REFUSED" && (
          <div className="mt-3 text-danger">

            <h5 className="fw-bold mb-1">
              Offre refusée
            </h5>

            <p className="mb-0">
              Vous avez refusé cette offre.
            </p>

          </div>
        )}

        {quote.status === "EXPIRED" && (
          <div className="mt-3 text-warning">

            <h5 className="fw-bold mb-1">
              Offre expirée
            </h5>

            <p className="mb-0">
              Cette offre a expiré et ne peut plus être acceptée.
            </p>

          </div>
        )}

      </div>

      <div className="text-end">

        <span
          className={`badge fs-6 ${status.className}`}
        >
          {status.label}
        </span>

        {quote.status === "ACCEPTED" &&
          quote.application_id && (

            <div className="mt-3">

              <button
                className="btn btn-success"
                onClick={() =>
                  navigate(
                    `/applications/${quote.application_id}`
                  )
                }
              >
                Voir mon dossier
              </button>

            </div>

        )}
{quote.status === "EXPIRED" && (
  <div className="alert alert-warning mb-4">

    <h5 className="mb-1">
      Offre expirée
    </h5>

    <p className="mb-0">
      Cette offre n'est plus valable et ne peut plus être acceptée.
    </p>

  </div>
)}
      </div>

    </div>



    {/* VEHICLE */}

    <div className="card shadow-sm mb-3">

      <div className="card-body">

        <h4 className="mb-3">
          <i className="bi bi-car-front me-2" />
          Véhicule
        </h4>

        <h5>
          {quote.vehicle.brand}{" "}
          {quote.vehicle.model}
        </h5>

        <p className="text-muted">
          Prix :{" "}
          <strong>
            {quote.base_price} €
          </strong>
        </p>

      </div>

    </div>



    {/* FINANCING */}

    <div className="card shadow-sm mb-3">

      <div className="card-body">

        <h4 className="mb-3">
          <i className="bi bi-credit-card me-2" />
          Financement
        </h4>

        <div className="row">

          <div className="col-md-6">

            <p>
              Apport : {quote.down_payment} €
            </p>

            <p>
              Remise : {quote.discount} €
            </p>

            <p>
              Reprise : {quote.trade_in_value} €
            </p>

          </div>

          <div className="col-md-6">

            <p>
              Montant financé : {quote.financed_amount} €
            </p>

            <p>
              Durée : {quote.duration_months} mois
            </p>

            <h5 className="fw-bold">
              {quote.monthly_payment} € / mois
            </h5>

          </div>

        </div>

      </div>

    </div>



    {/* ADVISOR */}

    {quote.sales_agent && (

      <div className="card shadow-sm mb-3">

        <div className="card-body">

          <h4>
            <i className="bi bi-person me-2" />
            Votre conseiller
          </h4>

          <p className="mb-0">
            {quote.sales_agent.first_name}{" "}
            {quote.sales_agent.last_name}
          </p>

        </div>

      </div>

    )}



    {/* ACTIONS */}

    {quote.status === "SENT" && (

      <div className="mt-4">

        <button
          className="btn btn-success me-2"
          onClick={() => {
            setDecisionMode("accept");
            setShowDecision(true);
          }}
        >
          Accepter l'offre
        </button>

        <button
          className="btn btn-outline-danger"
          onClick={() => {
            setDecisionMode("refuse");
            setShowDecision(true);
          }}
        >
          Refuser
        </button>

      </div>

    )}



    <button
      className="btn btn-outline-secondary mt-4"
      onClick={() => navigate(-1)}
    >
      Retour
    </button>

    <QuoteDecisionModal
      show={showDecision}
      mode={decisionMode}
      loading={loading}
      onClose={() => setShowDecision(false)}
      onConfirm={async (data) => {

        if (decisionMode === "accept") {
          await acceptQuote();
        } else {
          await refuseQuote(data);
        }

        setShowDecision(false);

      }}
    />

  </div>

);

}