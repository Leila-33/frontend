import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

/**
 * Formulaire de création / modification d'une offre commerciale.
 *
 * Responsabilités :
 * - charger le prospect ;
 * - gérer les informations financières ;
 * - gérer la reprise d'un véhicule ;
 * - valider l'ensemble du formulaire ;
 * - calculer l'estimation de reprise ;
 * - transmettre les données au composant parent.
 *
 * Le composant ne contient pas la logique métier
 * de création de l'offre : celle-ci reste gérée
 * par `onSubmit`.
 */
export default function QuoteFormPage({
  initialValues = null,
  mode = "create",
  onSubmit = null,
}) {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ÉTAT
  // =====================================================

  const [loading, setLoading] = useState(false);

  const [tradeInLoading, setTradeInLoading] =
    useState(false);

  const [lead, setLead] = useState(null);

  const [discount, setDiscount] = useState(
    initialValues?.discount ?? 0
  );

  const [downPayment, setDownPayment] =
    useState(
      initialValues?.down_payment ?? 0
    );

  const [duration, setDuration] = useState(
    initialValues?.duration_months ?? 36
  );

  const [tradeInValue, setTradeInValue] =
    useState(
      initialValues?.trade_in_value ?? 0
    );

  const [form, setForm] = useState({
    trade_in_enabled:
      Boolean(initialValues?.trade_in),

    trade_brand:
      initialValues?.trade_in?.brand ?? "",

    trade_model:
      initialValues?.trade_in?.model ?? "",

    trade_year:
      initialValues?.trade_in?.year ?? "",

    trade_mileage:
      initialValues?.trade_in?.mileage ?? "",

    trade_condition:
      initialValues?.trade_in?.condition ?? "",
  });

  // =====================================================
  // VÉHICULE
  // =====================================================

  const vehicle = lead?.vehicle;

  const basePrice =
    Number(
      initialValues?.base_price ??
        vehicle?.price ??
        0
    );

  // =====================================================
  // CHARGEMENT DU PROSPECT
  // =====================================================

  const fetchLead = useCallback(async () => {
    if (!leadId) {
      return;
    }

    try {
      const data = await apiFetch(
        `/agent/leads/${leadId}`,
        {
          method: "GET",
        }
      );

      setLead(data);
    } catch (error) {
      toast.error(
        "Impossible de charger le prospect."
      );
    }
  }, [leadId]);

  useEffect(() => {
    if (mode === "create") {
      fetchLead();
      return;
    }

    if (initialValues?.lead) {
      setLead(initialValues.lead);
    }
  }, [
    fetchLead,
    mode,
    initialValues,
  ]);

  // =====================================================
  // VALIDATION DE LA REPRISE
  // =====================================================

  /**
   * Valide uniquement les champs de la reprise.
   *
   * La reprise n'est considérée comme obligatoire
   * que lorsque `trade_in_enabled` est activé.
   */
  const validateTradeIn = useCallback(
    (data) => {
      const errors = {};

      // -------------------------------------------------
      // Si la reprise n'est pas activée,
      // aucun champ de reprise n'est obligatoire.
      // -------------------------------------------------

      if (!data.trade_in_enabled) {
        return errors;
      }

      const currentYear =
        new Date().getFullYear();

      // -------------------------------------------------
      // MARQUE
      // -------------------------------------------------

      if (!data.trade_brand?.trim()) {
        errors.trade_brand =
          "Marque obligatoire.";
      }

      // -------------------------------------------------
      // MODÈLE
      // -------------------------------------------------

      if (!data.trade_model?.trim()) {
        errors.trade_model =
          "Modèle obligatoire.";
      }

      // -------------------------------------------------
      // ANNÉE
      // -------------------------------------------------

      if (
        data.trade_year === "" ||
        data.trade_year == null
      ) {
        errors.trade_year =
          "Année requise.";
      } else {
        const year = Number(
          data.trade_year
        );

        if (
          !Number.isInteger(year) ||
          year < 1900 ||
          year > currentYear
        ) {
          errors.trade_year =
            "Année invalide.";
        }
      }

      // -------------------------------------------------
      // KILOMÉTRAGE
      // -------------------------------------------------

      if (
        data.trade_mileage === "" ||
        data.trade_mileage == null
      ) {
        errors.trade_mileage =
          "Kilométrage requis.";
      } else {
        const mileage = Number(
          data.trade_mileage
        );

        if (
          !Number.isFinite(mileage) ||
          mileage < 0
        ) {
          errors.trade_mileage =
            "Kilométrage invalide.";
        }
      }

      // -------------------------------------------------
      // ÉTAT
      // -------------------------------------------------

      if (!data.trade_condition) {
        errors.trade_condition =
          "État obligatoire.";
      }

      return errors;
    },
    []
  );

  // =====================================================
  // VALIDATION GLOBALE
  // =====================================================

  /**
   * Valide l'ensemble du formulaire.
   *
   * Toutes les erreurs sont centralisées dans cet objet.
   *
   * Le formulaire est valide uniquement lorsque :
   *
   * Object.keys(errors).length === 0
   */
  const errors = useMemo(() => {
    const validationErrors = {};

    // -------------------------------------------------
    // PRIX DU VÉHICULE
    // -------------------------------------------------

    if (
      !Number.isFinite(basePrice) ||
      basePrice < 0
    ) {
      validationErrors.base_price =
        "Prix du véhicule invalide.";
    }

    // -------------------------------------------------
    // REMISE
    // -------------------------------------------------

    const numericDiscount =
      Number(discount);

    if (
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0
    ) {
      validationErrors.discount =
        "Remise invalide.";
    }

    // -------------------------------------------------
    // APPORT
    // -------------------------------------------------

    const numericDownPayment =
      Number(downPayment);

    if (
      !Number.isFinite(numericDownPayment) ||
      numericDownPayment < 0
    ) {
      validationErrors.down_payment =
        "Apport invalide.";
    }

    // -------------------------------------------------
    // DURÉE
    // -------------------------------------------------

    const allowedDurations = [
      24,
      36,
      48,
      60,
    ];

    if (
      !allowedDurations.includes(
        Number(duration)
      )
    ) {
      validationErrors.duration =
        "Durée de financement invalide.";
    }

    // -------------------------------------------------
    // REPRISE
    // -------------------------------------------------

    const tradeInErrors =
      validateTradeIn(form);

    Object.assign(
      validationErrors,
      tradeInErrors
    );

    // -------------------------------------------------
    // VALEUR DE REPRISE
    // -------------------------------------------------

    const numericTradeInValue =
      Number(tradeInValue);

    if (
      form.trade_in_enabled &&
      (
        !Number.isFinite(
          numericTradeInValue
        ) ||
        numericTradeInValue < 0
      )
    ) {
      validationErrors.trade_in_value =
        "Valeur de reprise invalide.";
    }

    // -------------------------------------------------
    // COHÉRENCE DU FINANCEMENT
    // -------------------------------------------------

    const totalDiscount =
      numericDiscount +
      numericDownPayment +
      numericTradeInValue;

    if (
      Number.isFinite(basePrice) &&
      Number.isFinite(totalDiscount) &&
      totalDiscount > basePrice
    ) {
      validationErrors.total =
        "La remise, l'apport et la reprise ne peuvent pas dépasser le prix du véhicule.";
    }

    return validationErrors;
  }, [
    basePrice,
    discount,
    downPayment,
    duration,
    form,
    tradeInValue,
    validateTradeIn,
  ]);

  // =====================================================
  // VALIDITÉ DU FORMULAIRE
  // =====================================================

  /**
   * Une seule règle détermine si l'offre peut être
   * enregistrée : aucune erreur ne doit être présente.
   */
  const isFormValid =
    Object.keys(errors).length === 0;

  // =====================================================
  // MODIFICATION DES CHAMPS DE REPRISE
  // =====================================================

  const handleTradeInChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // =====================================================
  // ACTIVATION / DÉSACTIVATION DE LA REPRISE
  // =====================================================

  const handleTradeInToggle = (event) => {
    const enabled =
      event.target.checked;

    setForm((previousForm) => ({
      ...previousForm,
      trade_in_enabled: enabled,
    }));

    // Si la reprise est désactivée,
    // sa valeur ne doit plus être déduite.
    if (!enabled) {
      setTradeInValue(0);
    }
  };

  // =====================================================
  // CALCUL DE LA REPRISE
  // =====================================================

  const handleTradeIn = async () => {
    if (
      !form.trade_in_enabled ||
      Object.keys(
        validateTradeIn(form)
      ).length > 0
    ) {
      return;
    }

    try {
      setTradeInLoading(true);

      const payload = {
        brand: form.trade_brand.trim(),
        model: form.trade_model.trim(),
        year: Number(form.trade_year),
        mileage: Number(form.trade_mileage),
        condition: form.trade_condition,
      };

      const response = await apiFetch(
        "/trade-in/estimate",
        {
          method: "POST",
          body: payload,
        }
      );

      const estimatedValue = Number(
        response?.estimated_value ?? 0
      );

      setTradeInValue(
        Number.isFinite(estimatedValue)
          ? estimatedValue
          : 0
      );

      toast.success(
        "Estimation reprise mise à jour."
      );
    } catch (error) {
      toast.error(
        error?.message ||
          "Erreur lors de l'estimation de la reprise."
      );
    } finally {
      setTradeInLoading(false);
    }
  };

  // =====================================================
  // CALCUL DE L'OFFRE
  // =====================================================

  const total = useMemo(() => {
    return Math.max(
      basePrice -
        Number(discount || 0) -
        Number(downPayment || 0) -
        Number(tradeInValue || 0),
      0
    );
  }, [
    basePrice,
    discount,
    downPayment,
    tradeInValue,
  ]);

  const monthly = useMemo(() => {
    const numericDuration =
      Number(duration);

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration <= 0
    ) {
      return "0.00";
    }

    return (
      total / numericDuration
    ).toFixed(2);
  }, [
    total,
    duration,
  ]);

  // =====================================================
  // CRÉATION / MODIFICATION DE L'OFFRE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Sécurité supplémentaire :
    // même si le bouton est désactivé côté interface,
    // on empêche également la soumission si une erreur
    // existe.
    if (
      loading ||
      !isFormValid ||
      !lead ||
      !onSubmit
    ) {
      return;
    }

    const payload = {
      lead_id: lead.id,

      discount: Number(discount),

      down_payment:
        Number(downPayment),

      trade_in_value:
        Number(tradeInValue),

      duration_months:
        Number(duration),

      trade_in:
        form.trade_in_enabled
          ? {
              brand:
                form.trade_brand.trim(),

              model:
                form.trade_model.trim(),

              year:
                Number(form.trade_year),

              mileage:
                Number(
                  form.trade_mileage
                ),

              condition:
                form.trade_condition,
            }
          : null,
    };

    try {
      setLoading(true);

      await onSubmit(payload);
    } catch (error) {
      toast.error(
        error?.message ||
          "Erreur lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (!lead) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-light border"
          role="status"
        >
          Prospect introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* =================================================
          EN-TÊTE
          ================================================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h1 className="h2 fw-bold mb-1">
            {mode === "create"
              ? "Créer une offre"
              : "Modifier l'offre"}
          </h1>

          <div className="text-muted">
            {lead.first_name}{" "}
            {lead.last_name}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <i
            className="bi bi-arrow-left me-2"
            aria-hidden="true"
          />
          Retour
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
      >

        {/* =================================================
            REPRISE
            ================================================= */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">

            <h2 className="h5 fw-semibold mb-3">
              Reprise véhicule
            </h2>

            <div className="form-check mb-3">
              <input
                id="trade-in-enabled"
                className="form-check-input"
                type="checkbox"
                checked={
                  form.trade_in_enabled
                }
                onChange={
                  handleTradeInToggle
                }
                disabled={loading}
              />

              <label
                htmlFor="trade-in-enabled"
                className="form-check-label"
              >
                Le client possède un véhicule
                à reprendre
              </label>
            </div>

            {form.trade_in_enabled && (
              <div className="row g-3">

                {/* -----------------------------------------
                    MARQUE
                    ----------------------------------------- */}

                <div className="col-md-6">
                  <label
                    htmlFor="trade-brand"
                    className="form-label"
                  >
                    Marque
                  </label>

                  <input
                    id="trade-brand"
                    name="trade_brand"
                    type="text"
                    className={`form-control ${
                      errors.trade_brand
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.trade_brand
                    }
                    onChange={
                      handleTradeInChange
                    }
                    disabled={loading}
                    aria-invalid={
                      Boolean(
                        errors.trade_brand
                      )
                    }
                    aria-describedby={
                      errors.trade_brand
                        ? "trade-brand-error"
                        : undefined
                    }
                  />

                  {errors.trade_brand && (
                    <div
                      id="trade-brand-error"
                      className="invalid-feedback"
                    >
                      {errors.trade_brand}
                    </div>
                  )}
                </div>

                {/* -----------------------------------------
                    MODÈLE
                    ----------------------------------------- */}

                <div className="col-md-6">
                  <label
                    htmlFor="trade-model"
                    className="form-label"
                  >
                    Modèle
                  </label>

                  <input
                    id="trade-model"
                    name="trade_model"
                    type="text"
                    className={`form-control ${
                      errors.trade_model
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.trade_model
                    }
                    onChange={
                      handleTradeInChange
                    }
                    disabled={loading}
                    aria-invalid={
                      Boolean(
                        errors.trade_model
                      )
                    }
                  />

                  {errors.trade_model && (
                    <div className="invalid-feedback">
                      {errors.trade_model}
                    </div>
                  )}
                </div>

                {/* -----------------------------------------
                    ANNÉE
                    ----------------------------------------- */}

                <div className="col-md-4">
                  <label
                    htmlFor="trade-year"
                    className="form-label"
                  >
                    Année
                  </label>

                  <input
                    id="trade-year"
                    name="trade_year"
                    type="number"
                    min="1900"
                    max={
                      new Date().getFullYear()
                    }
                    className={`form-control ${
                      errors.trade_year
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.trade_year
                    }
                    onChange={
                      handleTradeInChange
                    }
                    disabled={loading}
                    aria-invalid={
                      Boolean(
                        errors.trade_year
                      )
                    }
                  />

                  {errors.trade_year && (
                    <div className="invalid-feedback">
                      {errors.trade_year}
                    </div>
                  )}
                </div>

                {/* -----------------------------------------
                    KILOMÉTRAGE
                    ----------------------------------------- */}

                <div className="col-md-4">
                  <label
                    htmlFor="trade-mileage"
                    className="form-label"
                  >
                    Kilométrage
                  </label>

                  <input
                    id="trade-mileage"
                    name="trade_mileage"
                    type="number"
                    min="0"
                    className={`form-control ${
                      errors.trade_mileage
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.trade_mileage
                    }
                    onChange={
                      handleTradeInChange
                    }
                    disabled={loading}
                    aria-invalid={
                      Boolean(
                        errors.trade_mileage
                      )
                    }
                  />

                  {errors.trade_mileage && (
                    <div className="invalid-feedback">
                      {errors.trade_mileage}
                    </div>
                  )}
                </div>

                {/* -----------------------------------------
                    ÉTAT
                    ----------------------------------------- */}

                <div className="col-md-4">
                  <label
                    htmlFor="trade-condition"
                    className="form-label"
                  >
                    État
                  </label>

                  <select
                    id="trade-condition"
                    name="trade_condition"
                    className={`form-select ${
                      errors.trade_condition
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.trade_condition
                    }
                    onChange={
                      handleTradeInChange
                    }
                    disabled={loading}
                    aria-invalid={
                      Boolean(
                        errors.trade_condition
                      )
                    }
                  >
                    <option value="">
                      Choisir
                    </option>

                    <option value="excellent">
                      Excellent
                    </option>

                    <option value="good">
                      Bon
                    </option>

                    <option value="average">
                      Moyen
                    </option>

                    <option value="poor">
                      Mauvais
                    </option>
                  </select>

                  {errors.trade_condition && (
                    <div className="invalid-feedback">
                      {errors.trade_condition}
                    </div>
                  )}
                </div>

                {/* -----------------------------------------
                    CALCUL REPRISE
                    ----------------------------------------- */}

                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={
                      handleTradeIn
                    }
                    disabled={
                      loading ||
                      tradeInLoading ||
                      Object.keys(
                        validateTradeIn(form)
                      ).length > 0
                    }
                  >
                    {tradeInLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Calcul en cours...
                      </>
                    ) : (
                      <>
                        <i
                          className="bi bi-calculator me-2"
                          aria-hidden="true"
                        />
                        Calculer la reprise
                      </>
                    )}
                  </button>

                  {tradeInValue > 0 && (
                    <div className="alert alert-light border mt-3 mb-0">
                      Valeur estimée :
                      {" "}
                      <strong>
                        {tradeInValue} €
                      </strong>
                    </div>
                  )}

                  {errors.trade_in_value && (
                    <div className="text-danger small mt-2">
                      {errors.trade_in_value}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* =================================================
            CONTENU PRINCIPAL
            ================================================= */}

        <div className="row g-4">

          {/* =================================================
              INFORMATIONS FINANCIÈRES
              ================================================= */}

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">

                <h2 className="h5 fw-semibold mb-3">
                  Informations financières
                </h2>

                <div className="row g-3">

                  {/* -----------------------------------------
                      REMISE
                      ----------------------------------------- */}

                  <div className="col-md-6">
                    <label
                      htmlFor="discount"
                      className="form-label"
                    >
                      Remise (€)
                    </label>

                    <input
                      id="discount"
                      type="number"
                      className={`form-control ${
                        errors.discount
                          ? "is-invalid"
                          : ""
                      }`}
                      min="0"
                      value={discount}
                      onChange={(event) =>
                        setDiscount(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      disabled={loading}
                      aria-invalid={
                        Boolean(
                          errors.discount
                        )
                      }
                    />

                    {errors.discount && (
                      <div className="invalid-feedback">
                        {errors.discount}
                      </div>
                    )}
                  </div>

                  {/* -----------------------------------------
                      APPORT
                      ----------------------------------------- */}

                  <div className="col-md-6">
                    <label
                      htmlFor="down-payment"
                      className="form-label"
                    >
                      Apport client (€)
                    </label>

                    <input
                      id="down-payment"
                      type="number"
                      className={`form-control ${
                        errors.down_payment
                          ? "is-invalid"
                          : ""
                      }`}
                      min="0"
                      value={downPayment}
                      onChange={(event) =>
                        setDownPayment(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      disabled={loading}
                      aria-invalid={
                        Boolean(
                          errors.down_payment
                        )
                      }
                    />

                    {errors.down_payment && (
                      <div className="invalid-feedback">
                        {errors.down_payment}
                      </div>
                    )}
                  </div>

                  {/* -----------------------------------------
                      DURÉE
                      ----------------------------------------- */}

                  <div className="col-md-6">
                    <label
                      htmlFor="duration"
                      className="form-label"
                    >
                      Durée
                    </label>

                    <select
                      id="duration"
                      className={`form-select ${
                        errors.duration
                          ? "is-invalid"
                          : ""
                      }`}
                      value={duration}
                      onChange={(event) =>
                        setDuration(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      disabled={loading}
                      aria-invalid={
                        Boolean(
                          errors.duration
                        )
                      }
                    >
                      <option value={24}>
                        24 mois
                      </option>

                      <option value={36}>
                        36 mois
                      </option>

                      <option value={48}>
                        48 mois
                      </option>

                      <option value={60}>
                        60 mois
                      </option>
                    </select>

                    {errors.duration && (
                      <div className="invalid-feedback">
                        {errors.duration}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RÉCAPITULATIF
              ================================================= */}

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">

                <h2 className="h5 fw-semibold mb-3">
                  Récapitulatif
                </h2>

                <div className="mb-3">
                  <div className="fw-semibold">
                    {vehicle?.brand}{" "}
                    {vehicle?.model}
                  </div>

                  <small className="text-muted">
                    {lead.first_name}{" "}
                    {lead.last_name}
                  </small>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Prix véhicule
                  </span>

                  <strong>
                    {basePrice} €
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Remise
                  </span>

                  <strong>
                    - {discount} €
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Apport
                  </span>

                  <strong>
                    - {downPayment} €
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Reprise
                  </span>

                  <strong>
                    - {tradeInValue} €
                  </strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Montant financé
                  </span>

                  <strong>
                    {total} €
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-4">
                  <span>
                    Mensualité estimée
                  </span>

                  <strong>
                    {monthly} €/mois
                  </strong>
                </div>

                {/* -----------------------------------------
                    ERREUR GLOBALE
                    ----------------------------------------- */}

                {!isFormValid && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    Veuillez corriger les erreurs
                    du formulaire avant de générer
                    l'offre.
                  </div>
                )}

                {/* -----------------------------------------
                    ERREUR DE COHÉRENCE FINANCIÈRE
                    ----------------------------------------- */}

                {errors.total && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    {errors.total}
                  </div>
                )}

                {/* -----------------------------------------
                    BOUTON PRINCIPAL
                    ----------------------------------------- */}

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={
                    loading ||
                    !isFormValid
                  }
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-file-earmark-check me-2"
                        aria-hidden="true"
                      />

                      {mode === "create"
                        ? "Générer l'offre"
                        : "Enregistrer les modifications"}
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}