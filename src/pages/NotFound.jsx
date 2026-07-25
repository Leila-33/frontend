import { useNavigate } from "react-router-dom";

export default function NotFound() {

  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center vh-100 bg-light"
    >

      {/* ICON */}
      <div className="mb-4">

        <i
          className="bi bi-exclamation-circle"
          style={{ fontSize: "4rem", color: "#6c757d" }}
        />

      </div>

      {/* TITLE */}
      <h1 className="fw-bold display-5 mb-2">
        404
      </h1>

      {/* MESSAGE */}
      <p className="text-muted mb-4">
        Oups… cette page n’existe pas ou a été déplacée.
      </p>

      {/* ACTION */}
      <button
        className="btn btn-dark rounded-pill px-4"
        onClick={() => navigate("/")}
      >
        Retour à l’accueil
      </button>

    </div>
  );
}