import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";

import WarrantyPlansComparisonTable
  from "../../components/WarrantyPlansComparisonTable";


// ==========================================================
// PAGE DE GESTION DES PLANS DE GARANTIE
// ==========================================================
//
// Cette page permet à l'administrateur de :
//
// - consulter les plans de garantie
// - créer un nouveau plan
// - modifier un plan existant
// - activer / désactiver un plan
// - comparer les différentes garanties
//
// ==========================================================

export default function WarrantyPlansPage() {

  // ========================================================
  // ÉTATS
  // ========================================================

  // Liste des plans récupérés depuis l'API.
  const [plans, setPlans] = useState([]);

  // Erreurs de validation du formulaire.
  const [formErrors, setFormErrors] = useState({});

  // Référence permettant de faire défiler automatiquement
  // la page vers le formulaire lors d'une modification.
  const formRef = useRef(null);

  // Indique si le formulaire est en mode modification.
  const [editMode, setEditMode] = useState(false);

  // Plan actuellement sélectionné pour la modification.
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ========================================================
  // ÉTAT DU FORMULAIRE
  // ========================================================

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


  // ========================================================
  // RÉINITIALISER LE FORMULAIRE
  // ========================================================
  //
  // Cette fonction remet le formulaire dans son état initial.
  // Elle est utilisée après une création, une modification
  // ou lorsque l'administrateur annule une modification.
  //
  // ========================================================

  const resetForm = () => {

    setForm({
      name: "",
      description: "",
      plan_type: "basic",

      duration_months: "",
      mileage_limit: "",
      price: "",

      covers_engine: true,
      covers_transmission: true,
      covers_electronics: false,
      covers_assistance: false,
      covers_wear_parts: false
    });

    // Suppression des anciennes erreurs.
    setFormErrors({});
  };



// ========================================================
// RÉCUPÉRATION DES PLANS DE GARANTIE
// ========================================================

const fetchPlans = useCallback(
  async () => {

    try {

      const data = await apiFetch(
        "/admin/warranty-plans"
      );

      setPlans(data);

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors du chargement des plans"
      );
    }
  },
  []
);


// ========================================================
// CHARGEMENT INITIAL
// ========================================================

