import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { uploadToS3 } from "../../services/uploadService";
import { ENGINE_LABELS } from "../../constants/vehicleLabels"
import { useAuth } from "../../context/AuthContext";
import ApplicationTimeline from "../../components/applications/ApplicationTimeline";
import { STATUS } from "../../utils/status";
import { BsCheckCircleFill } from "react-icons/bs";
import PaymentStatus from "../../components/applications/PaymentStatus";
import { computePricing } from "../../utils/pricing";

export default function Application() {

  const navigate = useNavigate();

  const location = useLocation();
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    reason: ""
  });

  const handleDeleteApplication = () => {
    setDeleteModal({ open: true });
  };

  const confirmDelete = async () => {

    try {

      await apiFetch(`/applications/${applicationId}`, {
        method: "DELETE"
      });

      setDeleteModal({ open: false });

      navigate("/applications");

    } catch (err) {

      console.error(err);

      toast.error("Erreur lors de la suppression");

    }
  };

  const {
    id: applicationId,
    vehicleId
  } = useParams();

  // =========================
  // AUTH
  // =========================
  const {
    isClient,
    user
  } = useAuth();

  // =========================
  // ROUTE STATE
  // =========================
  const highlight =
    location.state?.highlight || null;

const stateDates = location.state?.dates || null;

  const stateVehicle =
    location.state?.vehicle || null;

  // =========================
  // STATE
  // =========================
  const [application, setApplication] =
    useState(null);

  const [vehicle, setVehicle] =
    useState(stateVehicle);

  const [selectedDates, setSelectedDates] = useState(stateDates)

    const [uploadErrors, setUploadErrors] = useState({});

  const [tradeInErrors, setTradeInErrors] =
    useState({});

  const [tradeInValue, setTradeInValue] =
    useState(0);

  // =========================
  // MODES
  // =========================
  const isCreateMode = !applicationId;

const isEditable =
  isCreateMode ||
  ["draft", "rejected"].includes(
    application?.status
  );

    

  const fetchVehicle = useCallback(async () => {

    try {

      const data = await apiFetch(
        `/vehicles/${vehicleId}`,
      );

      setVehicle(data);

    } catch (err) {

      console.error(err);

      toast.error(
        "Véhicule introuvable"
      );

      navigate("/", {
        replace: true
      });
    }

  }, [vehicleId, navigate]);

  const [form, setForm] = useState({
    // =========================
    // USER INFOS
    // =========================
    first_name: user.first_name,
    last_name: user.last_name,
    birth_date: "",
    email: user.email,

    phone: "",
    address: "",

    employment_status: "",
    monthly_income: "",
    monthly_expenses: "",
    selected_dates: selectedDates ||{
      start: "",
      end: ""
    },
    // =========================
    // VEHICLE
    // =========================
    vehicle: vehicle || null,

    // =========================
    // OPTIONS
    // =========================
    selected_options: [],
    down_payment: "",
    duration_months: "36",
    discount: "",
    


    // reprise ancien véhicule
    trade_in_enabled: false,
    trade_brand: "",
    trade_model: "",
    trade_year: "",
    trade_mileage: "",
    trade_condition: "good",
    // =========================
    // DOCUMENTS
    // backend compatible
    // =========================
    documents: {
      identity: {
        status: "pending",
        file: null,
        comment: ""
      },

      address_proof: {
        status: "pending",
        file: null,
        comment: ""
      },

      payslip: {
        status: "pending",
        file: null,
        comment: ""
      },

      rib: {
        status: "pending",
        file: null,
        comment: ""
      }
    }
  });

  const vehicleData = form.vehicle;
  const selectedDatesData = form.selected_dates;


const pricing = computePricing(
  form,
  vehicleData,
  selectedDatesData,
  tradeInValue
);

