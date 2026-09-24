import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

/**
 * Formulaire de création d'un lead depuis la fiche véhicule.
 *
 * Responsabilités :
 * - préremplir les coordonnées de l'utilisateur connecté ;
 * - permettre leur modification ;
 * - valider les informations saisies ;
 * - créer le lead après confirmation du formulaire ;
 * - informer le parent lorsque le lead a été créé.
 *
 * Le composant ne gère pas la logique métier du lead :
 * celle-ci reste du ressort de l'API.
 */
export default function LeadFormModal({
  show,
  onClose,
  vehicleId,
  user,
  onSuccess,
}) {
  // =====================================================
  // ÉTAT
  // =====================================================

  /**
   * Données saisies dans le formulaire.
   */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
  });

  /**
   * Erreurs de validation par champ.
   */
  const [errors, setErrors] = useState({});

  /**
   * Indique si la création du lead est en cours.
   *
   * Permet notamment d'empêcher plusieurs soumissions
   * successives du formulaire.
   */
  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // VALIDATION
  // =====================================================

  /**
   * Valide les données du formulaire.
   *
   * La validation frontend permet d'éviter une requête
   * inutile lorsque les informations obligatoires sont
   * absentes.
   *
   * La validation backend reste indispensable.
   */
  const validate = useCallback((data) => {
    const validationErrors = {};

    const firstName =
      data.first_name.trim();

    const lastName =
      data.last_name.trim();

    const email =
      data.email.trim();

    const phone =
      data.phone.trim();

    if (!firstName) {
      validationErrors.first_name =
        "Le prénom est obligatoire.";
    }

    if (!lastName) {
      validationErrors.last_name =
        "Le nom est obligatoire.";
    }

    if (!email) {
      validationErrors.email =
        "L'email est obligatoire.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      validationErrors.email =
        "Veuillez saisir une adresse email valide.";
    }

    if (!phone) {
      validationErrors.phone =
        "Le téléphone est obligatoire.";
    }

    return validationErrors;
  }, []);

  // =====================================================
  // INITIALISATION
  // =====================================================

  /**
   * Préremplit le formulaire lorsque la modale est ouverte.
   *
   * Les informations connues de l'utilisateur sont reprises
   * automatiquement afin d'éviter une saisie inutile.
   */
  useEffect(() => {
    if (!show) {
      return;
    }

    const initialForm = {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      message: "",
    };

    setForm(initialForm);
    setErrors({});
    setSubmitting(false);
  }, [show, user]);

  // =====================================================
  // MODIFICATION DU FORMULAIRE
  // =====================================================

  /**
   * Met à jour un champ du formulaire.
   *
   * La validation du champ modifié est effectuée
   * immédiatement afin de fournir un retour utilisateur
   * sans attendre la soumission.
   */
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    /**
     * Recalcule les erreurs après chaque modification.
     */
    setErrors(validate(updatedForm));
  };

  // =====================================================
  // SOUMISSION
  // =====================================================

  /**
   * Crée le lead associé au véhicule.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    /**
     * Évite une double soumission si l'utilisateur
     * clique plusieurs fois sur le bouton.
     */
    if (submitting) {
      return;
    }

    const validationErrors =
      validate(form);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const data = await apiFetch(
        "/leads",
        {
          method: "POST",
          body: {
            vehicle_id: vehicleId,

            /**
             * On nettoie les champs texte avant
             * de les transmettre à l'API.
             */
            first_name:
              form.first_name.trim(),

            last_name:
              form.last_name.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            message:
              form.message.trim(),
          },
        }
      );

      toast.success(
        "Votre demande a bien été envoyée."
      );

      /**
       * Informe immédiatement le composant parent
       * que le lead vient d'être créé.
       */
      onSuccess?.(data);

      /**
       * Ferme la modale après la création réussie.
       */
      onClose();
    } catch (error) {
      toast.error(
        error?.message ||
        "Erreur lors de l'envoi de votre demande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  /**
   * La modale n'est pas rendue lorsqu'elle est fermée.
   */
  if (!show) {
    return null;
  }

  /**
   * Le formulaire est valide lorsqu'aucune erreur
   * n'est actuellement présente.
   */
  const isValid =
    Object.keys(errors).length === 0;

  return (
    <>
      {/* =================================================
          MODALE
      ================================================= */}

      <div
        className="modal fade show"
        style={{
          display: "block",
        }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            {/* =============================================
                EN-TÊTE
            ============================================= */}

            <div className="modal-header">
              <div>
                <h2
                  id="lead-form-title"
                  className="h5 modal-title fw-bold mb-1"
                >
                  Je suis intéressé
                </h2>

                <p className="text-muted small mb-0">
                  Laissez vos coordonnées pour être
                  recontacté par un conseiller.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
                aria-label="Fermer"
              />
            </div>

            {/* =============================================
                FORMULAIRE
            ============================================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="modal-body">

                <div className="row g-3">

                  {/* =======================================
                      PRÉNOM
                  ======================================= */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="lead-first-name"
                      className="form-label"
                    >
                      Prénom
                    </label>

                    <input
                      id="lead-first-name"
                      type="text"
                      name="first_name"
                      className={`form-control ${
                        errors.first_name
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.first_name}
                      onChange={handleChange}
                      autoComplete="given-name"
                      aria-invalid={
                        Boolean(
                          errors.first_name
                        )
                      }
                      aria-describedby={
                        errors.first_name
                          ? "lead-first-name-error"
                          : undefined
                      }
                    />

                    {errors.first_name && (
                      <div
                        id="lead-first-name-error"
                        className="invalid-feedback"
                      >
                        {errors.first_name}
                      </div>
                    )}
                  </div>

                  {/* =======================================
                      NOM
                  ======================================= */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="lead-last-name"
                      className="form-label"
                    >
                      Nom
                    </label>

                    <input
                      id="lead-last-name"
                      type="text"
                      name="last_name"
                      className={`form-control ${
                        errors.last_name
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.last_name}
                      onChange={handleChange}
                      autoComplete="family-name"
                      aria-invalid={
                        Boolean(
                          errors.last_name
                        )
                      }
                      aria-describedby={
                        errors.last_name
                          ? "lead-last-name-error"
                          : undefined
                      }
                    />

                    {errors.last_name && (
                      <div
                        id="lead-last-name-error"
                        className="invalid-feedback"
                      >
                        {errors.last_name}
                      </div>
                    )}
                  </div>

                  {/* =======================================
                      EMAIL
                  ======================================= */}

                  <div className="col-12">
                    <label
                      htmlFor="lead-email"
                      className="form-label"
                    >
                      Email
                    </label>

                    <input
                      id="lead-email"
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      aria-invalid={
                        Boolean(
                          errors.email
                        )
                      }
                      aria-describedby={
                        errors.email
                          ? "lead-email-error"
                          : undefined
                      }
                    />

                    {errors.email && (
                      <div
                        id="lead-email-error"
                        className="invalid-feedback"
                      >
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* =======================================
                      TÉLÉPHONE
                  ======================================= */}

                  <div className="col-12">
                    <label
                      htmlFor="lead-phone"
                      className="form-label"
                    >
                      Téléphone
                    </label>

                    <input
                      id="lead-phone"
                      type="tel"
                      name="phone"
                      className={`form-control ${
                        errors.phone
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      aria-invalid={
                        Boolean(
                          errors.phone
                        )
                      }
                      aria-describedby={
                        errors.phone
                          ? "lead-phone-error"
                          : undefined
                      }
                    />

                    {errors.phone && (
                      <div
                        id="lead-phone-error"
                        className="invalid-feedback"
                      >
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* =======================================
                      MESSAGE
                  ======================================= */}

                  <div className="col-12">
                    <label
                      htmlFor="lead-message"
                      className="form-label"
                    >
                      Message{" "}
                      <span className="text-muted">
                        (optionnel)
                      </span>
                    </label>

                    <textarea
                      id="lead-message"
                      name="message"
                      rows={4}
                      className="form-control"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="
                        Je souhaiterais obtenir davantage
                        d'informations sur ce véhicule...
                      "
                    />
                  </div>
                </div>
              </div>

              {/* ===========================================
                  ACTIONS
              =========================================== */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !isValid ||
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <span
                        className="
                          spinner-border
                          spinner-border-sm
                          me-2
                        "
                        aria-hidden="true"
                      />

                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i
                        className="
                          bi
                          bi-send
                          me-2
                        "
                        aria-hidden="true"
                      />

                      Envoyer ma demande
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* =================================================
          ARRIÈRE-PLAN
      ================================================= */}

      <div
        className="modal-backdrop fade show"
        onClick={
          submitting
            ? undefined
            : onClose
        }
        aria-hidden="true"
      />
    </>
  );
}