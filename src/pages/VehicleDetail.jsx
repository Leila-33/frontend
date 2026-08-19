import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../services/apiFetch";
import { ENGINE_LABELS } from "../constants/vehicleLabels"
import { BsCalendar, BsSpeedometer2, BsFuelPump } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import TestDriveModal from "../components/test-drives/TestDriveModal";
import LeadFormModal from "../components/sales/LeadFormModal";
import "../styles/badges.css";
import Calendar from "../components/Calendar";
import { useCalendar } from "../hooks/useCalendar";
import "../styles/modalvehicledetail.css";
import { computePricing } from "../utils/pricing";
import InspectionStepper from "../components/InspectionStepper";
import DetailLayout from "../layouts/DetailLayout";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isClient, isAdmin, isEmployee, user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [interestStatus, setInterestStatus] = useState(false);

  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
const [showLeadModal, setShowLeadModal] = useState(false);
useEffect(() => {

  const loadVehicle = async () => {

    try {

      const data = await apiFetch(
        `/vehicles/${id}`
      );

      setVehicle(data);

    } catch (err) {

      console.error(err);

      toast.error(
        err.message || "Erreur chargement véhicule"
      );

    }

  };



  const loadFavoriteStatus = async () => {

    try {

      const res = await apiFetch(
        `/favorites/me`
      );


      const exists = (
        res.items || []
      ).some(
        f => f.vehicle.id === id
      );


      setIsFavorite(exists);

    } catch (err) {

      console.error(err);

    }

  };



  const loadInterestStatus = async () => {

    try {

      const data = await apiFetch(
        `/vehicles/${id}/interest-status`
      );


      setInterestStatus(data);


    } catch (err) {

      console.error(err);

    }

  };



  const load = async () => {

    await loadVehicle();


    if (isClient) {

      await Promise.all([
        loadFavoriteStatus(),
        loadInterestStatus()
      ]);

    }

  };


  load();


}, [id, isClient]);





  useEffect(() => {

    if (vehicle?.type !== "rent") return;

    const loadAvailability = async () => {
      try {

        const data = await apiFetch(
          `/vehicles/${vehicle.id}/unavailable-dates`
        );

        setUnavailableRanges(data);

      } catch (err) {

        console.error(err);
        toast.error(err.message);

      }
    };

    loadAvailability();

  }, [vehicle?.id, vehicle?.type]);




const toggleFavorite = async () => {

  if (favLoading) return;

  const previousState = isFavorite;

  try {

    setFavLoading(true);


    // Optimistic update
    setIsFavorite(!previousState);

    if (previousState) {

      await apiFetch(
        `/favorites/${id}`,
        {
          method: "DELETE"
        }
      );


      toast.info(
        "Retiré des favoris"
      );


    } else {


      await apiFetch(
        `/favorites/${id}`,
        {
          method: "POST"
        }
      );


      toast.success(
        "Ajouté aux favoris ❤️"
      );

    }


  } catch (err) {


    // rollback si erreur
    setIsFavorite(previousState);


    toast.error(
      err.message ||
      "Erreur lors de la mise à jour des favoris"
    );


  } finally {

    setFavLoading(false);

  }

};





  const {
    selectedDates,
    setSelectedDates,
    hoverDate,
    setHoverDate,
    isBlocked,
    handleSelectDate,
    isInRangePreview,
    isFormValid,
    days,
    monthLabel
  } = useCalendar(vehicle || {}, unavailableRanges);


const { selectedDays, totalPrice } = computePricing(
  null,
  vehicle,
  selectedDates
);
  if (!vehicle) {
    return <p className="text-center mt-5">Chargement...</p>;
  }
  const handlePrimaryAction = () => {
  if (!vehicle) return;

  if (vehicle.type === "rent") {
    setShowCalendar(true);
    return;
  }

  if (vehicle.type === "sale") {
    navigate(`/applications/new/${vehicle.id}`, {
      state: {
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          price: vehicle.price,
          mileage: vehicle.mileage,
          engine_type: vehicle.engine_type,
          included_options: vehicle.included_options,
          optional_options: vehicle.optional_options
        },
        dates: {
  start: formatDate(selectedDates?.start),
  end: formatDate(selectedDates?.end)
}
      }
    });

    return;
  }
};

