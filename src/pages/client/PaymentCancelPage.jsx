import { useNavigate } from "react-router-dom";
import { BsXCircleFill } from "react-icons/bs";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="text-center p-5 bg-white shadow-sm rounded-4 border"
        style={{ maxWidth: 500 }}
      >
        {/* ICON */}
        <BsXCircleFill size={70} className="text-danger mb-3" />

        {/* TITLE */}
        <h2 className="fw-bold mb-2">Paiement annulé</h2>

        {/* MESSAGE */}
        <p className="text-muted mb-4">
          Votre paiement n’a pas été effectué.
          <br />
          Vous pouvez réessayer à tout moment.
        </p>

        {/* INFO BOX */}
        <div className="alert alert-warning small">
          ⚠ Aucun montant n’a été débité
          <br />⚠ Votre dossier reste en attente
        </div>

        {/* BUTTONS */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-dark w-100"
            onClick={() => navigate(-1)}
          >
            Réessayer
          </button>

          <button
            className="btn btn-dark w-100"
            onClick={() => navigate("/vehicles")}
          >
            Voir véhicules
          </button>
        </div>
      </div>
    </div>
  );
}
