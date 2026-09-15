// src/pages/VerifyEmail.jsx

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiFetch from "../services/apiFetch";
import { toast } from "react-toastify";

export default function VerifyEmail() {
const [params] = useSearchParams();
const navigate = useNavigate();

useEffect(() => {

  const token = params.get("token");

  if (!token) {
    toast.error("Token manquant");
    return;
  }

  const verify = async () => {

    try {

      await apiFetch(
        `/auth/verify-email?token=${encodeURIComponent(token)}`
      );

      toast.success(
        "Email vérifié ✅"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      toast.error(
        err.message ||
        "Erreur de vérification"
      );
    }
  };

  verify();

}, [params, navigate]);

  return (
    <div className="container mt-5 text-center">
      <h2>Vérification en cours...</h2>
    </div>
  );
}