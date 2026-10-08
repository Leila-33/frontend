import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowRight, BsCheckCircleFill, BsShieldCheck } from "react-icons/bs";
import "../../styles/PaymentSuccessPage.css";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate("/applications");
    }, 4000);

    const countdownTimer = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownTimer);
    };
  }, [navigate]);

  const handleGoToApplications = () => {
    navigate("/applications");
  };

  return (
    <main className="payment-success-page">
      <div className="payment-success-background">
        <div className="payment-success-orb payment-success-orb-1" />
        <div className="payment-success-orb payment-success-orb-2" />
      </div>

      <div className="container payment-success-container">
        <section
          className="payment-success-card"
          aria-labelledby="payment-success-title"
        >
          {/* ==================================================
              ICÔNE
          ================================================== */}

          <div className="payment-success-icon-wrapper">
            <div className="payment-success-icon-ring">
              <BsCheckCircleFill
                className="payment-success-icon"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* ==================================================
              LABEL
          ================================================== */}

          <div className="payment-success-label">
            <span />
            PAIEMENT CONFIRMÉ
          </div>

          {/* ==================================================
              TITRE
          ================================================== */}

          <h1 id="payment-success-title" className="payment-success-title">
            Votre paiement a été validé
          </h1>

          <p className="payment-success-description">
            Merci pour votre confiance. Votre paiement a bien été enregistré et
            votre dossier peut maintenant poursuivre son traitement.
          </p>

          {/* ==================================================
              INFORMATIONS
          ================================================== */}

          <div className="payment-success-summary">
            <div className="payment-success-summary-header">
              <div className="payment-success-summary-icon">
                <BsShieldCheck aria-hidden="true" />
              </div>

              <div>
                <span className="payment-success-summary-title">
                  Transaction confirmée
                </span>

                <span className="payment-success-summary-subtitle">
                  Votre opération a bien été prise en compte.
                </span>
              </div>
            </div>

            <div className="payment-success-details">
              <div className="payment-success-detail">
                <span className="payment-success-check">
                  <BsCheckCircleFill aria-hidden="true" />
                </span>

                <span>Transaction confirmée</span>
              </div>

              <div className="payment-success-detail">
                <span className="payment-success-check">
                  <BsCheckCircleFill aria-hidden="true" />
                </span>

                <span>Dossier activé</span>
              </div>

              <div className="payment-success-detail">
                <span className="payment-success-check">
                  <BsCheckCircleFill aria-hidden="true" />
                </span>

                <span>Traitement de votre dossier en cours</span>
              </div>
            </div>
          </div>

          {/* ==================================================
              BOUTON
          ================================================== */}

          <button
            type="button"
            className="payment-success-button"
            onClick={handleGoToApplications}
          >
            <span>Voir mes dossiers</span>

            <BsArrowRight aria-hidden="true" />
          </button>

          {/* ==================================================
              REDIRECTION
          ================================================== */}

          <div className="payment-success-redirect">
            <span>Redirection automatique dans</span>

            <strong>{countdown}</strong>

            <span>seconde{countdown > 1 ? "s" : ""}...</span>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="payment-success-footer">
            <span className="payment-success-footer-dot" />
            Paiement sécurisé
          </div>
        </section>
      </div>
    </main>
  );
}
