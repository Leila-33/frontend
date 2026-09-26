import { useState, useEffect, useCallback } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { uploadToS3 } from "../../services/uploadService";
import { ENGINE_TYPES } from "../../constants/vehicleOptions";
import { useAuth } from "../../contexts/AuthContext";
import ApplicationTimeline from "../../components/applications/ApplicationTimeline";
import PaymentStatus from "../../components/applications/PaymentStatus";
import { APPLICATION_STATUSES } from "../../constants/applicationOptions";
import { computePricing } from "../../utils/pricingUtils";
import { BsCheckCircleFill } from "react-icons/bs";
import { formatAmount } from "../../utils/priceUtils";
import {
  DOCUMENT_STATUS,
  REQUIRED_DOCUMENT_TYPES,
  DOCUMENT_LABELS,
} from "../../constants/documentOptions";
import { TRADE_IN_CONDITIONS } from "../../constants/vehicleOptions";
import { validateTradeIn } from "../../utils/tradeInValidation";

export default function Application() {
  const navigate = useNavigate();
  const location = useLocation();

  const { id: applicationId, vehicleId } = useParams();

  const { isClient, user } = useAuth();

  // =========================
  // 2. ROUTE STATE
  // =========================

  const highlight = location.state?.highlight || null;
  const stateDates = location.state?.dates || null;
  const stateVehicle = location.state?.vehicle || null;

  // =========================
  // 3. TOUS LES ÉTATS
  // =========================

  const [application, setApplication] = useState(null);

  const [vehicle, setVehicle] = useState(stateVehicle);

  const [selectedDates, setSelectedDates] = useState(stateDates);

  const [uploadErrors, setUploadErrors] = useState({});

  const [tradeInValue, setTradeInValue] = useState(0);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    reason: "",
  });

  const [filePreviews, setFilePreviews] = useState({});

  const [form, setForm] = useState({
    // =========================
    // INFORMATIONS UTILISATEUR
    // =========================

    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    birth_date: "",
    email: user?.email || "",

    phone: "",
    address: "",

    employment_status: "",
    monthly_income: "",
    monthly_expenses: "",

    // =========================
    // DATES DE LOCATION
    // =========================

    selected_dates: selectedDates || {
      start: "",
      end: "",
    },

    // =========================
    // VÉHICULE
    // =========================

    vehicle: vehicle || null,

    // =========================
    // OPTIONS
    // =========================

    optionsSelected: [],

    // =========================
    // FINANCEMENT
    // =========================

    down_payment: "",
    duration_months: "36",
    discount: "",

    // =========================
    // REPRISE DE VÉHICULE
    // =========================

    trade_in_enabled: false,
    trade_brand: "",
    trade_model: "",
    trade_year: "",
    trade_mileage: "",
    trade_condition: "good",

    // =========================
    // DOCUMENTS
    // =========================

    documents: {
      identity: {
        status: "missing",
        file: null,
        comment: "",
      },

      address_proof: {
        status: "missing",
        file: null,
        comment: "",
      },

      payslip: {
        status: "missing",
        file: null,
        comment: "",
      },

      rib: {
        status: "missing",
        file: null,
        comment: "",
      },
    },
  });

  // =========================
  // 4. CONSTANTES CALCULÉES
  // =========================

  const isCreateMode = !applicationId;

  const isEditable =
    isCreateMode || ["draft", "rejected"].includes(application?.status);

  const vehicleData = form.vehicle;

  const selectedDatesData = form.selected_dates;

  const pricing = computePricing(
    form,
    vehicleData,
    selectedDatesData,
    tradeInValue
  );

  const canUseTradeIn = pricing.downPayment < pricing.totalPrice;

  const isOverPaid = pricing.rawFinancedAmount < 0;

  // =========================
  // 5. FONCTIONS DE RÉCUPÉRATION
  // =========================

  const fetchVehicle = useCallback(async () => {
    try {
      const data = await apiFetch(`/vehicles/${vehicleId}`);

      setVehicle(data);
    } catch (err) {
      console.error(err);

      toast.error("Véhicule introuvable");

      navigate("/", {
        replace: true,
      });
    }
  }, [vehicleId, navigate]);

  const fetchApplication = useCallback(
    async (id = applicationId) => {
      if (!id) {
        return;
      }

      try {
        // =========================
        // RÉCUPÉRATION DU DOSSIER
        // =========================

        const data = await apiFetch(`/applications/${id}`, {
          method: "GET",
        });

        if (!data) {
          navigate("/application-not-found", {
            replace: true,
          });

          return;
        }

        if (data.deleted_at) {
          navigate("/application-deleted", {
            replace: true,
          });

          return;
        }

        // =========================
        // APPLICATION
        // =========================

        setApplication(data);

        // =========================
        // TRADE-IN
        // =========================

        setTradeInValue(data.trade_in?.estimated_value ?? 0);

        // =========================
        // MAP DOCUMENTS
        // =========================

        const documentsMap = Object.fromEntries(
          REQUIRED_DOCUMENT_TYPES.map((type) => [
            type,
            {
              status: "missing",
              file: null,
              comment: "",
            },
          ])
        );

        (data.documents || []).forEach((doc) => {
          if (!documentsMap[doc.type]) {
            return;
          }

          documentsMap[doc.type] = {
            status: doc.status,
            file: null,
            comment: doc.comment || "",
            s3_key: doc.s3_key,
            download_url: doc.download_url,
          };
        });

        // =========================
        // OPTIONS
        // =========================

        const optionsSelected = (data.options_selected || []).map((optionId) =>
          String(optionId)
        );

        // =========================
        // FORM
        // =========================

        setForm((prev) => ({
          ...prev,

          // =========================
          // INFORMATIONS CLIENT
          // =========================

          first_name: data.first_name ?? "",

          last_name: data.last_name ?? "",

          email: data.email ?? "",

          phone: data.phone ?? "",

          address: data.address ?? "",

          birth_date: data.birth_date ? data.birth_date.split("T")[0] : "",

          // =========================
          // INFORMATIONS FINANCIÈRES
          // =========================

          monthly_income: data.monthly_income ?? "",

          monthly_expenses: data.monthly_expenses ?? "",

          employment_status: data.employment_status ?? "",

          // =========================
          // VÉHICULE
          // =========================

          vehicle: data.vehicle ?? null,

          // =========================
          // LOCATION
          // =========================

          selected_dates: data.selected_dates ?? null,

          // =========================
          // OPTIONS
          // =========================

          optionsSelected,

          // =========================
          // FINANCEMENT
          // =========================

          down_payment: data.financing?.down_payment ?? "",

          duration_months: String(data.financing?.duration_months ?? 36),

          // =========================
          // REMISE
          // =========================

          discount: data.discount ?? "",

          // =========================
          // TRADE-IN
          // =========================

          trade_in_enabled: !!data.trade_in,

          trade_brand: data.trade_in?.brand ?? "",

          trade_model: data.trade_in?.model ?? "",

          trade_year: data.trade_in?.year ?? "",

          trade_mileage: data.trade_in?.mileage ?? "",

          trade_condition: data.trade_in?.condition ?? "good",

          // =========================
          // DOCUMENTS
          // =========================

          documents: documentsMap,
        }));
      } catch (err) {
        console.error(err);
        // Redirection spécifique si le dossier est introuvable.
        if (err?.status === 404) {
          navigate("/application-not-found", {
            replace: true,
          });

          return;
        }
        // =========================
        // MESSAGE D'ERREUR
        // =========================

        let message = "Erreur lors du chargement du dossier.";

        if (Array.isArray(err?.data?.detail)) {
          message = err.data.detail.map((error) => error.message).join(" | ");
        } else if (typeof err?.data?.detail === "string") {
          message = err.data.detail;
        } else if (typeof err?.message === "string") {
          message = err.message;
        }

        toast.error(message);

        throw err;
      }
    },
    [applicationId, navigate]
  );

  // =========================
  // 6. FONCTIONS DE VALIDATION
  // =========================

  const isTradeInValid = () => {
    if (!form.trade_in_enabled) return false;

    const year = Number(form.trade_year);
    const mileage = Number(form.trade_mileage);
    const currentYear = new Date().getFullYear();

    return (
      !!form.trade_brand?.trim() &&
      !!form.trade_model?.trim() &&
      !!form.trade_condition &&
      Number.isFinite(year) &&
      year > 1900 &&
      year <= currentYear &&
      Number.isFinite(mileage) &&
      mileage >= 0
    );
  };

  const validate = (f, ref = application) => {
    const e = {};

    const isSale = pricing.isSale;

    // =========================
    // USER INFOS
    // =========================
    if (!f.first_name?.trim()) {
      e.first_name = "Prénom requis";
    }

    if (!f.last_name?.trim()) {
      e.last_name = "Nom requis";
    }

    if (!f.birth_date) {
      e.birth_date = "Date de naissance requise";
    } else {
      const birth = new Date(f.birth_date);
      const today = new Date();

      const age =
        today.getFullYear() -
        birth.getFullYear() -
        (today <
        new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
          ? 1
          : 0);

      if (age < 18) {
        e.birth_date = "Vous devez avoir au moins 18 ans";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!f.email?.trim()) {
      e.email = "Email requis";
    } else if (!emailRegex.test(f.email)) {
      e.email = "Email invalide";
    }

    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;

    if (!f.phone || !phoneRegex.test(f.phone)) {
      e.phone = "Téléphone invalide";
    }

    if (!f.address?.trim()) {
      e.address = "Adresse requise";
    }

    // =========================
    // VEHICLE
    // =========================
    if (!f.vehicle?.id) {
      e.vehicle = "Véhicule requis";
    }

    // =========================
    // SALE RULES
    // =========================
    if (isSale) {
      const income = Number(f.monthly_income);
      const expenses = Number(f.monthly_expenses || 0);

      if (!income || income <= 0) {
        e.monthly_income = "Revenus mensuels requis";
      }

      if (expenses < 0) {
        e.monthly_expenses = "Charges invalides";
      }

      if (income > 0 && expenses >= income) {
        e.monthly_expenses = "Les charges doivent être inférieures aux revenus";
      }

      if (!f.employment_status) {
        e.employment_status = "Situation professionnelle requise";
      }

      // =========================
      // FINANCE VALIDATION (FROM computePricing)
      // =========================
      if (pricing.isInvalidFinance) {
        e.financial = "Montage financier invalide";
      }
      if (isOverPaid) {
        e.financial =
          "L'apport et la reprise ne peuvent pas dépasser le prix du véhicule";
      }
      if (pricing.downPayment < 0) {
        e.down_payment = "Apport invalide";
      }

      if (pricing.totalPrice > 0 && pricing.downPayment > pricing.totalPrice) {
        e.down_payment = "L'apport ne peut pas dépasser le prix total";
      }

      // =========================
      // FINANCIAL RISK
      // =========================
      const ratio =
        income > 0 ? (expenses + pricing.downPayment / 12) / income : 1;

      if (ratio > 0.5) {
        e.financial_risk = "Taux d'endettement trop élevé (recommandé < 50%)";
      }

      // =========================
      // TRADE-IN
      // =========================
      if (f.trade_in_enabled) {
        Object.assign(e, validateTradeIn(f));
      }
    }

    // =========================
    // DOCUMENTS
    // =========================
    const docRequired = (key, label) => {
      const existingDoc = ref?.documents?.find((d) => d.type === key);

      const uploadedFile = f.documents?.[key]?.file;

      const approved = existingDoc?.status === "validated";

      const pending = existingDoc?.status === "pending";

      if (!approved && !pending && !uploadedFile) {
        e[`doc_${key}`] = `${label} requis`;
      }
    };

    docRequired("identity", "Pièce d'identité");
    docRequired("address_proof", "Justificatif domicile");
    docRequired("payslip", "Bulletin salaire");
    docRequired("rib", "RIB");

    return e;
  };

  const errors = validate(form, application);

  const allErrors = {
    ...errors,
    ...uploadErrors,
  };

  // =========================
  // 7. FONCTIONS DE GESTION
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // VALIDATION TECHNIQUE DU FICHIER
  // =========================

  const validateFile = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return "Format invalide (PDF/JPG/PNG uniquement)";
    }

    if (file.size > maxSize) {
      return "Fichier trop volumineux (5 Mo maximum)";
    }

    return null;
  };

  // =========================
  // SÉLECTION D'UN FICHIER
  // =========================

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // =========================
    // VALIDATION DU FICHIER
    // =========================

    const fileError = validateFile(file);

    if (fileError) {
      setUploadErrors((prev) => ({
        ...prev,
        [`doc_${type}`]: fileError,
      }));

      // Permet de sélectionner à nouveau
      // le même fichier après une erreur.
      e.target.value = "";

      return;
    }

    // =========================
    // SUPPRESSION DE L'ERREUR
    // =========================

    setUploadErrors((prev) => {
      const next = { ...prev };

      delete next[`doc_${type}`];

      return next;
    });

    // =========================
    // MISE À JOUR DU FORMULAIRE
    // =========================

    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: {
          file,
          comment: "",
        },
      },
    }));
  };

  // =========================
  // SÉLECTION D'UNE OPTION
  // =========================

  const toggleOption = (optionId) => {
    // Les identifiants sont stockés
    // sous forme de chaînes de caractères.
    const id = String(optionId);

    setForm((prev) => {
      const selected = prev.optionsSelected || [];

      const exists = selected.includes(id);

      return {
        ...prev,

        // Si l'option existe déjà,
        // elle est retirée.
        //
        // Sinon, elle est ajoutée.
        optionsSelected: exists
          ? selected.filter((selectedId) => selectedId !== id)
          : [...selected, id],
      };
    });
  };

  const handleTradeInChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // 8. FONCTIONS MÉTIER
  // =========================
  const handleTradeIn = async () => {
    try {
      if (!form.trade_in_enabled) {
        setTradeInValue(0);
        return;
      }

      const payload = {
        brand: form.trade_brand,
        model: form.trade_model,
        year: Number(form.trade_year),
        mileage: Number(form.trade_mileage),
        condition: form.trade_condition,
      };

      const res = await apiFetch("/trade-in/estimate", {
        method: "POST",
        body: payload,
      });

      setTradeInValue(res.estimated_value || 0);

      toast.success("Estimation reprise mise à jour");
    } catch (err) {
      toast.error("Erreur estimation reprise");
    }
  };

  const handlePayment = async () => {
    try {
      const res = await apiFetch("/payments/checkout", {
        method: "POST",

        body: {
          application_id: application.id,
        },
      });

      window.location.href = res.checkout_url;
    } catch (err) {
      console.error(err);

      toast.error("Erreur paiement");
    }
  };

  const handleDeleteApplication = () => {
    setDeleteModal({ open: true });
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/applications/${applicationId}`, {
        method: "DELETE",
      });

      setDeleteModal({ open: false });

      navigate("/applications");
    } catch (err) {
      console.error(err);

      toast.error("Erreur lors de la suppression");
    }
  };

  // =========================
  // 9. SAUVEGARDE ET SOUMISSION
  // =========================

  // =========================
  // CONSTRUCTION DES DOCUMENTS
  // =========================

  const buildUploadedDocuments = async () => {
    const uploadedDocuments = [];

    const existingDocuments = application?.documents || [];

    for (const type of REQUIRED_DOCUMENT_TYPES) {
      const formDoc = form.documents?.[type];

      const existingDocument = existingDocuments.find(
        (document) => document.type === type
      );

      // =========================
      // DOCUMENT DÉJÀ VALIDÉ
      // =========================

      if (existingDocument?.status === "validated") {
        uploadedDocuments.push({
          type,
          s3_key: existingDocument.s3_key,
        });

        continue;
      }

      // =========================
      // NOUVEAU FICHIER
      // =========================

      if (formDoc?.file) {
        const s3_key = await uploadToS3(formDoc.file);

        uploadedDocuments.push({
          type,
          s3_key,
        });

        continue;
      }

      // =========================
      // DOCUMENT EN ATTENTE
      // =========================

      if (existingDocument?.status === "pending" && existingDocument.s3_key) {
        uploadedDocuments.push({
          type,
          s3_key: existingDocument.s3_key,
        });
      }
    }

    return uploadedDocuments;
  };

  const persistApplication = async ({ mode }) => {
    const isSubmit = mode === "submit";

    // =========================
    // VALIDATION DU FORMULAIRE
    // =========================

    // allErrors inclut les erreurs métier
    // ainsi que les erreurs de fichiers.
    if (isSubmit && Object.keys(allErrors).length > 0) {
      toast.error("Veuillez corriger les erreurs");

      return;
    }

    try {
      // =========================
      // DOCUMENTS
      // =========================

      const uploadedDocuments = await buildUploadedDocuments();

      // =========================
      // FINANCEMENT
      // =========================

      const financingPayload = pricing.isSale
        ? {
            down_payment: pricing.downPayment,
            duration_months: pricing.durationMonths,
          }
        : null;

      // =========================
      // REPRISE DE VÉHICULE
      // =========================

      // La reprise est disponible uniquement
      // pour une vente et si l'utilisateur l'a activée.
      const tradeInPayload =
        pricing.isSale && form.trade_in_enabled
          ? {
              enabled: true,
              estimated_value: tradeInValue,
              brand: form.trade_brand,
              model: form.trade_model,
              year: Number(form.trade_year),
              mileage: Number(form.trade_mileage),
              condition: form.trade_condition,
            }
          : null;

      // =========================
      // PAYLOAD COMMUN
      // =========================

      const payload = {
        // =========================
        // IDENTIFICATION
        // =========================

        ...(applicationId && {
          id: applicationId,
        }),

        vehicle_id: form.vehicle?.id,

        // =========================
        // INFORMATIONS CLIENT
        // =========================

        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        birth_date: form.birth_date,

        // =========================
        // TYPE DE DOSSIER
        // =========================

        application_type: vehicleData?.type,

        // =========================
        // OPTIONS
        // =========================

        // Les options ne sont disponibles
        // que pour une location.
        selected_option_ids: pricing.isRent ? form.optionsSelected || [] : [],

        // =========================
        // FINANCEMENT
        // =========================

        financing: financingPayload,

        // =========================
        // REPRISE
        // =========================

        trade_in: tradeInPayload,

        // =========================
        // LOCATION
        // =========================

        ...(pricing.isRent && {
          selected_dates: form.selected_dates,
        }),

        // =========================
        // INFORMATIONS FINANCIÈRES
        // =========================

        ...(pricing.isSale && {
          employment_status: form.employment_status,

          monthly_income: Number(form.monthly_income || 0),

          monthly_expenses: Number(form.monthly_expenses || 0),
        }),

        // =========================
        // DOCUMENTS
        // =========================

        documents: uploadedDocuments,
      };

      // =========================
      // ENREGISTREMENT
      // =========================

      const endpoint = isSubmit
        ? "/applications/submit"
        : "/applications/draft";

      const res = await apiFetch(endpoint, {
        method: "POST",
        body: payload,
      });

      toast.success(
        isSubmit ? "Dossier soumis avec succès" : "Brouillon sauvegardé"
      );
      // =========================
      // NAVIGATION
      // =========================

      // En mode création, le dossier possède maintenant
      // un ID : on remplace l'URL /applications/new
      // par l'URL du dossier créé.

      if (!applicationId && res?.id) {
        navigate(`/applications/${res.id}`, {
          replace: true,
        });

        return res;
      }

      // =========================
      // ACTUALISATION
      // =========================

      // Recharge le dossier complet afin de synchroniser
      // l'état local avec les données enregistrées en backend.

      if (applicationId) {
        await fetchApplication(applicationId);
      }

      return res;
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    await persistApplication({
      mode: "submit",
    });
  };

  const saveDraft = async () => {
    await persistApplication({
      mode: "draft",
    });
  };

  // =========================
  // 10. FONCTIONS D'AFFICHAGE
  // =========================
  // =========================
  // AFFICHAGE D'UN DOCUMENT
  // =========================

  const renderDoc = (type, label) => {
    // =========================
    // DOCUMENT EXISTANT
    // =========================

    const doc = application?.documents?.find(
      (document) => document.type === type
    );

    // =========================
    // NOUVEAU FICHIER
    // =========================

    const formDoc = form.documents?.[type];

    const newFile = formDoc?.file;

    // =========================
    // STATUT
    // =========================

    const status = newFile ? "pending" : doc?.status || "missing";

    // Récupération de la configuration
    // correspondant au statut.
    const statusConfig = DOCUMENT_STATUS[status] || DOCUMENT_STATUS.missing;

    const isApproved = status === "validated";

    // =========================
    // ERREUR
    // =========================

    const error = allErrors?.[`doc_${type}`];

    // URL temporaire du nouveau fichier.
    const previewUrl = filePreviews[type];

    return (
      <div
        key={type}
        className={`
        mb-3
        border
        rounded-4
        p-3
        bg-white
        shadow-sm
        ${error ? "border-danger" : ""}
      `}
      >
        {/* =========================
          HEADER
          ========================= */}

        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* Icône du statut */}
            <div
              className={`
              rounded-circle
              d-flex
              align-items-center
              justify-content-center
              bg-${statusConfig.color}
              ${statusConfig.color === "warning" ? "text-dark" : "text-white"}
            `}
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
              }}
            >
              <i className={`bi ${statusConfig.icon}`}></i>
            </div>

            {/* Nom et description */}
            <div>
              <strong className="d-block">{label}</strong>

              <small className="text-muted">{statusConfig.description}</small>
            </div>
          </div>

          {/* =========================
            BADGE STATUT
            ========================= */}

          <span
            className={`
            badge
            rounded-pill
            px-3
            py-2
            bg-${statusConfig.color}
            ${statusConfig.color === "warning" ? "text-dark" : ""}
          `}
          >
            <i className={`bi ${statusConfig.icon} me-1`}></i>

            {statusConfig.label}
          </span>
        </div>

        {/* =========================
          INPUT FICHIER
          ========================= */}

        <div className="mt-3">
          <input
            type="file"
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!isEditable || isApproved}
            onChange={(e) => handleFileChange(e, type)}
          />

          <div className="form-text">PDF, JPG ou PNG — 5 Mo maximum</div>
        </div>

        {/* =========================
          NOUVEAU FICHIER
          ========================= */}

        {newFile && (
          <div className="alert alert-primary mt-3 mb-0 py-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-arrow-up"></i>

              <span className="small text-truncate" title={newFile.name}>
                {newFile.name}
              </span>
            </div>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="small d-inline-block mt-1"
              >
                Aperçu du fichier sélectionné
              </a>
            )}
          </div>
        )}

        {/* =========================
          DOCUMENT EXISTANT
          ========================= */}

        {doc?.s3_key && !newFile && (
          <div className="alert alert-light border mt-3 mb-0 py-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-check text-success"></i>

              <span className="small">Document déjà envoyé</span>
            </div>

            {doc.download_url && (
              <a
                href={doc.download_url}
                target="_blank"
                rel="noreferrer"
                className="small d-inline-block mt-1"
              >
                Voir le document actuel
              </a>
            )}
          </div>
        )}

        {/* =========================
          ERREUR
          ========================= */}

        {error && (
          <div
            className="alert alert-danger mt-3 mb-0 py-2 d-flex align-items-center gap-2"
            role="alert"
          >
            <i className="bi bi-exclamation-circle"></i>

            <span className="small">{error}</span>
          </div>
        )}

        {/* =========================
          MOTIF DU REFUS
          ========================= */}

        {status === "rejected" && doc?.comment && (
          <div className="alert alert-danger mt-3 mb-0 py-2">
            <div className="d-flex gap-2">
              <i className="bi bi-chat-left-text"></i>

              <div>
                <strong className="small">Motif du refus</strong>

                <div className="small mt-1">{doc.comment}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================
  // 11. USEEFFECTS
  // =========================

  // =========================
  // SCROLL VERS LES DOCUMENTS
  // =========================

  useEffect(() => {
    if (highlight !== "document_request") {
      return;
    }

    const timeoutId = setTimeout(() => {
      const element = document.getElementById("documents");

      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    // Nettoyage du timeout.
    return () => {
      clearTimeout(timeoutId);
    };
  }, [highlight]);

  // =========================
  // RÉINITIALISATION REPRISE
  // =========================

  useEffect(() => {
    // On ne réinitialise la reprise que si :
    // - un apport est présent ;
    // - l'apport atteint ou dépasse le prix total ;
    // - la reprise est activée.
    if (
      pricing.totalPrice > 0 &&
      pricing.downPayment >= pricing.totalPrice &&
      form.trade_in_enabled
    ) {
      setForm((prev) => ({
        ...prev,

        trade_in_enabled: false,
        trade_brand: "",
        trade_model: "",
        trade_year: "",
        trade_mileage: "",
        trade_condition: "good",
      }));

      // La valeur estimée de la reprise
      // doit également être réinitialisée.
      setTradeInValue(0);
    }
  }, [pricing.downPayment, pricing.totalPrice, form.trade_in_enabled]);

  useEffect(() => {
    const initialize = async () => {
      // =========================
      // EDIT MODE
      // =========================

      if (applicationId) {
        try {
          await fetchApplication(applicationId);
        } catch (err) {
          // Dossier inexistant
          if (err?.status === 404) {
            navigate("/", {
              replace: true,
            });

            return;
          }

          console.error("Erreur lors du chargement du dossier :", err);
        }

        return;
      }

      // =========================
      // CREATE MODE
      // =========================

      if (!vehicleId) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      // =========================
      // VÉHICULE
      // =========================

      if (!vehicle) {
        try {
          await fetchVehicle();
        } catch (err) {
          console.error("Erreur lors du chargement du véhicule :", err);

          // Impossible de continuer sans véhicule
          navigate("/", {
            replace: true,
          });

          return;
        }
      }

      // =========================
      // EXISTING DRAFT
      // =========================

      try {
        const existing = await apiFetch(
          `/applications/by-vehicle/${vehicleId}`
        );

        // Un brouillon existe déjà
        if (existing?.id) {
          navigate(`/applications/${existing.id}`, {
            replace: true,
          });

          return;
        }
      } catch (err) {
        // 404 = aucun brouillon existant.
        // C'est normal en mode création.
        if (err?.status !== 404) {
          console.error("Erreur lors de la recherche du brouillon :", err);
        }
      }
    };

    initialize();
  }, [
    applicationId,
    vehicleId,
    fetchApplication,
    fetchVehicle,
    navigate,
    vehicle,
  ]);

  // =========================
  // GESTION DES APERÇUS
  // =========================

  useEffect(() => {
    const previews = {};

    // Création d'une URL temporaire
    // pour chaque nouveau fichier.
    Object.entries(form.documents || {}).forEach(([type, document]) => {
      if (document?.file) {
        previews[type] = URL.createObjectURL(document.file);
      }
    });

    setFilePreviews(previews);

    // Libération des URLs temporaires
    // lorsque les fichiers changent
    // ou lorsque le composant est démonté.
    return () => {
      Object.values(previews).forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [form.documents]);

  // =========================
  // VALIDITÉ DU FORMULAIRE
  // =========================

  // Le formulaire est valide uniquement
  // lorsqu'aucune erreur n'est présente.
  const isFormValid = Object.keys(allErrors).length === 0;

  // =========================
  // 12. RENDU JSX
  // =========================

  return (
    <div className="container py-5">
      {/* =========================
        HEADER
         ========================= */}
      <div className="text-center mb-5 position-relative">
        {/* =========================
            DELETE BUTTON
        ========================= */}
        {!isCreateMode && isEditable && (
          <button
            type="button"
            className="btn btn-light border rounded-circle shadow-sm position-absolute top-0 end-0 d-flex align-items-center justify-content-center"
            style={{ width: "42px", height: "42px" }}
            onClick={handleDeleteApplication}
            title="Supprimer le dossier"
          >
            <i className="bi bi-trash3 text-danger"></i>
          </button>
        )}

        {/* =========================
         TITLE
        ========================= */}
        <h1 className="fw-bold mb-2">
          {isCreateMode ? "Nouveau dossier" : `Dossier #${applicationId}`}
        </h1>

        <p className="text-muted mb-0">
          {isCreateMode
            ? "Complétez votre demande de financement"
            : isEditable
              ? "Modification du dossier"
              : "Consultation du dossier"}
        </p>

        {/* =========================
              STATUS
          ========================= */}
        {application?.status && (
          <div className="mt-3">
            <span
              className={`badge bg-${APPLICATION_STATUSES[application.status]?.color}`}
            >
              {APPLICATION_STATUSES[application.status]?.label}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* =========================
            MAIN CONTENT
        ========================= */}
          <div className="col-lg-8">
            {/* =========================
              IDENTITÉ
          ========================= */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 p-lg-5">
                <div className="mb-4">
                  <h4 className="fw-semibold mb-1">
                    Informations personnelles
                  </h4>

                  <p className="text-muted small mb-0">
                    Vos coordonnées et informations d'identité
                  </p>
                </div>

                <div className="row g-3">
                  {/* NOM */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="last_name">
                      Nom
                    </label>

                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={form.last_name || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                      autoComplete="family-name"
                    />

                    {errors.last_name && (
                      <small className="text-danger">{errors.last_name}</small>
                    )}
                  </div>

                  {/* PRENOM */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="first_name">
                      Prénom
                    </label>

                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={form.first_name || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                      autoComplete="given-name"
                    />

                    {errors.first_name && (
                      <small className="text-danger">{errors.first_name}</small>
                    )}
                  </div>

                  {/* DATE NAISSANCE */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="birth_date">
                      Date de naissance
                    </label>

                    <input
                      id="birth_date"
                      type="date"
                      name="birth_date"
                      value={form.birth_date || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                    />

                    {errors.birth_date && (
                      <small className="text-danger">{errors.birth_date}</small>
                    )}
                  </div>

                  {/* TELEPHONE */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="phone">
                      Téléphone
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                      autoComplete="tel"
                    />

                    {errors.phone && (
                      <small className="text-danger">{errors.phone}</small>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                      placeholder="ex: client@email.com"
                      autoComplete="email"
                    />

                    {errors.email && (
                      <small className="text-danger">{errors.email}</small>
                    )}
                  </div>

                  {/* ADRESSE */}
                  <div className="col-12">
                    <label className="form-label" htmlFor="address">
                      Adresse
                    </label>

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={form.address || ""}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                      placeholder="Numéro, rue, ville..."
                      autoComplete="street-address"
                    />

                    {errors.address && (
                      <small className="text-danger">{errors.address}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {vehicleData?.type === "sale" && (
              <>
                {/* =========================
                      PROFESSIONNEL
                  ========================= */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <div className="mb-4">
                      <h4 className="fw-semibold mb-1">
                        Situation professionnelle
                      </h4>

                      <p className="text-muted small mb-0">
                        Votre activité actuelle
                      </p>
                    </div>

                    <input
                      name="employment_status"
                      value={form.employment_status}
                      placeholder="CDI, CDD, indépendant..."
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      disabled={!isEditable}
                    />

                    {errors.employment_status && (
                      <small className="text-danger">
                        {errors.employment_status}
                      </small>
                    )}
                  </div>
                </div>

                {/* =========================
                      FINANCIER
                  ========================= */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <div className="mb-4">
                      <h4 className="fw-semibold mb-1">
                        Informations financières
                      </h4>

                      <p className="text-muted small mb-0">
                        Revenus et charges mensuelles
                      </p>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Revenus mensuels</label>

                        <input
                          type="number"
                          name="monthly_income"
                          value={form.monthly_income}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          disabled={!isEditable}
                        />

                        {errors.monthly_income && (
                          <small className="text-danger">
                            {errors.monthly_income}
                          </small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Charges mensuelles</label>

                        <input
                          type="number"
                          name="monthly_expenses"
                          value={form.monthly_expenses}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          disabled={!isEditable}
                        />

                        {errors.monthly_expenses && (
                          <small className="text-danger">
                            {errors.monthly_expenses}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================
                      FINANCEMENT
                  ========================= */}

                {/* FINANCING */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <div className="mb-4">
                      <h4 className="fw-semibold mb-1">Financement</h4>

                      <p className="text-muted small mb-0">
                        Simulez une solution adaptée à votre budget
                      </p>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Apport personnel (€)
                        </label>
                        <input
                          type="number"
                          name="down_payment"
                          value={form.down_payment}
                          onChange={handleChange}
                          className={`form-control form-control-lg ${
                            errors.down_payment ? "is-invalid" : ""
                          }`}
                          disabled={!isEditable}
                          placeholder="Ex : 3000"
                          min="0"
                          max={pricing.totalPrice}
                        />

                        {errors.down_payment && (
                          <div className="invalid-feedback">
                            {errors.down_payment}
                          </div>
                        )}

                        <div className="small text-muted mt-2">
                          Réduit vos mensualités
                        </div>
                      </div>
                      {pricing.financedAmount > 0 && (
                        <div className="col-md-6">
                          <label className="form-label">
                            Durée du financement
                          </label>

                          <select
                            name="duration_months"
                            value={form.duration_months}
                            onChange={handleChange}
                            className={`form-select form-select-lg ${
                              errors.duration_months ? "is-invalid" : ""
                            }`}
                            disabled={!isEditable}
                          >
                            <option value="24">24 mois</option>
                            <option value="36">36 mois</option>
                            <option value="48">48 mois</option>
                            <option value="60">60 mois</option>
                          </select>

                          {errors.duration_months && (
                            <div className="invalid-feedback">
                              {errors.duration_months}
                            </div>
                          )}
                        </div>
                      )}
                      {pricing.financedAmount === 0 && (
                        <div className="alert alert-success py-2 d-flex align-items-center gap-2">
                          <BsCheckCircleFill className="text-success" />
                          Aucun financement nécessaire (paiement comptant)
                        </div>
                      )}
                    </div>
                    {errors.financial && (
                      <div className="alert alert-warning mt-4 mb-0">
                        {errors.financial}
                      </div>
                    )}
                    {errors.financial_risk && (
                      <div className="alert alert-warning mt-4 mb-0">
                        {errors.financial_risk}
                      </div>
                    )}
                  </div>
                </div>

                {/* TRADE-IN */}

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={!!form.trade_in_enabled}
                    disabled={!isEditable || !canUseTradeIn}
                    onChange={(e) => {
                      const enabled = e.target.checked;

                      setForm((prev) => ({
                        ...prev,
                        trade_in_enabled: enabled,

                        ...(enabled
                          ? {}
                          : {
                              trade_brand: "",
                              trade_model: "",
                              trade_year: "",
                              trade_mileage: "",
                              trade_condition: "good",
                            }),
                      }));
                    }}
                  />

                  <label className="form-check-label">
                    Reprise de véhicule
                  </label>
                </div>
              </>
            )}

            {form.trade_in_enabled && (
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Votre ancien véhicule</h5>
                    <p className="text-muted small mb-0">
                      Estimation automatique de reprise
                    </p>
                  </div>

                  <div className="row g-3">
                    {/* MARQUE */}
                    <div className="col-md-6">
                      <label className="form-label">Marque</label>

                      <input
                        name="trade_brand"
                        value={form.trade_brand ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${
                          allErrors.trade_brand ? "is-invalid" : ""
                        }`}
                        placeholder="Peugeot"
                      />

                      <div className="invalid-feedback">
                        {allErrors.trade_brand}
                      </div>
                    </div>

                    {/* MODELE */}
                    <div className="col-md-6">
                      <label className="form-label">Modèle</label>

                      <input
                        name="trade_model"
                        value={form.trade_model ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${
                          allErrors.trade_model ? "is-invalid" : ""
                        }`}
                        placeholder="308"
                      />

                      <div className="invalid-feedback">
                        {allErrors.trade_model}
                      </div>
                    </div>

                    {/* ANNEE */}
                    <div className="col-md-4">
                      <label className="form-label">Année</label>

                      <input
                        type="number"
                        name="trade_year"
                        value={form.trade_year ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${
                          allErrors.trade_year ? "is-invalid" : ""
                        }`}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />

                      <div className="invalid-feedback">
                        {allErrors.trade_year}
                      </div>
                    </div>

                    {/* KM */}
                    <div className="col-md-4">
                      <label className="form-label">Kilométrage</label>

                      <input
                        type="number"
                        name="trade_mileage"
                        value={form.trade_mileage ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${
                          allErrors.trade_mileage ? "is-invalid" : ""
                        }`}
                        min="0"
                        placeholder="50000"
                      />

                      <div className="invalid-feedback">
                        {allErrors.trade_mileage}
                      </div>
                    </div>

                    {/* CONDITION */}
                    <div className="col-md-4">
                      <label className="form-label">État du véhicule</label>

                      <select
                        name="trade_condition"
                        value={form.trade_condition ?? "good"}
                        onChange={handleTradeInChange}
                        className={`form-select ${
                          allErrors.trade_condition ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Choisir</option>

                        {Object.entries(TRADE_IN_CONDITIONS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>

                      {allErrors.trade_condition && (
                        <div className="invalid-feedback">
                          {allErrors.trade_condition}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-dark px-4"
                      onClick={handleTradeIn}
                      disabled={!isTradeInValid()}
                    >
                      Estimer la reprise
                    </button>
                  </div>

                  {/* RESULTAT */}
                  {tradeInValue > 0 && (
                    <div className="mt-4 border rounded-4 p-4 bg-light">
                      <div className="small text-muted mb-2">
                        Valeur estimée de reprise
                      </div>

                      <div className="fw-bold fs-2">
                        {formatAmount(tradeInValue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================
              DOCUMENTS
          ========================= */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <div className="mb-4">
                  <h4
                    id="documents"
                    className={`fw-semibold mb-1 ${
                      highlight === "document_request" ? "text-danger" : ""
                    }`}
                  >
                    Documents
                  </h4>

                  <p className="text-muted small mb-0">
                    Déposez les justificatifs nécessaires
                  </p>
                </div>
                {REQUIRED_DOCUMENT_TYPES.map((type) =>
                  renderDoc(type, DOCUMENT_LABELS[type] ?? type)
                )}
              </div>
            </div>
          </div>

          {/* =========================
                SIDEBAR
            ========================= */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* VEHICLE */}
              {vehicleData && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="small text-muted mb-2">
                      Véhicule sélectionné
                    </div>

                    <h4 className="fw-bold mb-1">
                      {vehicleData.brand} {vehicleData.model}
                    </h4>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          vehicleData.type === "sale"
                            ? "bg-success"
                            : "bg-primary"
                        }`}
                      >
                        {vehicleData.type === "sale" ? "Vente" : "Location"}
                      </span>

                      <div className="fw-bold fs-5">{pricing.totalPrice} €</div>
                    </div>

                    <div className="text-muted small d-flex flex-wrap gap-2">
                      {vehicleData.year && <span>{vehicleData.year}</span>}

                      {vehicleData.mileage && (
                        <span>• {vehicleData.mileage} km</span>
                      )}

                      {vehicleData.engine_type && (
                        <span>• {ENGINE_TYPES[vehicleData.engine_type]}</span>
                      )}
                    </div>

                    {selectedDatesData?.start && (
                      <div className="border rounded-4 p-3 mt-4 bg-light">
                        <div className="small text-muted mb-2">
                          Période sélectionnée
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                          <span>Début</span>
                          <strong>
                            {new Date(
                              selectedDatesData.start
                            ).toLocaleDateString()}
                          </strong>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span>Fin</span>
                          <strong>
                            {new Date(
                              selectedDatesData.end
                            ).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* OPTIONS - LOCATION */}
              {/* ========================= */}

              {vehicleData?.type === "rent" && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-semibold mb-4">Options</h5>

                    {/* ========================= */}
                    {/* OPTIONS INCLUSES */}
                    {/* ========================= */}

                    {vehicleData.included_options?.length > 0 && (
                      <div className="mb-4">
                        <div className="small text-muted mb-2">Inclus</div>

                        <div className="d-flex flex-wrap gap-2">
                          {vehicleData.included_options.map((opt) => (
                            <span
                              key={opt.id}
                              className="badge bg-light text-dark border rounded-pill px-3 py-2"
                            >
                              {opt.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ========================= */}
                    {/* OPTIONS DISPONIBLES */}
                    {/* ========================= */}

                    {vehicleData.optional_options?.length > 0 && (
                      <div>
                        <div className="small text-muted mb-3">
                          Options disponibles
                        </div>

                        {vehicleData.optional_options.map((opt) => {
                          const checked = form.optionsSelected?.includes(
                            String(opt.id)
                          );

                          const price = Number(opt.price ?? 0);

                          const isDaily = opt.billing_type === "daily";

                          return (
                            <div
                              key={opt.id}
                              className="form-check border rounded-3 p-3 mb-2"
                            >
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={checked}
                                disabled={!isEditable}
                                onChange={() => toggleOption(opt.id)}
                              />

                              <label className="form-check-label ms-2">
                                {opt.name}

                                <div className="small text-muted">
                                  +{formatAmount(price)}
                                  {isDaily ? " / jour" : ""}
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ========================= */}
                    {/* RÉCAPITULATIF LOCATION */}
                    {/* ========================= */}

                    <div className="border rounded-4 p-4 mt-4 bg-light">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Base</span>

                        <strong>{formatAmount(pricing.basePrice)}</strong>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Options</span>

                        <strong>+{formatAmount(pricing.optionalPrice)}</strong>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">Total</span>

                        <h4 className="fw-bold mb-0">
                          {formatAmount(pricing.totalPrice)}
                        </h4>
                      </div>

                      {/* Paiement du montant total de la location */}

                      <PaymentStatus
                        application={application}
                        onPay={handlePayment}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* RÉCAPITULATIF - VENTE */}
              {/* ========================= */}

              {vehicleData?.type === "sale" && (
                <div className="card border-0 shadow-sm rounded-4 bg-light">
                  <div className="card-body p-4">
                    <div className="small text-muted mb-3">
                      Estimation financière
                    </div>

                    {/* ========================= */}
                    {/* PRIX DU VÉHICULE */}
                    {/* ========================= */}

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Prix véhicule</span>

                      <strong>{formatAmount(pricing.basePrice)}</strong>
                    </div>

                    {/* ========================= */}
                    {/* OPTIONS */}
                    {/* ========================= */}

                    {pricing.optionalPrice > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Options</span>

                        <strong>+{formatAmount(pricing.optionalPrice)}</strong>
                      </div>
                    )}

                    {/* ========================= */}
                    {/* REMISE */}
                    {/* ========================= */}

                    {pricing.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Remise</span>

                        <strong>-{formatAmount(pricing.discount)}</strong>
                      </div>
                    )}

                    {/* ========================= */}
                    {/* APPORT */}
                    {/* ========================= */}

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Apport</span>

                      <strong>-{formatAmount(pricing.downPayment)}</strong>
                    </div>

                    {/* ========================= */}
                    {/* REPRISE */}
                    {/* ========================= */}

                    {tradeInValue > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Reprise véhicule</span>

                        <strong>-{formatAmount(tradeInValue)}</strong>
                      </div>
                    )}

                    <hr />

                    {/* ========================= */}
                    {/* MONTANT FINANCÉ */}
                    {/* ========================= */}

                    {pricing.isCash ? (
                      <div className="border rounded-4 bg-success-subtle p-4 text-center">
                        <div className="fw-bold text-success mb-2">
                          Paiement comptant
                        </div>

                        <div className="text-muted small">
                          Aucun financement nécessaire
                        </div>

                        <div className="mt-3 fw-semibold fs-5">
                          Total : {formatAmount(pricing.totalPrice)}
                        </div>

                        {/* Paiement du prix total en comptant */}

                        <PaymentStatus
                          application={application}
                          onPay={handlePayment}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between mb-3">
                          <span className="fw-semibold">Montant financé</span>

                          <strong>
                            {formatAmount(pricing.financedAmount)}
                          </strong>
                        </div>

                        <div className="border rounded-4 bg-white p-4 text-center shadow-sm">
                          <div className="small text-muted mb-2">
                            Mensualité estimée
                          </div>

                          <h2 className="fw-bold mb-1">
                            {formatAmount(pricing.monthlyPayment)}
                          </h2>

                          <div className="text-muted small">
                            / mois sur {pricing.durationMonths} mois
                          </div>

                          <div className="small text-muted mt-2">
                            Sans intérêts
                          </div>

                          {/* ========================= */}
                          {/* PAIEMENT DE L'APPORT */}
                          {/* ========================= */}

                          <div className="mt-4 border-top pt-3">
                            <div className="small text-muted mb-1">
                              Acompte à payer
                            </div>

                            <div className="fw-bold fs-5">
                              {formatAmount(pricing.downPayment)}
                            </div>

                            <PaymentStatus
                              application={application}
                              onPay={handlePayment}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              {isEditable && isClient && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-grid gap-3">
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={saveDraft}
                      >
                        {isCreateMode
                          ? "Créer le brouillon"
                          : "Sauvegarder le brouillon"}
                      </button>

                      <button
                        type="submit"
                        className="btn btn-dark py-3"
                        disabled={!isFormValid}
                      >
                        Soumettre le dossier
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {application?.events?.length > 0 && (
        <ApplicationTimeline events={application.events} />
      )}
      {deleteModal.open && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              {/* HEADER */}
              <div className="modal-header border-0">
                <h5 className="modal-title fw-semibold">
                  Supprimer le dossier
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setDeleteModal({ open: false })}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                <p className="mb-0 text-muted">
                  Es-tu sûr de vouloir supprimer ce dossier{" "}
                  <strong>brouillon</strong> ? Cette action est irréversible.
                </p>
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteModal({ open: false })}
                >
                  Annuler
                </button>

                <button className="btn btn-danger px-4" onClick={confirmDelete}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
