import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/apiFetch";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  // =========================
  // VALIDATION REAL TIME
  // =========================
  const validate = (data) => {
    const err = {};

    if (!data.email) {
      err.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      err.email = "Email invalide";
    }

    if (!data.password) {
      err.password = "Mot de passe requis";
    }

    return err;
  };

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    const updated = {
      ...form,
      [e.target.name]: e.target.value
    };

    setForm(updated);
    setErrors(validate(updated));
  };

  // =========================
  // SUBMIT LOGIN
  // =========================
const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setError("");

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password
      },
    });

    // 🔥 ICI LE CHANGEMENT IMPORTANT
    login(data); //

    toast.success("Connexion réussie 🎉");

  

  } catch (err) {
    toast.error(err.message || "Erreur de connexion");
    setError(err.message || "Erreur de connexion");
  }
};

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">Connexion</h2>

      <form onSubmit={handleSubmit}>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          className={`form-control mb-2 ${errors.email ? "is-invalid" : ""}`}
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-danger">{errors.email}</p>}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          className={`form-control mb-2 ${errors.password ? "is-invalid" : ""}`}
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p className="text-danger">{errors.password}</p>}

        {/* ERROR / SUCCESS */}
        {error && <p className="text-danger">{error}</p>}

        <button className="btn btn-primary w-100 mt-2">
          Se connecter
        </button>

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