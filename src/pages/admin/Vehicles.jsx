import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { uploadImages } from "../../services/uploadService";
import { BsTag, BsCarFront, BsPlusLg, BsCalendar3, BsSpeedometer2, BsCarFrontFill, BsImage, BsCheckCircleFill, BsShieldCheck, BsFuelPump, BsCheckCircle, BsPlusCircle, BsXCircle, BsPencil, BsTrash } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/form_check.css";
/* ================= CAROUSEL ================= */

function ImageCarousel({ images = [] }) {
  const [index, setIndex] = useState(0);
  const safeImages = images.filter(Boolean);
  const hasImages = safeImages.length > 0;

  const btn = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 10,
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 30,
    height: 30,
    cursor: "pointer"
  });

  const next = (e) => {
    e.stopPropagation();
    setIndex((p) => (p + 1) % safeImages.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((p) => (p - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <div
      style={{
        position: "relative",
        height: 200,
        overflow: "hidden",
        background: "#f5f5f5"
      }}
    >
      {hasImages ? (
        <img
          src={safeImages[index]}
          alt="vehicle"
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover"
          }}
        />
      ) : (
        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
          <BsImage size={30} />
        </div>
      )}

      {safeImages.length > 1 && (
        <>
          <button onClick={prev} style={btn("left")}>‹</button>
          <button onClick={next} style={btn("right")}>›</button>
        </>
      )}
    </div>
  );
}


/* ================= CARD ================= */

function VehicleCard({ v, setVehicles, openModal, askDelete }) {
  const { isClient, isAdmin } = useAuth();
  const navigate = useNavigate();
  const goToDetail = () => {

    navigate(
      isAdmin
        ? `/admin/vehicle/${v.id}`
        : `/vehicle/${v.id}`
    );

  };
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [dateErrors, setDateErrors] = useState("");
  const [dateCheck, setDateCheck] = useState({
    vehicle: null,
    start: "",
    end: ""
  });
  const validateDates = (
    start,
    end
  ) => {

    const newErrors = {};

    // =========================
    // REQUIRED
    // =========================
    if (!start) {
      newErrors.start =
        "Date de départ requise";
    }

    if (!end) {
      newErrors.end =
        "Date de retour requise";
    }

    // =========================
    // DATE VALIDATIONS
    // =========================
    if (start && end) {

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const startDate =
        new Date(start);

      const endDate =
        new Date(end);

      // départ >= aujourd'hui
      if (startDate < today) {

        newErrors.start =
          "La date de départ doit être aujourd'hui ou ultérieure";
      }

      // retour > départ
      if (endDate <= startDate) {

        newErrors.end =
          "La date de retour doit être après le départ";
      }
    }

    setDateErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleStartChange = (value) => {
    const newState = { ...dateCheck, start: value };

    setDateCheck(newState);
    validateDates(newState.start, newState.end);
  };

  const handleEndChange = (value) => {
    const newState = { ...dateCheck, end: value };

    setDateCheck(newState);
    validateDates(newState.start, newState.end);
  };

  const [availability, setAvailability] = useState(null);
 const setAvailabilityFunction = async (vehicle, value) => {
  try {

    const updated = await apiFetch(
      `/admin/vehicles/${vehicle.id}/availability`,
      {
        method: "PATCH",
        body: { value }
      }
    );

    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicle.id ? updated : v
      )
    );

    toast.success(
      value
        ? "Véhicule activé"
        : "Véhicule désactivé"
    );

  } catch (err) {
    toast.error(err.message || "Erreur disponibilité");
  } 
};

