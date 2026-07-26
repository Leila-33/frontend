import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../../../services/apiFetch";
import { quoteStatusConfig } from "../../../utils/status";


export default function CustomerQuotesPage(){

  const [quotes,setQuotes] = useState([]);

  const navigate = useNavigate();

  useEffect(()=>{

    const load = async()=>{

      const data = await apiFetch(
        "/quotes",
        {
          method:"GET",
        }
      );

      setQuotes(data);

    };


    load();

  },[]);



  const quotesByStatus = {

    SENT: quotes.filter(
      quote => quote.status === "SENT"
    ),

    ACCEPTED: quotes.filter(
      quote => quote.status === "ACCEPTED"
    ),

    REJECTED: quotes.filter(
      quote => quote.status === "REJECTED"
    ),

    EXPIRED: quotes.filter(
      quote => quote.status === "EXPIRED"
    ),

  };



const renderQuotes = (
  status,
  quotesList
) => {

  if (quotesList.length === 0) {
    return null;
  }


  return (

    <div className="mb-5" key={status}>


      <h4 className="fw-bold mb-3">

        {quoteStatusConfig[status].title}

      </h4>



      {
        quotesList.map((quote) => {


          return (

            <div
              key={quote.id}
              className="card mb-3 shadow-sm"
            >

              <div className="card-body">


                <div className="d-flex justify-content-between">


                  <div>


                    <h5>

                      {
                        quote.vehicle
                          ? (
                              <>
                                {quote.vehicle.brand}
                                {" "}
                                {quote.vehicle.model}
                              </>
                            )
                          : "Véhicule"
                      }

                    </h5>



                    <p className="text-muted mb-1">

                      Prix :

                      {" "}

                      {quote.base_price} €

                    </p>



                    <p className="mb-0">

                      Mensualité :

                      {" "}

                      <strong>

                        {quote.monthly_payment}

                        €/mois

                      </strong>

                    </p>


                  </div>





                  <div className="d-flex flex-column align-items-end gap-2">


                    <span
                      className={
                        `badge ${quoteStatusConfig[status].className}`
                      }
                    >

                      {quoteStatusConfig[status].label}

                    </span>




                    {
                      quote.requires_action && (

                        <span className="badge bg-warning text-dark">

                          Action requise

                        </span>

                      )
                    }


                  </div>



                </div>





                {
                  quote.requires_action && (

                    <div className="alert alert-warning mt-3 mb-0">

                      <i className="bi bi-exclamation-circle me-2"/>

                      Votre réponse est attendue pour cette offre.

                    </div>

                  )
                }





                <button

                  className="btn btn-outline-primary mt-3"

                  onClick={() =>
                    navigate(
                      `/quotes/${quote.id}`
                    )
                  }

                >

                  Voir l'offre

                </button>



              </div>


            </div>

          );


        })
      }


    </div>

  );

};



return (

  <div className="container mt-4 mb-5">


    <h2 className="fw-bold mb-4">

      Mes offres commerciales

    </h2>



    {
      quotes.length === 0 && (

        <div className="alert alert-info">

          Vous n'avez aucune offre.

        </div>

      )
    }



    {renderQuotes(
      "SENT",
      quotesByStatus.SENT
    )}



    {renderQuotes(
      "ACCEPTED",
      quotesByStatus.ACCEPTED
    )}



    {renderQuotes(
      "REJECTED",
      quotesByStatus.REJECTED
    )}



    {renderQuotes(
      "EXPIRED",
      quotesByStatus.EXPIRED
    )}



  </div>

);

}