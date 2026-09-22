import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsCheckCircleFill } from "react-icons/bs";

export default function PaymentSuccessPage() {

  const navigate = useNavigate();

  // auto redirect optionnel
  useEffect(() => {

    const timer = setTimeout(() => {
      navigate("/applications");
    }, 4000);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (

    <div className="container d-flex align-items-center justify-content-center min-vh-100">

      <div className="text-center p-5 bg-white shadow-sm rounded-4 border" style={{ maxWidth: 500 }}>

        {/* ICON */}
        <BsCheckCircleFill size={70} className="text-success mb-3" />

        {/* TITLE */}
        <h2 className="fw-bold mb-2">
          Paiement réussi 🎉
        </h2>

        {/* MESSAGE */}
        <p className="text-muted mb-4">
          Votre paiement a été validé avec succès.
          <br />
          Votre dossier est maintenant en cours de traitement.
        </p>

        {/* INFO BOX */}
        <div className="alert alert-success small">
          ✔ Transaction confirmée<br />
          ✔ Dossier activé<br />
          ✔ Garantie en cours de création
        </div>

        {/* BUTTON */}
        <button
          className="btn btn-dark w-100 mt-2"
          onClick={() => navigate("/applications")}
        >
          Voir mes dossiers
        </button>

      </div>

    </div>

  );
}