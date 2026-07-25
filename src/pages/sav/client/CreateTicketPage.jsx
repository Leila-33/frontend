import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../../../services/apiFetch";
import { toast } from "react-toastify";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "",
    message: "",
    application_id: "",
    priority: "MEDIUM",
    category: "GENERAL",
  });

const [errors, setErrors] = useState({});
const validate = (values) => {
  const newErrors = {};

  if (!values.subject.trim()) {
    newErrors.subject = "Le sujet est obligatoire.";
  }

  if (!values.message.trim()) {
    newErrors.message = "Le message est obligatoire.";
  }

  return newErrors;
};

const handleChange = (e) => {
  const { name, value } = e.target;

  const updatedForm = {
    ...form,
    [name]: value,
  };

  setForm(updatedForm);

  // Validation à chaque frappe
  setErrors(validate(updatedForm));
};
const handleSubmit = async (e) => {
   e.preventDefault();

  const validationErrors = validate(form);

  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  try {
    const data = await apiFetch("/support-tickets", {
      method: "POST",
      body: form,
    });

    toast.success("Message envoyé avec succès");

    // petit délai pour UX (SaaS style)
    setTimeout(() => {
      navigate(`/support-tickets/${data.id}`);
    }, 800);

  } catch (err) {
    const message = err?.message || "Une erreur est survenue";
    toast.error(message);
  }
};
const isFormValid =
  form.subject.trim() !== "" &&
  form.message.trim() !== "";
  return (
    <div className="container py-4">
      <h2 className="mb-4">Nouvelle demande SAV</h2>


      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

        {/* SUBJECT */}
        <div className="mb-3">
  <label className="form-label">
    Sujet
  </label>

  <input
    className={`form-control ${
      errors.subject ? "is-invalid" : ""
    }`}
    name="subject"
    value={form.subject}
    onChange={handleChange}
  />

  {errors.subject && (
    <div className="invalid-feedback">
      {errors.subject}
    </div>
  )}
</div>

        {/* CATEGORY */}
        <div className="mb-3">
          <label className="form-label">Catégorie</label>

          <select
  className="form-select"
  name="category"
  value={form.category}
  onChange={handleChange}
  required
>
  <option value="GENERAL">Général</option>
  <option value="FINANCING">Financement</option>
  <option value="DELIVERY">Livraison</option>
  <option value="WARRANTY">Garantie</option>
  <option value="VEHICLE_ISSUE">Problème véhicule</option>
  <option value="DOCUMENTS">Documents</option>
  <option value="PAYMENT">Paiement</option>
  <option value="OTHER">Autre</option>
</select>
        </div>

        {/* MESSAGE */}
        <div className="mb-3">
  <label className="form-label">
    Message
  </label>

  <textarea
    className={`form-control ${
      errors.message ? "is-invalid" : ""
    }`}
    rows="5"
    name="message"
    value={form.message}
    onChange={handleChange}
  />

  {errors.message && (
    <div className="invalid-feedback">
      {errors.message}
    </div>
  )}
</div>

        {/* APPLICATION ID */}
        <div className="mb-3">
          <label className="form-label">ID dossier (optionnel)</label>
          <input
            className="form-control"
            name="application_id"
            value={form.application_id}
            onChange={handleChange}
          />
        </div>

        {/* PRIORITY */}
        <div className="mb-3">
          <label className="form-label">Priorité</label>
          <select
  className="form-select"
  name="priority"
  value={form.priority}
  onChange={handleChange}
>
  <option value="LOW">Faible</option>
  <option value="MEDIUM">Moyenne</option>
  <option value="HIGH">Haute</option>
  <option value="URGENT">Urgente</option>
</select>
        </div>

        <button
  className="btn btn-primary w-100"
  disabled={!isFormValid}
>
  Envoyer la demande
</button>
      </form>
    </div>
  );
}