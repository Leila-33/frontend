import { useState, useMemo, useEffect } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";

import { useNavigate, useParams } from "react-router-dom";

export default function QuoteFormPage({

  initialValues = null,

  mode = "create",

  onSubmit = null,

}) {
  const { leadId } = useParams();
  const navigate = useNavigate();


  const [loading, setLoading] = useState(false);

  const [lead, setLead] = useState(null);

const [
 discount,
 setDiscount
] = useState(
  initialValues?.discount ?? 0
);



const [
 downPayment,
 setDownPayment
] = useState(
  initialValues?.down_payment ?? 0
);



const [
 duration,
 setDuration
] = useState(
  initialValues?.duration_months ?? 36
);



const [
 tradeInValue,
 setTradeInValue
] = useState(
  initialValues?.trade_in_value ?? 0
);



const [form, setForm] = useState({

  trade_in_enabled:
    Boolean(
      initialValues?.trade_in
    ),


  trade_brand:
    initialValues?.trade_in?.brand ?? "",


  trade_model:
    initialValues?.trade_in?.model ?? "",


  trade_year:
    initialValues?.trade_in?.year ?? "",


  trade_mileage:
    initialValues?.trade_in?.mileage ?? "",


  trade_condition:
    initialValues?.trade_in?.condition ?? ""

});


  const [tradeInErrors, setTradeInErrors] = useState({});



  // =========================
  // LOAD LEAD
  // =========================

useEffect(() => {

  if(mode === "create") {

    fetchLead();

  }

  else if(initialValues?.lead){

    setLead(
      initialValues.lead
    );

  }

}, [
  leadId,
  mode,
  initialValues
]);


  const fetchLead = async () => {

    try {

      const data = await apiFetch(
        `/agent/leads/${leadId}`,
        {
          method: "GET",
        }
      );


      setLead(data);


    } catch (err) {

      toast.error(
        "Impossible de charger le prospect."
      );

    }

  };



  // =========================
  // TRADE IN
  // =========================


const validateTradeIn = (data) => {

  const errors = {};


  const currentYear = new Date().getFullYear();


  // MARQUE
  if (!data.trade_brand?.trim()) {
    errors.trade_brand = "Marque obligatoire";
  }


  // MODELE
  if (!data.trade_model?.trim()) {
    errors.trade_model = "Modèle obligatoire";
  }


  // ANNEE
 const year = Number(data.trade_year);

    if (data.trade_year === "" || data.trade_year == null) {
      errors.trade_year = "Année requise";

    } else if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      errors.trade_year = "Année invalide";}


  // KM
 const mileage = Number(data.trade_mileage);

    if (data.trade_mileage === "" || data.trade_mileage == null) {
      errors.trade_mileage = "Kilométrage requis";

    } else if (
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      errors.trade_mileage = "Kilométrage invalide";}


  // ETAT
  if (!data.trade_condition) {
    errors.trade_condition = "Etat obligatoire";
  }


  return errors;
};


  const handleTradeInChange = (e) => {

    const {
      name,
      value
    } = e.target;


    const updated = {

      ...form,

      [name]: value

    };


    setForm(updated);


    setTradeInErrors(
      validateTradeIn(updated)
    );

  };



  const isTradeInValid = () => {


    if (!form.trade_in_enabled)
      return false;


    const errors =
      validateTradeIn(form);


    return Object.keys(errors).length === 0;

  };



  const handleTradeIn = async () => {

    try {


      if (!form.trade_in_enabled) {

        setTradeInValue(0);

        return;

      }



      const payload = {

        brand: form.trade_brand,

        model: form.trade_model,

        year: Number(form.trade_year),

        mileage: Number(form.trade_mileage),

        condition: form.trade_condition

      };



      const res = await apiFetch(
        "/trade-in/estimate",
        {
          method: "POST",
          body: payload,
        }
      );



      setTradeInValue(
        res.estimated_value || 0
      );


      toast.success(
        "Estimation reprise mise à jour"
      );


    } catch(err) {

      toast.error(
        "Erreur estimation reprise"
      );

    }

  };





  // =========================
  // CALCUL QUOTE
  // =========================


  const vehicle = lead?.vehicle;

