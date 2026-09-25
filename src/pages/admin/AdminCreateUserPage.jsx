import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import apiFetch from "../../services/apiFetch";

import {
  ROLE_CONFIG,
} from "../../constants/roleOptions";

// ==========================================================
// ÉTAT INITIAL
// ==========================================================

const INITIAL_FORM = {
  email: "",
  password: "",
  last_name: "",
  first_name: "",
  role: "client",
};

// ==========================================================
// VALIDATION DU FORMULAIRE
// ==========================================================

/**
 * Valide l'ensemble des données du formulaire.
 *
 * Retourne un objet contenant uniquement les erreurs
 * détectées.
 */
const validate = (data) => {
  const newErrors = {};

  // ========================================================
  // NOM
  // ========================================================

  if (!data.last_name.trim()) {
    newErrors.last_name = "Nom requis";
  }

  // ========================================================
  // PRÉNOM
  // ========================================================

  if (!data.first_name.trim()) {
    newErrors.first_name = "Prénom requis";
  }

  // ========================================================
  // EMAIL
  // ========================================================

  if (!data.email.trim()) {
    newErrors.email = "Email requis";

  } else if (
    !/\S+@\S+\.\S+/.test(
      data.email.trim()
    )
  ) {
    newErrors.email = "Email invalide";
  }

  // ========================================================
  // MOT DE PASSE
  // ========================================================

  if (!data.password) {
    newErrors.password =
      "Mot de passe requis";

  } else if (
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(
      data.password
    )
  ) {
    newErrors.password =
      "8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial";
  }

  // ========================================================
  // RÔLE
  // ========================================================

  if (!data.role) {
    newErrors.role = "Rôle requis";

  } else if (!ROLE_CONFIG[data.role]) {
    newErrors.role = "Rôle invalide";
  }

  // ========================================================
  // RETOUR DES ERREURS
  // ========================================================

  return newErrors;
};

// ==========================================================
// COMPOSANT
// ==========================================================

export default function AdminCreateUserPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(
    INITIAL_FORM
  );

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // ========================================================
  // MODIFICATION DU FORMULAIRE
  // ========================================================

  /**
   * Met à jour le champ modifié puis relance immédiatement
   * la validation du formulaire.
   *
   * Les erreurs sont donc affichées en temps réel.
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

    // Validation en temps réel.
    setErrors(
      validate(updatedForm)
    );
  };

  // ========================================================
  // SOUMISSION
  // ========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation finale avant l'envoi.
    const validationErrors =
      validate(form);

    setErrors(validationErrors);

    // Empêche l'envoi si le formulaire est invalide.
    if (
      Object.keys(validationErrors).length > 0 ||
      loading
    ) {
      return;
    }

    setLoading(true);

    try {
      await apiFetch(
        "/admin/auth",
        {
          method: "POST",

          body: {
            ...form,

            // Nettoyage des champs textuels
            // avant l'envoi au backend.
            email: form.email.trim(),
            last_name: form.last_name.trim(),
            first_name: form.first_name.trim(),
          },
        }
      );

      toast.success(
        "Compte créé avec succès 🎉"
      );

      navigate("/admin/users");

    } catch (error) {
      console.error(
        "create user error:",
        error
      );

      toast.error(
        error?.message ??
          "Erreur lors de la création de l'utilisateur"
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // ANNULATION
  // ========================================================

  const handleCancel = () => {
    if (!loading) {
      navigate("/admin/users");
    }
  };

  // ========================================================
  // VALIDITÉ DU FORMULAIRE
  // ========================================================

  const isFormValid =
    Object.keys(errors).length === 0 &&
    form.email.trim() !== "" &&
    form.password !== "" &&
    form.last_name.trim() !== "" &&
    form.first_name.trim() !== "" &&
    form.role !== "";

  // ========================================================
  // RENDU
  // ========================================================

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "600px",
      }}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-4">

        <h3 className="fw-bold mb-1">
          Créer un utilisateur
        </h3>

        <p className="text-muted mb-0">
          Créez un nouveau compte utilisateur
          et définissez son rôle.
        </p>

      </div>

      {/* ====================================================
          FORMULAIRE
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm rounded-4 p-4"
        noValidate
      >

        {/* ==================================================
            EMAIL
        ================================================== */}

        <div className="mb-3">

          <label
            htmlFor="user-email"
            className="form-label fw-semibold"
          >
            Email
          </label>

          <input
            id="user-email"
            type="email"
            name="email"
            className={`form-control ${
              errors.email
                ? "is-invalid"
                : form.email
                  ? "is-valid"
                  : ""
            }`}
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading}
          />

          {errors.email && (
            <div className="invalid-feedback">
              {errors.email}
            </div>
          )}

        </div>

        {/* ==================================================
            MOT DE PASSE
        ================================================== */}

        <div className="mb-3">

          <label
            htmlFor="user-password"
            className="form-label fw-semibold"
          >
            Mot de passe
          </label>

          <input
            id="user-password"
            type="password"
            name="password"
            className={`form-control ${
              errors.password
                ? "is-invalid"
                : form.password
                  ? "is-valid"
                  : ""
            }`}
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={loading}
          />

          {errors.password && (
            <div className="invalid-feedback">
              {errors.password}
            </div>
          )}

        </div>

        {/* ==================================================
            NOM
        ================================================== */}

        <div className="mb-3">

          <label
            htmlFor="user-last-name"
            className="form-label fw-semibold"
          >
            Nom
          </label>

          <input
            id="user-last-name"
            type="text"
            name="last_name"
            className={`form-control ${
              errors.last_name
                ? "is-invalid"
                : form.last_name
                  ? "is-valid"
                  : ""
            }`}
            value={form.last_name}
            onChange={handleChange}
            autoComplete="family-name"
            required
            disabled={loading}
          />

          {errors.last_name && (
            <div className="invalid-feedback">
              {errors.last_name}
            </div>
          )}

        </div>

        {/* ==================================================
            PRÉNOM
        ================================================== */}

        <div className="mb-3">

          <label
            htmlFor="user-first-name"
            className="form-label fw-semibold"
          >
            Prénom
          </label>

          <input
            id="user-first-name"
            type="text"
            name="first_name"
            className={`form-control ${
              errors.first_name
                ? "is-invalid"
                : form.first_name
                  ? "is-valid"
                  : ""
            }`}
            value={form.first_name}
            onChange={handleChange}
            autoComplete="given-name"
            required
            disabled={loading}
          />

          {errors.first_name && (
            <div className="invalid-feedback">
              {errors.first_name}
            </div>
          )}

        </div>

        {/* ==================================================
            RÔLE
        ================================================== */}

        <div className="mb-4">

          <label
            htmlFor="user-role"
            className="form-label fw-semibold"
          >
            Rôle
          </label>

          <select
            id="user-role"
            name="role"
            className={`form-select ${
              errors.role
                ? "is-invalid"
                : ""
            }`}
            value={form.role}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {Object.entries(
              ROLE_CONFIG
            ).map(
              ([role, config]) => (
                <option
                  key={role}
                  value={role}
                >
                  {config.label}
                </option>
              )
            )}
          </select>

          {errors.role && (
            <div className="invalid-feedback">
              {errors.role}
            </div>
          )}

        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="d-flex gap-2">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              !isFormValid
            }
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />

                Création...
              </>
            ) : (
              <>

                Créer utilisateur
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}