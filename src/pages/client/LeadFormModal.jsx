import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";

export default function LeadFormModal({
  show,
  onClose,
  vehicleId,
  user,
  onSuccess,
}) {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});


  // =========================
  // VALIDATION
  // =========================

  const validate = (data) => {

    const errors = {};

    if (!data.first_name.trim()) {
      errors.first_name = "Le prénom est obligatoire.";
    }

    if (!data.last_name.trim()) {
      errors.last_name = "Le nom est obligatoire.";
    }

    if (!data.email.trim()) {
      errors.email = "L'email est obligatoire.";
    }

    if (!data.phone.trim()) {
      errors.phone = "Le téléphone est obligatoire.";
    }

    return errors;

  };


  // =========================
  // INIT
  // =========================

  useEffect(() => {

    if (!show) return;

    const initialForm = {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      message: "",
    };

    setForm(initialForm);

    setErrors(
      validate(initialForm)
    );

  }, [show, user]);


  // =========================
  // CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]: value,
    };

    setForm(updated);

    setErrors(
      validate(updated)
    );

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {

      setErrors(validationErrors);

      return;

    }

    try {

      const data = await apiFetch(
        "/leads",
        {
          method: "POST",
          body: {
            vehicle_id: vehicleId,
            ...form,
          },
        }
      );

      toast.success(
        "Votre demande a bien été envoyée."
      );

      onClose();

      if (onSuccess) {
        onSuccess(data);
      }

    } catch (err) {

      toast.error(
        err.message ||
        "Erreur lors de l'envoi de votre demande."
      );

    }

  };


  const isValid = useMemo(() => {

    return (
      Object.keys(errors).length === 0
    );

  }, [errors]);


  if (!show) {
    return null;
  }


  return (
    <>
      <div
        className="modal fade show"
        style={{
          display: "block",
        }}
        tabIndex="-1"
      >

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">
                Je suis intéressé
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />

            </div>

            <form onSubmit={handleSubmit}>

              <div className="modal-body">

                <p className="text-muted">

                  Vérifiez vos coordonnées.
                  Un conseiller vous contactera rapidement.

                </p>

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <label className="form-label">
                      Prénom
                    </label>

                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`form-control ${
                        errors.first_name
                          ? "is-invalid"
                          : ""
                      }`}
                    />

                    {errors.first_name && (

                      <div className="invalid-feedback">
                        {errors.first_name}
                      </div>

                    )}

                  </div>

                  <div className="col-md-6 mb-3">

                    <label className="form-label">
                      Nom
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`form-control ${
                        errors.last_name
                          ? "is-invalid"
                          : ""
                      }`}
                    />

                    {errors.last_name && (

                      <div className="invalid-feedback">
                        {errors.last_name}
                      </div>

                    )}

                  </div>

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`form-control ${
                      errors.email
                        ? "is-invalid"
                        : ""
                    }`}
                  />

                  {errors.email && (

                    <div className="invalid-feedback">
                      {errors.email}
                    </div>

                  )}

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Téléphone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`form-control ${
                      errors.phone
                        ? "is-invalid"
                        : ""
                    }`}
                  />

                  {errors.phone && (

                    <div className="invalid-feedback">
                      {errors.phone}
                    </div>

                  )}

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Message (optionnel)
                  </label>

                  <textarea
                    rows="4"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Je souhaiterais obtenir davantage d'informations sur ce véhicule..."
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isValid}
                >
                  Envoyer ma demande
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

      <div className="modal-backdrop fade show" />
    </>
  );

}

