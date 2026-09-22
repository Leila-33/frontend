import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* CONTENU */}
      <div>

        {/* HERO */}
        <div className="bg-dark text-white text-center p-5">
          <h1 className="display-5 fw-bold">
            Trouvez votre véhicule idéal
          </h1>

          <p className="lead">
            Achat ou location de voitures en quelques clics
          </p>

          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/vehicles")}
          >
            Rechercher un véhicule
          </button>
        </div>

        {/* FEATURES */}
        <div className="container py-5">
          <div className="row g-4">

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4 hover-card">
                <div className="fs-1 text-primary">🚘</div>
                <h5 className="mt-3 fw-bold">Large choix</h5>
                <p className="text-muted">
                  Des véhicules adaptés à tous les besoins et budgets.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4 hover-card">
                <div className="fs-1 text-success">💰</div>
                <h5 className="mt-3 fw-bold">Prix compétitifs</h5>
                <p className="text-muted">
                  Les meilleures offres du marché, sans compromis.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4 hover-card">
                <div className="fs-1 text-warning">⚡</div>
                <h5 className="mt-3 fw-bold">Recherche rapide</h5>
                <p className="text-muted">
                  Trouvez un véhicule en quelques secondes.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <footer className="text-center py-3 bg-light border-top mt-auto">
        <small>© 2026 - Mmotors</small>
      </footer>


    </div>
  );
}