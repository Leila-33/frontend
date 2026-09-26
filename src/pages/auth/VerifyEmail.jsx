import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

// =====================================================
// COMPOSANT : VÉRIFICATION DE L'ADRESSE EMAIL
// =====================================================

// Cette page est appelée depuis le lien reçu par email.
//
// Exemple :
// /verify-email?token=xxxxxxxx
//
// Le composant :
// 1. récupère le token présent dans l'URL ;
// 2. vérifie le token auprès de l'API ;
// 3. affiche le résultat à l'utilisateur ;
// 4. redirige vers la connexion après une vérification réussie.
export default function VerifyEmail() {
  // =====================================================
  // ÉTATS
  // =====================================================

  // Indique si la vérification est en cours.
  const [loading, setLoading] = useState(true);

  // Contient le résultat de la vérification.
  //
  // Valeurs possibles :
  // - "loading"
  // - "success"
  // - "error"
  const [status, setStatus] = useState("loading");

  // Message affiché à l'utilisateur.
  const [message, setMessage] = useState(
    "Vérification de votre adresse email..."
  );

  // =====================================================
  // HOOKS REACT ROUTER
  // =====================================================

  const [params] = useSearchParams();

  const navigate = useNavigate();

  // =====================================================
  // VÉRIFICATION DU TOKEN
  // =====================================================

  useEffect(() => {
    // Récupération du token présent dans l'URL.
    const token = params.get("token");

    // -----------------------------------------------------
    // TOKEN ABSENT
    // -----------------------------------------------------

    if (!token) {
      setLoading(false);
      setStatus("error");

      setMessage("Le lien de vérification est invalide ou incomplet.");

      toast.error("Token de vérification manquant.");

      return;
    }

    // Permet d'éviter de modifier l'état du composant
    // si celui-ci est démonté avant la fin de la requête.
    let isMounted = true;

    // Timer utilisé uniquement après une vérification réussie.
    let redirectTimer;

    // -----------------------------------------------------
    // FONCTION DE VÉRIFICATION
    // -----------------------------------------------------

    const verifyEmail = async () => {
      try {
        // Appel de l'API avec le token récupéré dans l'URL.
        await apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`);

        // Si le composant a été démonté pendant la requête,
        // on ne met pas à jour son état.
        if (!isMounted) {
          return;
        }

        // Mise à jour de l'interface.
        setLoading(false);
        setStatus("success");

        setMessage("Votre adresse email a été vérifiée avec succès.");

        // Notification de succès.
        toast.success("Email vérifié ✅");

        // Redirection vers la page de connexion.
        redirectTimer = setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1500);
      } catch (err) {
        // Si le composant a été démonté pendant la requête,
        // on ne met pas à jour son état.
        if (!isMounted) {
          return;
        }

        // Mise à jour de l'interface.
        setLoading(false);
        setStatus("error");

        setMessage(
          err?.message || "Le lien de vérification est invalide ou a expiré."
        );

        // Notification d'erreur.
        toast.error(
          err?.message || "Erreur lors de la vérification de votre email."
        );
      }
    };

    verifyEmail();

    // =====================================================
    // NETTOYAGE
    // =====================================================

    return () => {
      // Empêche les mises à jour d'état après démontage.
      isMounted = false;

      // Annule la redirection si nécessaire.
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [params, navigate]);

  // =====================================================
  // RENDU
  // =====================================================

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card border-0 shadow-sm rounded-4 text-center"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="card-body p-5">
          {/* =================================================
              ÉTAT : VÉRIFICATION EN COURS
              ================================================= */}

          {loading && (
            <>
              <div
                className="spinner-border text-primary mb-4"
                style={{
                  width: "3rem",
                  height: "3rem",
                }}
                role="status"
                aria-hidden="true"
              />

              <h2 className="h4 fw-semibold mb-3">Vérification en cours...</h2>

              <p className="text-muted mb-0">
                Nous vérifions votre adresse email.
                <br />
                Veuillez patienter quelques instants.
              </p>
            </>
          )}

          {/* =================================================
              ÉTAT : VÉRIFICATION RÉUSSIE
              ================================================= */}

          {!loading && status === "success" && (
            <>
              <div className="text-success mb-4" style={{ fontSize: "3rem" }}>
                ✓
              </div>

              <h2 className="h4 fw-semibold mb-3">Email vérifié</h2>

              <p className="text-muted mb-3">{message}</p>

              <p className="small text-muted mb-0">
                Redirection vers la page de connexion...
              </p>
            </>
          )}

          {/* =================================================
              ÉTAT : ERREUR
              ================================================= */}

          {!loading && status === "error" && (
            <>
              <div className="text-danger mb-4" style={{ fontSize: "3rem" }}>
                !
              </div>

              <h2 className="h4 fw-semibold mb-3">Vérification impossible</h2>

              <p className="text-muted mb-4">{message}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
