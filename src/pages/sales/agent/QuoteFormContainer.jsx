import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import apiFetch from "../../../services/apiFetch";
import QuoteFormPage from "../../../components/sales/QuoteForm";

/**
 * Formulaire de création et de modification d'une offre.
 *
 * Le mode est déterminé par la présence d'un `id`
 * dans l'URL :
 *
 * - `/sales/quotes/new` → création ;
 * - `/sales/quotes/:id/edit` → modification.
 *
 * La page gère uniquement la coordination avec l'API
 * et la navigation.
 *
 * Le composant `QuoteFormPage` reste responsable
 * de l'affichage et de la gestion du formulaire.
 */
export default function QuoteFormContainer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // MODE
  // =====================================================

  const isEditMode = Boolean(id);

  const mode = isEditMode
    ? "edit"
    : "create";

  // =====================================================
  // ÉTAT
  // =====================================================

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  // =====================================================
  // CHARGEMENT
  // =====================================================

  const fetchQuote = useCallback(async () => {
    // En mode création, aucune donnée existante
    // n'est nécessaire.
    if (!isEditMode) {
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch(
        `/agent/quotes/${id}`,
        {
          method: "GET",
        }
      );

      setQuote(data);
    } catch (error) {
      toast.error(
        error?.message ||
        "Impossible de charger l'offre."
      );

      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    isEditMode,
    navigate,
  ]);

  // =====================================================
  // INITIALISATION
  // =====================================================

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // =====================================================
  // SOUMISSION
  // =====================================================

  const handleSubmit = useCallback(
    async (payload) => {
      if (isEditMode) {
        // -------------------------
        // MODIFICATION
        // -------------------------

        await apiFetch(
          `/agent/quotes/${id}`,
          {
            method: "PUT",
            body: payload,
          }
        );

        toast.success(
          "Offre modifiée avec succès."
        );

        navigate(
          `/sales/quotes/${id}`
        );

        return;
      }

      // -------------------------
      // CRÉATION
      // -------------------------

      const result = await apiFetch(
        "/agent/quotes",
        {
          method: "POST",
          body: payload,
        }
      );

      toast.success(
        "Offre créée avec succès."
      );

      navigate(
        `/sales/quotes/${result.quote_id}`
      );
    },
    [
      id,
      isEditMode,
      navigate,
    ]
  );

  // =====================================================
  // CHARGEMENT DE L'OFFRE
  // =====================================================

  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />

          <span>
            Chargement de l'offre...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // OFFRE INTROUVABLE
  // =====================================================

  if (isEditMode && !quote) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning mb-0">
          Offre introuvable.
        </div>
      </div>
    );
  }

  // =====================================================
  // FORMULAIRE
  // =====================================================

  return (
    <QuoteFormPage
      mode={mode}
      initialValues={quote}
      onSubmit={handleSubmit}
    />
  );
}