const canUseTradeIn =
  pricing.downPayment < pricing.totalPrice;
  const isOverPaid =
  pricing.rawFinancedAmount < 0;
  // ---------------- VALIDATION PURE ----------------
 const validateTradeIn = (data = form) => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    // =========================
    // BRAND
    // =========================
    if (!data.trade_brand?.trim()) {
      errors.trade_brand = "Marque requise";
    }

    // =========================
    // MODEL
    // =========================
    if (!data.trade_model?.trim()) {
      errors.trade_model = "Modèle requis";
    }

    // =========================
    // YEAR
    // =========================
    const year = Number(data.trade_year);

    if (data.trade_year === "" || data.trade_year == null) {
      errors.trade_year = "Année requise";

    } else if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      errors.trade_year = "Année invalide";
    }

    // =========================
    // MILEAGE
    // =========================
    const mileage = Number(data.trade_mileage);

    if (data.trade_mileage === "" || data.trade_mileage == null) {
      errors.trade_mileage = "Kilométrage requis";

    } else if (
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      errors.trade_mileage = "Kilométrage invalide";
    }

    // =========================
    // CONDITION
    // =========================
    if (!data.trade_condition) {
      errors.trade_condition = "État requis";
    }

    return errors;
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
      (
        today <
        new Date(
          today.getFullYear(),
          birth.getMonth(),
          birth.getDate()
        )
          ? 1
          : 0
      );

    if (age < 18) {
      e.birth_date = "Vous devez avoir au moins 18 ans";
    }
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!f.email?.trim()) {
    e.email = "Email requis";
  } else if (!emailRegex.test(f.email)) {
    e.email = "Email invalide";
  }

  const phoneRegex =
    /^(\+33|0)[1-9](\d{2}){4}$/;

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
      e.monthly_expenses =
        "Les charges doivent être inférieures aux revenus";
    }

    if (!f.employment_status) {
      e.employment_status = "Situation professionnelle requise";
    }

    // =========================
    // FINANCE VALIDATION (FROM computePricing)
    // =========================
    if (pricing.isInvalidFinance) {
      e.financial =
        "Montage financier invalide";
    }
if (isOverPaid) {
      e.financial = "L'apport et la reprise ne peuvent pas dépasser le prix du véhicule";
    }
    if (pricing.downPayment < 0) {
      e.down_payment = "Apport invalide";
    }

    if (
      pricing.totalPrice > 0 &&
      pricing.downPayment > pricing.totalPrice
    ) {
      e.down_payment =
        "L'apport ne peut pas dépasser le prix total";
    }

    // =========================
    // FINANCIAL RISK
    // =========================
    const ratio =
      income > 0
        ? (expenses + pricing.downPayment / 12) /
          income
        : 1;

    if (ratio > 0.5) {
      e.financial_risk =
        "Taux d'endettement trop élevé (recommandé < 50%)";
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

    const existingDoc =
      ref?.documents?.find(d => d.type === key);

    const uploadedFile =
      f.documents?.[key]?.file;

    const approved =
      existingDoc?.status === "validated";

    const pending =
      existingDoc?.status === "pending";

    if (
      !approved &&
      !pending &&
      !uploadedFile
    ) {
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
  ...uploadErrors
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]: value
    };

    setForm(updated);
  };



  const handleTradeInChange = (e) => {

    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]: value
    };

    setForm(updated);

    setTradeInErrors(validateTradeIn(updated));
  };

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



  // ---------------- INPUT ----------------
