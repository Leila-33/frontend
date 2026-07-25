import React, { useState } from "react";
import apiFetch from "../../services/apiFetch";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminCreateUserPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    last_name: "",
    first_name: "",
    role: "CLIENT",
  });



    const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/admin/auth", {
        method: "POST",
        body: form,
      });

    toast.success("Compte créé avec succès 🎉");

      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);

    } catch (err) {
      console.error(err);
    toast.error(err.message || "Erreur lors de l'inscription de l'utilisateur");
    }
  };

    return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4">Créer un utilisateur</h3>




            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

        {/* EMAIL */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* FULL NAME */}
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>


                <div className="mb-3">
          <label className="form-label">Rôle</label>
          <select
            name="role"
            className="form-select"
            value={form.role}
            onChange={handleChange}
          >
            <option value="client">Client</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

                <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            Créer utilisateur
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin/users")}
          >
            Annuler
          </button>
        </div>

      </form>
    </div>
  );
}