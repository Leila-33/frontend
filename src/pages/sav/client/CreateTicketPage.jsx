import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from "../../../constants/supportTicketOptions";

import apiFetch from "../../../services/apiFetch";

/**
 * Page de création d'un ticket SAV.
 *
 * Responsabilités :
 * - gérer les données du formulaire ;
 * - effectuer la validation côté client ;
 * - envoyer la demande à l'API ;
 * - afficher le résultat de l'opération ;
 * - rediriger vers le ticket créé.
 *
 * La validation métier reste assurée par le backend.
 */
export default function CreateTicketPage() {
  const navigate = useNavigate();

  // =========================
  // FORMULAIRE
  // =========================

  const [form, setForm] = useState({
    subject: "",
    message: "",
    application_id: "",
    priority: "MEDIUM",
    category: "GENERAL",
  });

  // =========================
  // ÉTATS UI
  // =========================

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =========================
  // VALIDATION
  // =========================

  /**
   * Valide les champs obligatoires du formulaire.
   *
   * @param {Object} values
   * @returns {Object}
   */
  const validate = (values) => {
    const newErrors = {};

    if (!values.subject.trim()) {
      newErrors.subject =
        "Le sujet est obligatoire.";
    }

    if (!values.message.trim()) {
      newErrors.message =
        "Le message est obligatoire.";
    }

    return newErrors;
  };

  // =========================
  // FORM CHANGE
  // =========================

  /**
   * Met à jour un champ du formulaire.
   *
   * La validation est effectuée à chaque modification
   * afin de fournir un retour immédiat à l'utilisateur.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    // Revalide le formulaire après chaque modification.
    setErrors(validate(updatedForm));
  };

  // =========================
  // SUBMIT
  // =========================

  /**
   * Envoie le formulaire de création du ticket.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Évite les doubles soumissions.
    if (isSubmitting) {
      return;
    }

    // =========================
    // VALIDATION
    // =========================

    const validationErrors = validate(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      // =========================
      // PRÉPARATION DES DONNÉES
      // =========================

      const payload = {
        ...form,

        // Les champs texte sont nettoyés avant
        // leur transmission au backend.
        subject: form.subject.trim(),
        message: form.message.trim(),

        // Un dossier non renseigné est transmis
        // comme null plutôt qu'une chaîne vide.
        application_id:
          form.application_id.trim() || null,
      };

      // =========================
      // APPEL API
      // =========================

      const data = await apiFetch(
        "/support-tickets",
        {
          method: "POST",
          body: payload,
        }
      );

      // =========================
      // SUCCÈS
      // =========================

      toast.success(
        "Votre demande SAV a été créée."
      );

      // Redirection immédiate vers le ticket créé.
      //
      // Le setTimeout n'est pas nécessaire :
      // le toast reste visible indépendamment
      // de la navigation.
      navigate(
        `/support-tickets/${data.id}`
      );

    } catch (error) {
      toast.error(
        error?.message ||
        "Impossible de créer le ticket."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // ÉTAT DU FORMULAIRE
  // =========================

  const isFormValid =
    form.subject.trim() !== "" &&
    form.message.trim() !== "";

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container py-4">

      {/* =========================
          HEADER
          ========================= */}

      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">
          Nouvelle demande SAV
        </h1>

        <p className="text-muted mb-0">
          Décrivez votre demande afin que notre
          service après-vente puisse vous répondre.
        </p>
      </div>

      {/* =========================
          FORMULAIRE
          ========================= */}

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm rounded-4"
        noValidate
      >
        <div className="card-body p-4">

          {/* =========================
              SUJET
              ========================= */}

          <div className="mb-4">
            <label
              htmlFor="ticket-subject"
              className="form-label fw-semibold"
            >
              Sujet
            </label>

            <input
              id="ticket-subject"
              type="text"
              className={`form-control ${errors.subject
                  ? "is-invalid"
                  : ""
                }`}
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Ex. Problème avec mon véhicule"
              maxLength={255}
              autoComplete="off"
              aria-invalid={
                errors.subject
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.subject
                  ? "ticket-subject-error"
                  : undefined
              }
            />

            {errors.subject && (
              <div
                id="ticket-subject-error"
                className="invalid-feedback"
              >
                {errors.subject}
              </div>
            )}
          </div>

          {/* =========================
              CATÉGORIE
              ========================= */}

          <div className="mb-4">
            <label
              htmlFor="ticket-category"
              className="form-label fw-semibold"
            >
              Catégorie
            </label>
            <select
              id="ticket-category"
              className="form-select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {Object.entries(TICKET_CATEGORIES).map(
                ([value, option]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* =========================
              MESSAGE
              ========================= */}

          <div className="mb-4">
            <label
              htmlFor="ticket-message"
              className="form-label fw-semibold"
            >
              Message
            </label>

            <textarea
              id="ticket-message"
              className={`form-control ${errors.message
                  ? "is-invalid"
                  : ""
                }`}
              rows={6}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Décrivez votre demande..."
              aria-invalid={
                errors.message
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.message
                  ? "ticket-message-error"
                  : undefined
              }
            />

            {errors.message && (
              <div
                id="ticket-message-error"
                className="invalid-feedback"
              >
                {errors.message}
              </div>
            )}
          </div>

          {/* =========================
              DOSSIER ASSOCIÉ
              ========================= */}

          <div className="mb-4">
            <label
              htmlFor="ticket-application"
              className="form-label fw-semibold"
            >
              ID dossier
              <span className="text-muted fw-normal">
                {" "}
                (optionnel)
              </span>
            </label>

            <input
              id="ticket-application"
              type="text"
              className="form-control"
              name="application_id"
              value={form.application_id}
              onChange={handleChange}
              placeholder="Ex. 123"
              autoComplete="off"
            />

            <div className="form-text">
              Vous pouvez associer cette demande à
              un dossier existant.
            </div>
          </div>

          {/* =========================
              PRIORITÉ
              ========================= */}

          <div className="mb-4">
            <label
              htmlFor="ticket-priority"
              className="form-label fw-semibold"
            >
              Priorité
            </label>

            <select
              id="ticket-priority"
              className="form-select"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {Object.entries(TICKET_PRIORITIES).map(
                ([value, option]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* =========================
              ACTION
              ========================= */}

          <div className="d-flex justify-content-end pt-2">
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={
                !isFormValid ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />

                  Envoi en cours...
                </>
              ) : (
                <>
                  <i
                    className="bi bi-send me-2"
                    aria-hidden="true"
                  />

                  Envoyer la demande
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}