import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../services/apiFetch";
import { BsSpeedometer2, BsFuelPump, BsImage, BsCheckCircle, BsXCircle, BsCalendarCheck } from "react-icons/bs";
import {ENGINE_LABELS} from "../constants/vehicleLabels"
import AvailabilityModal from "../components/AvailabilityModal";
import { useAuth } from "../context/AuthContext";

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

function VehicleCard({ v, openModal, askDelete}) {
    const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const goToDetail = () => {

    navigate(
      isAdmin
        ? `/admin/vehicle/${v.id}`
        : `/vehicle/${v.id}`
    );

  };
  const [dateCheck, setDateCheck] = useState({
    vehicle: null,
    start: "",
    end: ""
  });


  const renderAvailability = (v) => {
    if (v.type === "sale") {
      return (
        <span className={`badge border ${v.is_available ? "border-success text-success" : "border-danger text-danger"}`}>
          {v.is_available ? (
            <><BsCheckCircle className="me-1"/> Disponible</>
          ) : (
            <><BsXCircle className="me-1"/> Indisponible</>
          )}
        </span>
      );
    }

    if (v.type === "rent") {
      return (
        <span
          className="badge border border-dark text-dark"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
    e.stopPropagation();
setDateCheck({ vehicle: v, start: "", end: "" });  }}          
        >
          <BsCalendarCheck className="me-1"/> Vérifier disponibilité
        </span>
      );
    }

    return null;
  };

  const optionalPrice = (v.optional_options || []).reduce(
    (sum, o) => sum + Number(o.price || 0),
    0
  );

  const totalPrice = Number(v.price || 0) + optionalPrice;




  return (
    <div className="col-md-4 mb-4">

      {/* MODAL */}
      <AvailabilityModal
  vehicle={dateCheck.vehicle}
  onClose={() => {
    setDateCheck({ vehicle: null });
  }}
/>


      {/* CARD */}
<div
  className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden hover-card"
  onClick={goToDetail}
  style={{
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  }}
>

  {/* IMAGE */}
  <div style={{ position: "relative" }}>
    <ImageCarousel images={v.images} />

    {/* BADGE TYPE SUR IMAGE */}
    <span
      className={`badge position-absolute top-0 start-0 m-2 px-2 py-1
        ${v.type === "sale"
          ? "bg-success"
          : "bg-primary"
        }`}
    >
      {v.type === "sale" ? "Vente" : "Location"}
    </span>
  </div>

  <div className="card-body d-flex flex-column">

    {/* TITLE */}
    <h5 className="fw-semibold mb-1">
      {v.brand} {v.model}
    </h5>

    {/* PRICE */}
    <div className="mb-2">
      <span className="fw-bold fs-4">{totalPrice}€</span>

      {optionalPrice > 0 && (
        <small className="text-muted ms-2">
          (+{optionalPrice}€ options)
        </small>
      )}
    </div>

    {/* INFOS INLINE */}
    <div className="d-flex justify-content-between text-muted small mb-3 border-top pt-2">

      <span className="d-flex align-items-center gap-1">
        <BsSpeedometer2 size={14} />
        {v.mileage} km
      </span>

      <span className="d-flex align-items-center gap-1">
        <BsFuelPump size={14} />
        <span className="">{ENGINE_LABELS[v.engine_type]  || "-"}</span>
      </span>

      <span className="d-flex align-items-center gap-1">
        📅 {v.year}
      </span>

    </div>

    {/* AVAILABILITY */}
    <div className="mb-3">
      {renderAvailability(v)}
    </div>

    {/* OPTIONS */}
    {v.type === "rent" && (
      <div className="mt-auto">

        {v.included_options?.length > 0 && (
          <div className="mb-2">
            <small className="text-muted d-block mb-1">Inclus</small>

            <div className="d-flex flex-wrap gap-1">
              {v.included_options.map((opt) => (
                <span
                  key={opt.id}
                  className="badge bg-success-subtle text-success border border-success-subtle"
                >
                  <BsCheckCircle className="me-1" />
                  {opt.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {v.optional_options?.length > 0 && (
          <div>
            <small className="text-muted d-block mb-1">Options</small>

            <div className="d-flex flex-wrap gap-1">
              {v.optional_options.map((opt) => (
                <span
                  key={opt.id}  
                  className="badge bg-light text-dark border"
                >
                  +{opt.price ?? 0}€ {opt.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    )}

  </div>
</div>
    
    </div>
  );
}

















export default function VehicleSearch() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    brand: "",
    price_max: "",
    year_min: "",
    mileage_max: ""
  });
const [page, setPage] = useState(1);
const [size] = useState(10);
const [total, setTotal] = useState(0);



const cleanFilters = Object.fromEntries(
  Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
);


const fetchVehicles = async (customPage = page) => {
      window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    
const params = new URLSearchParams({
  ...cleanFilters,
  page: customPage,
  size
});
const baseUrl = isAdmin
  ? "/admin/vehicles/"
  : "/vehicles/";

const url = params
  ? `${baseUrl}?${params}`
  : baseUrl;

const data = await apiFetch(url);

    setVehicles(data.items);
    setTotal(data.total);
    setPage(data.page);

  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};

const totalPages = Math.ceil(total / size);

  useEffect(() => {
    fetchVehicles(1);
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container py-4">

      <h1 className="mb-4 fw-bold">🔎 Recherche de véhicules</h1>

     <div className="card shadow-sm border-0 p-3 mb-4">
  <div className="row g-3">

    {/* TYPE */}
    <div className="col-md-4">
      <label className="form-label">Type</label>
      <select
        className="form-select"
        name="type"
        value={filters.type}
        onChange={handleChange}
      >
        <option value="">Tous</option>
        <option value="sale">Vente</option>
        <option value="rent">Location</option>
      </select>
    </div>

    {/* BRAND */}
    <div className="col-md-4">
      <label className="form-label">Marque</label>
      <input
        className="form-control"
        name="brand"
        placeholder="Ex: BMW"
        value={filters.brand || ""}
        onChange={handleChange}
      />
    </div>

    {/* PRICE MAX */}
    <div className="col-md-4">
      <label className="form-label">Prix max</label>
      <input
        type="number"
        className="form-control"
        name="price_max"
        placeholder="Ex: 20000"
        value={filters.price_max || ""}
        onChange={handleChange}
      />
    </div>

    {/* MILEAGE */}
    <div className="col-md-4">
      <label className="form-label">Kilométrage max</label>
      <input
        type="number"
        className="form-control"
        name="mileage_max"
        placeholder="Ex: 100000"
        value={filters.mileage_max || ""}
        onChange={handleChange}
      />
    </div>

    {/* ENGINE TYPE */}
    <div className="col-md-4">
      <label className="form-label">Motorisation</label>
      <select
        className="form-select"
        name="engine_type"
        value={filters.engine_type || ""}
        onChange={handleChange}
      >
        <option value="">Tous</option>
        <option value="diesel">Diesel</option>
        <option value="petrol">Essence</option>
        <option value="electric">Électrique</option>
        <option value="hybrid">Hybride</option>
      </select>
    </div>

    {/* YEAR */}
    <div className="col-md-4">
      <label className="form-label">Année min</label>
      <input
        type="number"
        className="form-control"
        name="year_min"
        placeholder="Ex: 2020"
        value={filters.year_min || ""}
        onChange={handleChange}
      />
    </div>

  </div>

  <div className="text-end mt-3">
    <button
      className="btn btn-primary px-4"
      onClick={() => fetchVehicles(1)} // 🔥 reset page
    >
      Rechercher
    </button>
  </div>
</div>


     <div className="row g-3">
<div className="row g-3">
  {vehicles.length > 0 ? (
    vehicles.map((v) => (
      <VehicleCard key={v.id} v={v} />
    ))
  ) : (
    <div className="text-center text-muted mt-4 col-12">
      Aucun véhicule trouvé
    </div>
  )}
</div>
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

    </div>
  );
}