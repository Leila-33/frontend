import { useState } from "react";

import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import apiFetch from "../../services/apiFetch";

export default function Register() {
  // Permet de naviguer vers la page de connexion
  // après la création du compte.
  const navigate = useNavigate();

  // =========================
  // ÉTAT DU FORMULAIRE
  // =========================

  // Contient toutes les valeurs saisies
  // par l'utilisateur.
  const [form, setForm] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    cgu: false,
  });

  // Contient les erreurs de validation.
  const [errors, setErrors] = useState({});

  // =========================
  // VALIDATION
  // =========================

  const validate = (data) => {
    const newErrors = {};

    if (!data.lastname) {
      newErrors.lastname = "Nom requis";
    }

    if (!data.firstname) {
      newErrors.firstname = "Prénom requis";
    }

    if (!data.email) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email invalide";
    }

    if (!data.password) {
      newErrors.password = "Mot de passe requis";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(
        data.password
      )
    ) {
      newErrors.password =
        "8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial";
    }

    // -------------------------
    // CGU
    // -------------------------

    if (!data.cgu) {
      newErrors.cgu = "Vous devez accepter les CGU";
    }

    // Retourne toutes les erreurs.
    return newErrors;
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    // Récupère les informations du champ modifié.
    const { name, value, type, checked } = e.target;

    // Construit le nouveau formulaire.
    //
    // On conserve toutes les anciennes valeurs
    // et on remplace uniquement le champ modifié.
    const updatedForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    // Met à jour le formulaire.
    setForm(updatedForm);

    // Relance immédiatement la validation
    // après chaque modification.
    setErrors(validate(updatedForm));
  };

  // =========================
  // SUBMIT REGISTER
  // =========================

  const handleSubmit = async (e) => {
    // Empêche le rechargement de la page.
    e.preventDefault();

    // Effectue une dernière validation
    // juste avant l'appel à l'API.
    const validationErrors = validate(form);

    // Met à jour les erreurs affichées.
    setErrors(validationErrors);

    // S'il existe au moins une erreur,
    // on arrête immédiatement la fonction.
    //
    // L'API ne sera donc pas appelée.
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // =========================
    // APPEL API
    // =========================

    try {
      // Appelle l'API FastAPI
      // pour créer le compte.
      await apiFetch("/auth/register", {
        method: "POST",

        body: {
          first_name: form.firstname,
          last_name: form.lastname,
          email: form.email,
          password: form.password,
          accepted_cgu: form.cgu,
        },
      });

      // =========================
      // INSCRIPTION RÉUSSIE
      // =========================

      toast.success(
        "Compte créé avec succès ! Un email de confirmation vous a été envoyé."
      );

      // Réinitialise le formulaire.
      setForm({
        lastname: "",
        firstname: "",
        email: "",
        password: "",
        cgu: false,
      });

      // Réinitialise également les erreurs.
      setErrors({});

      // Redirige immédiatement vers la connexion.
      // Le message de confirmation est transmis
      // à la page de connexion.
      navigate("/login", {
        state: {
          registrationSuccess: true,
          email: form.email,
        },
      });
    } catch (err) {
      // Affiche l'erreur retournée par l'API.
      toast.error(err.message || "Erreur lors de l'inscription");
    }
  };

  // =========================
  // ÉTAT DU BOUTON
  // =========================

  // errors est initialisé avec {}.
  //
  // Donc :
  //
  // {}                           => bouton activé
  // { email: "Email invalide" } => bouton désactivé
  //
  // Object.keys(errors) permet de récupérer
  // les propriétés de l'objet errors.
  const hasErrors = Object.keys(errors).length > 0;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Créer un compte</h2>

      <form onSubmit={handleSubmit}>
        {/* =========================
            NOM
        ========================= */}

        <input
          className={`form-control mb-2 ${errors.lastname ? "is-invalid" : ""}`}
          name="lastname"
          placeholder="Nom"
          value={form.lastname}
          onChange={handleChange}
        />

        {/* Affiche l'erreur du nom
            si elle existe. */}
        {errors.lastname && <p className="text-danger">{errors.lastname}</p>}

        {/* =========================
            PRÉNOM
        ========================= */}

        <input
          className={`form-control mb-2 ${
            errors.firstname ? "is-invalid" : ""
          }`}
          name="firstname"
          placeholder="Prénom"
          value={form.firstname}
          onChange={handleChange}
        />

        {/* Affiche l'erreur du prénom
            si elle existe. */}
        {errors.firstname && <p className="text-danger">{errors.firstname}</p>}

        {/* =========================
            EMAIL
        ========================= */}

        <input
          className={`form-control mb-2 ${errors.email ? "is-invalid" : ""}`}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Affiche l'erreur email
            si elle existe. */}
        {errors.email && <p className="text-danger">{errors.email}</p>}

        {/* =========================
            MOT DE PASSE
        ========================= */}

        <input
          className={`form-control mb-2 ${errors.password ? "is-invalid" : ""}`}
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
        />

        {/* Affiche l'erreur du mot de passe
            si elle existe. */}
        {errors.password && <p className="text-danger">{errors.password}</p>}

        {/* =========================
            CGU
        ========================= */}

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="cgu"
            checked={form.cgu}
            onChange={handleChange}
          />

          <label className="form-check-label">J’accepte les CGU</label>
        </div>

        {/* Affiche l'erreur des CGU
            si l'utilisateur ne les a pas acceptées. */}
        {errors.cgu && <p className="text-danger">{errors.cgu}</p>}

        {/* =========================
            BOUTON
        ========================= */}

        <button
          type="submit"
          className="btn btn-primary w-100 mt-2"
          disabled={hasErrors}
        >
          S’inscrire
        </button>
      </form>
    </div>
  );
}
