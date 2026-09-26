import { useEffect, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ApplicationTimeline from "../../components/applications/ApplicationTimeline";
import { APPLICATION_STATUSES } from "../../constants/applicationOptions";
import {
  DOCUMENT_LABELS,
  DOCUMENT_STATUS,
} from "../../constants/documentOptions";
import { formatDate } from "../../utils/dateUtils";
import { formatAmount } from "../../utils/priceUtils";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";

export default function AdminApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [updatingDocumentId, setUpdatingDocumentId] = useState(null);
  // Dossier actuellement consulté.
  const [application, setApplication] = useState(null);

  // État de la modale de refus d'un document.
  const [rejectModal, setRejectModal] = useState({
    open: false,
    type: null, // "document" | "application"
    docType: null,
    category: "",
    comment: "",
  });

  // Motifs prédéfinis pour le refus d'un document.
  const rejectCategories = [
    "Document illisible",
    "Document incomplet",
    "Document expiré",
    "Incohérence d’informations",
    "Autre",
  ];

  // Ouvre la modale permettant de refuser un document.
  const openRejectModal = (docId, docType) => {
    setRejectModal({
      open: true,
      type: "document",
      docId: docId,
      docType: docType,
      category: "",
      comment: "",
    });
  };

  // Confirme le refus d'un document après validation du motif.
  const confirmReject = async () => {
    try {
      // Le motif est obligatoire.
      if (!rejectModal.category) {
        toast.error("Veuillez sélectionner un motif");
        return;
      }

      // Combine le motif prédéfini et le commentaire personnalisé.
      const finalComment = [rejectModal.category, rejectModal.comment]
        .filter(Boolean)
        .join(" — ");

      // Met à jour le statut du document côté API.
      await updateDocStatus(rejectModal.docId, "rejected", finalComment);

      // Recharge le dossier pour récupérer les données à jour.
      await fetchApplication();

      toast.success("Document refusé");

      // Ferme et réinitialise la modale.
      setRejectModal({
        open: false,
        docId: null,
        docType: null,
        category: "",
        comment: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du refus");
    }
  };

  // État de la modale utilisée pour valider ou refuser le dossier.
  const [modal, setModal] = useState({
    open: false,
    type: null, // "validate" | "refuse"
    reason: "",
  });

  // Ouvre la modale de validation du dossier.
  const openValidateModal = () => {
    setModal({ open: true, type: "validate", reason: "" });
  };

  // Ouvre la modale de refus du dossier.
  const openRefuseModal = () => {
    setModal({ open: true, type: "refuse", reason: "" });
  };
  // ==========================================================
  // OUVERTURE DE LA MODALE DE PRISE EN CHARGE
  // ==========================================================

  const openTakeOverModal = () => {
    setModal({
      open: true,
      type: "process",
      reason: "",
    });
  };
  // Met à jour le statut du dossier via l'API.
  const updateApplicationStatus = async (
    applicationId,
    status,
    reason = ""
  ) => {
    try {
      const res = await apiFetch(
        `/admin/applications/${applicationId}/status`,
        {
          method: "PATCH",
          body: {
            status,
            reason: reason || null,
          },
        }
      );

      return res;
    } catch (err) {
      console.error(err);

      toast.error("Erreur lors de la mise à jour du dossier");

      throw err;
    }
  };

  // ==========================================================
  // CONFIRMATION DE L'ACTION
  // ==========================================================

  const confirmAction = async () => {
    try {
      if (!modal.type) return;

      if (modal.type === "process") {
        await updateApplicationStatus(application.id, "processing");

        toast.success("Dossier pris en charge");
      }

      if (modal.type === "validate") {
        await updateApplicationStatus(application.id, "approved");

        toast.success("Dossier validé");
      }

      if (modal.type === "refuse") {
        if (!modal.reason?.trim()) {
          toast.error("Veuillez indiquer un motif");
          return;
        }

        await updateApplicationStatus(application.id, "rejected", modal.reason);

        toast.success("Dossier refusé");
      }

      await fetchApplication();

      setModal({
        open: false,
        type: null,
        reason: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'action");
    }
  };

  // ==========================================================
  // PRISE EN CHARGE DU DOSSIER
  // ==========================================================

  const handleTakeOver = async () => {
    try {
      await updateApplicationStatus(application.id, "processing");

      toast.success("Dossier pris en charge");

      await fetchApplication();
    } catch (err) {
      console.error("Erreur lors de la prise en charge :", err);
    }
  };

  // ---------------- CHARGEMENT DU DOSSIER ----------------

  // Mémorise la fonction pour éviter de la recréer à chaque rendu.
  // Elle est recréée uniquement lorsque l'identifiant du dossier change.
  const fetchApplication = useCallback(async () => {
    if (!id) return;

    try {
      const data = await apiFetch(`/applications/${id}`, {
        method: "GET",
      });
      if (!data) {
        navigate("/application-not-found", {
          replace: true,
        });

        return;
      }
      // Si le dossier a été supprimé ou n'existe plus,
      // redirige vers la page correspondante.
      if (data.deleted_at === true) {
        navigate("/application-deleted", {
          replace: true,
        });

        return;
      }

      setApplication(data);
    } catch (err) {
      console.error("fetchApplication error:", err);

      // Redirection spécifique si le dossier est introuvable.
      if (err?.status === 404) {
        navigate("/application-not-found", {
          replace: true,
        });

        return;
      }

      // Récupération du message d'erreur retourné par l'API.
      let message = "Erreur lors du chargement";

      if (Array.isArray(err?.data?.detail)) {
        message = err.data.detail.map((e) => e.message).join(" | ");
      } else if (typeof err?.data?.detail === "string") {
        message = err.data.detail;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      toast.error(message);
    }
  }, [id, navigate]);

  // Charge le dossier lorsque son identifiant change.
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // ---------------- GESTION DES DOCUMENTS ----------------

  // Met à jour le statut d'un document.
  const updateDocStatus = async (docId, status, comment = "") => {
    try {
      const res = await apiFetch(`/admin/applications/documents/status`, {
        method: "PATCH",
        body: {
          document_id: docId,
          status,
          comment,
        },
      });

      // Recharge les données afin d'afficher le nouveau statut.
      fetchApplication();

      toast.success("Document mis à jour");

      return res;
    } catch (err) {
      console.error("updateDocStatus error:", err);

      toast.error("Erreur lors de la mise à jour");

      throw err;
    }
  };

  // Normalise la structure des documents reçus par l'API.
  const docs = Array.isArray(application?.documents)
    ? application.documents
    : Object.values(application?.documents || {});

  // Vérifie que tous les documents présents sont validés.
  const isDocsValid =
    docs.length > 0 && docs.every((d) => d?.status === "validated");

  // Affiche un écran vide pendant le chargement initial.
  if (!application) return null;

  // ---------------- INTERFACE ----------------

  return (
    <div className="container py-4">
      {/* BARRE SUPÉRIEURE : retour et statut du dossier */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <button
          className="btn btn-light border rounded-pill px-4 shadow-sm"
          onClick={() => navigate("/admin/applications")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>

        <span
          className={`badge fs-6 px-4 py-3 rounded-pill bg-${APPLICATION_STATUSES[application.status]?.color}`}
        >
          {APPLICATION_STATUSES[application.status]?.label}
        </span>
      </div>

      {/* EN-TÊTE DU DOSSIER ET ACTIONS ADMINISTRATEUR */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">
            <div>
              <div className="text-muted small mb-2">Dossier</div>

              <h2 className="fw-bold mb-1">#{application.id}</h2>

              <div className="text-muted">
                Créé le {formatDate(application.created_at)}
              </div>
            </div>

            {/* ACTIONS SUR LE DOSSIER */}
            <div className="d-flex gap-2 flex-wrap">
              {application?.can_validate && (
                <button
                  className="btn btn-success rounded-pill px-4"
                  disabled={!isDocsValid}
                  onClick={openValidateModal}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Valider
                </button>
              )}

              {application?.can_reject && (
                <button
                  className="btn btn-danger rounded-pill px-4"
                  onClick={openRefuseModal}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Refuser
                </button>
              )}
              {application.status === "submitted" && (
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={openTakeOverModal}
                >
                  Prendre en charge
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATIONS PRINCIPALES : CLIENT, VÉHICULE, FINANCEMENT ET REPRISE */}
      <div className="row g-4">
        {/* CLIENT */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">Client</h5>

              <div className="mb-3">
                <div className="small text-muted">Nom complet</div>

                <div className="fw-semibold">
                  {application.first_name} {application.last_name}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">Email</div>

                <div>{application.email}</div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">Téléphone</div>

                <div>{application.phone}</div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">Adresse</div>

                <div>{application.address}</div>
              </div>

              <div>
                <div className="small text-muted">Date de naissance</div>

                <div>
                  {application.birth_date
                    ? new Date(application.birth_date).toLocaleDateString(
                        "fr-FR"
                      )
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VÉHICULE */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">Projet véhicule</h5>

              <div className="mb-3">
                <div className="small text-muted">Type</div>

                <div className="fw-semibold">
                  {application.vehicle?.type === "sale"
                    ? "Vente"
                    : application.vehicle?.type === "rent"
                      ? "Location"
                      : application.vehicle?.type}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">Véhicule</div>

                <div className="fw-semibold">
                  {application.vehicle?.brand} {application.vehicle?.model}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">Année</div>

                <div>{application.vehicle?.year}</div>
              </div>

              <div>
                <div className="small text-muted">Prix</div>

                <div className="fw-bold fs-5">
                  {formatAmount(application.vehicle?.price)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCEMENT */}
        {application.financing && (
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-4">Financement</h5>

                <div className="mb-3">
                  <div className="small text-muted">Revenus mensuels</div>

                  <div className="fw-semibold">
                    {formatAmount(application.monthly_income)}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Charges mensuelles</div>

                  <div className="fw-semibold">
                    {formatAmount(application.monthly_expenses)}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted">Remise</div>

                  <div className="fw-semibold">
                    {formatAmount(application.discount)}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Apport</div>

                  <div>{formatAmount(application.financing.down_paymen)}</div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Durée</div>

                  <div>{application.financing.duration_months} mois</div>
                </div>

                <div>
                  <div className="small text-muted">Mensualité estimée</div>

                  <div className="fw-bold fs-4">
                    {formatAmount(application.financing.monthly_payment)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPRISE DU VÉHICULE */}
        {application.trade_in && (
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-4">Reprise véhicule</h5>

                <div className="mb-3">
                  <div className="small text-muted">Véhicule</div>

                  <div>
                    {application.trade_in.brand} {application.trade_in.model}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Kilométrage</div>

                  <div>
                    {application.trade_in.mileage?.toLocaleString("fr-FR")} km
                  </div>
                </div>

                <div>
                  <div className="small text-muted">Estimation</div>

                  <div className="fw-bold fs-4">
                    {formatAmount(application.trade_in.estimated_value)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- DOCUMENTS ---------------- */}

      {/* =========================
    DOCUMENTS
========================= */}

      {(() => {
        const documents = Array.isArray(application?.documents)
          ? application.documents
          : [];

        const totalDocuments = documents.length;

        const validatedDocuments = documents.filter(
          (doc) => doc.status === "validated"
        ).length;

        const pendingDocuments = documents.filter(
          (doc) => doc.status === "pending"
        ).length;

        const rejectedDocuments = documents.filter(
          (doc) => doc.status === "rejected"
        ).length;

        const progress = totalDocuments
          ? Math.round((validatedDocuments / totalDocuments) * 100)
          : 0;

        const allValidated =
          totalDocuments > 0 && validatedDocuments === totalDocuments;

        return (
          <div className="mt-4">
            {/* =========================
          EN-TÊTE
      ========================= */}

            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h5 className="fw-semibold mb-1">
                      Documents justificatifs
                    </h5>

                    <p className="text-muted small mb-0">
                      Vérification des documents nécessaires au traitement du
                      dossier.
                    </p>
                  </div>

                  <div className="text-end">
                    <div className="fw-semibold">
                      {validatedDocuments} / {totalDocuments}
                    </div>

                    <div className="small text-muted">documents validés</div>
                  </div>
                </div>

                {/* =========================
              PROGRESSION
          ========================= */}

                <div className="mt-4">
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${progress}%`,
                      }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="small text-muted mt-2">
                    {progress}% des documents sont validés
                  </div>
                </div>

                {/* =========================
              COMPTEURS
          ========================= */}

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                    <i className="bi bi-check-circle me-1" />
                    {validatedDocuments} validé
                    {validatedDocuments > 1 ? "s" : ""}
                  </span>

                  <span className="badge rounded-pill bg-warning-subtle text-warning px-3 py-2">
                    <i className="bi bi-hourglass-split me-1" />
                    {pendingDocuments} en attente
                  </span>

                  <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
                    <i className="bi bi-x-circle me-1" />
                    {rejectedDocuments} refusé{rejectedDocuments > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* =========================
          ÉTAT GLOBAL
      ========================= */}

            {allValidated && (
              <div className="alert alert-success border-0 rounded-4 d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-check-circle-fill fs-5" />

                <div>
                  <div className="fw-semibold">
                    Tous les documents sont conformes.
                  </div>

                  <div className="small">
                    Le dossier peut être validé si les autres conditions sont
                    respectées.
                  </div>
                </div>
              </div>
            )}

            {!allValidated && rejectedDocuments > 0 && (
              <div className="alert alert-danger border-0 rounded-4 d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-exclamation-circle-fill fs-5" />

                <div>
                  <div className="fw-semibold">
                    Des documents doivent être corrigés.
                  </div>

                  <div className="small">
                    Le client doit remplacer les documents refusés avant une
                    nouvelle validation.
                  </div>
                </div>
              </div>
            )}

            {!allValidated &&
              rejectedDocuments === 0 &&
              pendingDocuments > 0 && (
                <div className="alert alert-warning border-0 rounded-4 d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-hourglass-split fs-5" />

                  <div>
                    <div className="fw-semibold">
                      Documents en attente de validation.
                    </div>

                    <div className="small">
                      Vérifiez les documents restants avant de valider le
                      dossier.
                    </div>
                  </div>
                </div>
              )}

            {/* =========================
          LISTE DES DOCUMENTS
      ========================= */}

            {documents.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-5 text-center text-muted">
                  <i className="bi bi-file-earmark-x fs-1 d-block mb-3" />

                  <div className="fw-semibold mb-1">Aucun document</div>

                  <div className="small">
                    Aucun document n'a été fourni pour ce dossier.
                  </div>
                </div>
              </div>
            ) : (
              documents.map((doc) => {
                const status = DOCUMENT_STATUS[doc.status] || {
                  label: doc.status || "Inconnu",
                  description: "Statut du document inconnu",
                  color: "secondary",
                  icon: "bi-question-circle",
                };

                const isPending = doc.status === "pending";

                const isUpdating = updatingDocumentId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="card border-0 shadow-sm rounded-4 mb-3"
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        {/* =========================
                      INFORMATIONS
                  ========================= */}

                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-3">
                            {/* ICÔNE DU STATUT */}

                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center bg-${status.color}-subtle text-${status.color}`}
                              style={{
                                width: "44px",
                                height: "44px",
                                minWidth: "44px",
                              }}
                            >
                              <i className={`bi ${status.icon}`} />
                            </div>

                            {/* NOM + STATUT */}

                            <div>
                              <div className="fw-semibold">
                                {DOCUMENT_LABELS?.[doc.type] || doc.type}
                              </div>

                              <div className="small text-muted">
                                {status.description}
                              </div>
                            </div>
                          </div>

                          {/* =========================
                        MOTIF DE REFUS
                    ========================= */}

                          {doc.status === "rejected" && doc.comment && (
                            <div className="alert alert-danger border-0 py-2 px-3 small mt-3 mb-0 rounded-3">
                              <div className="fw-semibold mb-1">
                                <i className="bi bi-chat-left-text me-2" />
                                Motif du refus
                              </div>

                              <div>{doc.comment}</div>
                            </div>
                          )}
                        </div>

                        {/* =========================
                      ACTIONS
                  ========================= */}

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          {/* STATUT */}

                          <span
                            className={`badge rounded-pill px-3 py-2 bg-${status.color}`}
                          >
                            {status.label}
                          </span>

                          {/* CONSULTER */}

                          {doc.download_url && (
                            <a
                              href={doc.download_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-light border rounded-pill px-3 shadow-sm"
                              title="Consulter le document"
                            >
                              Consulter
                            </a>
                          )}

                          {/* =========================
                        ACTIONS ADMIN
                        UNIQUEMENT EN ATTENTE
                    ========================= */}

                          {application.status === "processing" &&
                            isPending &&
                            doc.download_url && (
                              <>
                                {/* VALIDATION */}

                                <button
                                  type="button"
                                  className="btn btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                  }}
                                  disabled={isUpdating}
                                  title="Valider le document"
                                  onClick={() => {
                                    setUpdatingDocumentId(doc.id);

                                    updateDocStatus(
                                      doc.id,
                                      "validated"
                                    ).finally(() => {
                                      setUpdatingDocumentId(null);
                                    });
                                  }}
                                >
                                  {isUpdating ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <i className="bi bi-check-lg" />
                                  )}
                                </button>

                                {/* REFUS */}

                                <button
                                  type="button"
                                  className="btn btn-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                  }}
                                  disabled={isUpdating}
                                  title="Refuser le document"
                                  onClick={() =>
                                    openRejectModal(doc.id, doc.type)
                                  }
                                >
                                  <i className="bi bi-x-lg" />
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}

      {/* HISTORIQUE DES ÉVÉNEMENTS DU DOSSIER */}
      <ApplicationTimeline events={application.events} />

      {/* ---------------- MODALE DE REFUS D'UN DOCUMENT ---------------- */}

      {rejectModal.open && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">❌ Refuser le document</h5>

                <button
                  className="btn-close"
                  onClick={() => setRejectModal({ open: false })}
                />
              </div>

              <div className="modal-body">
                {/* Sélection du motif de refus. */}
                <label className="form-label">Motif du refus</label>

                <select
                  className="form-select mb-3"
                  value={rejectModal.category}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Sélectionner --</option>

                  {rejectCategories.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Commentaire complémentaire facultatif. */}
                <label className="form-label">Commentaire</label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explique précisément le problème..."
                  value={rejectModal.comment}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setRejectModal({ open: false })}
                >
                  Annuler
                </button>

                <button
                  className="btn btn-danger"
                  onClick={confirmReject}
                  disabled={!rejectModal.category}
                >
                  ❌ Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODALE DE VALIDATION / REFUS DU DOSSIER ---------------- */}

      <ConfirmActionModal
        open={modal.open}
        type={modal.type}
        title={
          modal.type === "process"
            ? "Prendre en charge le dossier"
            : modal.type === "validate"
              ? "Valider le dossier"
              : "Refuser le dossier"
        }
        description={
          modal.type === "process"
            ? "Confirmer la prise en charge de ce dossier ?"
            : modal.type === "validate"
              ? "Confirmer la validation du dossier ?"
              : "Indique le motif du refus :"
        }
        onCancel={() =>
          setModal({
            open: false,
            type: null,
            reason: "",
          })
        }
        onConfirm={confirmAction}
      >
        {modal.type === "refuse" && (
          <textarea
            className="form-control"
            rows="3"
            value={modal.reason}
            onChange={(e) =>
              setModal((prev) => ({
                ...prev,
                reason: e.target.value,
              }))
            }
            placeholder="Ex : document illisible, incomplet..."
          />
        )}
      </ConfirmActionModal>
    </div>
  );
}