useEffect(() => {
  fetchPlans();
}, [fetchPlans]);



  // ========================================================
  // VALIDATION DU FORMULAIRE
  // ========================================================
  //
  // Vérifie que les données saisies respectent les règles
  // métier avant d'autoriser la création ou la modification.
  //
  // ========================================================

  const validatePlan = (formData) => {

    const errors = {};


    // ------------------------------------------------------
    // 1. NOM DU PLAN
    // ------------------------------------------------------
    //
    // Le nom doit contenir au moins 2 caractères.
    //
    // ------------------------------------------------------

    if (
      !formData.name ||
      formData.name.trim().length < 2
    ) {

      errors.name =
        "Le nom du plan doit contenir au moins 2 caractères.";
    }


    // ------------------------------------------------------
    // 2. DURÉE
    // ------------------------------------------------------
    //
    // La durée doit être comprise entre 3 et 120 mois.
    //
    // ------------------------------------------------------

    const duration = Number(
      formData.duration_months
    );

    if (
      !duration ||
      duration < 3 ||
      duration > 120
    ) {

      errors.duration_months =
        "La durée doit être entre 3 et 120 mois.";
    }


    // ------------------------------------------------------
    // 3. KILOMÉTRAGE
    // ------------------------------------------------------
    //
    // Le kilométrage doit être compris entre
    // 10 000 et 300 000 km.
    //
    // ------------------------------------------------------

    const mileage = Number(
      formData.mileage_limit
    );

    if (
      !mileage ||
      mileage < 10000 ||
      mileage > 300000
    ) {

      errors.mileage_limit =
        "Le kilométrage doit être entre 10 000 et 300 000 km.";
    }


    // ------------------------------------------------------
    // 4. PRIX
    // ------------------------------------------------------
    //
    // Le prix doit être compris entre 50 € et 10 000 €.
    //
    // ------------------------------------------------------

    const price = Number(
      formData.price
    );

    if (
      !price ||
      price < 50 ||
      price > 10000
    ) {

      errors.price =
        "Le prix doit être entre 50 € et 10 000 €.";
    }


    // ------------------------------------------------------
    // 5. RÈGLE DU PLAN PREMIUM
    // ------------------------------------------------------
    //
    // Un plan premium doit obligatoirement couvrir :
    //
    // - le moteur
    // - la transmission
    //
    // ------------------------------------------------------

    if (formData.plan_type === "premium") {

      if (
        !formData.covers_engine ||
        !formData.covers_transmission
      ) {

        errors.coverage =
          "Un plan premium doit couvrir le moteur ET la transmission.";
      }
    }


    // ------------------------------------------------------
    // 6. AU MOINS UNE COUVERTURE
    // ------------------------------------------------------
    //
    // Un plan doit posséder au minimum une couverture.
    //
    // ------------------------------------------------------

    const hasCoverage =
      formData.covers_engine ||
      formData.covers_transmission ||
      formData.covers_electronics ||
      formData.covers_assistance ||
      formData.covers_wear_parts;

    if (!hasCoverage) {

      errors.coverage =
        "Sélectionnez au moins une couverture.";
    }


    // ------------------------------------------------------
    // 7. RÈGLE DU PLAN CUSTOM
    // ------------------------------------------------------
    //
    // Un plan custom doit obligatoirement posséder
    // une description.
    //
    // ------------------------------------------------------

    if (
      formData.plan_type === "custom" &&
      (!formData.description ||
        formData.description.trim().length === 0)
    ) {

      errors.description =
        "Un plan custom doit obligatoirement avoir une description.";
    }


    return errors;
  };


  // ========================================================
  // ÉTAT DE VALIDITÉ DU FORMULAIRE
  // ========================================================
  //
  // Le bouton de soumission est désactivé lorsqu'une
  // erreur de validation existe.
  //
  // ========================================================

  const isValid =
    Object.keys(
      validatePlan(form)
    ).length === 0;


  // ========================================================
  // GESTION DES CHANGEMENTS DU FORMULAIRE
  // ========================================================
  //
  // Cette fonction est utilisée pour tous les champs
  // du formulaire.
  //
  // Les checkbox utilisent "checked".
  // Les autres champs utilisent "value".
  //
  // ========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;


    // Création du nouvel état du formulaire.
    const updatedForm = {
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value
    };


    setForm(updatedForm);


    // Validation immédiate après chaque modification.
    setFormErrors(
      validatePlan(updatedForm)
    );
  };


  // ========================================================
  // OUVRIR LE MODE MODIFICATION
  // ========================================================
  //
  // Préremplit le formulaire avec les données du plan
  // sélectionné.
  //
  // ========================================================

  const openEditModal = (plan) => {

    // Mémorisation du plan sélectionné.
    setSelectedPlan(plan);

    // Passage en mode modification.
    setEditMode(true);


    // Préremplissage du formulaire.
    setForm({

      name:
        plan.name ?? "",

      description:
        plan.description ?? "",

      plan_type:
        plan.plan_type ?? "basic",

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
        plan.covers_wear_parts ?? false
    });


    // Suppression des anciennes erreurs.
    setFormErrors({});


    // ------------------------------------------------------
    // SCROLL VERS LE FORMULAIRE
    // ------------------------------------------------------
    //
    // Lorsque l'utilisateur clique sur "Modifier",
    // on remonte automatiquement vers le formulaire.
    //
    // ------------------------------------------------------

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };


  // ========================================================
  // ANNULER LA MODIFICATION
  // ========================================================

  const cancelEdit = () => {

    // Quitter le mode modification.
    setEditMode(false);

    // Désélectionner le plan.
    setSelectedPlan(null);

    // Réinitialiser le formulaire.
    resetForm();
  };


  // ========================================================
  // CRÉER / MODIFIER UN PLAN
  // ========================================================
  //
  // Une seule fonction gère les deux opérations :
  //
  // - POST  → création
  // - PUT   → modification
  //
  // ========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // Sécurité supplémentaire :
    // on empêche l'envoi si le formulaire est invalide.
    if (!isValid) {
      return;
    }


    try {

      // ----------------------------------------------------
      // CONSTRUCTION DU BODY
      // ----------------------------------------------------
      //
      // Conversion des champs numériques avant l'envoi
      // vers l'API.
      //
      // ----------------------------------------------------

      const body = {

        name:
          form.name,

        description:
          form.description,

        plan_type:
          form.plan_type,

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
          form.covers_wear_parts
      };


      // ----------------------------------------------------
      // CHOIX DE LA ROUTE
      // ----------------------------------------------------
      //
      // En mode modification :
      // PUT /admin/warranty-plans/{id}
      //
      // En création :
      // POST /admin/warranty-plans
      //
      // ----------------------------------------------------

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


      // Message adapté à l'opération effectuée.
      toast.success(
        editMode
          ? "Plan modifié ✅"
          : "Plan créé ✅"
      );


      // Actualisation de la liste.
      await fetchPlans();


      // Réinitialisation du formulaire.
      resetForm();

      // Sortie du mode modification.
      setEditMode(false);

      // Suppression du plan sélectionné.
      setSelectedPlan(null);

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors de la sauvegarde du plan"
      );
    }
  };


  // ========================================================
  // ACTIVER / DÉSACTIVER UN PLAN
  // ========================================================
  //
  // Inverse l'état actuel du plan.
  //
  // active = true  → désactivation
  // active = false → activation
  //
  // ========================================================

  const toggleActive = async (id, active) => {

    try {

      await apiFetch(
        `/admin/warranty-plans/${id}/status`,
        {

          method: "PATCH",

          body: {
            active: !active
          }
        }
      );


      // Message adapté au nouvel état.
      toast.success(
        active
          ? "Plan désactivé ❌"
          : "Plan activé ✅"
      );


      // Actualisation de la liste.
      await fetchPlans();

    } catch (err) {

      toast.error(
        err?.message ||
        "Erreur lors de la modification du statut"
      );
    }
  };


  // ========================================================
  // RENDU
  // ========================================================

  return (

    <div className="container py-4">

      {/* ====================================================
          TITRE DE LA PAGE
      ==================================================== */}

      <h2 className="fw-bold mb-4">
        🛡️ Gestion des plans de garantie
      </h2>


      {/* ====================================================
          FORMULAIRE DE CRÉATION / MODIFICATION
      ==================================================== */}

      <div
        ref={formRef}
        className="card border-0 shadow-sm rounded-4 mb-4"
      >

        <div className="card-body">

          {/* ------------------------------------------------
              EN-TÊTE DU FORMULAIRE
          ------------------------------------------------ */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">

              {editMode
                ? `Modifier le plan : ${selectedPlan?.name}`
                : "Créer un plan"
              }

            </h5>


            {/* Bouton permettant de quitter le mode
                modification. */}

            {editMode && (

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={cancelEdit}
              >

                <i className="bi bi-x-circle me-1"></i>

                Annuler modification

              </button>
            )}

          </div>


          {/* ------------------------------------------------
              FORMULAIRE
          ------------------------------------------------ */}

          <form
            onSubmit={handleSubmit}
            className="row g-3"
          >


            {/* =================================================
                NOM DU PLAN
            ================================================= */}

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


              {/* Message d'erreur de validation. */}

              {formErrors.name && (

                <div className="invalid-feedback">
                  {formErrors.name}
                </div>
              )}

            </div>


            {/* =================================================
                TYPE DE PLAN
            ================================================= */}

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

                <option value="basic">
                  Basic
                </option>

                <option value="standard">
                  Standard
                </option>

                <option value="premium">
                  Premium
                </option>

                <option value="custom">
                  Custom
                </option>

              </select>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="col-12">

              <label className="form-label">
                Description
              </label>


              <textarea
                className={`form-control ${
                  formErrors.description
                    ? "is-invalid"
                    : ""
                }`}
                rows="3"
                name="description"
                value={form.description}
                onChange={handleChange}
              />


              {formErrors.description && (

                <div className="invalid-feedback">
                  {formErrors.description}
                </div>
              )}

            </div>


            {/* =================================================
                DURÉE
            ================================================= */}

            <div className="col-md-4">

              <label className="form-label">
                Durée (mois)
              </label>


              <input
                type="number"
                className={`form-control ${
                  formErrors.duration_months
                    ? "is-invalid"
                    : ""
                }`}
                name="duration_months"
                value={form.duration_months}
                onChange={handleChange}
              />


              {formErrors.duration_months && (

                <div className="invalid-feedback">
                  {formErrors.duration_months}
                </div>
              )}

            </div>


            {/* =================================================
                KILOMÉTRAGE
            ================================================= */}

            <div className="col-md-4">

              <label className="form-label">
                Kilométrage maximum
              </label>


              <input
                type="number"
                className={`form-control ${
                  formErrors.mileage_limit
                    ? "is-invalid"
                    : ""
                }`}
                name="mileage_limit"
                value={form.mileage_limit ?? ""}
                onChange={handleChange}
              />


              {formErrors.mileage_limit && (

                <div className="invalid-feedback">
                  {formErrors.mileage_limit}
                </div>
              )}

            </div>


            {/* =================================================
                PRIX
            ================================================= */}

            <div className="col-md-4">

              <label className="form-label">
                Prix (€)
              </label>


              <input
                type="number"
                className={`form-control ${
                  formErrors.price
                    ? "is-invalid"
                    : ""
                }`}
                name="price"
                value={form.price}
                onChange={handleChange}
              />


              {formErrors.price && (

                <div className="invalid-feedback">
                  {formErrors.price}
                </div>
              )}

            </div>


            {/* =================================================
                COUVERTURES
            ================================================= */}

            <div className="col-12">

              <label className="form-label fw-semibold">
                Couverture
              </label>


              <div
                className={`border rounded-3 p-3 d-flex flex-wrap gap-4 ${
                  formErrors.coverage
                    ? "border-danger"
                    : ""
                }`}
              >

                {/* Liste des couvertures disponibles. */}

                {[
                  ["covers_engine", "Moteur"],
                  ["covers_transmission", "Transmission"],
                  ["covers_electronics", "Électronique"],
                  ["covers_assistance", "Assistance"],
                  ["covers_wear_parts", "Pièces d'usure"]
                ].map(([key, label]) => (

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


              {/* Message d'erreur concernant les couvertures. */}

              {formErrors.coverage && (

                <div className="text-danger small mt-2">
                  {formErrors.coverage}
                </div>
              )}

            </div>


            {/* =================================================
                BOUTON DE SOUMISSION
            ================================================= */}

            <div className="col-12">

              <button
                type="submit"
                disabled={!isValid}
                className="btn btn-dark px-4"
              >

                {editMode
                  ? "Enregistrer les modifications"
                  : "Créer le plan"
                }

              </button>

            </div>

          </form>

        </div>

      </div>


      {/* ====================================================
          LISTE / COMPARAISON DES PLANS
      ==================================================== */}

      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body">

          <h4 className="fw-bold mb-4">
            Comparaison des garanties
          </h4>


          {/* Tableau réutilisable permettant de comparer
              les différents plans. */}

          <WarrantyPlansComparisonTable

            plans={plans}

            onEdit={openEditModal}

            onToggle={toggleActive}

          />

        </div>

      </div>

    </div>
  );
}