const handleFileChange = (e, type) => {

  const file = e.target.files?.[0];

  if (!file) return;

  const valid =
    ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
    file.size <= 5 * 1024 * 1024;

  if (!valid) {

    setUploadErrors(prev => ({
  ...prev,
  [`doc_${type}`]:
    "Fichier invalide (PDF/JPG/PNG max 5Mo)"
}));

    return;
  }

 setUploadErrors(prev => {
  const next = { ...prev };
  delete next[`doc_${type}`];
  return next;
});

  setForm(prev => ({
    ...prev,
    documents: {
      ...prev.documents,
      [type]: {
        file,
        status: "pending",
        comment: ""
      }
    }
  }));
};
  // ---------------- FETCH ----------------

  const fetchApplication = useCallback(async (
    id = applicationId
  ) => {
    if (!id) return;

    try {


      const data = await apiFetch(
        `/applications/${id}`,
        {
          method: "GET"
        }
      );
      if (!data || data.deleted === true) {

        navigate("/application-deleted", {
          replace: true
        });

        return;
      }
      setApplication(data);
      setTradeInValue(
        data.trade_in?.estimated_value ?? 0
      );

      // =========================
      // MAP DOCUMENTS
      // =========================
      const documentsMap = {
        identity: {
          status: "pending",
          file: null,
          comment: ""
        },

        address_proof: {
          status: "pending",
          file: null,
          comment: ""
        },

        payslip: {
          status: "pending",
          file: null,
          comment: ""
        },

        rib: {
          status: "pending",
          file: null,
          comment: ""
        }
      };

      (data.documents || []).forEach((doc) => {
        documentsMap[doc.type] = {
          status: doc.status,
          file: null,
          comment: doc.comment || "",
          s3_key: doc.s3_key,
          download_url: doc.download_url
        };
      });

      // =========================
      // MAP OPTIONS
      // =========================
      const optionsSelected =
        data.options_selected || [];

      // =========================
      // MAP FORM
      // =========================
      setForm((prev) => ({
        ...prev,

        first_name: data.first_name || "",
        last_name: data.last_name || "",

        email: data.email || "",
        phone: data.phone || "",

        address: data.address || "",
        birth_date: data.birth_date
          ? data.birth_date.split("T")[0]
          : "",

        monthly_income:
          data.monthly_income || "",

        monthly_expenses:
          data.monthly_expenses || "",

        employment_status:
          data.employment_status || "",

        vehicle: data.vehicle || null,
        selected_dates: data.selected_dates || null,

        // =========================
        // OPTIONS
        // =========================
        optionsSelected,

        // =========================
        // FINANCING
        // =========================
        down_payment:
          data.financing?.down_payment || "",

        duration_months:
          String(
            data.financing?.duration_months || 36
          ),

        discount: data.discount || "",

        // =========================
        // TRADE-IN
        // =========================
        trade_in_enabled:
          !!data.trade_in,

        trade_brand:
          data.trade_in?.brand || "",

        trade_model:
          data.trade_in?.model || "",

        trade_year:
          data.trade_in?.year || "",

        trade_mileage:
          data.trade_in?.mileage || "",

        trade_condition:
          data.trade_in?.condition || "good",


        // =========================
        // DOCUMENTS
        // =========================
        documents: documentsMap
      }));

    } catch (err) {

      console.error(err);

      let message =
        "Erreur lors du chargement";

      if (Array.isArray(err?.data?.detail)) {
        message = err.data.detail
          .map(e => e.message)
          .join(" | ");
      }

      else if (
        typeof err?.data?.detail === "string"
      ) {
        message = err.data.detail;
      }

      else if (
        typeof err?.message === "string"
      ) {
        message = err.message;
      }

      toast.error(message);
      throw err;


    }
  }, [
    applicationId,
    navigate,
  ]);
  useEffect(() => {

    const initialize = async () => {

      // =========================
      // EDIT MODE
      // =========================
      if (applicationId) {

        try {

          await fetchApplication(applicationId);

        } catch (err) {

          // APPLICATION NOT FOUND
          if (err?.status === 404) {

            navigate("/", {
              replace: true
            });

            return;
          }

          console.error(err);
        }

        return;
      }

      // =========================
      // CREATE MODE
      // =========================
      if (!vehicleId) {

        navigate("/", {
          replace: true
        });

        return;
      }
      // =========================
      // VEHICLE
      // =========================
      if (!vehicle) {
        await fetchVehicle();
      }

      // =========================
      // EXISTING DRAFT
      // =========================
      try {

        const existing =
          await apiFetch(
            `/applications/by-vehicle/${vehicleId}`
          );

        if (existing?.id) {

          navigate(
            `/applications/${existing.id}`,
            {
              replace: true
            }
          );
        }

      } catch (_) { }

    };

    initialize();

  }, [applicationId, vehicleId, fetchApplication, fetchVehicle, navigate, vehicle]);

  const handlePayment = async () => {

    try {

      const res = await apiFetch(
        "/payments/checkout",
        {
          method: "POST",

          body: {

            application_id: application.id,

            amount:
              application.vehicle.price,

            product_name:
              `${application.vehicle.brand} ${application.vehicle.model}`,

            email:
              form.email,

            user_id: user.id

          }
        }
      );

      window.location.href =
        res.checkout_url;

    } catch (err) {

      console.error(err);

      toast.error(
        "Erreur paiement"
      );
    }
  };

  useEffect(() => {
    if (highlight === "document_request") {

      setTimeout(() => {
        const el = document.getElementById("documents");

        el?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);

    }
  }, [highlight]);

  // ---------------- SAVE DRAFT - SUBMIT ----------------
  const persistApplication = async ({ mode }) => {

  const isSubmit = mode === "submit";

  if (
    isSubmit &&
    Object.keys(errors).length > 0
  ) {
    toast.error(
      "Veuillez corriger les erreurs"
    );

    return;
  }

    try {

      // =========================
      // DOCUMENTS
      // =========================
      const uploadedDocuments = [];

      const existingDocuments =
        application?.documents || [];

      for (const type of [
        "identity",
        "address_proof",
        "payslip",
        "rib"
      ]) {

        const formDoc = form.documents?.[type];

        const existingDocument =
          existingDocuments.find(
            d => d.type === type
          );

        // =========================
        // DOCUMENT DÉJÀ VALIDÉ
        // =========================
        if (
          existingDocument?.status === "validated"
        ) {

          uploadedDocuments.push({
            type,
            s3_key: existingDocument.s3_key
          });

          continue;
        }

        // =========================
        // NOUVEAU FICHIER
        // =========================
        if (formDoc?.file) {

          const s3_key = await uploadToS3(
            formDoc.file
          );

          uploadedDocuments.push({
            type,
            s3_key
          });

          continue;
        }

        // =========================
        // DOCUMENT PENDING
        // =========================
        if (
          existingDocument?.status === "pending"
        ) {

          uploadedDocuments.push({
            type,
            s3_key: existingDocument.s3_key
          });
        }
      }

      // =========================
      // FINANCING
      // =========================
      const financingPayload = pricing.isSale
        ? {
          down_payment: pricing.downPayment,
          duration_months: pricing.durationMonths
        }
        : null;

      // =========================
      // TRADE IN
      // =========================
      const tradeInPayload =
        form.trade_in_enabled
          ? {
            enabled: true,
            estimated_value: tradeInValue,
            brand: form.trade_brand,
            model: form.trade_model,
            year: Number(form.trade_year),
            mileage: Number(form.trade_mileage),
            condition: form.trade_condition
          }
          :  null;

      // =========================
      // COMMON PAYLOAD
      // =========================
      const payload = {

        // IMPORTANT: always include id (draft OR submit)
        id: applicationId || undefined,

        vehicle_id: form.vehicle?.id,

        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        birth_date: form.birth_date,

        employment_status: form.employment_status,

        monthly_income: Number(form.monthly_income || 0),
        monthly_expenses: Number(form.monthly_expenses || 0),
        selected_dates: form.selected_dates,
        documents: uploadedDocuments,

        total_price: pricing.totalPrice,

        selected_option_ids: pricing.isRent
          ? form.optionsSelected || []
          : [],

        optional_price: pricing.isRent ? pricing.optionalPrice : 0,

        financing: financingPayload,

        trade_in: tradeInPayload,
        application_type: vehicleData?.type
      };

      let res;

      // =========================
      // SAVE DRAFT
      // =========================
      if (!isSubmit) {

        res = await apiFetch("/applications/draft", {
          method: "POST",
          body: payload,
        });

        toast.success("Brouillon sauvegardé");
      }

      // =========================
      // SUBMIT (SINGLE ROUTE)
      // =========================
      else {

        res = await apiFetch("/applications/submit", {
          method: "POST",
          body: payload,
        });

        toast.success("Dossier soumis avec succès");
      }

      // =========================
      // APPLICATION ID
      // =========================
      const finalApplicationId =
        applicationId || res?.id;

      // =========================
      // NAVIGATE
      // =========================
      if (!applicationId && res?.id) {

        navigate(
          `/applications/${res.id}`,
          {
            replace: true
          }
        );
      }

      // =========================
      // REFRESH FULL APPLICATION
      // =========================
      if (finalApplicationId) {

        await fetchApplication(
          finalApplicationId
        );
      }

      return res;

    } catch (err) {

      toast.error(err.message || "Erreur lors de l'enregistrement")


    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await persistApplication({
      mode: "submit"
    });
  };

  const saveDraft = async () => {

    await persistApplication({
      mode: "draft"
    });

  };

const resetTradeIn = {
  trade_in_enabled: false,
  trade_brand: "",
  trade_model: "",
  trade_year: "",
  trade_mileage: "",
  trade_condition: "good",
};


useEffect(() => {
  if (
    pricing.downPayment >= pricing.totalPrice &&
    form.trade_in_enabled
  ) {
    setForm(prev => ({
      ...prev,
      ...resetTradeIn,
    }));
  }
}, [
  pricing.downPayment,
  pricing.totalPrice,
  form.trade_in_enabled,
]);


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
        condition: form.trade_condition
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

  const toggleOption = (optionId) => {

    const id = String(optionId);

    setForm((prev) => {

      const selected =
        prev.optionsSelected || [];

      const exists =
        selected.includes(id);

      return {
        ...prev,

        optionsSelected: exists
          ? selected.filter(
            (x) => x !== id
          )
          : [...selected, id]
      };
    });
  };

  const renderDoc = (type, label) => {

    const doc = application?.documents?.find(
      (d) => d.type === type
    );
    const newFile = form.documents?.[type]?.file;

    const status = doc?.status || "missing";

    const isApproved = status === "validated";

    const error = allErrors?.[`doc_${type}`]; // ✅ IMPORTANT

    return (
      <div className="mb-3 border rounded-4 p-3 bg-white shadow-sm">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-start mb-3">

          <div className="d-flex align-items-center gap-2">

            <i className="bi bi-file-earmark-text text-secondary"></i>

            <strong className="fs-6">{label}</strong>

          </div>

          <span
            className={`badge rounded-pill px-3 py-2 ${status === "validated"
              ? "bg-success"
              : status === "rejected"
                ? "bg-danger"
                : status === "pending"
                  ? "bg-warning text-dark"
                  : "bg-secondary"
              }`}
          >
            {status === "validated"
              ? "Validé"
              : status === "rejected"
                ? "Refusé"
                : status === "pending"
                  ? "En cours"
                  : "Manquant"}
          </span>

        </div>

        {/* INPUT */}
        <input
          type="file"
          className="form-control"
          disabled={!isEditable || isApproved}
          onChange={(e) => handleFileChange(e, type)}
        />

        {/* EXISTING */}
        {doc?.s3_key && !newFile && (
          <div className="mt-2 text-success small">
            ✔ Document déjà envoyé
          </div>
        )}

        {/* NEW FILE */}
        {newFile && (
          <div className="mt-2">

            <span className="text-primary small">
              📄 {newFile.name}
            </span>

            <div>
              <a
                href={URL.createObjectURL(newFile)}
                target="_blank"
                rel="noreferrer"
              >
                Aperçu du fichier sélectionné
              </a>
            </div>

          </div>
        )}

        {/* ❌ VALIDATION ERROR (IMPORTANT) */}
        {error && (
          <div className="text-danger small mt-2">
            {error}
          </div>
        )}

        {/* REJECTION COMMENT */}
        {status === "rejected" && doc?.comment && (
          <div className="alert alert-danger mt-3 py-2">
            ❌ {doc.comment}
          </div>
        )}

        {/* PREVIEW */}
        {doc?.download_url && !newFile && (
          <a href={doc.download_url}>
            Voir le document actuel
          </a>
        )}

      </div>
    );
  };

const isFormValid =
  Object.keys(errors).length === 0 &&
  Object.keys(allErrors).length === 0;






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
          {isCreateMode
            ? "Nouveau dossier"
            : `Dossier #${applicationId}`}
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
                className={`badge bg-${STATUS[application.status]?.color}`}
              >
                {STATUS[application.status]?.label}
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
                      <small className="text-danger">
                        {errors.last_name}
                      </small>
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
                      <small className="text-danger">
                        {errors.first_name}
                      </small>
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
                      <small className="text-danger">
                        {errors.birth_date}
                      </small>
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
                      <small className="text-danger">
                        {errors.phone}
                      </small>
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
                      <small className="text-danger">
                        {errors.email}
                      </small>
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
                      <small className="text-danger">
                        {errors.address}
                      </small>
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

                    <label className="form-label">
                      Revenus mensuels
                    </label>

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

                    <label className="form-label">
                      Charges mensuelles
                    </label>

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

                      <h4 className="fw-semibold mb-1">
                        Financement
                      </h4>

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
                          className={`form-select form-select-lg ${errors.duration_months ? "is-invalid" : ""
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

                      </div>)}
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
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trade_in_enabled: e.target.checked,

                        trade_brand: e.target.checked
                          ? prev.trade_brand
                          : "",

                        trade_model: e.target.checked
                          ? prev.trade_model
                          : "",

                        trade_year: e.target.checked
                          ? prev.trade_year
                          : "",

                        trade_mileage: e.target.checked
                          ? prev.trade_mileage
                          : "",

                        trade_condition: e.target.checked
                          ? prev.trade_condition
                          : "good"
                      }))
                    }
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
                    <h5 className="fw-semibold mb-1">
                      Votre ancien véhicule
                    </h5>
                    <p className="text-muted small mb-0">
                      Estimation automatique de reprise
                    </p>
                  </div>

                  <div className="row g-3">

                    {/* MARQUE */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Marque
                      </label>

                      <input
                        name="trade_brand"
                        value={form.trade_brand ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${tradeInErrors.trade_brand ? "is-invalid" : ""
                          }`}
                        placeholder="Peugeot"
                      />

                      <div className="invalid-feedback">
                        {tradeInErrors.trade_brand}
                      </div>
                    </div>

                    {/* MODELE */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Modèle
                      </label>

                      <input
                        name="trade_model"
                        value={form.trade_model ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${tradeInErrors.trade_model ? "is-invalid" : ""
                          }`}
                        placeholder="308"
                      />

                      <div className="invalid-feedback">
                        {tradeInErrors.trade_model}
                      </div>
                    </div>

                    {/* ANNEE */}
                    <div className="col-md-4">
                      <label className="form-label">
                        Année
                      </label>

                      <input
                        type="number"
                        name="trade_year"
                        value={form.trade_year ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${tradeInErrors.trade_year ? "is-invalid" : ""
                          }`}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />

                      <div className="invalid-feedback">
                        {tradeInErrors.trade_year}
                      </div>
                    </div>

                    {/* KM */}
                    <div className="col-md-4">
                      <label className="form-label">
                        Kilométrage
                      </label>

                      <input
                        type="number"
                        name="trade_mileage"
                        value={form.trade_mileage ?? ""}
                        onChange={handleTradeInChange}
                        className={`form-control ${tradeInErrors.trade_mileage ? "is-invalid" : ""
                          }`}
                        min="0"
                        placeholder="50000"
                      />

                      <div className="invalid-feedback">
                        {tradeInErrors.trade_mileage}
                      </div>
                    </div>

                    {/* CONDITION */}
                    <div className="col-md-4">
                      <label className="form-label">
                        État du véhicule
                      </label>

                      <select
                        name="trade_condition"
                        value={form.trade_condition ?? "good"}
                        onChange={handleTradeInChange}
                        className={`form-select ${tradeInErrors.trade_condition ? "is-invalid" : ""
                          }`}
                      >
                        <option value="">Choisir</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Bon</option>
                        <option value="average">Moyen</option>
                        <option value="poor">Mauvais</option>
                      </select>

                      <div className="invalid-feedback">
                        {tradeInErrors.trade_condition}
                      </div>
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
                        {Number(tradeInValue).toLocaleString()} €
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
                    className={`fw-semibold mb-1 ${highlight === "document_request"
                      ? "text-danger"
                      : ""
                      }`}
                  >
                    Documents
                  </h4>

                  <p className="text-muted small mb-0">
                    Déposez les justificatifs nécessaires
                  </p>

                </div>

                {renderDoc("identity", "Pièce d'identité")}
                {renderDoc("address_proof", "Justificatif de domicile")}
                {renderDoc("payslip", "Bulletin de salaire")}
                {renderDoc("rib", "RIB")}

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
                        className={`badge rounded-pill px-3 py-2 ${vehicleData.type === "sale"
                          ? "bg-success"
                          : "bg-primary"
                          }`}
                      >
                        {vehicleData.type === "sale"
                          ? "Vente"
                          : "Location"}
                      </span>

                      <div className="fw-bold fs-5">
                        {pricing.totalPrice} €
                      </div>

                    </div>

                    <div className="text-muted small d-flex flex-wrap gap-2">

                      {vehicleData.year && (
                        <span>{vehicleData.year}</span>
                      )}

                      {vehicleData.mileage && (
                        <span>
                          • {vehicleData.mileage} km
                        </span>
                      )}

                      {vehicleData.engine_type && (
                        <span>
                          • {ENGINE_LABELS[vehicleData.engine_type]}
                        </span>
                      )}

                    </div>

                    {selectedDatesData?.start && (
                      <div className="border rounded-4 p-3 mt-4 bg-light">

                        <div className="small text-muted mb-2">
                          Période sélectionnée
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                          <span>Début</span>
                          <strong>{new Date(selectedDates.start).toLocaleDateString()}</strong>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span>Fin</span>
                          <strong>{new Date(selectedDates.end).toLocaleDateString()}</strong>
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* OPTIONS */}
              {vehicleData?.type === "rent" && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">

                  <div className="card-body p-4">

                    <h5 className="fw-semibold mb-4">
                      Options
                    </h5>

                    {/* INCLUDED */}
                    {vehicleData.included_options?.length > 0 && (
                      <div className="mb-4">

                        <div className="small text-muted mb-2">
                          Inclus
                        </div>

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

                    {/* OPTIONAL */}
                    {vehicleData.optional_options?.length > 0 && (
                      <div>

                        <div className="small text-muted mb-3">
                          Options disponibles
                        </div>

                        {vehicleData.optional_options.map((opt) => {

                          const checked =
                            form.optionsSelected?.includes(
                              String(opt.id)
                            );

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

                                {(opt.price || opt.price === 0) && (
                                  <div className="small text-muted">
                                    +{opt.price} €
                                  </div>
                                )}

                              </label>

                            </div>
                          );
                        })}

                      </div>
                    )}

                    {/* TOTAL */}
                    <div className="border rounded-4 p-4 mt-4 bg-light">

                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">
                          Base
                        </span>

                        <strong>{pricing.basePrice} €</strong>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          Options
                        </span>

                        <strong>+{pricing.optionalPrice} €</strong>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between align-items-center">

                        <span className="fw-semibold">
                          Total
                        </span>

                        <h4 className="fw-bold mb-0">
                          {pricing.totalPrice} €
                        </h4>

                      </div>

                    </div>

                  </div>
                </div>
              )}
              {/* FINANCING SUMMARY */}
              {vehicleData?.type === "sale" && (
                <div className="card border-0 shadow-sm rounded-4 bg-light">

                  <div className="card-body p-4">

                    <div className="small text-muted mb-3">
                      Estimation financière
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Prix véhicule
                      </span>

                      <strong>
                        {pricing.totalPrice.toLocaleString()} €
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Apport
                      </span>

                      <strong>
                        -{pricing.downPayment.toLocaleString()} €
                      </strong>
                    </div>

                    {tradeInValue > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">
                          Reprise véhicule
                        </span>

                        <strong>
                          -{tradeInValue.toLocaleString()} €
                        </strong>
                      </div>
                    )}

                    <hr />

                    {pricing.isCash ? (

  <div className="border rounded-4 bg-success-subtle p-4 text-center">

    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
      <div className="fw-bold text-success">
        Paiement comptant
      </div>
    </div>

    <div className="text-muted small">
      Aucun financement nécessaire
    </div>

    <div className="mt-3 fw-semibold fs-5">
      Total : {pricing.totalPrice.toLocaleString()} €
    </div>

    <PaymentStatus
      application={application}
      onPay={handlePayment}
    />

  </div>

) : (

  <>
    <div className="d-flex justify-content-between mb-3">
      <span className="fw-semibold">
        Montant financé
      </span>

      <strong>
        {pricing.financedAmount.toLocaleString()} €
      </strong>
    </div>

    <div className="border rounded-4 bg-white p-4 text-center shadow-sm">

      <div className="small text-muted mb-2">
        Mensualité estimée
      </div>

      <h2 className="fw-bold mb-1">
        {pricing.monthlyPayment.toFixed(2).toLocaleString()} €
      </h2>

      <div className="text-muted small">
        / mois sur {pricing.durationMonths} mois
      </div>

      <div className="small text-muted mt-2">
        Sans intérêts
      </div>

      <PaymentStatus
        application={application}
        onPay={handlePayment}
      />

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
                  onClick={() =>
                    setDeleteModal({ open: false })
                  }
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                <p className="mb-0 text-muted">
                  Es-tu sûr de vouloir supprimer ce dossier <strong>brouillon</strong> ?
                  Cette action est irréversible.
                </p>
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0">

                <button
                  className="btn btn-light"
                  onClick={() =>
                    setDeleteModal({ open: false })
                  }
                >
                  Annuler
                </button>

                <button
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                >
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