const basePrice =
  initialValues?.base_price ??
  vehicle?.price ??
  0;

const totalDiscount =
  discount + downPayment + tradeInValue;

const isValidQuote =
  totalDiscount <= basePrice;

  const total = useMemo(() => {


    return Math.max(

      basePrice
      - discount
      - downPayment
      - tradeInValue,

      0

    );


  }, [
    basePrice,
    discount,
    downPayment,
    tradeInValue
  ]);



  const monthly = useMemo(() => {


    if (!duration)
      return 0;


    return (
      total / duration
    ).toFixed(2);


  }, [
    total,
    duration
  ]);






  // =========================
  // CREATE QUOTE
  // =========================


  const handleSubmit = async () => {

  const payload = {
    lead_id: lead.id,
    discount,
    down_payment: downPayment,
    trade_in_value: tradeInValue,
    duration_months: duration,
    trade_in: form.trade_in_enabled
      ? {
          brand: form.trade_brand,
          model: form.trade_model,
          year: Number(form.trade_year),
          mileage: Number(form.trade_mileage),
          condition: form.trade_condition,
          estimated_value: tradeInValue,
        }
      : null,
  };

  try {

    setLoading(true);

    await onSubmit(payload);

  } catch (err) {

    toast.error(
      err.message ||
      "Erreur lors de l'enregistrement."
    );

  } finally {

    setLoading(false);

  }

};





  if (!lead) {
    return (
      <div className="container py-5">
        Prospect introuvable.
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">

{
 mode === "create"
 ?
 "Créer une offre"
 :
 "Modifier l'offre"
}

</h2>

          <div className="text-muted">
            {lead.first_name} {lead.last_name}
          </div>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          Retour
        </button>

      </div>
{/* REPRISE */}


          <div className="card shadow-sm mb-4">


            <div className="card-body">


              <h5>
                Reprise véhicule
              </h5>



              <div className="form-check mb-3">


                <input

                  className="form-check-input"

                  type="checkbox"

                  checked={
                    form.trade_in_enabled
                  }

                  onChange={(e)=>

                    setForm({

                      ...form,

                      trade_in_enabled:
                        e.target.checked

                    })

                  }

                />


                <label className="form-check-label">

                  Le client possède un véhicule à reprendre

                </label>


              </div>





              {form.trade_in_enabled && (

                <div className="row g-3">


  {/* MARQUE */}
  <div className="col-md-6">

    <label className="form-label">
      Marque
    </label>

    <input
      name="trade_brand"
      className={`form-control ${
        tradeInErrors.trade_brand
          ? "is-invalid"
          : ""
      }`}
      value={form.trade_brand}
      onChange={handleTradeInChange}
    />

    {tradeInErrors.trade_brand && (
      <div className="invalid-feedback">
        {tradeInErrors.trade_brand}
      </div>
    )}

  </div>



  {/* MODELE */}
  <div className="col-md-6">

    <label className="form-label">
      Modèle
    </label>

    <input
      name="trade_model"
      className={`form-control ${
        tradeInErrors.trade_model
          ? "is-invalid"
          : ""
      }`}
      value={form.trade_model}
      onChange={handleTradeInChange}
    />

    {tradeInErrors.trade_model && (
      <div className="invalid-feedback">
        {tradeInErrors.trade_model}
      </div>
    )}

  </div>



  {/* ANNEE */}
  <div className="col-md-4">

    <label className="form-label">
      Année
    </label>

    <input
      type="number"
      name="trade_year"
      className={`form-control ${
        tradeInErrors.trade_year
          ? "is-invalid"
          : ""
      }`}
      value={form.trade_year}
      onChange={handleTradeInChange}
    />

    {tradeInErrors.trade_year && (
      <div className="invalid-feedback">
        {tradeInErrors.trade_year}
      </div>
    )}

  </div>



  {/* KM */}
  <div className="col-md-4">

    <label className="form-label">
      Kilométrage
    </label>

    <input
      type="number"
      name="trade_mileage"
      className={`form-control ${
        tradeInErrors.trade_mileage
          ? "is-invalid"
          : ""
      }`}
      value={form.trade_mileage}
      onChange={handleTradeInChange}
    />

    {tradeInErrors.trade_mileage && (
      <div className="invalid-feedback">
        {tradeInErrors.trade_mileage}
      </div>
    )}

  </div>



  {/* CONDITION */}
  <div className="col-md-4">

    <label className="form-label">
      État
    </label>

    <select
      name="trade_condition"
      className={`form-select ${
        tradeInErrors.trade_condition
          ? "is-invalid"
          : ""
      }`}
      value={form.trade_condition}
      onChange={handleTradeInChange}
    >

      <option value="">
        Choisir
      </option>

      <option value="excellent">
        Excellent
      </option>

      <option value="good">
        Bon
      </option>

      <option value="average">
        Moyen
      </option>

      <option value="poor">
        Mauvais
      </option>

    </select>


    {tradeInErrors.trade_condition && (
      <div className="invalid-feedback">
        {tradeInErrors.trade_condition}
      </div>
    )}

  </div>






                  <button

                    className="btn btn-dark mt-3"

                    disabled={
                      !isTradeInValid()
                    }

                    onClick={
                      handleTradeIn
                    }

                  >

                    Calculer la reprise

                  </button>



                  {tradeInValue > 0 && (

                    <div className="alert alert-light mt-3">

                      Valeur estimée :
                      {" "}
                      <strong>
                        {tradeInValue} €
                      </strong>


                    </div>

                  )}



                </div>

              )}



            </div>

          </div>
      <div className="row g-4">

        {/* COLONNE GAUCHE */}

        <div className="col-lg-7">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Informations financières
              </h5>

              <div className="row g-3">

                <div className="col-md-6">
  <label className="form-label">
    Remise (€)
  </label>

  <input
    type="number"
    className="form-control"
    min="0"
    max={basePrice}
    value={discount}
    onChange={(e) =>
      setDiscount(
        Math.min(
          Number(e.target.value),
          basePrice
        )
      )
    }
  />
</div>


<div className="col-md-6">
  <label className="form-label">
    Apport client (€)
  </label>

  <input
    type="number"
    className="form-control"
    min="0"
    max={basePrice}
    value={downPayment}
    onChange={(e) =>
      setDownPayment(
        Math.min(
          Number(e.target.value),
          basePrice
        )
      )
    }
  />
</div>

  

                <div className="col-md-6">
                  <label className="form-label">
                    Durée
                  </label>

                  <select
                    className="form-select"
                    value={duration}
                    onChange={(e) =>
                      setDuration(Number(e.target.value))
                    }
                  >
                    <option value={24}>24 mois</option>
                    <option value={36}>36 mois</option>
                    <option value={48}>48 mois</option>
                    <option value={60}>60 mois</option>
                  </select>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* COLONNE DROITE */}

        <div className="col-lg-5">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Récapitulatif
              </h5>

              <div className="mb-3">

                <div className="fw-semibold">
                  {vehicle?.brand} {vehicle?.model}
                </div>

                <small className="text-muted">
                  {lead.first_name} {lead.last_name}
                </small>

              </div>

              <hr />

              <div className="d-flex justify-content-between">
  <span>Prix véhicule</span>
  <strong>{basePrice} €</strong>
</div>

<div className="d-flex justify-content-between">
  <span>Remise</span>
  <strong>- {discount} €</strong>
</div>

<div className="d-flex justify-content-between">
  <span>Apport</span>
  <strong>- {downPayment} €</strong>
</div>

<div className="d-flex justify-content-between">
  <span>Reprise</span>
  <strong>- {tradeInValue} €</strong>
</div>

<hr />

<div className="d-flex justify-content-between">
  <span>Montant financé</span>
  <strong>{total} €</strong>
</div>

<div className="d-flex justify-content-between">
  <span>Mensualité estimée</span>
  <strong>{monthly} €/mois</strong>
</div>

              <button
  className="btn btn-dark w-100"
  onClick={handleSubmit}
  disabled={
    loading || !isValidQuote
  }
>
  {
 mode === "create"
 ?
 "Générer l'offre"
 :
 "Enregistrer les modifications"
}
</button>

{!isValidQuote && (
  <div className="alert alert-danger mt-3">
    La remise, l'apport et la reprise ne peuvent pas dépasser
    le prix du véhicule.
  </div>
)}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}




