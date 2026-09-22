import { useState } from "react";

import { useNavigate } from "react-router-dom";

import apiFetch from "../../services/apiFetch";

import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

export default function Login() {

  // Permet de naviguer vers une autre page
  const navigate = useNavigate();

  // Récupère la fonction login depuis AuthContext
  const { login } = useAuth();

  // =========================
  // ÉTAT DU FORMULAIRE
  // =========================

  // Contient les valeurs saisies par l'utilisateur
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  // Contient les erreurs de validation du formulaire

  const [errors, setErrors] = useState({});

  // Contient une éventuelle erreur provenant de l'API

  const [error, setError] = useState("");

  // Indique si la requête de connexion est en cours
  //
  // Permet notamment d'empêcher plusieurs clics
  // sur le bouton pendant l'envoi.
  const [submitting, setSubmitting] = useState(false);


  // =========================
  // VALIDATION DU FORMULAIRE
  // =========================

  const validate = (data) => {

    // Objet qui contiendra les erreurs trouvées
    const err = {};

    // -------------------------
    // VALIDATION EMAIL
    // -------------------------

    if (!data.email) {

      err.email = "Email requis";

    } else if (!/\S+@\S+\.\S+/.test(data.email)) {

      err.email = "Email invalide";
    }


    // -------------------------
    // VALIDATION MOT DE PASSE
    // -------------------------

    if (!data.password) {

      err.password = "Mot de passe requis";
    }


    // Retourne toutes les erreurs
    return err;
  };


  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    // Construit le nouveau formulaire
    //
    // On conserve les anciennes valeurs
    // et on remplace uniquement le champ modifié.
    const updated = {
      ...form,
      [e.target.name]: e.target.value
    };

    // Met à jour le formulaire
    setForm(updated);

    // Relance immédiatement la validation
    setErrors(validate(updated));

    // Si l'utilisateur recommence à modifier le formulaire,
    // on peut supprimer l'erreur provenant de l'API.
    setError("");
  };


  // =========================
  // SUBMIT LOGIN
  // =========================

  const handleSubmit = async (e) => {

    // Empêche le comportement classique du formulaire
    // qui provoquerait un rechargement de la page.
    e.preventDefault();


    // -------------------------
    // VALIDATION
    // -------------------------

    // Vérifie une dernière fois le formulaire
    // avant d'appeler l'API.
    const validationErrors = validate(form);

    // Met à jour les erreurs
    setErrors(validationErrors);

    // Si des erreurs existent,
    // on ne fait pas la requête HTTP.
    if (Object.keys(validationErrors).length > 0) {
      return;
    }


    // -------------------------
    // DÉBUT DE LA REQUÊTE
    // -------------------------

    // Supprime une ancienne erreur API
    setError("");

    // Désactive le bouton pendant la requête
    setSubmitting(true);


    try {

      // Appel de l'API FastAPI
      const data = await apiFetch("/auth/login", {
        method: "POST",

        body: {
          email: form.email,
          password: form.password
        }
      });


      // -------------------------
      // CONNEXION RÉUSSIE
      // -------------------------

      // Transmet le token à AuthContext
      //
      // AuthContext va ensuite gérer l'utilisateur connecté.
      login(data.access_token);

      // Affiche un message de succès
      toast.success("Connexion réussie 🎉");


    } catch (err) {

      // -------------------------
      // ERREUR API
      // -------------------------

      // Récupère le message fourni par apiFetch
      const message = err.message || "Erreur de connexion";

      // Affiche l'erreur avec Toastify
      toast.error(message);

      // Stocke également l'erreur dans le state
      // afin de pouvoir l'afficher sous le formulaire.
      setError(message);


    } finally {

      // La requête est terminée :
      // on réactive le bouton.
      setSubmitting(false);
    }
  };


  // =========================
  // ÉTAT DU BOUTON
  // =========================

  // Object.keys(errors).length > 0
  //
  // signifie qu'il existe au moins une erreur
  // de validation.
  //
  // submitting
  //
  // signifie que la requête est actuellement en cours.
  //
  // Le bouton est donc désactivé dans les deux cas.
  const isSubmitDisabled =
    Object.keys(errors).length > 0 || submitting;


  // =========================
  // RENDER
  // =========================

  return (

    <div
      className="container mt-5"
      style={{ maxWidth: "400px" }}
    >

      <h2 className="mb-4 text-center">
        Connexion
      </h2>


      <form onSubmit={handleSubmit}>

        {/* =========================
            EMAIL
        ========================= */}

        <input
          type="email"
          name="email"
          className={`form-control mb-2 ${
            errors.email ? "is-invalid" : ""
          }`}
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Affiche l'erreur email uniquement
            lorsqu'elle existe */}
        {errors.email && (
          <p className="text-danger">
            {errors.email}
          </p>
        )}


        {/* =========================
            PASSWORD
        ========================= */}

        <input
          type="password"
          name="password"
          className={`form-control mb-2 ${
            errors.password ? "is-invalid" : ""
          }`}
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
        />

        {/* Affiche l'erreur password uniquement
            lorsqu'elle existe */}
        {errors.password && (
          <p className="text-danger">
            {errors.password}
          </p>
        )}


        {/* =========================
            ERREUR API
        ========================= */}

        {error && (
          <p className="text-danger">
            {error}
          </p>
        )}


        {/* =========================
            BOUTON CONNEXION
        ========================= */}

        <button
          type="submit"
          className="btn btn-primary w-100 mt-2"
          disabled={isSubmitDisabled}
        >
          {submitting
            ? "Connexion..."
            : "Se connecter"}
        </button>


        {/* =========================
            INSCRIPTION
        ========================= */}

        <p className="mt-3 text-center">

          Pas encore inscrit ?{" "}

          <span
            style={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() => navigate("/register")}
          >
            S’inscrire
          </span>

        </p>

      </form>

    </div>
  );
}
