import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BsCalendar, BsFuelPump, BsSpeedometer2 } from "react-icons/bs";

import apiFetch from "../../services/apiFetch";
import { ENGINE_TYPES } from "../../constants/vehicleOptions";
import { useAuth } from "../../contexts/AuthContext";
import { computePricing } from "../../utils/pricingUtils";

import Calendar from "../../components/vehicles/Calendar";
import InspectionStepper from "../../components/vehicles/InspectionStepper";
import DetailLayout from "../../layouts/DetailLayout";
import LeadFormModal from "../../components/sales/LeadFormModal";
import TestDriveModal from "../../components/test-drives/TestDriveModal";

import "../../styles/badges.css";
import "../../styles/modalvehicledetail.css";
import { formatAmount } from "../../utils/priceUtils";
import { formatDateForApi } from "../../utils/dateUtils";
/**
 * Page de détail d'un véhicule.
 *
 * Cette page permet :
 * - de consulter les informations du véhicule ;
 * - de consulter ses images ;
 * - d'ajouter / retirer le véhicule des favoris ;
 * - de réserver un véhicule à la location ;
 * - de faire une demande d'achat ;
 * - de demander un essai routier ;
 * - de manifester son intérêt pour un véhicule à la vente ;
 * - de consulter les informations de garantie ;
 * - aux administrateurs de consulter le workflow d'inspection.
 */
