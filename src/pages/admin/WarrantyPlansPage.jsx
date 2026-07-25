import { useEffect, useState, useRef } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import WarrantyPlansComparisonTable from "../../components/WarrantyPlansComparisonTable";


export default function WarrantyPlansPage() {
const [formErrors, setFormErrors] = useState({});

  const [plans, setPlans] = useState([]);
const formRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    plan_type: "basic",
    duration_months: 12,
    mileage_limit: "",
    covers_engine: true,
    covers_transmission: true,
    covers_electronics: false,
    covers_assistance: false,
    covers_wear_parts: false,
    price: 0
  });

  const resetForm = () => {

  setForm({

    name: "",
    description: "",
    plan_type: "BASIC",
    duration_months: "",
    mileage_limit: "",
    price: "",

    covers_engine: true,
    covers_transmission: true,
    covers_electronics: false,
    covers_assistance: false,
    covers_wear_parts: false,

  });

  setFormErrors({});
};
// =========================
// EDIT MODE
// =========================

const [editMode, setEditMode] = useState(false);
const [selectedPlan, setSelectedPlan] = useState(null);

  // =========================
  // FETCH PLANS
  // =========================
  const fetchPlans = async () => {
    try {
      const data = await apiFetch("/admin/warranty-plans");
      setPlans(data);
    } catch (err) {
      toast.error(err.message || "Erreur chargement plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  const updatedForm = {
    ...form,
    [name]: type === "checkbox" ? checked : value
  };

  setForm(updatedForm);

  // 🔥 validation en temps réel
  const errors = validatePlan(updatedForm);
  setFormErrors(errors);
};

const validatePlan = (form) => {
  const errors = {};

  // 1. Nom du plan (> 3 caractères)
  if (!form.name || form.name.trim().length < 2) {
    errors.name = "Le nom du plan doit contenir au moins 2 caractères.";
  }

  // 2. Durée (3 à 120 mois)
  const duration = Number(form.duration_months);
  if (!duration || duration < 3 || duration > 120) {
    errors.duration_months = "La durée doit être entre 3 et 120 mois.";
  }

  // 3. Kilométrage (10 000 à 300 000 km)
  const mileage = Number(form.mileage_limit);
  if (!mileage || mileage < 10000 || mileage > 300000) {
    errors.mileage_limit =
      "Le kilométrage doit être entre 10 000 et 300 000 km.";
  }

  // 4. Prix (50 € à 10 000 €)
  const price = Number(form.price);
  if (!price || price < 50 || price > 10000) {
    errors.price = "Le prix doit être entre 50 € et 10 000 €.";
  }

  // 5. Plan PREMIUM → moteur + transmission obligatoires
  if (form.plan_type === "premium") {
    if (!form.covers_engine || !form.covers_transmission) {
      errors.coverage =
        "Un plan premium doit couvrir le moteur ET la transmission.";
    }
  }
const hasCoverage =
    form.covers_engine ||
    form.covers_transmission ||
    form.covers_electronics ||
    form.covers_assistance ||
    form.covers_wear_parts;
  if (!hasCoverage) {
    errors.coverage =
      "Sélectionnez au moins une couverture";
  }
  // 6. Plan CUSTOM → description obligatoire
  if (form.plan_type === "custom") {
    if (!form.description || form.description.trim().length === 0) {
      errors.description =
        "Un plan custom doit obligatoirement avoir une description.";
    }
  }

  return errors;
};
const isValid = Object.keys(validatePlan(form)).length === 0;


// =========================
// OUVRIR MODIFICATION
// =========================

const openEditModal = (plan) => {

  setSelectedPlan(plan);

  setEditMode(true);


  setForm({

    name: plan.name ?? "",

    description: plan.description ?? "",

    plan_type: plan.plan_type ?? "BASIC",

    duration_months:
      plan.duration_months ?? "",

    mileage_limit:
      plan.mileage_limit ?? "",

    price:
      plan.price ?? "",


    covers_engine:
      plan.covers_engine ?? true,

    covers_transmission:
      plan.covers_transmission ?? true,

    covers_electronics:
      plan.covers_electronics ?? false,

    covers_assistance:
      plan.covers_assistance ?? false,

    covers_wear_parts:
      plan.covers_wear_parts ?? false,

  });


  setFormErrors({});


  // =========================
  // SCROLL VERS LE FORMULAIRE
  // =========================

  formRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "start"
});

};


// =========================
// ANNULER MODIFICATION
// =========================
const cancelEdit = () => {

  setEditMode(false);

  setSelectedPlan(null);

  resetForm();

};

// =========================
// SUBMIT CREATE / UPDATE
// =========================

const handleSubmit = async (e) => {

  e.preventDefault();


  if (!isValid) {
    return;
  }



  try {


    const body = {

      name: form.name,

      description: form.description,

      plan_type: form.plan_type,

      duration_months:
        Number(form.duration_months),

      mileage_limit:
        form.mileage_limit
          ? Number(form.mileage_limit)
          : null,

      price:
        Number(form.price),


      covers_engine:
        form.covers_engine,

      covers_transmission:
        form.covers_transmission,

      covers_electronics:
        form.covers_electronics,

      covers_assistance:
        form.covers_assistance,

      covers_wear_parts:
        form.covers_wear_parts,

    };



    await apiFetch(

      editMode
        ? `/admin/warranty-plans/${selectedPlan.id}`
        : "/admin/warranty-plans",

      {

        method:
          editMode
            ? "PUT"
            : "POST",

        body

      }

    );



    toast.success(

      editMode
        ? "Plan modifié ✅"
        : "Plan créé ✅"

    );

await fetchPlans();

resetForm();

setEditMode(false);

setSelectedPlan(null);

  } catch(err) {


    toast.error(
      err.message ||
      "Erreur sauvegarde plan"
    );


  }


};



