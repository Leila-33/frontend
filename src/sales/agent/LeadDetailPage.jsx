import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { leadStatusConfig, quoteStatusConfig } from "../../utilis/status";
import ConfirmModal from "../components/ConfirmModal";

export default function LeadDetailPage() {

  const { id } = useParams();
  const navigate = useNavigate();

const [
  showDeleteModal,
  setShowDeleteModal
] = useState(false);

  const [lead, setLead] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(false);


  const fetchLead = async () => {

    try {

      const data = await apiFetch(
        `/agent/leads/${id}`,
        {
          method: "GET",
        }
      );

      setLead(data);


    } catch(err) {

      toast.error(
        "Erreur lors du chargement du prospect"
      );

    }

  };



  useEffect(() => {
    fetchLead();
  }, [id]);

const hasQuote = lead?.quotes?.length > 0;
const markAsContacted = async () => {
  try {
          setLoading(true);

    await apiFetch(
      `/agent/leads/${lead.id}/contact`,
      {
        method: "PATCH",
      }
    );

    fetchLead();

    toast.success("Le prospect a été marqué comme contacté.");

  } catch (err) {
    toast.error(err.message || "Impossible de mettre à jour le prospect.");
  }finally{


      setLoading(false);


    }
};
const deleteLead = async () => {

  try {

    setLoading(true);

    await apiFetch(
      `/agent/leads/${lead.id}`,
      {
        method: "DELETE",
      }
    );

    toast.success(
      "Prospect supprimé."
    );

    navigate("/sales/leads");

  } catch (err) {

    toast.error(
      err.message ||
      "Impossible de supprimer le prospect."
    );

  } finally {

    setLoading(false);

    setShowDeleteModal(false);

  }

};

if (loading) {

  return (
    <div className="container py-5 text-center text-muted">
      Chargement du prospect...
    </div>
  );

}





if (!lead) {

  return (
    <div className="container py-5">

      <div className="card shadow-sm border-0 rounded-4">

        <div className="card-body text-center p-5">
          
          <h4 className="mt-3">
            Prospect introuvable
          </h4>

          <p className="text-muted mb-0">
            Ce prospect n'existe plus ou n'est plus accessible.
          </p>

        </div>

      </div>

    </div>
  );

}

  return (

    <div className="container py-4">


      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            {lead.first_name} {lead.last_name}
          </h2>

          <span
  className={
    `badge ${
      leadStatusConfig[lead.status]?.className 
      ?? "bg-dark"
    }`
  }
>

  {
    leadStatusConfig[lead.status]?.label
    ?? lead.status
  }

</span>

        </div>


        <div className="d-flex gap-2">

  {lead.can_delete && (
  <button
    className="btn btn-outline-danger"
    onClick={() => setShowDeleteModal(true)}
    title="Supprimer le prospect"

  >
    <i className="bi bi-trash" />
  </button>
)}

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

        <div className="col-md-6">

          <div className="card shadow-sm rounded-4">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Informations client
              </h5>


              <p>
                <strong>Email :</strong>
                <br/>
                {lead.email}
              </p>


              <p>
                <strong>Téléphone :</strong>
                <br/>
                {lead.phone}
              </p>


              <p>
                <strong>Message :</strong>
                <br/>
                {lead.message || "Aucun message"}
              </p>


            </div>

          </div>

        </div>




        {/* VEHICULE */}

        <div className="col-md-6">


          <div className="card shadow-sm rounded-4">

            <div className="card-body">


              <h5 className="fw-bold mb-3">
                Véhicule recherché
              </h5>



              {lead.vehicle ? (

                <>
                  <p>
                    <strong>
                      {lead.vehicle.brand}
                      {" "}
                      {lead.vehicle.model}
                    </strong>
                  </p>


                  <p>
                    Prix :
                    {" "}
                    {lead.vehicle.price} €
                  </p>

                </>

              ) : (

                <p className="text-muted">
                  Aucun véhicule sélectionné
                </p>

              )}


            </div>

          </div>


        </div>



      </div>



      {/* ACTIONS COMMERCIAL */}

<div className="card shadow-sm rounded-4 mt-4">

  <div className="card-body">


    <h5 className="fw-bold mb-3">
      Actions commerciales
    </h5>


    <div className="d-flex gap-3 flex-wrap">


      {
        lead.status === "ASSIGNED" && (

          <button
            className="btn btn-primary"
            onClick={markAsContacted}
            disabled={loading}
          >
            {
              loading
                ? "Mise à jour..."
                : "Marquer comme contacté"
            }
          </button>

        )
      }



      {
        lead.can_create_quote && (

          <button
            className="btn btn-dark"
            onClick={() =>
              navigate(
                `/sales/quotes/create/${lead.id}`
              )
            }
          >
            Créer une offre
          </button>

        )
      }


    </div>



    {
      lead.quotes &&
      lead.quotes.length > 0 && (

        <div className="mt-4">


          <h5 className="fw-bold mb-3">
            Offres
          </h5>



          <div className="d-flex gap-2 flex-wrap">


            {
              lead.quotes.map(
                (quote) => (

                  <button
                    key={quote.id}
                    onClick={() =>
                      navigate(
                        `/sales/quotes/${quote.id}`
                      )
                    }
                    className="btn btn-outline-dark"
                  >

                    Voir l'offre (
  {
    quoteStatusConfig[quote.status]?.label
    ?? quote.status
  }
)

                  </button>

                )
              )
            }


          </div>


        </div>

      )
    }


  </div>

</div>

<ConfirmModal

  show={showDeleteModal}

  title="Supprimer le prospect"

  message={
    <>
      Êtes-vous sûr de vouloir supprimer ce prospect ?
      <br />
      Cette action est irréversible.
    </>
  }

  confirmText="Supprimer"

  cancelText="Annuler"

  loading={loading}

  onClose={() =>
    setShowDeleteModal(false)
  }

  onConfirm={deleteLead}

/>

    </div>

  );

}