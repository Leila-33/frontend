import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/apiFetch";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    cgu: false
  });

  const [errors, setErrors] = useState({});

  // =========================
  // VALIDATION
  // =========================
  const validate = (data) => {
    const newErrors = {};

    if (!data.lastname) newErrors.lastname = "Nom requis";
    if (!data.firstname) newErrors.firstname = "Prénom requis";

    if (!data.email) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email invalide";
    }

    if (!data.password) {
    newErrors.password = "Mot de passe requis";
  } else if (
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(data.password)
  ) {
    newErrors.password =
      "8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial";
  }

    if (!data.cgu) {
      newErrors.cgu = "Vous devez accepter les CGU";
    }

    return newErrors;
  };

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value
    };

    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  // =========================
  // SUBMIT REGISTER
  // =========================
const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: {
        first_name: form.firstname,
        last_name: form.lastname,
        email: form.email,
        password: form.password,
        accepted_cgu: form.cgu
      },
    });

    toast.success("Compte créé avec succès 🎉");

    setForm({
      lastname: "",
      firstname: "",
      email: "",
      password: "",
      cgu: false
    });

    setTimeout(() => {
      navigate("/login");
    }, 1000);

  } catch (err) {
    toast.error(err.message || "Erreur lors de l'inscription");
  }
};

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Créer un compte</h2>

      <form onSubmit={handleSubmit}>

        {/* NOM */}
        <input
          className={`form-control mb-2 ${errors.lastname ? "is-invalid" : ""}`}
          name="lastname"
          placeholder="Nom"
          value={form.lastname}
          onChange={handleChange}
        />
        {errors.lastname && <p className="text-danger">{errors.lastname}</p>}

        {/* PRENOM */}
        <input
          className={`form-control mb-2 ${errors.firstname ? "is-invalid" : ""}`}
          name="firstname"
          placeholder="Prénom"
          value={form.firstname}
          onChange={handleChange}
        />
        {errors.firstname && <p className="text-danger">{errors.firstname}</p>}

        {/* EMAIL */}
        <input
          className={`form-control mb-2 ${errors.email ? "is-invalid" : ""}`}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-danger">{errors.email}</p>}

        {/* PASSWORD */}
        <input
          className={`form-control mb-2 ${errors.password ? "is-invalid" : ""}`}
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p className="text-danger">{errors.password}</p>}

        {/* CGU */}
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="cgu"
            checked={form.cgu}
            onChange={handleChange}
          />
          <label className="form-check-label">
            J’accepte les CGU
          </label>
        </div>
        {errors.cgu && <p className="text-danger">{errors.cgu}</p>}

        {/* BUTTON */}
        <button className="btn btn-primary w-100 mt-2">
          S’inscrire
        </button>

      </form>
    </div>
  );
}