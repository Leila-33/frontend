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
import { LEAD_STATUSES } from "../../../constants/leadOptions";
import { QUOTE_STATUSES } from "../../../constants/quoteOptions";
import ConfirmActionModal from "../../../components/common/ConfirmActionModal";
import { formatAmount } from "../../../utils/priceUtils";

/**
 * Page de détail d'un prospect commercial.
 *
 * Responsabilités :
 * - charger les informations du prospect ;
 * - afficher ses coordonnées et son véhicule ;
 * - afficher les actions commerciales disponibles ;
 * - permettre de marquer le prospect comme contacté ;
 * - permettre de créer une offre ;
 * - afficher les offres existantes ;
 * - permettre la suppression du prospect lorsque celle-ci
 *   est autorisée par le backend.
 *
 * Les règles métier restent gérées par l'API.
 * Le frontend se contente d'afficher les actions autorisées
 * via les propriétés `can_*` retournées par le backend.
 */
export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ÉTAT
  // =====================================================

  const [lead, setLead] = useState(null);

  /**
   * Chargement initial du prospect.
   *
   * Cet état est distinct de `actionLoading` afin d'éviter
   * de masquer toute la page lorsqu'une action commerciale
   * est simplement en cours.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Indique qu'une action est actuellement exécutée :
   * - marquage comme contacté ;
   * - suppression.
   */
  const [actionLoading, setActionLoading] =
    useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  // =====================================================
  // CHARGEMENT DU PROSPECT
  // =====================================================

  const fetchLead = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch(
        `/agent/leads/${id}`,
        {
          method: "GET",
        }
      );

      setLead(data);
    } catch (error) {
      toast.error(
        error?.message ||
          "Erreur lors du chargement du prospect."
      );

      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // =====================================================
  // MARQUER COMME CONTACTÉ
  // =====================================================

  const markAsContacted = async () => {
    if (
      !lead ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(
        `/agent/leads/${lead.id}/contacted`,
        {
          method: "PATCH",
        }
      );


      await fetchLead();

      toast.success(
        "Le prospect a été marqué comme contacté."
      );
    } catch (error) {
      toast.error(
        error?.message ||
          "Impossible de mettre à jour le prospect."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SUPPRESSION DU PROSPECT
  // =====================================================

  const deleteLead = async () => {
    if (
      !lead ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(
        `/agent/leads/${lead.id}`,
        {
          method: "DELETE",
        }
      );

      toast.success(
        "Prospect supprimé."
      );

      navigate("/sales/leads");
    } catch (error) {
      toast.error(
        error?.message ||
          "Impossible de supprimer le prospect."
      );
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  // =====================================================
  // ÉTATS DE CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <div
        className="container py-5 text-center text-muted"
        role="status"
        aria-live="polite"
      >
        <span
          className="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        />

        Chargement du prospect...
      </div>
    );
  }

  // =====================================================
  // PROSPECT INTROUVABLE
  // =====================================================

  if (!lead) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center p-5">

            <i
              className="bi bi-person-x fs-1 text-muted"
              aria-hidden="true"
            />

            <h1 className="h4 fw-semibold mt-3">
              Prospect introuvable
            </h1>

            <p className="text-muted mb-4">
              Ce prospect n'existe plus ou n'est
              plus accessible.
            </p>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate("/sales/leads")
              }
            >
              <i
                className="bi bi-arrow-left me-2"
                aria-hidden="true"
              />
              Retour aux prospects
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // DONNÉES D'AFFICHAGE
  // =====================================================

  const statusConfig =
    LEAD_STATUSES[lead.status];

  const quotes = Array.isArray(
    lead.quotes
  )
    ? lead.quotes
    : [];

  const vehicle = lead.vehicle;

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="container py-4">

      {/* =================================================
          EN-TÊTE
          ================================================= */}

      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">

            <h1 className="h2 fw-bold mb-0">
              {lead.first_name}{" "}
              {lead.last_name}
            </h1>

            <span
              className={`badge ${
                statusConfig?.className ??
                "bg-secondary"
              }`}
            >
              {statusConfig?.label ??
                lead.status ??
                "Statut inconnu"}
            </span>

          </div>

          <p className="text-muted mb-0 mt-1">
            Détail du prospect commercial
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          {lead.can_delete && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() =>
                setShowDeleteModal(true)
              }
              disabled={actionLoading}
            >
              <i
                className="bi bi-trash me-2"
                aria-hidden="true"
              />
              Supprimer
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
            disabled={actionLoading}
          >
            <i
              className="bi bi-arrow-left me-2"
              aria-hidden="true"
            />
            Retour
          </button>

        </div>
      </header>

      {/* =================================================
          INFORMATIONS PRINCIPALES
          ================================================= */}

      <div className="row g-4">

        {/* =================================================
            INFORMATIONS CLIENT
            ================================================= */}

        <div className="col-lg-6">
          <section className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-4">

                <i
                  className="bi bi-file-earmark-text text-muted"
                  aria-hidden="true"
                />

                <h2 className="h5 fw-semibold mb-0">
                  Informations client
                </h2>

              </div>

              <div className="mb-3">

                <div className="small text-muted mb-1">
                  Email
                </div>

                <div className="fw-medium text-break">
                  {lead.email || "Non renseigné"}
                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted mb-1">
                  Téléphone
                </div>

                <div className="fw-medium">
                  {lead.phone || "Non renseigné"}
                </div>

              </div>

              <div>

                <div className="small text-muted mb-1">
                  Message
                </div>

                <div
                  className="text-break"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {lead.message ||
                    "Aucun message"}
                </div>

              </div>

            </div>
          </section>
        </div>

        {/* =================================================
            VÉHICULE
            ================================================= */}

        <div className="col-lg-6">
          <section className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-4">

                <i
                  className="bi bi-car-front text-muted"
                  aria-hidden="true"
                />

                <h2 className="h5 fw-semibold mb-0">
                  Véhicule recherché
                </h2>

              </div>

              {vehicle ? (
                <>
                  <h3 className="h6 fw-bold mb-2">
                    {vehicle.brand}{" "}
                    {vehicle.model}
                  </h3>

                  <div className="d-flex align-items-center gap-2">

                    <i
                      className="bi bi-tag text-muted"
                      aria-hidden="true"
                    />

                    <span>
                      {formatAmount(vehicle.price)}
                    </span>

                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">
                  Aucun véhicule sélectionné.
                </p>
              )}

            </div>
          </section>
        </div>

      </div>

      {/* =================================================
          ACTIONS COMMERCIALES
          ================================================= */}

      <section className="card border-0 shadow-sm rounded-4 mt-4">

        <div className="card-body p-4">

          <div className="d-flex align-items-center gap-2 mb-4">

            <i
              className="bi bi-kanban text-muted"
              aria-hidden="true"
            />

            <h2 className="h5 fw-semibold mb-0">
              Actions commerciales
            </h2>

          </div>

          <div className="d-flex gap-2 flex-wrap">

            {/* -----------------------------------------
                MARQUER COMME CONTACTÉ
                ----------------------------------------- */}

            {lead.status === "ASSIGNED" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={markAsContacted}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />

                    Mise à jour...
                  </>
                ) : (
                  <>
                    <i
                      className="bi bi-telephone-check me-2"
                      aria-hidden="true"
                    />

                    Marquer comme contacté
                  </>
                )}
              </button>
            )}

            {/* -----------------------------------------
                CRÉER UNE OFFRE
                ----------------------------------------- */}

            {lead.can_create_quote && (
              <button
                type="button"
                className="btn btn-dark"
                onClick={() =>
                  navigate(
                    `/sales/quotes/new`
                  )
                }
                disabled={actionLoading}
              >
                <i
                  className="bi bi-file-earmark-plus me-2"
                  aria-hidden="true"
                />

                Créer une offre
              </button>
            )}

          </div>

          {/* =================================================
              OFFRES EXISTANTES
              ================================================= */}

          {quotes.length > 0 && (
            <div className="border-top mt-4 pt-4">

              <div className="d-flex align-items-center gap-2 mb-3">

                <i
                  className="bi bi-file-earmark-text text-muted"
                  aria-hidden="true"
                />

                <h2 className="h5 fw-semibold mb-0">
                  Offres
                </h2>

                <span className="badge bg-light text-dark">
                  {quotes.length}
                </span>

              </div>

              <div className="row g-2">

                {quotes.map((quote) => {
                  const quoteConfig =
                    QUOTE_STATUSES[
                      quote.status
                    ];

                  return (
                    <div
                      key={quote.id}
                      className="col-12 col-md-6"
                    >
                      <button
                        type="button"
                        className="btn btn-outline-dark w-100 d-flex justify-content-between align-items-center text-start"
                        onClick={() =>
                          navigate(
                            `/sales/quotes/${quote.id}`
                          )
                        }
                        disabled={actionLoading}
                      >
                        <span>
                          <i
                            className="bi bi-file-earmark-text me-2"
                            aria-hidden="true"
                          />

                          Offre #{quote.id}
                        </span>

                        <span
                          className={`badge ${
                            quoteConfig?.className ??
                            "bg-secondary"
                          }`}
                        >
                          {quoteConfig?.label ??
                            quote.status}
                        </span>
                      </button>
                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </div>
      </section>

      {/* =================================================
          MODALE DE SUPPRESSION
          ================================================= */}

      <ConfirmActionModal
        open={showDeleteModal}
        type="delete"
        title="Supprimer le prospect"
        description={
          <>
            Êtes-vous sûr de vouloir supprimer
            ce prospect ?
            <br />
            Cette action est irréversible.
          </>
        }
        loading={actionLoading}
        onCancel={() =>
          setShowDeleteModal(false)
        }
        onConfirm={deleteLead}
      />

    </div>
  );
}