const formatDate = (date) => {
    if (!date) return null;

    return new Intl.DateTimeFormat("en-CA")
        .format(date);
};

const canBuy =
  vehicle.status === "PUBLISHED";

console.log(formatDate(selectedDates?.start))
console.log(selectedDates?.end)
const handleApplication = () => {
  if (!vehicle) return;

  navigate(`/applications/new/${vehicle.id}`, {
    state: {
      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        price: vehicle.price,
        mileage: vehicle.mileage,
        engine_type: vehicle.engine_type,
        included_options: vehicle.included_options,
        optional_options: vehicle.optional_options
      },
      dates: {
  start: formatDate(selectedDates?.start),
  end: formatDate(selectedDates?.end)
}
    }
  });
};
const handleInterestedClick = () => {
  setShowLeadModal(true);
};

  return (
    
    <DetailLayout
  breadcrumb={[
    {
      label: "Véhicules",
      path: isAdmin
        ? "/admin/vehicles"
        : "/vehicles"
    },
    {
      label: `${vehicle.brand} ${vehicle.model}`
    }
  ]}
>

      <div className="row g-4">

        {/* =========================
          LEFT: IMAGES
      ========================= */}
        <div className="col-lg-6">

          <div className="position-sticky" style={{ top: 20 }}>

            <div className="rounded-4 overflow-hidden shadow-sm bg-white position-relative">

              {/* CAROUSEL */}
              {!vehicle.images?.length ? (
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: 420 }}
                >
                  <span className="text-muted">Aucune image</span>
                </div>
              ) : (
                <div
                  id="vehicleCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner">

                    {vehicle.images.map((img, index) => (
                      <div
                        key={index}
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                      >
                        <img
                          src={img}
                          className="w-100"
                          style={{ height: 420, objectFit: "cover" }}
                          alt="vehicle"
                        />
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* ❤️ FAVORIS */}
              {isClient && (
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className="btn btn-light shadow position-absolute rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    top: 15,
                    right: 15,
                    width: 46,
                    height: 46
                  }}
                >
                  {isFavorite ? (
                    <i className="bi bi-heart-fill text-danger fs-5"></i>
                  ) : (
                    <i className="bi bi-heart fs-5"></i>
                  )}
                </button>
              )}

            </div>
          </div>

        </div>

        {/* =========================
          RIGHT: INFOS
      ========================= */}
        <div className="col-lg-6">

          <div className="bg-white rounded-4 shadow-sm p-4">

            {/* TITLE */}
            <h2 className="fw-bold mb-1">
              {vehicle.brand} {vehicle.model}
            </h2>

            <div className="d-flex flex-wrap gap-3 text-muted small mb-3">

              <span className="d-flex align-items-center gap-1">
                <BsCalendar size={14} />
                {vehicle.year}
              </span>

              <span className="d-flex align-items-center gap-1">
                <BsSpeedometer2 size={14} />
                {vehicle.mileage.toLocaleString()} km
              </span>

              <span className="d-flex align-items-center gap-1">
                <BsFuelPump size={14} />
                {ENGINE_LABELS[vehicle.engine_type]}
              </span>

            </div>

            {/* BADGES */}
            <div className="d-flex gap-2 flex-wrap align-items-center mb-4">

              <span
                className={`badge-soft ${vehicle.type === "sale"
                    ? "bg-success-subtle text-success border-success"
                    : "bg-primary-subtle text-primary border-primary"
                  }`}
              >
                {vehicle.type === "sale"
                  ? "Vente"
                  : "Location"}
              </span>

              {vehicle.type === "sale" && (
                <span
                  className={`badge-soft ${vehicle.is_available
                      ? "bg-success-subtle text-success border-success"
                      : "bg-danger-subtle text-danger border-danger"
                    }`}
                >
                  {vehicle.is_available
                    ? "Disponible"
                    : "Indisponible"}
                </span>
              )}

              {vehicle.type === "rent" && (
                <span
                  className="badge-soft bg-success-subtle text-success border-success"
                >
                  Disponible à la location
                </span>
              )}


              {/* PLAQUE (ADMIN ONLY) */}
              {isAdmin && vehicle.license_plate && (
                <span
                  className="badge-soft shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
                    fontFamily: "monospace",
                    letterSpacing: "2px",
                    borderColor: "#dee2e6"
                  }}
                >
                  <i className="bi bi-car-front text-secondary"></i>
                  {vehicle.license_plate}
                </span>
              )}

            </div>
{/* =========================
    WARRANTY
========================= */}

