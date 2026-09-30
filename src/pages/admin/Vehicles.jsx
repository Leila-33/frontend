import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import { uploadImages } from "../../services/uploadService";
import Pagination from "../../components/common/Pagination";
import { useDebounce } from "../../hooks/useDebounce";

import { BsPlusLg, BsCarFrontFill } from "react-icons/bs";

import { VehicleCard } from "../../components/vehicles/VehicleCard";
import { ENGINE_TYPES, VEHICLE_TYPES } from "../../constants/vehicleOptions";

/* =========================================================
   PAGE ADMINISTRATION DES VÉHICULES
========================================================= */

export default function AdminVehicles() {
  /* =========================================================
     DONNÉES
  ========================================================= */

  const [vehicles, setVehicles] = useState([]);
  const [options, setOptions] = useState([]);
  const [warrantyPlans, setWarrantyPlans] = useState([]);

  /* =========================================================
     FILTRES
  ========================================================= */

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  // ==========================================================
  // RECHERCHE AVEC DEBOUNCE
  // ==========================================================

  // Valeur de recherche mise à jour après une courte pause
  // afin d'éviter une requête à chaque frappe.
  const debouncedSearch = useDebounce(search, 400);
  /* =========================================================
     PAGINATION
  ========================================================= */

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const size = 10;

  /* =========================================================
     MODALE VÉHICULE
  ========================================================= */

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================================================
     ÉTAT DU FORMULAIRE
  ========================================================= */

  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    type: "sale",
    mileage: "",
    year: "",
    license_plate: "",
    description: "",
    engine_type: "",
    equipments: [],
    condition: "used",
    warranty_plan_id: "",
    images: [],
    included_options: [],
    optional_options: [],
  });

  /* =========================================================
     IMAGES / VALIDATION / SAUVEGARDE
  ========================================================= */

  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* =========================================================
     RÉINITIALISATION DU FORMULAIRE
  ========================================================= */

  const resetForm = useCallback(() => {
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
      equipments: [],
      condition: "used",
      warranty_plan_id: "",
      images: [],
      included_options: [],
      optional_options: [],
    });

    setPreview([]);
    setErrors({});
    setEditId(null);
  }, []);

  /* =========================================================
     CHARGEMENT DES VÉHICULES
  ========================================================= */
  const fetchVehicles = useCallback(
    async (customPage = 1, shouldScroll = true) => {
      if (shouldScroll) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      try {
        const rawFilters = {
          search: debouncedSearch,
          type: filterType,
          license_plate: licensePlate,
          page: customPage,
          size,
        };

        const cleanFilters = Object.fromEntries(
          Object.entries(rawFilters).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
          )
        );

        const params = new URLSearchParams(cleanFilters);

        const data = await apiFetch(`/admin/vehicles?${params.toString()}`);

        setVehicles(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || customPage);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Erreur chargement véhicules :", err);

        toast.error(err.message || "Erreur lors du chargement des véhicules");
      }
    },
    [debouncedSearch, filterType, licensePlate]
  );

  /* =========================================================
     CHARGEMENT DES OPTIONS
  ========================================================= */

  const fetchOptions = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/options/active");

      setOptions(data.options || []);
    } catch (err) {
      toast.error(err.message || "Erreur lors du chargement des options");
    }
  }, []);

  /* =========================================================
     CHARGEMENT DES GARANTIES
  ========================================================= */

  const fetchPlans = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/warranty-plans");

      setWarrantyPlans(data || []);
    } catch (err) {
      toast.error(err.message || "Erreur lors du chargement des garanties");
    }
  }, []);

  /* =========================================================
     CHARGEMENT INITIAL
  ========================================================= */

  useEffect(() => {
    fetchOptions();
    fetchPlans();
  }, [fetchOptions, fetchPlans]);

  // ==========================================================
  // RÉINITIALISATION DE LA PAGINATION
  // ==========================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterType, licensePlate]);

  // ==========================================================
  // CHARGEMENT DES VÉHICULES
  // ==========================================================

  useEffect(() => {
    fetchVehicles(page, false);
  }, [page, fetchVehicles]);

  /* =========================================================
     VALIDATION DU FORMULAIRE
  ========================================================= */

  const validate = (data) => {
    const validationErrors = {};
    const currentYear = new Date().getFullYear();

    /* ---------- Marque ---------- */

    if (!data.brand?.trim()) {
      validationErrors.brand = "Marque requise";
    }

    /* ---------- Modèle ---------- */

    if (!data.model?.trim()) {
      validationErrors.model = "Modèle requis";
    }

    /* ---------- Prix ---------- */

    if (data.price === "" || data.price === null || Number(data.price) <= 0) {
      validationErrors.price = "Prix invalide";
    }

    /* ---------- Kilométrage ---------- */

    if (
      data.mileage === "" ||
      data.mileage === null ||
      Number(data.mileage) < 0
    ) {
      validationErrors.mileage = "Kilométrage invalide";
    }

    /* ---------- Année ---------- */

    if (
      data.year === "" ||
      data.year === null ||
      Number(data.year) < 1900 ||
      Number(data.year) > currentYear
    ) {
      validationErrors.year = "Année invalide";
    }

    /* ---------- Moteur ---------- */

    if (!data.engine_type) {
      validationErrors.engine_type = "Type de moteur requis";
    }

    /* ---------- Garantie ---------- */

    /*
     * Une garantie est obligatoire uniquement pour la vente.
     */
    if (data.type === "sale" && !data.warranty_plan_id) {
      validationErrors.warranty_plan_id =
        "Une garantie est obligatoire pour un véhicule en vente";
    }

    /* ---------- Immatriculation ---------- */

    if (!data.license_plate?.trim()) {
      validationErrors.license_plate = "Immatriculation requise";
    } else {
      const normalizedPlate = data.license_plate
        .toUpperCase()
        .replace(/\s/g, "");

      const plateRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;

      if (!plateRegex.test(normalizedPlate)) {
        validationErrors.license_plate = "Format invalide (ex : AB-123-CD)";
      }
    }

    return validationErrors;
  };

  /* =========================================================
     MODIFICATION DU FORMULAIRE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let newValue = value;

    /*
     * Le champ équipements est saisi sous forme de texte
     * séparé par des virgules, mais envoyé à l'API sous
     * forme de tableau.
     */
    if (name === "equipments") {
      newValue = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const updatedForm = {
      ...form,
      [name]: newValue,
    };

    /* =====================================================
       LOCATION → PAS DE GARANTIE
    ===================================================== */

    if (name === "type" && value === "rent") {
      updatedForm.warranty_plan_id = "";
    }

    /* =====================================================
       VENTE → PAS D'OPTIONS DE LOCATION
    ===================================================== */

    if (name === "type" && value === "sale") {
      updatedForm.included_options = [];
      updatedForm.optional_options = [];
    }

    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  /* =========================================================
     VALIDITÉ DU FORMULAIRE
  ========================================================= */

  const isFormValid =
    Object.keys(errors).length === 0 &&
    form.brand?.trim() &&
    form.model?.trim() &&
    Number(form.price) > 0 &&
    Number(form.mileage) >= 0 &&
    Number(form.year) >= 1900 &&
    Number(form.year) <= new Date().getFullYear() &&
    !!form.engine_type &&
    !!form.license_plate?.trim() &&
    (form.type !== "sale" || !!form.warranty_plan_id);

  /* =========================================================
     OUVERTURE DE LA MODALE
  ========================================================= */

  const openModal = (v = null) => {
    if (v) {
      setEditId(v.id);

      // =================================================
      // IMAGES EXISTANTES
      // =================================================

      const existingImages = v.images ?? [];

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

        equipments: Array.isArray(v.equipments) ? v.equipments.join(", ") : "",

        condition: v.condition ?? "used",

        images: existingImages.map((image) => image.key),

        included_options: v.included_options?.map((o) => o.id) ?? [],

        optional_options: v.optional_options?.map((o) => o.id) ?? [],
      });

      // =================================================
      // APERÇU DES IMAGES EXISTANTES
      // =================================================

      setPreview(existingImages.map((image) => image.url));
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
        optional_options: [],
      });

      setPreview([]);
    }

    setErrors({});
    setShowModal(true);
  };

  /* =========================================================
     FERMETURE DE LA MODALE
  ========================================================= */

  const closeModal = () => {
    /*
     * On révoque les URLs temporaires créées avec
     * URL.createObjectURL().
     */
    preview.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setShowModal(false);
    resetForm();
  };

  /* =========================================================
     GESTION DES IMAGES
  ========================================================= */

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    /*
     * Création des URLs temporaires uniquement pour
     * l'aperçu côté navigateur.
     */
    const urls = files.map((file) => URL.createObjectURL(file));

    setPreview((previous) => [...previous, ...urls]);

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, ...files],
    }));

    /*
     * Permet de sélectionner à nouveau le même fichier
     * si nécessaire.
     */
    event.target.value = "";
  };

  const removeImage = (index) => {
    const image = preview[index];

    // Libère l'URL temporaire créée avec URL.createObjectURL()
    if (image?.startsWith("blob:")) {
      URL.revokeObjectURL(image);
    }

    setPreview((prev) => prev.filter((_, imageIndex) => imageIndex !== index));

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };
  /* =========================================================
     OPTIONS : AJOUT / SUPPRESSION
  ========================================================= */

  const toggleOption = (field, optionId, checked) => {
    setForm((previous) => {
      const currentValues = previous[field] || [];

      const updatedValues = checked
        ? [...currentValues, optionId]
        : currentValues.filter((id) => id !== optionId);

      return {
        ...previous,
        [field]: updatedValues,
      };
    });
  };

  /* =========================================================
     ENVOI DU FORMULAIRE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /*
     * Double protection : le bouton est déjà désactivé
     * lorsque le formulaire est invalide.
     */
    if (!isFormValid || saving) {
      return;
    }

    setSaving(true);

    try {
      /* =====================================================
         1. UPLOAD DES NOUVELLES IMAGES
      ===================================================== */

      const files = form.images.filter((image) => image instanceof File);

      const uploadedKeys = files.length > 0 ? await uploadImages(files) : [];

      // =================================================
      // KEYS DES IMAGES EXISTANTES
      // =================================================

      const existingKeys = form.images.filter(
        (image) => typeof image === "string"
      );

      // =================================================
      // TOUTES LES KEYS À ENREGISTRER
      // =================================================

      const imageKeys = [...existingKeys, ...uploadedKeys];

      /* =====================================================
         2. CONSTRUCTION DU PAYLOAD
      ===================================================== */

      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),

        price: Number(form.price),
        mileage: Number(form.mileage),
        year: Number(form.year),

        type: form.type,
        condition: form.condition,

        license_plate: form.license_plate.toUpperCase().replace(/\s/g, ""),

        description: form.description?.trim() || null,

        engine_type: form.engine_type || null,

        warranty_plan_id:
          form.type === "sale" ? form.warranty_plan_id || null : null,

        equipments: form.equipments || [],

        included_options: form.type === "rent" ? form.included_options : [],

        optional_options: form.type === "rent" ? form.optional_options : [],

        images: imageKeys,
      };

      /* =====================================================
        3. APPEL API
      ===================================================== */

      await apiFetch(editId ? `/admin/vehicles/${editId}` : "/admin/vehicles", {
        method: editId ? "PUT" : "POST",

        body: payload,
      });

      /* =====================================================
        4. RAFRAÎCHISSEMENT
      ===================================================== */

      toast.success(editId ? "Véhicule modifié ✅" : "Véhicule ajouté ✅");

      await fetchVehicles(page);

      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde véhicule :", err);

      toast.error(err.message || "Erreur lors de la sauvegarde du véhicule");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <div className="container mt-4">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <BsCarFrontFill />
            Véhicules
          </h2>

          <small className="text-muted">Gestion du catalogue automobile</small>
        </div>

        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 px-3"
          onClick={() => openModal()}
        >
          <BsPlusLg />
          Ajouter
        </button>
      </div>

      {/* =====================================================
          FILTRES
      ===================================================== */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          {/* =========================
        HEADER
    ========================= */}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
            <div>
              <h5 className="fw-semibold mb-1">Rechercher un véhicule</h5>

              <p className="text-muted small mb-0">
                Recherchez par marque, modèle ou immatriculation.
              </p>
            </div>

            {(search || licensePlate || filterType) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearch("");
                  setLicensePlate("");
                  setFilterType("");
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-2" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* =========================
        FILTRES
    ========================= */}

          <div className="row g-3">
            {/* =========================
          RECHERCHE MARQUE / MODÈLE
      ========================= */}

            <div className="col-lg-5">
              <label htmlFor="vehicle-search" className="form-label fw-medium">
                Marque ou modèle
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted" />
                </span>

                <input
                  id="vehicle-search"
                  type="text"
                  className="form-control"
                  placeholder="Ex. BMW Série 3"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            {/* =========================
          IMMATRICULATION
      ========================= */}

            <div className="col-lg-4">
              <label
                htmlFor="vehicle-license-plate"
                className="form-label fw-medium"
              >
                Immatriculation
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-car-front text-muted" />
                </span>

                <input
                  id="vehicle-license-plate"
                  type="text"
                  className="form-control"
                  placeholder="AB-123-CD"
                  value={licensePlate}
                  onChange={(event) => {
                    const value = event.target.value
                      .toUpperCase()
                      .replace(/\s/g, "");

                    setLicensePlate(value);
                  }}
                />
              </div>
            </div>

            {/* =========================
          TYPE
      ========================= */}

            <div className="col-lg-3">
              <label htmlFor="vehicle-type" className="form-label fw-medium">
                Type
              </label>

              <select
                id="vehicle-type"
                className="form-select"
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
              >
                <option value="">Tous les types</option>

                {Object.entries(VEHICLE_TYPES).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LISTE DES VÉHICULES
      ===================================================== */}

      <div className="row g-4">
        {vehicles.length === 0 ? (
          <div className="col-12">
            <p className="text-muted mb-0">Aucun véhicule trouvé.</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              v={vehicle}
              fetchVehicles={fetchVehicles}
              openModal={openModal}
            />
          ))
        )}
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mt-4">
        {/* =========================
      NOMBRE TOTAL D'INSCRITS
  ========================= */}

        <span className="text-muted">
          <strong>{total}</strong> {total <= 1 ? "véhicule" : "véhicules"}
        </span>

        {/* =========================
      PAGINATION
  ========================= */}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => fetchVehicles(newPage)}
        />
      </div>

      {/* =====================================================
          MODALE AJOUT / MODIFICATION
      ===================================================== */}

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h5 className="mb-4">
                {editId ? "Modifier le véhicule" : "Ajouter un véhicule"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* =================================================
                      INFORMATIONS GÉNÉRALES
                  ================================================= */}

                  <div className="col-12">
                    <h6 className="text-muted">Informations générales</h6>
                  </div>

                  {/* Marque */}

                  <div className="col-md-6">
                    <label className="form-label">Marque</label>

                    <input
                      name="brand"
                      type="text"
                      className={`form-control ${
                        errors.brand ? "is-invalid" : ""
                      }`}
                      value={form.brand}
                      onChange={handleChange}
                    />

                    {errors.brand && (
                      <div className="invalid-feedback">{errors.brand}</div>
                    )}
                  </div>

                  {/* Modèle */}

                  <div className="col-md-6">
                    <label className="form-label">Modèle</label>

                    <input
                      name="model"
                      type="text"
                      className={`form-control ${
                        errors.model ? "is-invalid" : ""
                      }`}
                      value={form.model}
                      onChange={handleChange}
                    />

                    {errors.model && (
                      <div className="invalid-feedback">{errors.model}</div>
                    )}
                  </div>

                  {/* Prix */}

                  <div className="col-md-6">
                    <label className="form-label">Prix (€)</label>

                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`form-control ${
                        errors.price ? "is-invalid" : ""
                      }`}
                      value={form.price}
                      onChange={handleChange}
                    />

                    {errors.price && (
                      <div className="invalid-feedback">{errors.price}</div>
                    )}
                  </div>

                  {/* Type */}

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

                  {/* Kilométrage */}

                  <div className="col-md-6">
                    <label className="form-label">Kilométrage</label>

                    <input
                      name="mileage"
                      type="number"
                      min="0"
                      className={`form-control ${
                        errors.mileage ? "is-invalid" : ""
                      }`}
                      value={form.mileage}
                      onChange={handleChange}
                    />

                    {errors.mileage && (
                      <div className="invalid-feedback">{errors.mileage}</div>
                    )}
                  </div>

                  {/* Année */}

                  <div className="col-md-6">
                    <label className="form-label">Année</label>

                    <input
                      name="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`form-control ${
                        errors.year ? "is-invalid" : ""
                      }`}
                      value={form.year}
                      onChange={handleChange}
                    />

                    {errors.year && (
                      <div className="invalid-feedback">{errors.year}</div>
                    )}
                  </div>

                  {/* Immatriculation */}

                  <div className="col-md-6">
                    <label className="form-label">Immatriculation</label>

                    <input
                      name="license_plate"
                      type="text"
                      className={`form-control ${
                        errors.license_plate ? "is-invalid" : ""
                      }`}
                      value={form.license_plate}
                      onChange={handleChange}
                    />

                    {errors.license_plate && (
                      <div className="invalid-feedback">
                        {errors.license_plate}
                      </div>
                    )}
                  </div>

                  {/* Moteur */}

                  <div className="col-md-6">
                    <label className="form-label">Moteur</label>

                    <select
                      name="engine_type"
                      className={`form-select ${
                        errors.engine_type ? "is-invalid" : ""
                      }`}
                      value={form.engine_type}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>

                      {Object.entries(ENGINE_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>

                    {errors.engine_type && (
                      <div className="invalid-feedback">
                        {errors.engine_type}
                      </div>
                    )}
                  </div>

                  {/* Description */}

                  <div className="col-12">
                    <label className="form-label">Description</label>

                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* =================================================
                      GARANTIE
                  ================================================= */}

                  {form.type === "sale" && (
                    <div className="col-12">
                      <div className="card border-primary">
                        <div className="card-body">
                          <h6 className="mb-3">Garantie</h6>

                          <select
                            name="warranty_plan_id"
                            className={`form-select ${
                              errors.warranty_plan_id ? "is-invalid" : ""
                            }`}
                            value={form.warranty_plan_id || ""}
                            onChange={handleChange}
                          >
                            <option value="">Aucune garantie</option>

                            {warrantyPlans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                🛡 {plan.name} — {plan.duration_months} mois —{" "}
                                {plan.price} €
                              </option>
                            ))}
                          </select>

                          {form.warranty_plan_id && (
                            <div className="alert alert-info mt-2 mb-0 py-2">
                              ✔ Garantie active
                            </div>
                          )}

                          {errors.warranty_plan_id && (
                            <div className="invalid-feedback d-block">
                              {errors.warranty_plan_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      OPTIONS DE LOCATION
                  ================================================= */}

                  {form.type === "rent" && (
                    <div className="col-12">
                      {/* Options incluses */}

                      <h6 className="mb-3">Options incluses</h6>

                      <div className="row g-2">
                        {options
                          .filter((option) => option.type === "included")
                          .map((option) => (
                            <div key={option.id} className="col-md-6">
                              <div className="form-check">
                                <input
                                  id={`included-${option.id}`}
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={form.included_options.includes(
                                    option.id
                                  )}
                                  onChange={(event) =>
                                    toggleOption(
                                      "included_options",
                                      option.id,
                                      event.target.checked
                                    )
                                  }
                                />

                                <label
                                  htmlFor={`included-${option.id}`}
                                  className="form-check-label"
                                >
                                  {option.name}
                                </label>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Options optionnelles */}

                      <h6 className="mt-4 mb-3">Options optionnelles</h6>

                      <div className="row g-2">
                        {options
                          .filter((option) => option.type === "custom")
                          .map((option) => (
                            <div key={option.id} className="col-md-6">
                              <div className="form-check">
                                <input
                                  id={`optional-${option.id}`}
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={form.optional_options.includes(
                                    option.id
                                  )}
                                  onChange={(event) =>
                                    toggleOption(
                                      "optional_options",
                                      option.id,
                                      event.target.checked
                                    )
                                  }
                                />

                                <label
                                  htmlFor={`optional-${option.id}`}
                                  className="form-check-label"
                                >
                                  {option.name}

                                  {Number(option.price) > 0 && (
                                    <> (+{option.price} €)</>
                                  )}
                                </label>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      IMAGES
                  ================================================= */}

                  <div className="col-12">
                    <label className="form-label">Images</label>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="form-control"
                      onChange={handleImages}
                    />

                    {preview.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted d-block mb-2">
                          {preview.length} image(s) sélectionnée(s)
                        </small>

                        <div className="d-flex flex-wrap gap-3">
                          {preview.map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="position-relative"
                              style={{ width: "150px", height: "110px" }}
                            >
                              <img
                                src={image}
                                alt={`Aperçu ${index + 1}`}
                                className="img-thumbnail w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />

                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                onClick={() => removeImage(index)}
                                aria-label={`Supprimer l'image ${index + 1}`}
                              >
                                <i className="bi bi-x" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isFormValid || saving}
                  >
                    {saving
                      ? "Enregistrement..."
                      : editId
                        ? "Modifier"
                        : "Ajouter"}
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