const renderAvailability = (v) => {
  if (v.type !== "sale") return null;

  const isAvailable = v.is_available;

  const badge = (
    <span className="d-flex align-items-center gap-2">
      {isAvailable ? (
        <span className="text-success d-flex align-items-center">
          <BsCheckCircle className="me-1" />
          Disponible
        </span>
      ) : (
        <span className="text-danger d-flex align-items-center">
          <BsXCircle className="me-1" />
          Indisponible
        </span>
      )}
    </span>
  );

  if (isClient) return badge;

  return (
    <div
      className="d-flex align-items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {badge}

      {/* SWITCH NEUTRE */}
      <div className="form-check form-switch m-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={isAvailable}
          onChange={(e) => {
            setAvailabilityFunction(v, e.target.checked);
          }}
        />
      </div>
    </div>
  );
};

  const optionalPrice = (v.optional_options || []).reduce(
    (sum, o) => sum + Number(o.price || 0),
    0
  );

  const totalPrice = Number(v.price || 0) + optionalPrice;

  const handleCheck = async () => {
    try {
      const { vehicle, start, end } = dateCheck;

      if (!start || !end) return;

      const res = await apiFetch("/reservations/check", {
        method: "POST",
        body: {
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
        }
      });

      setAvailability(res.available);

    } catch (err) {
      toast.error(err.message);
    }
  };


  return (
    <div className="col-md-4 mb-4">

      {/* MODAL */}
      {dateCheck.vehicle && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4 rounded-4">

              <h5 className="mb-3">Disponibilité</h5>

              <input
                type="date"
                className="form-control mb-2"
                value={dateCheck.start}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  handleStartChange(e.target.value)
                }
              />

              {dateErrors.start && (
                <small className="text-danger">
                  {dateErrors.start}
                </small>
              )}

              <input
                type="date"
                className="form-control mb-2"
                value={dateCheck.end}
                min={dateCheck.start}   // 🔥 bloque dates avant start
                onChange={(e) => handleEndChange(e.target.value)}
              />

              {dateErrors.end && (
                <small className="text-danger">{dateErrors.end}</small>
              )}
              <button
                className="btn btn-dark w-100"
                onClick={handleCheck}
                disabled={
                  !dateCheck.start ||
                  !dateCheck.end ||
                  Object.keys(dateErrors).length > 0
                }
              >
                Vérifier
              </button>

              {availability !== null && (
                <div className="mt-3 text-center">
                  {availability ? (
                    <span className="text-success fw-bold">
                      <BsCheckCircle /> Disponible
                    </span>
                  ) : (
                    <span className="text-danger fw-bold">
                      <BsXCircle /> Indisponible
                    </span>
                  )}
                </div>
              )}

              <button
                className="btn btn-outline-dark mt-3 w-100"
                onClick={() => {
                  setDateCheck({ vehicle: null });
                  setAvailability(null);
                }}
              >
                Fermer
              </button>

            </div>
          </div>
        </div>
      )}


      {/* CARD */}
      <div
        className="card border-0 shadow-sm rounded-4 h-100 vehicle-card"
        style={{
          cursor: "pointer",
          transition: "all .25s ease"
        }}
        onClick={goToDetail}
      >
        <ImageCarousel images={v.images} />

        <div className="card-body d-flex flex-column">

          {/* TYPE + DISPO */}
          <div className="d-flex justify-content-between align-items-start mb-3">

            <span
              className={`badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2
        ${v.type === "sale"
                  ? "bg-success-subtle text-success"
                  : "bg-primary-subtle text-primary"
                }`}
            >
              <BsTag />
              {v.type === "sale" ? "Vente" : "Location"}
            </span>

            {renderAvailability(v)}
          </div>

          {/* TITRE */}
          <div className="mb-3">
            <h5 className="fw-bold mb-0">
              {v.brand}
            </h5>

            <div className="text-muted">
              {v.model}
            </div>
          </div>

          {/* INFOS PRINCIPALES */}
          <div className="d-flex flex-wrap gap-2 mb-3">

            <span className="badge bg-light text-dark border">
              <BsCalendar3 className="me-1" />
              {v.year}
            </span>

            <span className="badge bg-light text-dark border">
              <BsSpeedometer2 className="me-1" />
              {v.mileage?.toLocaleString()} km
            </span>

            {v.engine_type && (
              <span className="badge bg-light text-dark border">
                <BsFuelPump className="me-1" />
                {v.engine_type}
              </span>
            )}

            <span className="badge bg-light text-dark border">
              <BsShieldCheck className="me-1" />
              {v.condition === "new" ? "Neuf" : "Occasion"}
            </span>

          </div>

          {/* GARANTIE */}
          {v.warranty_plan && (
            <div className="mb-3">

              <span className="badge bg-warning-subtle text-warning-emphasis border px-3 py-2 rounded-pill">
                <BsShieldCheck className="me-1" />
                {v.warranty_plan.name}
              </span>

            </div>
          )}

          {/* OPTIONS LOCATION */}
          {v.type === "rent" && (
            <>
              {v.included_options?.length > 0 && (
                <div className="mb-3">

                  <small className="text-muted fw-semibold d-block mb-2">
                    Inclus
                  </small>

                  <div className="d-flex flex-wrap gap-2">

                    {v.included_options.map((opt) => (
                      <span
                        key={opt.id}
                        className="badge bg-success-subtle text-success border"
                      >
                        <BsCheckCircleFill className="me-1" />
                        {opt.name}
                      </span>
                    ))}

                  </div>
                </div>
              )}

              {v.optional_options?.length > 0 && (
                <div className="mb-3">

                  <small className="text-muted fw-semibold d-block mb-2">
                    Options disponibles
                  </small>

                  <div className="d-flex flex-wrap gap-2">

                    {v.optional_options.map((opt) => (
                      <span
                        key={opt.id}
                        className="badge bg-light text-dark border"
                      >
                        <BsPlusCircle className="me-1" />
                        {opt.name}
                        {opt.price ? ` (+${opt.price}€)` : ""}
                      </span>
                    ))}

                  </div>

                </div>
              )}
            </>
          )}

          {/* PRIX */}
          <div className="mt-auto pt-3 border-top">

            <div className="mb-3">

              <div className="fs-3 fw-bold text-dark">
                {totalPrice?.toLocaleString()} €
                {v.type === "rent" && (
                  <span className="fs-6 text-muted fw-normal ms-2">
                    / jour
                  </span>
                )}
              </div>

              {optionalPrice > 0 && (
                <small className="text-muted">
                  dont {optionalPrice}€ d'options
                </small>
              )}

            </div>

            {/* ACTIONS */}
            <div className="d-flex justify-content-between align-items-center">

              <div className="text-muted small">
                <BsCarFront className="me-1" />
                {v.license_plate}
              </div>

              <div className="d-flex gap-2">

                <button
                  type="button"
                  className="btn btn-light btn-sm border"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(v);
                  }}
                  title="Modifier"
                >
                  <BsPencil />
                </button>

                <button
                  type="button"
                  className="btn btn-light btn-sm border text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVehicleToDelete(v);
                  }}
                  title="Supprimer"
                >
                  <BsTrash />
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
      {/* MODALE DELETE VEHICULE */}

      {vehicleToDelete && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">

              <h5 className="mb-3">Supprimer ce véhicule ?</h5>

              <p className="text-muted">
                {vehicleToDelete.brand} {vehicleToDelete.model}
              </p>

              <div className="d-flex justify-content-center gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setVehicleToDelete(null)}
                >
                  Annuler
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => askDelete(v)}>
                  Supprimer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= PAGE ================= */
