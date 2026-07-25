import { useState } from "react";


export default function QuoteDecisionModal({

  show,

  mode,

  loading,

  onClose,

  onConfirm,

}) {


  const [
    reason,
    setReason
  ] = useState("");


  const [
    comment,
    setComment
  ] = useState("");



  if(!show)
    return null;



  const submit = ()=>{


    onConfirm({

      reason,

      comment,

    });


  };



  return (

    <>


      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{
          backgroundColor:"rgba(0,0,0,0.5)"
        }}
      >


        <div className="modal-dialog modal-dialog-centered">


          <div className="modal-content">



            <div className="modal-header">


              <h5 className="modal-title">


                {
                  mode === "accept"

                  ?

                  "Accepter cette offre"

                  :

                  "Refuser cette offre"

                }


              </h5>


              <button

                type="button"

                className="btn-close"

                onClick={onClose}

                disabled={loading}

              />


            </div>





            <div className="modal-body">


              {
                mode === "accept"

                &&

                <>


                  <p>

                    Vous êtes sur le point d'accepter cette offre commerciale.

                  </p>


                  <p className="text-muted mb-0">

                    Votre conseiller sera informé de votre décision.

                  </p>


                </>

              }




              {
                mode === "refuse"

                &&

                <>


                  <p>

                    Merci de préciser la raison de votre refus.

                  </p>




                  <div className="mb-3">


                    <label className="form-label">

                      Motif du refus

                    </label>


                    <select

                      className="form-select"

                      value={reason}

                      onChange={(e)=>

                        setReason(
                          e.target.value
                        )

                      }

                    >

                      <option value="">

                        Sélectionner...

                      </option>


                      <option value="PRICE">

                        Prix trop élevé

                      </option>


                      <option value="MONTHLY_PAYMENT">

                        Mensualité trop élevée

                      </option>


                      <option value="FINANCING">

                        Conditions de financement

                      </option>


                      <option value="VEHICLE">

                        Le véhicule ne correspond plus

                      </option>


                      <option value="PURCHASE_ELSEWHERE">

                        J'ai acheté ailleurs

                      </option>


                      <option value="OTHER">

                        Autre

                      </option>


                    </select>


                  </div>





                  <div className="mb-3">


                    <label className="form-label">

                      Commentaire

                      <span className="text-muted">

                        {" "}(facultatif)

                      </span>

                    </label>


                    <textarea

                      className="form-control"

                      rows="3"

                      value={comment}

                      onChange={(e)=>

                        setComment(
                          e.target.value
                        )

                      }

                    />


                  </div>


                </>

              }



            </div>





            <div className="modal-footer">


              <button

                className="btn btn-secondary"

                onClick={onClose}

                disabled={loading}

              >

                Annuler

              </button>





              <button

                className={

                  `btn ${
                    mode==="accept"
                    ?
                    "btn-success"
                    :
                    "btn-danger"
                  }`

                }


                disabled={

                  loading

                  ||

                  (
                    mode==="refuse"

                    &&

                    !reason

                  )

                }


                onClick={submit}

              >


                {

                  loading

                  ?

                  "Traitement..."

                  :

                  mode==="accept"

                  ?

                  "Accepter"

                  :

                  "Refuser"


                }


              </button>


            </div>



          </div>


        </div>


      </div>


    </>

  );

}