// =========================
// TOGGLE ACTIVE
// =========================

const toggleActive = async (id, active) => {

  try {


    await apiFetch(
      `/admin/warranty-plans/${id}`,
      {

        method:"PATCH",

        body:{
          active: !active
        }

      }
    );


    toast.success(
      active
        ? "Plan désactivé ❌"
        : "Plan activé ✅"
    );


    await fetchPlans();


  } catch(err){

    toast.error(
      err.message ||
      "Erreur modification statut"
    );

  }

};
  return (
  <div className="container py-4">

    <h2 className="fw-bold mb-4">
      🛡️ Gestion des plans de garantie
    </h2>


    {/* =========================
        FORMULAIRE
    ========================= */}

    <div
  ref={formRef}
  className="card border-0 shadow-sm rounded-4 mb-4"
>

      <div className="card-body">


        <div className="d-flex justify-content-between align-items-center mb-3">

          <h5 className="fw-bold mb-0">

            {
              editMode
                ? `✏️ Modifier le plan : ${selectedPlan?.name}`
                : "➕ Créer un plan"
            }

          </h5>


          {
            editMode && (

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={cancelEdit}
              >

                <i className="bi bi-x-circle me-1"></i>

                Annuler modification

              </button>

            )
          }


        </div>



        <form
          onSubmit={handleSubmit}
          className="row g-3"
        >


          {/* NOM */}

          <div className="col-md-6">

            <label className="form-label">
              Nom du plan
            </label>


            <input
              className={`form-control ${
                formErrors.name
                ? "is-invalid"
                : ""
              }`}
              name="name"
              value={form.name}
              onChange={handleChange}
            />


            {
              formErrors.name && (

                <div className="invalid-feedback">
                  {formErrors.name}
                </div>

              )
            }


          </div>




          {/* TYPE */}

          <div className="col-md-6">

            <label className="form-label">
              Type
            </label>


            <select
              className="form-select"
              name="plan_type"
              value={form.plan_type}
              onChange={handleChange}
            >

              <option value="BASIC">
                Basic
              </option>


              <option value="STANDARD">
                Standard
              </option>


              <option value="PREMIUM">
                Premium
              </option>


              <option value="CUSTOM">
                Custom
              </option>


            </select>


          </div>





          {/* DESCRIPTION */}

          <div className="col-12">

            <label className="form-label">
              Description
            </label>


            <textarea
              className="form-control"
              rows="3"
              name="description"
              value={form.description}
              onChange={handleChange}
            />


          </div>






          {/* DUREE */}

          <div className="col-md-4">

            <label className="form-label">
              Durée (mois)
            </label>


            <input
              type="number"
              className="form-control"
              name="duration_months"
              value={form.duration_months}
              onChange={handleChange}
            />


          </div>





          {/* KM */}

          <div className="col-md-4">

            <label className="form-label">
              Kilométrage maximum
            </label>


            <input
              type="number"
              className="form-control"
              name="mileage_limit"
              value={form.mileage_limit ?? ""}
              onChange={handleChange}
            />


          </div>





          {/* PRIX */}

          <div className="col-md-4">

            <label className="form-label">
              Prix (€)
            </label>


            <input
              type="number"
              className="form-control"
              name="price"
              value={form.price}
              onChange={handleChange}
            />


          </div>






          {/* COUVERTURES */}

          <div className="col-12">


            <label className="form-label fw-semibold">
              Couverture
            </label>



            <div className="border rounded-3 p-3 d-flex flex-wrap gap-4">


              {[
                ["covers_engine","Moteur"],
                ["covers_transmission","Transmission"],
                ["covers_electronics","Électronique"],
                ["covers_assistance","Assistance"],
                ["covers_wear_parts","Pièces d'usure"]

              ].map(([key,label]) => (


                <div
                  className="form-check"
                  key={key}
                >

                  <input
                    type="checkbox"
                    className="form-check-input"
                    name={key}
                    checked={form[key]}
                    onChange={handleChange}
                  />


                  <label className="form-check-label">

                    {label}

                  </label>


                </div>


              ))}


            </div>


          </div>





          {/* ACTION */}

          <div className="col-12">


            <button
              type="submit"
              disabled={!isValid}
              className="btn btn-dark px-4"
            >

              {
                editMode
                ?
                "Enregistrer les modifications"
                :
                "Créer le plan"
              }


            </button>


          </div>



        </form>



      </div>

    </div>







    {/* =========================
        LISTE DES PLANS
    ========================= */}


    <div className="card border-0 shadow-sm rounded-4">


      <div className="card-body">


        <h4 className="fw-bold mb-4">
          Comparaison des garanties
        </h4>



        <WarrantyPlansComparisonTable

          plans={plans}

          onEdit={openEditModal}

          onToggle={toggleActive}

        />


      </div>


    </div>



  </div>
);}