export default function VehicleDetail() {
  // =========================================================
  // ROUTING
  // =========================================================

  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // AUTHENTIFICATION
  // =========================================================

  const { isClient, isAuthenticated, isAdmin, isEmployee, user } = useAuth();
  // =========================================================
  // ÉTAT DU VÉHICULE
  // =========================================================

  const [vehicle, setVehicle] = useState(null);

  // =========================================================
  // FAVORIS
  // =========================================================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // =========================================================
  // INTÉRÊT COMMERCIAL
  // =========================================================

  const [interestStatus, setInterestStatus] = useState({
    already_interested: false,
    quote_id: null,
    application_id: null,
  });

  // =========================================================
  // DOSSIER ACTIF
  // =========================================================
  const [applicationId, setApplicationId] = useState(null);

  /**
   * Identifiant du dossier existant.
   *
   * - interestStatus.application_id :
   *   dossier créé à partir d'un lead (vente).
   *
   * - applicationId :
   *   dossier récupéré directement pour le véhicule
   *   (vente ou location).
   */
  const existingApplicationId = interestStatus?.application_id || applicationId;

  // =========================================================
  // DISPONIBILITÉ LOCATION
  // =========================================================

  const [unavailableRanges, setUnavailableRanges] = useState([]);

  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // =====================================================
  // ÉTAT : ESSAI ROUTIER EXISTANT
  // =====================================================

  // Essai routier déjà associé à l'utilisateur
  // pour ce véhicule.
  const [existingTestDrive, setExistingTestDrive] = useState(null);

  // Indique si la recherche de l'essai existant est en cours.
  const [loadingExistingTestDrive, setLoadingExistingTestDrive] =
    useState(false);

  // =========================================================
  // MODALES
  // =========================================================

  // Modale Essai routier
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);

  // Calendrier réservation
  const [showCalendar, setShowCalendar] = useState(false);

  // Modale "Je suis intéressé"
  const [showLeadModal, setShowLeadModal] = useState(false);

  // =========================================================
  // CHARGEMENT DU VÉHICULE
  // =========================================================

  /**
   * Charge le détail du véhicule depuis l'API.
   *
   * useCallback permet de conserver la même référence
   * de fonction tant que l'identifiant du véhicule ne change pas.
   *
   * Cela permet notamment de l'utiliser correctement
   * dans les dépendances des useEffect.
   */
  const loadVehicle = useCallback(async () => {
    try {
      const data = await apiFetch(`/vehicles/${id}`);

      setVehicle(data);

      return data;
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Erreur lors du chargement du véhicule");
    }
  }, [id]);
  // =====================================================
  // CHARGEMENT DU STATUT D'INTÉRÊT
  // =====================================================

  /**
   * Récupère l'état commercial du véhicule
   * pour l'utilisateur connecté.
   *
   * Cette fonction est définie en dehors du useEffect
   * afin de pouvoir être réutilisée après la création
   * d'un lead.
   */
  const loadInterestStatus = useCallback(async () => {
    if (!id) {
      setInterestStatus(null);

      return;
    }

    try {
      const data = await apiFetch(`/vehicles/${id}/interest-status`);

      setInterestStatus(data);
    } catch (err) {
      /*
       * Une erreur sur le statut commercial ne doit pas
       * empêcher l'affichage de la page.
       */
      console.error("Erreur lors du chargement du statut d'intérêt :", err);

      setInterestStatus(null);
    }
  }, [id]);
  // =====================================================
  // CHARGEMENT DE L'ESSAI ROUTIER EXISTANT
  // =====================================================

  /**
   * Recherche le dernier essai routier créé par
   * l'utilisateur connecté pour ce véhicule.
   */
  const loadExistingTestDrive = useCallback(async () => {
    if (!id) {
      setExistingTestDrive(null);

      return;
    }

    setLoadingExistingTestDrive(true);

    try {
      const data = await apiFetch(
        `/test-drives/existing?vehicle_id=${encodeURIComponent(id)}`
      );

      /*
       * Le backend retourne :
       *
       * {
       *   test_drive: {...}
       * }
       *
       * ou :
       *
       * {
       *   test_drive: null
       * }
       */
      setExistingTestDrive(data?.test_drive || null);
    } catch (err) {
      /*
       * Une erreur sur l'essai routier ne doit pas
       * empêcher l'affichage de la page.
       */
      console.error("Erreur lors du chargement de l'essai routier :", err);

      setExistingTestDrive(null);
    } finally {
      setLoadingExistingTestDrive(false);
    }
  }, [id]);
  // =========================================================
  // CHARGEMENT DES INFORMATIONS UTILISATEUR
  // =========================================================

  useEffect(() => {
    // =====================================================
    // FAVORIS
    // =====================================================

    /**
     * Vérifie si le véhicule est déjà dans les favoris
     * de l'utilisateur connecté.
     */
    const loadFavoriteStatus = async () => {
      try {
        const response = await apiFetch("/favorites/me");

        const exists = (response.items || []).some(
          (favorite) => String(favorite.vehicle?.id) === String(id)
        );

        setIsFavorite(exists);
      } catch (err) {
        /*
         * Une erreur sur les favoris ne doit pas empêcher
         * l'affichage de la page du véhicule.
         */
        console.error(err);
      }
    };

    // =====================================================
    // DOSSIER ACTIF
    // =====================================================

    /**
     * Récupère le dossier actif associé au véhicule.
     */
    const loadApplicationStatus = async () => {
      try {
        const data = await apiFetch(`/applications/by-vehicle/${id}`);

        setApplicationId(data.id || null);
      } catch (err) {
        /*
         * Une erreur sur le dossier ne doit pas empêcher
         * l'affichage de la page du véhicule.
         */
        console.error(err);

        setApplicationId(null);
      }
    };

    // =====================================================
    // CHARGEMENT PRINCIPAL
    // =====================================================

    /**
     * Charge d'abord le véhicule.
     *
     * Les informations personnalisées de l'utilisateur
     * sont ensuite chargées uniquement si :
     *
     * - l'utilisateur est connecté ;
     * - le véhicule existe.
     */
    const load = async () => {
      const loadedVehicle = await loadVehicle();

      if (!isClient || !loadedVehicle) {
        return;
      }

      // ===================================================
      // REQUÊTES COMMUNES
      // ===================================================

      const requests = [loadFavoriteStatus(), loadApplicationStatus()];

      // ===================================================
      // REQUÊTES SPÉCIFIQUES AUX VÉHICULES À LA VENTE
      // ===================================================

      if (loadedVehicle.type === "sale") {
        requests.push(loadInterestStatus());

        requests.push(loadExistingTestDrive());
      }

      // Exécute les requêtes en parallèle.
      await Promise.all(requests);
    };

    load();
  }, [id, isClient, loadVehicle, loadInterestStatus, loadExistingTestDrive]);

  // =========================================================
  // CHARGEMENT DES DISPONIBILITÉS
  // =========================================================

  useEffect(() => {
    const vehicleId = vehicle?.id;
    const vehicleType = vehicle?.type;

    /*
     * Les disponibilités ne sont nécessaires
     * que pour les véhicules proposés à la location.
     */
    if (!vehicleId || vehicleType !== "rent") {
      setUnavailableRanges([]);
      return;
    }

    const loadAvailability = async () => {
      try {
        const data = await apiFetch(`/vehicles/${vehicleId}/unavailable-dates`);

        setUnavailableRanges(data);
      } catch (err) {
        console.error(err);

        toast.error(
          err.message || "Erreur lors du chargement des disponibilités"
        );
      }
    };

    loadAvailability();
  }, [vehicle?.id, vehicle?.type]);

  // =========================================================
  // FAVORIS
  // =========================================================

  /**
   * Ajoute ou retire le véhicule des favoris.
   *
   * Le changement d'interface est effectué immédiatement
   * afin d'améliorer la réactivité.
   *
   * En cas d'erreur API, l'état précédent est restauré.
   */
  const toggleFavorite = async () => {
    if (favLoading) {
      return;
    }

    const previousState = isFavorite;

    try {
      setFavLoading(true);

      // Mise à jour optimiste de l'interface.
      setIsFavorite(!previousState);

      if (previousState) {
        await apiFetch(`/favorites/${id}`, {
          method: "DELETE",
        });

        toast.info("Retiré des favoris");
      } else {
        await apiFetch(`/favorites/${id}`, {
          method: "POST",
        });

        toast.success("Ajouté aux favoris ❤️");
      }
    } catch (err) {
      // Rollback si l'appel API échoue.
      setIsFavorite(previousState);

      toast.error(err.message || "Erreur lors de la mise à jour des favoris");
    } finally {
      setFavLoading(false);
    }
  };

  // =========================================================
  // TARIFICATION
  // =========================================================

  const { selectedDays, totalPrice } = computePricing(
    null,
    vehicle,
    selectedDates
  );

  // =========================================================
  // VÉHICULE TRANSMIS AU DOSSIER
  // =========================================================

  /**
   * Construit le snapshot du véhicule utilisé
   * lors de la création d'une demande.
   *
   * On ne transmet volontairement que les données
   * nécessaires à la page de création du dossier.
   */
  const getApplicationVehicle = () => {
    if (!vehicle) {
      return null;
    }

    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      price: vehicle.price,
      mileage: vehicle.mileage,
      engine_type: vehicle.engine_type,
      included_options: vehicle.included_options,
      optional_options: vehicle.optional_options,
    };
  };

  // =========================================================
  // NAVIGATION VERS LE DOSSIER
  // =========================================================

  /**
   * Redirige vers la création d'un dossier.
   *
   * Utilisé :
   * - directement pour une vente ;
   * - après sélection des dates pour une location.
   */
  const handleApplication = () => {
    if (!vehicle) {
      return;
    }

    navigate(`/applications/new/${vehicle.id}`, {
      state: {
        vehicle: getApplicationVehicle(),

        dates: {
          start: formatDateForApi(selectedDates?.start),

          end: formatDateForApi(selectedDates?.end),
        },
      },
    });
  };

  // =========================================================
  // ACTION PRINCIPALE
  // =========================================================

  /**
   * Gère le bouton principal de la page.
   *
   * Vente :
   * → création d'une demande d'achat.
   *
   * Location :
   * → ouverture du calendrier.
   */
  const handlePrimaryAction = () => {
    if (!vehicle) {
      return;
    }
    if (applicationId) {
      navigate(`/applications/${applicationId}`);

      return;
    }

    if (vehicle.type === "rent") {
      setShowCalendar(true);

      return;
    }

    if (vehicle.type === "sale") {
      handleApplication();
    }
  };

  // =========================================================
  // DISPONIBILITÉ À L'ACHAT OU A LA LOCATION
  // =========================================================

  const isPublished = vehicle?.status === "PUBLISHED";
  const isAvailable = vehicle?.is_available === true;
  const canBeProposed = isPublished && isAvailable;

  // =========================================================
  // LEAD COMMERCIAL
  // =========================================================

  /**
   * Ouvre le formulaire "Je suis intéressé".
   *
   * Aucun lead n'est créé à ce stade :
   * le LeadFormModal se charge de la confirmation.
   */
  const handleInterestedClick = () => {
    setShowLeadModal(true);
  };

  // =========================================================
  // CHARGEMENT
  // =========================================================

  if (!vehicle) {
    return <p className="text-center mt-5">Chargement...</p>;
  }

  // =========================================================
  // IMAGES
  // =========================================================
  const vehicleImages = (vehicle.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);

  // =========================================================
  // RENDU
  // =========================================================

  return (
    <DetailLayout
      breadcrumb={[
        {
          label: "Véhicules",
          path: isAdmin ? "/admin/vehicles" : "/vehicles",
        },

        {
          label: `${vehicle.brand} ${vehicle.model}`,
        },
      ]}
    >
      <div className="row g-4">
        {/* =====================================================
            LEFT : IMAGES DU VÉHICULE
        ===================================================== */}

        <div className="col-lg-6">
          <div className="position-sticky" style={{ top: 20 }}>
            <div
              className="
                rounded-4
                overflow-hidden
                shadow-sm
                bg-white
                position-relative
              "
            >
              {/* =================================================
                  CAROUSEL
              ================================================= */}

              {!vehicleImages.length ? (
                <div
                  className="
                    bg-light
                    d-flex
                    align-items-center
                    justify-content-center
                  "
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
                    {vehicleImages.map((image, index) => (
                      <div
                        key={image || index}
                        className={`
                            carousel-item
                            ${index === 0 ? "active" : ""}
                          `}
                      >
                        <img
                          src={image}
                          className="w-100"
                          style={{
                            height: 420,
                            objectFit: "cover",
                          }}
                          alt={`
                              ${vehicle.brand}
                              ${vehicle.model}
                              ${index + 1}
                            `}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================
                  FAVORIS
              ================================================= */}

              {isClient && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className="
                    btn
                    btn-light
                    shadow
                    position-absolute
                    rounded-circle
                    d-flex
                    align-items-center
                    justify-content-center
                  "
                  style={{
                    top: 15,
                    right: 15,
                    width: 46,
                    height: 46,
                  }}
                  aria-label={
                    isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
                  }
                >
                  {isFavorite ? (
                    <i
                      className="
                        bi
                        bi-heart-fill
                        text-danger
                        fs-5
                      "
                    />
                  ) : (
                    <i
                      className="
                        bi
                        bi-heart
                        fs-5
                      "
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT : INFORMATIONS DU VÉHICULE
        ===================================================== */}

        <div className="col-lg-6">
          <div
            className="
              bg-white
              rounded-4
              shadow-sm
              p-4
            "
          >
            {/* =================================================
                TITRE
            ================================================= */}

            <h2 className="fw-bold mb-1">
              {vehicle.brand} {vehicle.model}
            </h2>

            {/* =================================================
                INFORMATIONS PRINCIPALES
            ================================================= */}

            <div
              className="
                d-flex
                flex-wrap
                gap-3
                text-muted
                small
                mb-3
              "
            >
              <span className="d-flex align-items-center gap-1">
                <BsCalendar size={14} />
                {vehicle.year}
              </span>

              <span className="d-flex align-items-center gap-1">
                <BsSpeedometer2 size={14} />

                {Number(vehicle.mileage || 0).toLocaleString("fr-FR")}

                {" km"}
              </span>

              <span className="d-flex align-items-center gap-1">
                <BsFuelPump size={14} />

                {ENGINE_TYPES[vehicle.engine_type] || "Non précisé"}
              </span>
            </div>

            {/* =================================================
                BADGES
            ================================================= */}

            <div
              className="
                d-flex
                gap-2
                flex-wrap
                align-items-center
                mb-4
              "
            >
              {/* Type : vente / location */}

              <span
                className={`
                  badge-soft
                  ${
                    vehicle.type === "sale"
                      ? "bg-success-subtle text-success border-success"
                      : "bg-primary-subtle text-primary border-primary"
                  }
                `}
              >
                {vehicle.type === "sale" ? "Vente" : "Location"}
              </span>

              {/* Disponibilité à la vente */}

              {vehicle.type === "sale" && (
                <span
                  className={`
                    badge-soft
                    ${
                      vehicle.is_available
                        ? "bg-success-subtle text-success border-success"
                        : "bg-danger-subtle text-danger border-danger"
                    }
                  `}
                >
                  {vehicle.is_available ? "Disponible" : "Indisponible"}
                </span>
              )}

              {/* Disponibilité à la location */}

              {vehicle.type === "rent" && (
                <span
                  className="
                    badge-soft
                    bg-success-subtle
                    text-success
                    border-success
                  "
                >
                  Disponible à la location
                </span>
              )}

              {/* Immatriculation visible uniquement par
                  les administrateurs */}

              {isAdmin && vehicle.license_plate && (
                <span
                  className="
                      badge-soft
                      shadow-sm
                    "
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
                    fontFamily: "monospace",
                    letterSpacing: "2px",
                    borderColor: "#dee2e6",
                  }}
                >
                  <i
                    className="
                        bi
                        bi-car-front
                        text-secondary
                        me-1
                      "
                  />

                  {vehicle.license_plate}
                </span>
              )}
            </div>

            {/* =================================================
                GARANTIE
            ================================================= */}

            {vehicle.type === "sale" && vehicle.warranty_plan && (
              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                  mb-4
                "
              >
                <div className="card-body">
                  {/* En-tête garantie */}

                  <div
                    className="
                      d-flex
                      align-items-center
                      mb-3
                    "
                  >
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
                        width: 40,
                        height: 40,
                      }}
                    >
                      <i
                        className="
                          bi
                          bi-shield-check
                          fs-5
                        "
                      />
                    </div>

                    <div>
                      <h5 className="fw-bold mb-0">Garantie incluse</h5>

                      <small className="text-muted">
                        Protection du véhicule
                      </small>
                    </div>
                  </div>

                  {/* Nom de la garantie */}

                  <div className="fw-semibold mb-2">
                    {vehicle.warranty_plan.name}
                  </div>

                  {/* Durée / kilométrage */}

                  <div
                    className="
                      row
                      g-2
                      small
                      text-muted
                    "
                  >
                    <div className="col-6">
                      <i
                        className="
                          bi
                          bi-calendar-check
                          me-1
                        "
                      />

                      {vehicle.warranty_plan.duration_months}
                      {" mois"}
                    </div>

                    {vehicle.warranty_plan.mileage_limit && (
                      <div className="col-6">
                        <i
                          className="
                            bi
                            bi-speedometer2
                            me-1
                          "
                        />

                        {Number(
                          vehicle.warranty_plan.mileage_limit
                        ).toLocaleString("fr-FR")}

                        {" km"}
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Éléments couverts */}

                  <div
                    className="
                      d-flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {vehicle.warranty_plan.covers_engine && (
                      <span
                        className="
                          badge
                          bg-success-subtle
                          text-success
                        "
                      >
                        <i
                          className="
                            bi
                            bi-check-circle
                            me-1
                          "
                        />
                        Moteur
                      </span>
                    )}

                    {vehicle.warranty_plan.covers_transmission && (
                      <span
                        className="
                          badge
                          bg-success-subtle
                          text-success
                        "
                      >
                        <i
                          className="
                            bi
                            bi-check-circle
                            me-1
                          "
                        />
                        Transmission
                      </span>
                    )}

                    {vehicle.warranty_plan.covers_electronics && (
                      <span
                        className="
                          badge
                          bg-success-subtle
                          text-success
                        "
                      >
                        <i
                          className="
                            bi
                            bi-check-circle
                            me-1
                          "
                        />
                        Électronique
                      </span>
                    )}

                    {vehicle.warranty_plan.covers_assistance && (
                      <span
                        className="
                          badge
                          bg-success-subtle
                          text-success
                        "
                      >
                        <i
                          className="
                            bi
                            bi-check-circle
                            me-1
                          "
                        />
                        Assistance
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                PRIX
            ================================================= */}

            <div className="mb-4">
              <div
                className="
                  display-5
                  fw-bold
                  text-dark
                "
              >
                {formatAmount(vehicle.price)}

                {vehicle.type === "rent" && (
                  <span
                    className="
                      fs-5
                      text-muted
                      fw-normal
                    "
                  >
                    {" / jour"}
                  </span>
                )}
              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            {vehicle.description && (
              <p className="text-muted">{vehicle.description}</p>
            )}
            {/* =================================================
    ÉQUIPEMENTS
================================================= */}

            {vehicle.equipments && vehicle.equipments.length > 0 && (
              <div className="mt-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-list-check me-2" />
                  Équipements
                </h5>

                <div className="d-flex flex-wrap gap-2">
                  {vehicle.equipments.map((equipment, index) => (
                    <span
                      key={equipment.id || index}
                      className="
            badge
            bg-light
            text-dark
            border
            px-3
            py-2
          "
                    >
                      <i className="bi bi-check2 me-1 text-success" />
                      {equipment.name || equipment}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* =================================================
                OPTIONS DE LOCATION
            ================================================= */}

            {vehicle.type === "rent" && (
              <div className="mt-4 mb-4">
                {/* Options incluses */}

                {vehicle.included_options?.length > 0 && (
                  <div className="mb-3">
                    <small
                      className="
                        text-muted
                        d-block
                        mb-1
                      "
                    >
                      Inclus
                    </small>

                    <div
                      className="
                        d-flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {vehicle.included_options.map((option) => (
                        <span
                          key={option.id}
                          className="
                              badge
                              bg-success-subtle
                              text-success
                              px-3
                              py-2
                            "
                        >
                          {option.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options supplémentaires */}

                {vehicle.optional_options?.length > 0 && (
                  <div>
                    <small
                      className="
                        text-muted
                        d-block
                        mb-1
                      "
                    >
                      Options
                    </small>

                    <div
                      className="
                        d-flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {vehicle.optional_options.map((option) => (
                        <span
                          key={option.id}
                          className="
                              badge
                              bg-light
                              text-dark
                              border
                            "
                        >
                          +{option.price ?? 0}€
                          {option.billing_type === "daily" && " / jour"}{" "}
                          {option.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                WORKFLOW VÉHICULE - ADMIN
            ================================================= */}

            {isAdmin && vehicle.type === "sale" && (
              <InspectionStepper
                vehicle={vehicle}
                setVehicle={setVehicle}
                vehicleId={vehicle.id}
                user={user}
                loadVehicle={loadVehicle}
              />
            )}

            {/* =================================================
                CTA COMMERCIAL
            ================================================= */}
            {/* =====================================================
    INDISPONIBILITÉ DU VÉHICULE
===================================================== */}

            {!canBeProposed && (
              <div className="alert alert-warning mb-4" role="alert">
                <i
                  className="bi bi-exclamation-triangle me-2"
                  aria-hidden="true"
                />

                {isClient
                  ? "Ce véhicule n'est actuellement plus disponible à la vente ou à la location."
                  : isEmployee
                    ? "Votre rôle ne vous permet pas d'entamer un processus pour ce véhicule."
                    : isAdmin
                      ? "Ce véhicule n'est pas disponible ou n'est pas publié."
                      : "Ce véhicule n'est actuellement pas disponible."}
              </div>
            )}

            {/* =====================================================
    ACTIONS VENTE - CLIENT CONNECTÉ
===================================================== */}

            {vehicle.type === "sale" && canBeProposed && (
              <div className="d-grid gap-2 mb-4">
                {/* =================================================
        JE SUIS INTÉRESSÉ
        Accessible aux visiteurs et aux clients
    ================================================= */}

                {/* =================================================
    UTILISATEUR NON AUTHENTIFIÉ
================================================= */}

                {!isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary py-3 fw-semibold shadow-sm"
                      onClick={handleInterestedClick}
                    >
                      <i
                        className="bi bi-chat-left-text me-2"
                        aria-hidden="true"
                      />
                      Je suis intéressé
                    </button>

                    <small className="text-muted text-center">
                      Recevez une offre personnalisée pour ce véhicule.
                    </small>
                  </>
                ) : isClient ? (
                  <>
                    {/* =================================================
        DOSSIER EXISTANT
    ================================================= */}

                    {existingApplicationId ? (
                      <button
                        type="button"
                        className="btn btn-primary py-3 fw-semibold shadow-sm"
                        onClick={() =>
                          navigate(`/applications/${existingApplicationId}`)
                        }
                      >
                        <i
                          className="bi bi-folder2-open me-2"
                          aria-hidden="true"
                        />
                        Voir mon dossier
                      </button>
                    ) : (
                      <>
                        {/* =================================================
            OFFRE EXISTANTE
        ================================================= */}

                        {interestStatus?.quote_id ? (
                          <button
                            type="button"
                            className="btn btn-primary py-3 fw-semibold shadow-sm"
                            onClick={() =>
                              navigate(`/quotes/${interestStatus.quote_id}`)
                            }
                          >
                            <i
                              className="bi bi-file-earmark-text me-2"
                              aria-hidden="true"
                            />
                            Voir mon offre
                          </button>
                        ) : interestStatus?.already_interested ? (
                          <button
                            type="button"
                            className="btn btn-primary py-3 fw-semibold shadow-sm"
                            disabled
                            aria-disabled="true"
                          >
                            <i
                              className="bi bi-hourglass-split me-2"
                              aria-hidden="true"
                            />
                            Demande en cours de traitement
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary py-3 fw-semibold shadow-sm"
                              onClick={handleInterestedClick}
                            >
                              <i
                                className="bi bi-chat-left-text me-2"
                                aria-hidden="true"
                              />
                              Je suis intéressé
                            </button>

                            <small className="text-muted text-center">
                              Recevez une offre personnalisée pour ce véhicule.
                            </small>
                          </>
                        )}

                        {/* =================================================
            DÉPOSER MON DOSSIER
        ================================================= */}

                        <button
                          type="button"
                          className="btn btn-outline-primary py-3 fw-semibold"
                          onClick={handlePrimaryAction}
                        >
                          <i
                            className="bi bi-folder-plus me-2"
                            aria-hidden="true"
                          />
                          Déposer mon dossier
                        </button>
                      </>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* =====================================================
    FORMULAIRE LEAD
===================================================== */}

            <LeadFormModal
              show={showLeadModal}

              onClose={() => setShowLeadModal(false)}

              vehicleId={vehicle.id}

              user={user}

              onSuccess={async (data) => {
                await loadInterestStatus();
              }}
            />

            {/* =====================================================
    ACTIONS CLIENT
===================================================== */}

            {isClient && (
              <div className="d-grid gap-2 mb-4" aria-live="polite">
                {/* =========================================================
        ACTION PRINCIPALE - LOCATION
    ========================================================= */}

                {vehicle.type === "rent" && (
                  <button
                    type="button"
                    className="btn btn-dark py-3"
                    disabled={!canBeProposed && !applicationId}
                    onClick={handlePrimaryAction}
                  >
                    <i
                      className={`bi ${
                        applicationId ? "bi-folder2-open" : "bi-calendar-check"
                      } me-2`}
                      aria-hidden="true"
                    />

                    {applicationId
                      ? "Voir mon dossier"
                      : "Réserver ce véhicule"}
                  </button>
                )}

                {/* =========================================================
        ESSAI ROUTIER - VENTE
    ========================================================= */}

                {vehicle.type === "sale" &&
                  (loadingExistingTestDrive ? (
                    <button
                      type="button"
                      className="btn btn-primary py-3"
                      disabled
                      aria-busy="true"
                    >
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Vérification de votre essai routier...
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary py-3"
                      disabled={!canBeProposed && !existingTestDrive}
                      onClick={() => {
                        setShowTestDriveModal(true);
                      }}
                    >
                      <i
                        className={`bi ${
                          existingTestDrive
                            ? "bi-calendar2-check"
                            : "bi-calendar-check"
                        } me-2`}
                        aria-hidden="true"
                      />

                      {existingTestDrive
                        ? "Consulter mon essai routier"
                        : "Demander un essai routier"}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
          MODALE ESSAI ROUTIER
      ======================================================= */}

      <TestDriveModal
        show={showTestDriveModal}
        onClose={() => setShowTestDriveModal(false)}
        vehicleId={id}
        existingTestDrive={existingTestDrive}
        onCreated={loadExistingTestDrive}
      />

      {/* =======================================================
          MODALE CALENDRIER - LOCATION
      ======================================================= */}

      {/* =======================================================
    MODALE CALENDRIER - LOCATION
======================================================= */}

      {showCalendar && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* =================================================
            EN-TÊTE
        ================================================= */}

              <div className="modal-header">
                <h5 className="modal-title">Disponibilité du véhicule</h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fermer"
                  onClick={() => setShowCalendar(false)}
                />
              </div>

              {/* =================================================
            CORPS
        ================================================= */}

              <div className="modal-body">
                <Calendar
                  vehicle={vehicle}
                  unavailableRanges={unavailableRanges}
                  onDatesChange={setSelectedDates}
                  onValidityChange={setIsFormValid}
                />
              </div>

              {/* =================================================
            PIED DE LA MODALE
        ================================================= */}

              <div className="modal-footer">
                {/* Nombre de jours sélectionnés */}

                {selectedDates.start && selectedDates.end && (
                  <div className="me-auto">
                    <strong>
                      {selectedDays} {selectedDays > 1 ? "jours" : "jour"}
                    </strong>

                    {" · "}

                    <strong>{formatAmount(totalPrice)}</strong>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCalendar(false)}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={
                    !selectedDates.start || !selectedDates.end || !isFormValid
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
        </div>
      )}
    </DetailLayout>
  );
}