export default function AdminVehicles() {
  const [warrantyPlans, setWarrantyPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [options, setOptions] = useState([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(""); // ✅ important

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    type: "sale",
    mileage: "",
    year: "",
    description: "",
    engine_type: "",
    equipments: [],
    condition: "used",
    warranty_plan_id: "",
    images: [],
    included_options: [],
    optional_options: [],
    license_plate: ""
  });

  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / size);
  /* ================= FETCH ================= */

  const fetchVehicles = async (customPage = page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const rawFilters = {
        search,
        type: filterType,
        license_plate: licensePlate,
        page: customPage,
        size
      };

      const cleanFilters = Object.fromEntries(
        Object.entries(rawFilters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );

      const params = new URLSearchParams(cleanFilters);

      const data = await apiFetch(`/admin/vehicles/?${params}`);

      setVehicles(data.items);
      setTotal(data.total);
      setPage(data.page);

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const fetchOptions = async () => {
    try {
      const data = await apiFetch("/admin/options/active");
      setOptions(data);
    } catch (err) {
      toast.error(err.message);
    }
  };
  /* ================= DELETE VEHICLE ================= */

  const handleDelete = async (vehicle) => {
    try {
      await apiFetch(`/admin/vehicles/${vehicle.id}`, {
        method: "DELETE"
      });

      toast.success("Véhicule supprimé ✅");
      await fetchVehicles();

    } catch (err) {
      toast.error(err.message);
    }
  };
  /* ================= EFFECT ================= */

  // ✅ fetch options une seule fois
  useEffect(() => {
    fetchOptions();
    fetchPlans();
  }, []);

  // ✅ fetch vehicles avec debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVehicles(1);
    }, 1000);

    return () => clearTimeout(delay);
  }, [search, filterType, licensePlate]);




  /* ================= VALIDATION ================= */

  const validate = (data) => {
    const e = {};
    const currentYear = new Date().getFullYear();

    if (!data.brand?.trim()) {
      e.brand = "Marque requise";
    }

    if (!data.model?.trim()) {
      e.model = "Modèle requis";
    }

    if (data.price === "" || data.price === null || Number(data.price) <= 0) {
      e.price = "Prix invalide";
    }

    if (data.mileage === "" || data.mileage === null || Number(data.mileage) < 0) {
      e.mileage = "Kilométrage invalide";
    }

    if (
      data.year === "" ||
      data.year === null ||
      Number(data.year) < 1900 ||
      Number(data.year) > currentYear
    ) {
      e.year = "Année invalide";
    }

    // ✅ ENGINE TYPE
    if (!data.engine_type) {
      e.engine_type = "Type de moteur requis";
    }
    
     if (data.type === "sale" && !data.warranty_plan_id) {
  e.warranty_plan_id = "Une garantie est obligatoire pour un véhicule en vente";
}

    if (!data.license_plate?.trim()) {
      e.license_plate = "Immatriculation requise";
    } else {
      const plateRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;

      const normalized = data.license_plate.toUpperCase().replace(/\s/g, "");

      if (!plateRegex.test(normalized)) {
        e.license_plate = "Format invalide (ex: AB-123-CD)";
      }
    }
    return e;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    let val = value;

    if (name === "equipments") {
      val = value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);
    }

    const updated = {
      ...form,
      [name]: val
    };

    // =========================
    // UX RULE: RENT → NO WARRANTY
    // =========================
    if (name === "type" && value === "rent") {
      updated.warranty_plan_id = null;
    }

    // =========================
    // RESET OPTIONS ON TYPE CHANGE
    // =========================
    if (name === "type" && value === "sale") {

      updated.included_options = [];
      updated.optional_options = [];
    }

    setForm(updated);
    setErrors(validate(updated));
  };

  const hasWarranty =
  form.type !== "sale" ||
  !!form.warranty_plan_id;

