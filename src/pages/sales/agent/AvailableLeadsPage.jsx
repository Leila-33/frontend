import { useEffect, useState } from "react";
import apiFetch from "../../../services/apiFetch";
import { toast } from "react-toastify";
import LeadCard from "../../../components/sales/LeadCard";


export default function AvailableLeadsPage() {


  const [
    leads,
    setLeads
  ] = useState([]);



  const [
    loading,
    setLoading
  ] = useState(false);



  const [
    takingLeadId,
    setTakingLeadId
  ] = useState(null);



  // =========================
  // FETCH AVAILABLE LEADS
  // =========================

  const fetchLeads = async()=>{


    try{


      setLoading(true);


      const data = await apiFetch(

        "/agent/leads?scope=unassigned",

        {
          method:"GET",
        }

      );


      setLeads(data);


    }
    catch(err){


      toast.error(
        "Erreur lors du chargement des leads disponibles"
      );


    }
    finally{


      setLoading(false);


    }


  };





  useEffect(()=>{


    fetchLeads();


  },[]);





  // =========================
  // TAKE LEAD ACTION
  // =========================

  const handleTakeLead = async(leadId)=>{


    try{


      setTakingLeadId(leadId);



      await apiFetch(

        `/agent/leads/${leadId}/assign-to-me`,

        {
          method:"PATCH",
        }

      );



      toast.success(
        "Lead ajouté à vos prospects"
      );



      // retirer directement le lead
      // plutôt que recharger toute la liste

      setLeads((prev)=>

        prev.filter(
          lead => lead.id !== leadId
        )

      );



    }
    catch(err){


      toast.error(
        "Impossible de prendre ce lead"
      );


    }
    finally{


      setTakingLeadId(null);


    }


  };





  return (

    <div className="container py-4">



      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">


        <div>


          <h2 className="fw-bold mb-1">

            Leads disponibles

          </h2>


          <p className="text-muted mb-0">

            Prospects non assignés à saisir

          </p>


        </div>



        <button

          className="btn btn-outline-secondary"

          onClick={fetchLeads}

          disabled={loading}

        >

          {

            loading

            ?

            "Actualisation..."

            :

            "Actualiser"

          }


        </button>


      </div>





      {/* CONTENT */}


      {
        loading

        ?

        (

          <div className="text-center text-muted py-5">


            <div
              className="spinner-border mb-3"
              role="status"
            />


            <p>

              Chargement des leads...

            </p>


          </div>

        )


        :

        leads.length === 0

        ?

        (

          <div className="alert alert-light border">


            Aucun lead disponible pour le moment.


          </div>

        )


        :

        (

          <div className="row g-3">


            {
              leads.map((lead)=>(


                <div

                  key={lead.id}

                  className="col-md-4"

                >


                  <LeadCard

                    lead={lead}

                    mode="available"

                    onTakeLead={handleTakeLead}

                    loading={
                      takingLeadId === lead.id
                    }

                  />
                  


                </div>


              ))

            }


          </div>

        )

      }


    </div>

  );

}