import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ApplicationTimeline from "../../components/applications/ApplicationTimeline";
import { STATUS } from "../../utils/status";


export default function AdminApplication() {

  const { id } = useParams();
  const navigate = useNavigate();
  const today = () => new Date().toISOString().slice(0, 10);


  const [application, setApplication] = useState(null);


  const [rejectModal, setRejectModal] = useState({
    open: false,
    type: null, // "document" | "application"
    docType: null,
    category: "",
    comment: ""
  });
  const rejectCategories = [
    "Document illisible",
    "Document incomplet",
    "Document expiré",
    "Incohérence d’informations",
    "Autre"
  ];
  // modale pour refuser un document
  const openRejectModal = (docId, docType) => {
    setRejectModal({
      open: true,
      type: "document",
      docId: docId,
      docType: docType,
      category: "",
      comment: ""
    });
  };
  const confirmReject = async () => {

    try {

      // =========================
      // VALIDATION
      // =========================
      if (!rejectModal.category) {
        toast.error("Veuillez sélectionner un motif");
        return;
      }

      const finalComment = [
        rejectModal.category,
        rejectModal.comment
      ]
        .filter(Boolean)
        .join(" — ");

      // =========================
      // API CALL
      // =========================
      await updateDocStatus(
        rejectModal.docId,
        "rejected",
        finalComment
      );

      // =========================
      // REFRESH APPLICATION
      // =========================
      await fetchApplication();

      // =========================
      // SUCCESS
      // =========================
      toast.success("Document refusé");

      // =========================
      // CLOSE MODAL
      // =========================
      setRejectModal({
        open: false,
        docId: null,
        docType: null,
        category: "",
        comment: ""
      });

    } catch (err) {

      console.error(err);

      toast.error("Erreur lors du refus");
    }
  };
  // valider ou refuser un dossier
  const [modal, setModal] = useState({
    open: false,
    type: null, // "validate" | "refuse"
    reason: ""
  });

  const openValidateModal = () => {
    setModal({ open: true, type: "validate", reason: "" });
  };

  const openRefuseModal = () => {
    setModal({ open: true, type: "refuse", reason: "" });
  };

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
          }
        }
      );

      return res;

    } catch (err) {

      console.error(err);

      toast.error(
        "Erreur lors de la mise à jour du dossier"
      );

      throw err;
    }
  };

  const confirmAction = async () => {

    try {

      // =========================
      // VALIDATION
      // =========================
      if (!modal.type) return;

      // =========================
      // VALIDATE DOSSIER
      // =========================
      if (modal.type === "validate") {

        await updateApplicationStatus(
          application.id,
          "approved"
        );

        toast.success("Dossier validé");
      }

      // =========================
      // REFUSE DOSSIER
      // =========================
      if (modal.type === "refuse") {

        if (!modal.reason?.trim()) {
          toast.error("Veuillez indiquer un motif");
          return;
        }

        await updateApplicationStatus(
          application.id,
          "rejected",
          modal.reason
        );

        toast.success("Dossier refusé");
      }
      fetchApplication();

      // =========================
      // CLOSE MODAL
      // =========================
      setModal({
        open: false,
        type: null,
        reason: ""
      });

    } catch (err) {

      console.error(err);

      toast.error(
        "Erreur lors de l'action"
      );
    }
  };


  // ---------------- MOCK FETCH ----------------
  const fetchApplication = async () => {

    if (!id) return;

    try {

      const data = await apiFetch(
        `/applications/${id}`,
        {
          method: "GET",
        }
      );

      // =========================
      // NOT FOUND / DELETED
      // =========================
      if (!data || data.deleted === true) {

        navigate("/application-deleted", {
          replace: true
        });

        return;
      }

      setApplication(data);

    } catch (err) {

      console.error("fetchApplication error:", err);

      // =========================
      // 404 → NOT FOUND
      // =========================
      if (err?.status === 404) {

        navigate("/not-found", {
          replace: true
        });

        return;
      }

      // =========================
      // ERROR MESSAGE PARSING
      // =========================
      let message = "Erreur lors du chargement";

      if (Array.isArray(err?.data?.detail)) {

        message = err.data.detail
          .map(e => e.message)
          .join(" | ");

      } else if (typeof err?.data?.detail === "string") {

        message = err.data.detail;

      } else if (typeof err?.message === "string") {

        message = err.message;
      }

      toast.error(message);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);


  useEffect(() => {
    if (!application?.id) return;

    if (application.status !== "soumis") return;

    const takeOver = async () => {
      try {
        await fetch(`/api/applications/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "en_cours" })
        });

        setApplication((prev) => ({
          ...prev,
          status: "en_cours",
          history: [
            ...(prev.history || []),
            {
              action: "Prise en charge admin",
              date: today()
            }
          ]
        }));
      } catch (err) {
        console.error("Erreur prise en charge", err);
      }
    };

    takeOver();
  }, [application?.id]);


  // ---------------- UPDATE STATUS ----------------
  const updateDocStatus = async (
    docId,
    status,
    comment = ""
  ) => {
    try {

      const res = await apiFetch(
        `/admin/applications/documents/status`,
        {
          method: "PATCH",
          body: {
            document_id: docId,
            status,
            comment
          }        }
      );

      // =========================
      // UPDATE LOCAL STATE (UX instant)
      // =========================
      fetchApplication();
      toast.success("Document mis à jour");
      return res;

    } catch (err) {

      console.error(
        "updateDocStatus error:",
        err
      );
      toast.error("Erreur lors de la mise à jour");
      throw err; // ✅ IMPORTANT


    }
  };
  const docLabels = {

    identity:
      "Pièce d'identité",

    address_proof:
      "Justificatif de domicile",

    payslip:
      "Bulletin de salaire",

    rib:
      "RIB"
  };
  const docs = Array.isArray(application?.documents)
    ? application.documents
    : Object.values(application?.documents || {});

  const isDocsValid =
    docs.length > 0 &&
    docs.every(d => d?.status === "validated");

  console.log(isDocsValid);
  // ---------------- LOADING ----------------
  if (!application) return null;

  // ---------------- UI ----------------
  return (
    <div className="container py-4">

      {/* TOP BAR */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <button
          className="btn btn-light border rounded-pill px-4 shadow-sm"
          onClick={() =>
            navigate("/admin/applications")
          }
        >

          <i className="bi bi-arrow-left me-2"></i>

          Retour

        </button>
        <span
          className={`badge fs-6 px-4 py-3 rounded-pill bg-${STATUS[application.status]?.color}`}
        >
          {STATUS[application.status]?.label}
        </span>

      </div>

      {/* HEADER CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">

            <div>

              <div className="text-muted small mb-2">
                Dossier
              </div>

              <h2 className="fw-bold mb-1">
                #{application.id}
              </h2>

              <div className="text-muted">

                Créé le{" "}

                {new Date(
                  application.created_at
                ).toLocaleDateString()}

              </div>

            </div>

            {/* ACTIONS */}
            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-success rounded-pill px-4"
                disabled={!isDocsValid || application?.status === "approved"}
                onClick={openValidateModal}
              >

                <i className="bi bi-check-lg me-2"></i>

                Valider

              </button>

              <button
                className="btn btn-danger rounded-pill px-4"
                disabled={application?.status === "rejected" || application?.status === "approved"}
                onClick={openRefuseModal}
              >

                <i className="bi bi-x-lg me-2"></i>

                Refuser

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* GRID */}
      <div className="row g-4">

        {/* CLIENT */}
        <div className="col-lg-6">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <h5 className="fw-semibold mb-4">
                Client
              </h5>

              <div className="mb-3">

                <div className="small text-muted">
                  Nom complet
                </div>

                <div className="fw-semibold">

                  {application.first_name}{" "}
                  {application.last_name}

                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted">
                  Email
                </div>

                <div>
                  {application.email}
                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted">
                  Téléphone
                </div>

                <div>
                  {application.phone}
                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted">
                  Adresse
                </div>

                <div>
                  {application.address}
                </div>

              </div>

              <div>

                <div className="small text-muted">
                  Date de naissance
                </div>

                <div>

                  {application.birth_date
                    ? new Date(
                      application.birth_date
                    ).toLocaleDateString("fr-FR")
                    : "-"}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* VEHICLE */}
        <div className="col-lg-6">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <h5 className="fw-semibold mb-4">
                Projet véhicule
              </h5>

              <div className="mb-3">

                <div className="small text-muted">
                  Type
                </div>

                <div className="fw-semibold">

                  {application.vehicle?.type === "sale"
                    ? "Vente"
                    : application.vehicle?.type === "rent"
                      ? "Location"
                      : application.vehicle?.type}

                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted">
                  Véhicule
                </div>

                <div className="fw-semibold">

                  {application.vehicle?.brand}{" "}
                  {application.vehicle?.model}

                </div>

              </div>

              <div className="mb-3">

                <div className="small text-muted">
                  Année
                </div>

                <div>
                  {application.vehicle?.year}
                </div>

              </div>

              <div>

                <div className="small text-muted">
                  Prix
                </div>

                <div className="fw-bold fs-5">

                  {application.vehicle?.price?.toLocaleString(
                    "fr-FR"
                  )} €

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* FINANCING */}
        {application.financing && (

          <div className="col-lg-6">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <h5 className="fw-semibold mb-4">
                  Financement
                </h5>

                <div className="mb-3">

                  <div className="small text-muted">
                    Revenus mensuels
                  </div>

                  <div className="fw-semibold">

                    {application.monthly_income?.toLocaleString(
                      "fr-FR"
                    )} €

                  </div>

                </div>

                <div className="mb-3">

                  <div className="small text-muted">
                    Charges mensuelles
                  </div>

                  <div className="fw-semibold">

                    {application.monthly_expenses?.toLocaleString(
                      "fr-FR"
                    )} €

                  </div>

                </div>

                <div className="mb-3">

                  <div className="small text-muted">
                    Apport
                  </div>

                  <div>

                    {application.financing.down_payment?.toLocaleString(
                      "fr-FR"
                    )} €

                  </div>

                </div>

                <div className="mb-3">

                  <div className="small text-muted">
                    Durée
                  </div>

                  <div>

                    {application.financing.duration_months} mois

                  </div>

                </div>

                <div>

                  <div className="small text-muted">
                    Mensualité estimée
                  </div>

                  <div className="fw-bold fs-4">

                    {application.financing.monthly_payment?.toLocaleString(
                      "fr-FR"
                    )} €

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* TRADE-IN */}
        {application.trade_in && (

          <div className="col-lg-6">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <h5 className="fw-semibold mb-4">
                  Reprise véhicule
                </h5>

                <div className="mb-3">

                  <div className="small text-muted">
                    Véhicule
                  </div>

                  <div>

                    {application.trade_in.brand}{" "}
                    {application.trade_in.model}

                  </div>

                </div>

                <div className="mb-3">

                  <div className="small text-muted">
                    Kilométrage
                  </div>

                  <div>

                    {application.trade_in.mileage?.toLocaleString(
                      "fr-FR"
                    )} km

                  </div>

                </div>

                <div>

                  <div className="small text-muted">
                    Estimation
                  </div>

                  <div className="fw-bold fs-4">

                    {application.trade_in.estimated_value?.toLocaleString(
                      "fr-FR"
                    )} €

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>



      {/* DOCUMENTS */}
      <h5>Documents</h5>

      <div className="d-flex flex-column gap-3">

        {isDocsValid && (
          <div className="text-center py-4 text-success">

            <i className="bi bi-check-circle fs-1"></i>

            <h5 className="mt-2">
              Tous les documents ont été validés
            </h5>

            <p className="text-muted mb-0">
              Le dossier peut maintenant être traité
            </p>

          </div>
        )}
        {Array.isArray(application?.documents) &&
          application.documents.map((doc) => {

            const isApproved = doc.status === "validated";
            const isRejected = doc.status === "rejected";
            const isPending = doc.status === "pending";

            return (

              <div
                key={doc.type}
                className="card border-0 shadow-sm rounded-4 mb-3"
              >

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

                    {/* LEFT */}
                    <div className="flex-grow-1">

                      <div className="d-flex align-items-center gap-2 mb-2">

                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center ${isApproved
                            ? "bg-success-subtle text-success"
                            : isRejected
                              ? "bg-danger-subtle text-danger"
                              : isPending
                                ? "bg-warning-subtle text-warning"
                                : "bg-secondary-subtle text-secondary"
                            }`}
                          style={{ width: "42px", height: "42px" }}
                        >

                          <i
                            className={`bi ${isApproved
                              ? "bi-check-lg"
                              : isRejected
                                ? "bi-x-lg"
                                : "bi-file-earmark"
                              }`}
                          />

                        </div>

                        <div>

                          <div className="fw-semibold fs-6">
                            {docLabels?.[doc.type] || doc.type}
                          </div>

                          <div className="small text-muted">
                            {isApproved
                              ? "Document validé"
                              : isRejected
                                ? "Document refusé"
                                : isPending
                                  ? "En attente de validation"
                                  : "Document manquant"}
                          </div>

                        </div>

                      </div>

                      {doc.comment && (
                        <div className="alert alert-danger border-0 py-2 px-3 small mt-3 mb-0 rounded-3">
                          {doc.comment}
                        </div>
                      )}

                    </div>

                    {/* RIGHT */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">

                      <span
                        className={`badge rounded-pill px-3 py-2 bg-${isApproved
                          ? "success"
                          : isRejected
                            ? "danger"
                            : "warning"
                          }`}
                      >
                        {doc.status}
                      </span>

                      {doc.download_url && (
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light border rounded-pill px-4 shadow-sm"
                        >
                          Voir
                        </a>
                      )}

                      {/* APPROVE */}
                      {!isApproved && doc.download_url && (
                        <button
                          className="btn btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                          style={{ width: "42px", height: "42px" }}
                          onClick={() =>
                            updateDocStatus(doc.id, "validated")
                          }
                        >
                          <i className="bi bi-check-lg" />
                        </button>
                      )}

                      {/* REJECT */}
                      {!isApproved && doc.download_url && (
                        <button
                          className="btn btn-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                          style={{ width: "42px", height: "42px" }}
                          onClick={() =>
                            openRejectModal(doc.id, doc.type)
                          }
                        >
                          <i className="bi bi-x-lg" />
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            );
          })}

      </div>


      <ApplicationTimeline
        events={application.events}
      />

      {/* MODALE POUR REFUSER UN DOCUMENT */}

      {rejectModal.open && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  ❌ Refuser le document
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setRejectModal({ open: false })
                  }
                />
              </div>

              <div className="modal-body">

                {/* CATEGORY */}
                <label className="form-label">Motif du refus</label>
                <select
                  className="form-select mb-3"
                  value={rejectModal.category}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      category: e.target.value
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

                {/* COMMENT */}
                <label className="form-label">Commentaire</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explique précisément le problème..."
                  value={rejectModal.comment}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      comment: e.target.value
                    }))
                  }
                />

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setRejectModal({ open: false })
                  }
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

      {modal.open && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  {modal.type === "validate"
                    ? "Valider le dossier"
                    : "Refuser le dossier"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setModal({ open: false, type: null, reason: "" })
                  }
                />
              </div>

              <div className="modal-body">

                {modal.type === "validate" && (
                  <p>Confirmer la validation du dossier ?</p>
                )}

                {modal.type === "refuse" && (
                  <>
                    <p>Indique le motif du refus :</p>

                    <textarea
                      className="form-control"
                      rows="3"
                      value={modal.reason}
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          reason: e.target.value
                        }))
                      }
                      placeholder="Ex : document illisible, incomplet..."
                    />
                  </>
                )}

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setModal({ open: false, type: null, reason: "" })
                  }
                >
                  Annuler
                </button>

                <button
                  className={`btn ${modal.type === "validate"
                    ? "btn-success"
                    : "btn-danger"
                    }`}

                  disabled={
                    modal.type === "refuse" &&
                    !modal.reason?.trim()
                  }

                  onClick={confirmAction}
                >
                  Confirmer
                </button>

              </div>

            </div>
          </div>
        </div>
      )}




    </div>
  );
}