import {
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import apiFetch from "../../../services/apiFetch";

/**
 * Page d'activation du compte client.
 *
 * Le parcours est le suivant :
 *
 * 1. Récupération du token présent dans l'URL.
 * 2. Vérification du token auprès de l'API.
 * 3. Affichage d'un état adapté :
 *    - token invalide ;
 *    - token expiré ;
 *    - compte déjà activé ;
 *    - formulaire d'activation.
 * 4. Création du mot de passe et acceptation des CGU.
 * 5. Connexion automatique du client.
 * 6. Redirection vers son espace.
 */
export default function ActivateAccountPage() {
  // =====================================================
  // AUTHENTIFICATION ET NAVIGATION
  // =====================================================

  const {
    login,
    setPostLoginRedirect,
  } = useAuth();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // Token transmis dans le lien d'activation.
  const token = searchParams.get("token");

  // =====================================================
  // IDENTIFIANTS ACCESSIBILITÉ
  // =====================================================

  const passwordId = useId();
  const confirmPasswordId = useId();
  const cguId = useId();

  // =====================================================
  // ÉTAT DU FORMULAIRE
  // =====================================================

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    cgu: false,
  });

  const [errors, setErrors] = useState({});

  // =====================================================
  // ÉTAT DE LA PAGE
  // =====================================================

  // Vérification initiale du lien d'activation.
  const [checking, setChecking] = useState(true);

  // Soumission du formulaire.
  const [loading, setLoading] = useState(false);

  // Utilisateur associé au token.
  const [user, setUser] = useState(null);

  // États retournés par l'API de vérification.
  const [alreadyVerified, setAlreadyVerified] =
    useState(false);

  const [expired, setExpired] = useState(false);

  const [validToken, setValidToken] =
    useState(false);

  // =====================================================
  // VALIDATION DU FORMULAIRE
  // =====================================================

  /**
   * Valide les données saisies avant l'envoi.
   *
   * La validation est volontairement effectuée
   * uniquement lors de la soumission afin d'éviter
   * de recalculer et modifier l'état à chaque frappe.
   */
  const validateForm = useCallback(() => {
    const validationErrors = {};

    // -------------------------
    // MOT DE PASSE
    // -------------------------

    if (!form.password) {
      validationErrors.password =
        "Mot de passe requis";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
        .test(form.password)
    ) {
      validationErrors.password =
        "8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial";
    }

    // -------------------------
    // CONFIRMATION
    // -------------------------

    if (
      form.password !== form.confirmPassword
    ) {
      validationErrors.confirmPassword =
        "Les mots de passe ne correspondent pas";
    }

    // -------------------------
    // CGU
    // -------------------------

    if (!form.cgu) {
      validationErrors.cgu =
        "Vous devez accepter les CGU";
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  }, [form]);

  // =====================================================
  // MODIFICATION DU FORMULAIRE
  // =====================================================

  const handleChange = useCallback((event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // Supprime l'erreur du champ dès que l'utilisateur
    // recommence à le modifier.
    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[name];

      return nextErrors;
    });
  }, []);

  // =====================================================
  // VÉRIFICATION DU TOKEN
  // =====================================================

  const checkToken = useCallback(async () => {
    // Sans token, le lien est immédiatement considéré
    // comme invalide.
    if (!token) {
      setValidToken(false);
      setChecking(false);

      return;
    }

    try {
      setChecking(true);

      const data = await apiFetch(
        `/auth/check-activation-token?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
        }
      );

      setUser(data);

      setAlreadyVerified(
        Boolean(data?.already_verified)
      );

      setExpired(
        Boolean(data?.expired)
      );

      // Le token peut être techniquement reconnu
      // tout en étant expiré ou déjà utilisé.
      setValidToken(true);
    } catch (error) {
      setValidToken(false);

      toast.error(
        error?.message ||
        "Impossible de vérifier le lien d'activation."
      );
    } finally {
      setChecking(false);
    }
  }, [token]);

  // Vérifie le token uniquement lorsque celui-ci
  // change.
  useEffect(() => {
    checkToken();
  }, [checkToken]);

  // =====================================================
  // ACTIVATION DU COMPTE
  // =====================================================

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      // Validation côté frontend avant l'appel API.
      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);

        const result = await apiFetch(
          "/auth/activate-account",
          {
            method: "POST",
            body: {
              token,
              password: form.password,
              accepted_cgu: form.cgu,
            },
          }
        );

        toast.success(
          "Votre compte est activé."
        );

        // La redirection éventuelle après connexion
        // est enregistrée avant la connexion.
        setPostLoginRedirect(
          result.redirect
        );

        // Une seule connexion automatique.
        login(
          result.access_token,
          result.refresh_token
        );

        navigate(result.redirect);
      } catch (error) {
        toast.error(
          error?.message ||
          "Impossible d'activer votre compte."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      loading,
      login,
      navigate,
      setPostLoginRedirect,
      token,
      validateForm,
    ]
  );

  // =====================================================
  // VALIDITÉ DU FORMULAIRE
  // =====================================================

  const isFormValid =
    form.password.length > 0 &&
    form.password === form.confirmPassword &&
    form.cgu;

  // =====================================================
  // VÉRIFICATION EN COURS
  // =====================================================

  if (checking) {
    return (
      <main className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="d-flex align-items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />

          <span>
            Vérification du lien...
          </span>
        </div>
      </main>
    );
  }

  // =====================================================
  // TOKEN INVALIDE
  // =====================================================

  if (!token || !validToken) {
    return (
      <main className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="card border-0 shadow-sm rounded-4"
          style={{
            maxWidth: "450px",
            width: "100%",
          }}
        >
          <div className="card-body text-center p-4">
            <i
              className="bi bi-x-circle text-danger fs-1 mb-3"
              aria-hidden="true"
            />

            <h1 className="h4 fw-bold mb-3">
              Lien invalide
            </h1>

            <p className="text-muted mb-4">
              Ce lien d'activation est invalide
              ou ne peut plus être utilisé.
            </p>

            <Link
              to="/"
              className="btn btn-dark"
            >
              Retour
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // TOKEN EXPIRÉ
  // =====================================================

  if (expired) {
    return (
      <main className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="card border-0 shadow-sm rounded-4"
          style={{
            maxWidth: "450px",
            width: "100%",
          }}
        >
          <div className="card-body text-center p-4">
            <i
              className="bi bi-clock-history text-warning fs-1 mb-3"
              aria-hidden="true"
            />

            <h1 className="h4 fw-bold mb-3">
              Lien expiré
            </h1>

            <p className="text-muted mb-0">
              Ce lien d'activation a expiré.
              Veuillez demander un nouveau lien
              d'activation.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // COMPTE DÉJÀ ACTIVÉ
  // =====================================================

  if (alreadyVerified) {
    return (
      <main className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="card border-0 shadow-sm rounded-4"
          style={{
            maxWidth: "450px",
            width: "100%",
          }}
        >
          <div className="card-body text-center p-4">
            <i
              className="bi bi-check-circle text-success fs-1 mb-3"
              aria-hidden="true"
            />

            <h1 className="h4 fw-bold mb-3">
              Compte déjà activé
            </h1>

            <p className="text-muted mb-4">
              Bonjour{" "}
              <strong>
                {user?.first_name}
              </strong>
              , votre compte est déjà activé.
              <br />
              Vous pouvez vous connecter pour
              consulter vos offres.
            </p>

            <Link
              to="/login"
              className="btn btn-dark w-100"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // FORMULAIRE D'ACTIVATION
  // =====================================================

  return (
    <main className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{
          maxWidth: "450px",
          width: "100%",
        }}
      >
        <div className="card-body p-4">
          <h1 className="h3 fw-bold mb-2">
            Bienvenue{" "}
            {user?.first_name}
          </h1>

          <p className="text-muted mb-4">
            Choisissez votre mot de passe pour
            accéder à votre espace client.
          </p>

          <form onSubmit={handleSubmit}>
            {/* =========================================
                MOT DE PASSE
            ========================================= */}

            <div className="mb-3">
              <label
                htmlFor={passwordId}
                className="form-label"
              >
                Mot de passe
              </label>

              <input
                id={passwordId}
                type="password"
                name="password"
                className={`form-control ${
                  errors.password
                    ? "is-invalid"
                    : ""
                }`}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                aria-invalid={
                  Boolean(errors.password)
                }
                aria-describedby={
                  errors.password
                    ? `${passwordId}-error`
                    : undefined
                }
              />

              {errors.password && (
                <div
                  id={`${passwordId}-error`}
                  className="invalid-feedback"
                >
                  {errors.password}
                </div>
              )}
            </div>

            {/* =========================================
                CONFIRMATION
            ========================================= */}

            <div className="mb-3">
              <label
                htmlFor={confirmPasswordId}
                className="form-label"
              >
                Confirmation du mot de passe
              </label>

              <input
                id={confirmPasswordId}
                type="password"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword
                    ? "is-invalid"
                    : ""
                }`}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                aria-invalid={
                  Boolean(
                    errors.confirmPassword
                  )
                }
                aria-describedby={
                  errors.confirmPassword
                    ? `${confirmPasswordId}-error`
                    : undefined
                }
              />

              {errors.confirmPassword && (
                <div
                  id={`${confirmPasswordId}-error`}
                  className="invalid-feedback"
                >
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* =========================================
                CGU
            ========================================= */}

            <div className="mb-3">
              <div className="form-check">
                <input
                  id={cguId}
                  className={`form-check-input ${
                    errors.cgu
                      ? "is-invalid"
                      : ""
                  }`}
                  type="checkbox"
                  name="cgu"
                  checked={form.cgu}
                  onChange={handleChange}
                  disabled={loading}
                  aria-invalid={Boolean(
                    errors.cgu
                  )}
                />

                <label
                  htmlFor={cguId}
                  className="form-check-label"
                >
                  J'accepte les{" "}
                  <Link
                    to="/cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CGU
                  </Link>
                </label>

                {errors.cgu && (
                  <div className="invalid-feedback">
                    {errors.cgu}
                  </div>
                )}
              </div>
            </div>

            {/* =========================================
                SUBMIT
            ========================================= */}

            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={
                loading ||
                !isFormValid
              }
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />

                  Activation...
                </>
              ) : (
                <>
                  <i
                    className="bi bi-check-circle me-2"
                    aria-hidden="true"
                  />

                  Activer mon compte
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}