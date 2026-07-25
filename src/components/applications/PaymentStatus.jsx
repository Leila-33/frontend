import {
  BsCreditCard,
  BsCheckCircleFill
} from "react-icons/bs";

export default function PaymentStatus({
  application,
  onPay
}) {

  if (!application) return null;

  if (application.payment_status === "paid") {
    return (
      <div className="mt-3">
        <div className="alert alert-success rounded-4 border-0 mb-0 d-flex align-items-center justify-content-center gap-2">
          <BsCheckCircleFill />
          <span className="fw-semibold">
            Paiement confirmé
          </span>
        </div>
      </div>
    );
  }

  if (application.status === "approved") {
    return (
      <button
        type="button"
        className="btn btn-success w-100 mt-3 rounded-4 fw-semibold"
        onClick={onPay}
      >
        <BsCreditCard className="me-2" />
        Payer maintenant
      </button>
    );
  }

  return null;
}