{vehicle?.warranty_plan && (

<div className="card border-0 shadow-sm rounded-4 mb-4">

  <div className="card-body">

    <div className="d-flex align-items-center mb-3">

      <div
        className="
        bg-success-subtle
        text-success
        rounded-circle
        d-flex
        align-items-center
        justify-content-center
        me-2
        "
        style={{
          width:40,
          height:40
        }}
      >
        <i className="bi bi-shield-check fs-5"></i>
      </div>


      <div>

        <h5 className="fw-bold mb-0">
          Garantie incluse
        </h5>

        <small className="text-muted">
          Protection du véhicule
        </small>

      </div>

    </div>



    <div className="fw-semibold mb-2">
      {vehicle.warranty_plan.name}
    </div>



    <div className="row g-2 small text-muted">


      <div className="col-6">

        <i className="bi bi-calendar-check me-1"></i>

        {vehicle.warranty_plan.duration_months}
        {" mois"}

      </div>



      {vehicle.warranty_plan.mileage_limit && (

      <div className="col-6">

        <i className="bi bi-speedometer2 me-1"></i>

        {vehicle.warranty_plan.mileage_limit.toLocaleString()}
        {" km"}

      </div>

      )}


    </div>



    <hr />


    <div className="d-flex flex-wrap gap-2">


      {vehicle.warranty_plan.covers_engine && (

        <span className="badge bg-success-subtle text-success">
          <i className="bi bi-check-circle me-1"></i>
          Moteur
        </span>

      )}



      {vehicle.warranty_plan.covers_transmission && (

        <span className="badge bg-success-subtle text-success">
          <i className="bi bi-check-circle me-1"></i>
          Transmission
        </span>

      )}



      {vehicle.warranty_plan.covers_electronics && (

        <span className="badge bg-success-subtle text-success">
          <i className="bi bi-check-circle me-1"></i>
          Électronique
        </span>

      )}



      {vehicle.warranty_plan.covers_assistance && (

        <span className="badge bg-success-subtle text-success">
          <i className="bi bi-check-circle me-1"></i>
          Assistance
        </span>

      )}


    </div>


  </div>

</div>

)}
            {/* PRICE */}
            <div className="mb-4">

              <div className="display-5 fw-bold text-dark">
                {vehicle.price.toLocaleString()} €
                {vehicle.type === "rent" && (
                  <span className="fs-5 text-muted fw-normal">
                    {" "} / jour
                  </span>
                )}
              </div>

            </div>

            {/* DESCRIPTION */}
            {vehicle.description && (
              <p className="text-muted">
                {vehicle.description}
              </p>
            )}

            {/* =========================
              OPTIONS
          ========================= */}
            {vehicle.type === "rent" && (
              <div className="mt-4 mb-4">

                {vehicle.included_options?.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Inclus</small>

                    <div className="d-flex flex-wrap gap-2">
                      {vehicle.included_options.map(opt => (
                        <span
                          key={opt.id}
                          className="badge bg-success-subtle text-success px-3 py-2"
                        >
                          {opt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vehicle.optional_options?.length > 0 && (
                  <div>
                    <small className="text-muted d-block mb-1">Options</small>

                    <div className="d-flex flex-wrap gap-2">
                      {vehicle.optional_options.map((opt) => (
                        <span
                          key={opt.id}
                          className="badge bg-light text-dark border"
                        >
                          +{opt.price ?? 0}€
                          {opt.billing_type === "daily" && " / jour"} {opt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
{/* =========================
  VEHICLE WORKFLOW (ADMIN)
========================= */}

{isAdmin && vehicle?.type === "sale" && (

    <InspectionStepper
      vehicle={vehicle}
      setVehicle={setVehicle}
      vehicleId={vehicle.id}
      user={user}
    />

)}

{/* =========================
  INTEREST CTA (LEAD TRIGGER)
========================= */}
{vehicle.type === "sale" &&
  canBuy &&
  !isEmployee && (

  <div className="mb-4">

    {
      interestStatus.application_id ? (

        <button
          className="btn btn-primary w-100 py-3 fw-semibold shadow-sm"
          onClick={() =>
            navigate(
              `/applications/${interestStatus.application_id}`
            )
          }
        >
          Voir mon dossier
        </button>

      ) : interestStatus.quote_id ? (

        <button
          className="btn btn-primary w-100 py-3 fw-semibold shadow-sm"
          onClick={() =>
            navigate(
              `/quotes/${interestStatus.quote_id}`
            )
          }
        >
          Voir mon offre
        </button>

      ) : interestStatus.already_interested ? (

        <button
          className="btn btn-primary w-100 py-3 fw-semibold shadow-sm"
          disabled
        >
          Demande en cours de traitement
        </button>

      ) : (

        <>
          <button
            className="btn btn-primary w-100 py-3 fw-semibold shadow-sm"
            onClick={handleInterestedClick}
          >
            Je suis intéressé
          </button>

          <small className="text-muted d-block mt-2 text-center">
            Recevez une offre personnalisée pour ce véhicule
          </small>
        </>

      )
    }

  </div>

)}
<LeadFormModal
  show={showLeadModal}
  onClose={() => setShowLeadModal(false)}
  vehicleId={vehicle.id}
  user={user}
  onSuccess={(data) => {
    if (data?.quote_id) {
      navigate(`/quotes/${data.quote_id}`);
    } else if (data?.application_id) {
      navigate(`/applications/${data.application_id}`);
    }
  }}
/>
            {/* =========================
              ACTIONS
          ========================= */}
            {isClient && (

              <div className="d-grid gap-2 mb-4">
{!canBuy && (
  <div className="alert alert-warning">
    Ce véhicule n'est actuellement pas disponible.
  </div>
)}
                <button
                  className="btn btn-dark py-3"
                  onClick={handlePrimaryAction}
                  disabled={!canBuy}
                >
                  {vehicle.type === "sale"
                    ? "Faire une demande d'achat"
                    : "Réserver ce véhicule"}
                </button>

                {vehicle.type === "sale" && (

                  <button
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => setShowModal(true)}
                    disabled={!canBuy}

                  >
                    Réserver un essai routier
                  </button>

                )}

              </div>

            )}

          </div>


        </div>

      </div>

      {/* =========================
        MODAL TEST DRIVE
    ========================= */}
      <TestDriveModal
        show={showModal}
        onClose={() => setShowModal(false)}
        vehicleId={vehicle.id}
      />



      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h5 className="mb-3">
              Choisissez vos dates
            </h5>

<h6 className="mb-3 text-muted">
  {monthLabel}
</h6>
            <Calendar
              days={days}
              selectedDates={selectedDates}
              isBlocked={isBlocked}
              handleSelectDate={handleSelectDate}
              setHoverDate={setHoverDate}
              isInRangePreview={isInRangePreview}
            />
            {selectedDates.start && selectedDates.end && (
  <small>
    {selectedDays} {selectedDays > 1 ? "jours" : "jour"} • {totalPrice} €
  </small>
)}
            <div className="d-flex justify-content-end gap-2 mt-3">

              <button
                className="btn btn-light"
                onClick={() => setShowCalendar(false)}
              >
                Annuler
              </button>

              <button
                className="btn btn-dark"
                disabled={
                  !selectedDates.start ||
                  !selectedDates.end ||
                  !isFormValid
                }
                onClick={() => {
                  setShowCalendar(false);
                  handleApplication();
                }}
              >
                Confirmer
              </button>

            </div>

          </div>
        </div>
      )}
  </DetailLayout>);
}