const isFormValid =
  Object.keys(errors).length === 0 &&
  form.brand?.trim() &&
  form.model?.trim() &&
  Number(form.price) > 0 &&
  Number(form.mileage) >= 0 &&
  Number(form.year) > 1900 &&
  form.engine_type &&
  form.license_plate?.trim() &&
  hasWarranty;
  
  /* ================= MODAL ================= */

  const openModal = (v = null) => {
    if (v) {
      setEditId(v.id);
      console.log(v.license_plate)
      setForm({
        brand: v.brand ?? "",
        model: v.model ?? "",
        price: v.price ?? "",
        type: v.type ?? "sale",
        mileage: v.mileage ?? "",
        year: v.year ?? "",
        license_plate: v.license_plate ?? "",
        description: v.description ?? "",
        engine_type: v.engine_type ?? "",
        warranty_plan_id: v.warranty_plan?.id ?? "",

        // ✅ tableau → string pour textarea
        equipments: Array.isArray(v.equipments)
          ? v.equipments.join(", ")
          : "",

        condition: v.condition ?? "used",

        // ⚠️ IMPORTANT
        images: [], // seulement les nouvelles images

        included_options: v.included_options?.map(o => o.id) ?? [],
        optional_options: v.optional_options?.map(o => o.id) ?? []
      });

      // ✅ preview = URLs serveur uniquement
      setPreview(
        v.images?.map(img =>
          typeof img === "string" ? img : img.url
        ) ?? []
      );
    } else {
      setEditId(null);

      setForm({
        brand: "",
        model: "",
        price: "",
        type: "sale",
        mileage: "",
        year: "",
        license_plate: "",
        description: "",
        engine_type: "",
        warranty_plan_id: "",
        equipments: "",
        condition: "used",
        images: [],
        included_options: [],
        optional_options: []
      });

      setPreview([]);
    }

    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  /* ================= IMAGES ================= */

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    const urls = files.map(f => URL.createObjectURL(f));

    setPreview(prev => [...prev, ...urls]);

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };
  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      // =========================
      // 1. UPLOAD S3 (retour = KEYS)
      // =========================
      const files = form.images.filter(img => img instanceof File);

      const uploadedKeys = files.length > 0
        ? await uploadImages(files)
        : [];

      // images déjà existantes (déjà des KEYS)
      const existingKeys = form.images.filter(
        img => typeof img === "string"
      );

      const imageKeys = [...existingKeys, ...uploadedKeys];

      // =========================
      // 2. PAYLOAD CLEAN (KEYS ONLY)
      // =========================
      const payload = {
  brand: form.brand,
  model: form.model,
  price: Number(form.price),
  type: form.type,
  mileage: Number(form.mileage),
  year: Number(form.year),
  condition: form.condition,

  description: form.description || null,
  engine_type: form.engine_type || null,
  warranty_plan_id: form.warranty_plan_id || null,

  equipments: form.equipments || [],
  included_options: form.included_options || [],
  optional_options: form.optional_options || [],

  images: imageKeys,
  license_plate: form.license_plate,

};

      // =========================
      // 3. API CALL
      // =========================
      await apiFetch(
        editId ? `/admin/vehicles/${editId}` : "/admin/vehicles",
        {
          method: editId ? "PUT" : "POST",
          body: payload,
        }
      );

      toast.success("Véhicule enregistré ✅");
      await fetchVehicles();
      closeModal();

    } catch (err) {
      toast.error(err.message || "Erreur sauvegarde véhicule");
    }
  };


  const fetchPlans = async () => {
    try {
      const data = await apiFetch("/admin/warranty-plans");
      setWarrantyPlans(data);
    } catch (err) {
      toast.error(err.message || "Erreur chargement plans");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

  {/* TITLE */}
  <div>
    <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
      <BsCarFrontFill />
      Véhicules
    </h2>

    <small className="text-muted">
      Gestion du catalogue automobile
    </small>
  </div>

  {/* ACTION */}
  <button
    className="btn btn-primary d-flex align-items-center gap-2 px-3"
    onClick={() => openModal()}
  >
    <BsPlusLg />
    Ajouter
  </button>

</div>

      {/* FILTERS */}
      <div className="row mb-3">

        {/* 🔎 RECHERCHE TEXTE */}
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Marque ou modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 🚗 RECHERCHE IMMATRICULATION */}
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Immatriculation (AB-123-CD)"
            value={licensePlate}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/\s/g, "");

              setLicensePlate(value);
            }}
          />
        </div>

        {/* 🔽 TYPE */}
        <div className="col-md-4">
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="sale">Vente</option>
            <option value="rent">Location</option>
          </select>
        </div>

      </div>
      {/* LISTE VEHICULES */}
      <div className="row">
        {vehicles.length === 0 ? (
          <p>Aucun véhicule trouvé</p>
        ) : (
          vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              v={v}
              setVehicles={setVehicles}
              openModal={openModal}
              askDelete={handleDelete} // à remplacer
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">

            {/* PREV */}
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => fetchVehicles(page - 1)}
              >
                ←
              </button>
            </li>

            {/* NUMBERS */}
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => fetchVehicles(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            {/* NEXT */}
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => fetchVehicles(page + 1)}
              >
                →
              </button>
            </li>

          </ul>
        </nav>
      )}
      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">

              <h5>{editId ? "Modifier" : "Ajouter"} véhicule</h5>

              <form onSubmit={handleSubmit}>

                <div className="row g-3">

                  {/* =========================
        BASIC INFO
    ========================= */}

                  <div className="col-12">
                    <h6 className="text-muted">Informations générales</h6>
                  </div>

                  {/* BRAND */}
                  <div className="col-md-6">
                    <label className="form-label">Marque</label>
                    <input
                      name="brand"
                      className={`form-control ${errors.brand ? "is-invalid" : ""}`}
                      value={form.brand}
                      onChange={handleChange}
                    />
                    {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                  </div>

                  {/* MODEL */}
                  <div className="col-md-6">
                    <label className="form-label">Modèle</label>
                    <input
                      name="model"
                      className={`form-control ${errors.model ? "is-invalid" : ""}`}
                      value={form.model}
                      onChange={handleChange}
                    />
                    {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                  </div>

                  {/* PRICE */}
                  <div className="col-md-6">
                    <label className="form-label">Prix (€)</label>
                    <input
                      name="price"
                      type="number"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      value={form.price}
                      onChange={handleChange}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>

                  {/* TYPE */}
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="sale">Vente</option>
                      <option value="rent">Location</option>
                    </select>
                  </div>

                  {/* MILEAGE */}
                  <div className="col-md-6">
                    <label className="form-label">Kilométrage</label>
                    <input
                      name="mileage"
                      type="number"
                      className={`form-control ${errors.mileage ? "is-invalid" : ""}`}
                      value={form.mileage}
                      onChange={handleChange}
                    />
                    {errors.mileage && <div className="invalid-feedback">{errors.mileage}</div>}
                  </div>

                  {/* YEAR */}
                  <div className="col-md-6">
                    <label className="form-label">Année</label>
                    <input
                      name="year"
                      type="number"
                      className={`form-control ${errors.year ? "is-invalid" : ""}`}
                      value={form.year}
                      onChange={handleChange}
                    />
                    {errors.year && <div className="invalid-feedback">{errors.year}</div>}
                  </div>

                  {/* LICENSE */}
                  <div className="col-md-6">
                    <label className="form-label">Immatriculation</label>
                    <input
                      name="license_plate"
                      className={`form-control ${errors.license_plate ? "is-invalid" : ""}`}
                      value={form.license_plate || ""}
                      onChange={handleChange}
                    />
                    {errors.license_plate && (
                      <div className="invalid-feedback d-block">{errors.license_plate}</div>
                    )}
                  </div>

                  {/* ENGINE */}
                  <div className="col-md-6">
                    <label className="form-label">Moteur</label>
                    <select
                      name="engine_type"
                      className="form-select"
                      value={form.engine_type || ""}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="diesel">Diesel</option>
                      <option value="petrol">Essence</option>
                      <option value="electric">Électrique</option>
                      <option value="hybrid">Hybride</option>
                    </select>
                      <div className="invalid-feedback d-block">{errors.engine_type}</div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* =========================
        WARRANTY
    ========================= */}

                  {form.type === "sale" && (
                    <div className="col-12">
                      <div className="card border-primary">
                        <div className="card-body">

                          <h6 className="mb-3">Garantie</h6>

                          <select
                            name="warranty_plan_id"
                            className="form-select"
                            value={form.warranty_plan_id || ""}
                            onChange={handleChange}
                          >
                            <option value="">Aucune garantie</option>

                            {warrantyPlans?.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                🛡 {plan.name} — {plan.duration_months} mois — {plan.price}€
                              </option>
                            ))}
                          </select>

                          {form.warranty_plan_id && (
                            <div className="alert alert-info mt-2 mb-0 py-2">
                              ✔ Garantie active
                            </div>
                          )}

                        </div>
                      </div>
                      {errors.warranty_plan_id && (
                      <div className="invalid-feedback d-block">{errors.warranty_plan_id}</div>
                    )}
                    </div>
                  )}

                  {/* =========================
        OPTIONS RENT
    ========================= */}

                  {/* OPTIONS (uniquement si location) */}
{/* OPTIONS (uniquement si location) */}
{form.type === "rent" && (
  <>
    {/* OPTIONS INCLUSES */}
    <h6>Options incluses</h6>

    {options
      .filter((opt) => opt.type === "included")
      .map((opt) => (
        <div key={opt.id}>
          <input
            type="checkbox"
            checked={form.included_options.includes(opt.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setForm((prev) => ({
                  ...prev,
                  included_options: [...prev.included_options, opt.id]
                }));
              } else {
                setForm((prev) => ({
                  ...prev,
                  included_options: prev.included_options.filter(
                    (id) => id !== opt.id
                  )
                }));
              }
            }}
          />

          {opt.name}
        </div>
      ))}

    {/* OPTIONS OPTIONNELLES */}
    <h6 className="mt-3">Options optionnelles</h6>

    {options
      .filter((opt) => opt.type === "custom")
      .map((opt) => (
        <div key={opt.id}>
          <input
            type="checkbox"
            checked={form.optional_options.includes(opt.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setForm((prev) => ({
                  ...prev,
                  optional_options: [...prev.optional_options, opt.id]
                }));
              } else {
                setForm((prev) => ({
                  ...prev,
                  optional_options: prev.optional_options.filter(
                    (id) => id !== opt.id
                  )
                }));
              }
            }}
          />

          {opt.name} (+{opt.price} €)
        </div>
      ))}
  </>
)}
                  {/* IMAGES */}
                  <div className="col-12">
                    <label className="form-label">Images</label>
                    <input
                      type="file"
                      multiple
                      className="form-control"
                      onChange={handleImages}
                    />
                  </div>

                </div>

                {/* =========================
      ACTIONS
  ========================= */}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>

                  <button className="btn btn-primary" disabled={!isFormValid} type="submit">
                    {editId ? "Modifier" : "Ajouter"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}