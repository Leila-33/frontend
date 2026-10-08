import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page d-flex flex-column min-vh-100">
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="home-hero">
        <div className="home-hero-grid"></div>
        <div className="home-hero-glow home-hero-glow-1"></div>
        <div className="home-hero-glow home-hero-glow-2"></div>

        <div className="container position-relative home-hero-container">
          <div className="row align-items-center g-5">
            {/* ---------------------------------------------------
                TEXTE
                --------------------------------------------------- */}
            <div className="col-lg-7">
              <div className="home-hero-content">
                <div className="home-brand-label">
                  <span className="home-brand-line"></span>
                  M-MOTORS
                </div>

                <h1 className="home-hero-title">
                  Trouvez le véhicule
                  <span> qui vous ressemble.</span>
                </h1>

                <p className="home-hero-text">
                  Achat, location et financement automobile : découvrez une
                  sélection de véhicules pensée pour répondre à vos besoins et à
                  votre budget.
                </p>

                <div className="home-hero-actions">
                  <button
                    type="button"
                    className="home-btn home-btn-primary"
                    onClick={() => navigate("/vehicles")}
                  >
                    <span>Rechercher un véhicule</span>

                    <svg
                      className="home-btn-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M13 6L19 12L13 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="home-btn home-btn-secondary"
                    onClick={() => navigate("/vehicles")}
                  >
                    Voir les véhicules
                  </button>
                </div>

                <div className="home-trust-row">
                  <div className="home-trust-item">
                    <span className="home-trust-check">✓</span>
                    Véhicules sélectionnés
                  </div>

                  <span className="home-trust-separator">•</span>

                  <div className="home-trust-item">
                    <span className="home-trust-check">✓</span>
                    Achat & location
                  </div>

                  <span className="home-trust-separator">•</span>

                  <div className="home-trust-item">
                    <span className="home-trust-check">✓</span>
                    Démarches en ligne
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------
                VISUEL
                --------------------------------------------------- */}
            <div className="col-lg-5">
              <div className="home-hero-visual">
                <div className="home-visual-circle home-visual-circle-1"></div>
                <div className="home-visual-circle home-visual-circle-2"></div>

                <div className="home-car-card">
                  <div className="home-car-card-top">
                    <div>
                      <span className="home-mini-label">M-MOTORS</span>

                      <h2>
                        Votre prochain
                        <br />
                        véhicule
                      </h2>
                    </div>

                    <div className="home-status-dot">
                      <span></span>
                    </div>
                  </div>

                  <div className="home-car-illustration">
                    <svg
                      viewBox="0 0 520 220"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M98 134L119 84C123 74 133 67 144 67H365C376 67 386 74 390 84L414 134"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M74 134H438V162C438 168.627 432.627 174 426 174H86C79.3726 174 74 168.627 74 162V134Z"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M127 105H389"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        opacity="0.65"
                      />

                      <path
                        d="M154 69L183 35H320L350 69"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle cx="139" cy="174" r="20" fill="currentColor" />

                      <circle cx="373" cy="174" r="20" fill="currentColor" />

                      <circle
                        cx="139"
                        cy="174"
                        r="8"
                        fill="#111111"
                        opacity="0.7"
                      />

                      <circle
                        cx="373"
                        cy="174"
                        r="8"
                        fill="#111111"
                        opacity="0.7"
                      />

                      <path
                        d="M74 134H47"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />

                      <path
                        d="M438 134H465"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="home-car-card-info">
                    <div>
                      <span>ACHAT</span>
                      <strong>ou</strong>
                      <span>LOCATION</span>
                    </div>

                    <div className="home-card-arrow">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12H19"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13 6L19 12L13 18"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="home-floating-card home-floating-card-top">
                  <div className="home-floating-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3V21"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16.5 7.5C15.8 6.65 14.65 6.2 13.25 6.2C11.45 6.2 10.3 7.1 10.3 8.45C10.3 9.7 11.2 10.35 13.2 10.8C15.15 11.25 16.2 11.95 16.2 13.55C16.2 15 14.95 15.95 12.95 15.95C11.25 15.95 10 15.4 9.15 14.4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>Offres adaptées</strong>
                    <span>À votre budget</span>
                  </div>
                </div>

                <div className="home-floating-card home-floating-card-bottom">
                  <div className="home-floating-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 6V12L16 14"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>Recherche rapide</strong>
                    <span>Quelques clics suffisent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRODUCTION
          ========================================================= */}
      <section className="home-intro">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-label">L'EXPÉRIENCE M-MOTORS</span>

              <h2 className="home-section-title">
                Une nouvelle façon de vivre
                <span> votre projet automobile.</span>
              </h2>
            </div>

            <p className="home-section-text">
              De la recherche du véhicule jusqu'à la réalisation de votre
              projet, M-Motors vous accompagne dans un parcours simple et
              intuitif.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          AVANTAGES
          ========================================================= */}
      <section className="home-features">
        <div className="container">
          <div className="row g-4">
            {/* ---------------------------------------------------
                CHOIX
                --------------------------------------------------- */}
            <div className="col-lg-4">
              <article className="home-feature-card">
                <div className="home-feature-number">01</div>

                <div className="home-feature-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 16L6.7 9.9C6.89 9.22 7.51 8.75 8.21 8.75H15.79C16.49 8.75 17.11 9.22 17.3 9.9L19 16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M4 14.5H20V18.2C20 18.64 19.64 19 19.2 19H4.8C4.36 19 4 18.64 4 18.2V14.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />

                    <path
                      d="M7 19V20"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />

                    <path
                      d="M17 19V20"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3>
                  Une sélection
                  <br />
                  de véhicules
                </h3>

                <p>
                  Accédez à une sélection de véhicules répondant à différents
                  besoins, usages et budgets.
                </p>

                <button
                  type="button"
                  className="home-feature-link"
                  onClick={() => navigate("/vehicles")}
                >
                  <span>Découvrir les véhicules</span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            </div>

            {/* ---------------------------------------------------
                PRIX
                --------------------------------------------------- */}
            <div className="col-lg-4">
              <article className="home-feature-card">
                <div className="home-feature-number">02</div>

                <div className="home-feature-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />

                    <path
                      d="M14.6 9.8C14.15 9.25 13.45 8.95 12.5 8.95C11.35 8.95 10.55 9.5 10.55 10.35C10.55 11.15 11.15 11.5 12.5 11.8C13.85 12.1 14.55 12.55 14.55 13.55C14.55 14.45 13.75 15.05 12.5 15.05C11.45 15.05 10.65 14.7 10.1 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 7.5V8.9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 15.1V16.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3>
                  Des offres
                  <br />
                  pensées pour vous
                </h3>

                <p>
                  Comparez les possibilités disponibles et choisissez la
                  solution la plus adaptée à votre projet.
                </p>

                <button
                  type="button"
                  className="home-feature-link"
                  onClick={() => navigate("/vehicles")}
                >
                  <span>Voir les offres</span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            </div>

            {/* ---------------------------------------------------
                RAPIDITÉ
                --------------------------------------------------- */}
            <div className="col-lg-4">
              <article className="home-feature-card">
                <div className="home-feature-number">03</div>

                <div className="home-feature-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.2 2.8L6.7 12H11L10.8 21.2L17.3 12H13L13.2 2.8Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3>
                  Un parcours
                  <br />
                  simple et rapide
                </h3>

                <p>
                  Recherchez votre véhicule et avancez dans votre projet
                  directement depuis votre espace en ligne.
                </p>

                <button
                  type="button"
                  className="home-feature-link"
                  onClick={() => navigate("/vehicles")}
                >
                  <span>Commencer maintenant</span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BLOC STATISTIQUES / PROMESSE
          ========================================================= */}
      <section className="home-highlight">
        <div className="container">
          <div className="home-highlight-box">
            <div className="home-highlight-content">
              <span className="home-section-label home-section-label-light">
                M-MOTORS
              </span>

              <h2>
                Votre projet automobile,
                <br />
                <span>notre priorité.</span>
              </h2>

              <p>
                Une expérience pensée pour vous permettre de rechercher,
                comparer et avancer simplement dans votre projet.
              </p>
            </div>

            <div className="home-highlight-stats">
              <div className="home-stat">
                <strong>01</strong>
                <span>Recherche</span>
              </div>

              <div className="home-stat">
                <strong>02</strong>
                <span>Choix</span>
              </div>

              <div className="home-stat">
                <strong>03</strong>
                <span>Démarches</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
          ========================================================= */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-box">
            <div className="home-cta-content">
              <span className="home-section-label">
                VOTRE PROJET COMMENCE ICI
              </span>

              <h2>
                Prêt à trouver
                <span> votre prochain véhicule ?</span>
              </h2>

              <p>
                Explorez notre sélection et trouvez le véhicule qui correspond à
                votre projet.
              </p>
            </div>

            <button
              type="button"
              className="home-btn home-btn-primary home-cta-button"
              onClick={() => navigate("/vehicles")}
            >
              <span>Rechercher un véhicule</span>

              <svg
                className="home-btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6L19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
          ========================================================= */}
      <footer className="home-footer mt-auto">
        <div className="container">
          <div className="home-footer-inner">
            <div className="home-footer-brand">
              <div className="home-footer-logo">M</div>

              <div>
                <strong>M-MOTORS</strong>
                <span>Vente • Location • Financement</span>
              </div>
            </div>

            <div className="home-footer-copy">
              © 2026 M-Motors. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
