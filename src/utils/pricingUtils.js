/**
 * Calcule le prix total d'une application.
 *
 * Prend en compte :
 * - Le type de transaction (vente ou location).
 * - La durée de location.
 * - Les options sélectionnées.
 * - L'apport personnel.
 * - La valeur de reprise du véhicule.
 * - La remise éventuelle.
 * - Le montant financé et les mensualités.
 *
 * @param {Object} form - Données du formulaire.
 * @param {Object} vehicleData - Informations du véhicule.
 * @param {Object} selectedDatesData - Dates de location sélectionnées.
 * @param {number} tradeInValue - Valeur estimée du véhicule repris.
 *
 * @returns {Object} Détail des calculs tarifaires.
 */
export const computePricing = (
  form = {},
  vehicleData = {},
  selectedDatesData = {},
  tradeInValue = 0
) => {
  // =========================
  // TYPE DE TRANSACTION
  // =========================

  const isSale = vehicleData?.type === "sale";
  const isRent = vehicleData?.type === "rent";

  // =========================
  // PRIX DU VÉHICULE
  // =========================

  const vehiclePrice = Math.max(0, Number(vehicleData?.price ?? 0));

  // =========================
  // DURÉE DE LOCATION
  // =========================

  let selectedDays = 1;

  if (isRent && selectedDatesData?.start && selectedDatesData?.end) {
    const startDate = new Date(selectedDatesData.start);

    const endDate = new Date(selectedDatesData.end);

    const isValidDate =
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      endDate >= startDate;

    if (isValidDate) {
      const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

      const differenceInDays = Math.ceil(
        differenceInMilliseconds / (1000 * 60 * 60 * 24)
      );

      // Les deux dates sont incluses.
      selectedDays = Math.max(1, differenceInDays + 1);
    }
  }

  // =========================
  // PRIX DE BASE
  // =========================

  // En location, le prix est multiplié
  // par le nombre de jours sélectionnés.
  //
  // En vente, le prix est fixe.
  const basePrice = isRent ? vehiclePrice * selectedDays : vehiclePrice;

  // =========================
  // OPTIONS SÉLECTIONNÉES
  // =========================

  // Les IDs sont convertis en chaînes afin
  // d'éviter les problèmes de comparaison
  // entre un ID numérique et un ID textuel.
  const selectedOptionIds = new Set(
    (form?.optionsSelected ?? []).map((id) => String(id))
  );

  // =========================
  // PRIX DES OPTIONS
  // =========================

  const optionalPrice = (vehicleData?.optional_options ?? []).reduce(
    (sum, option) => {
      // Ignore les options non sélectionnées.
      if (!selectedOptionIds.has(String(option.id))) {
        return sum;
      }

      const optionPrice = Math.max(0, Number(option.price ?? 0));

      // Une option journalière est multipliée
      // par le nombre de jours de location.
      if (isRent && option.billing_type === "daily") {
        return sum + optionPrice * selectedDays;
      }

      // Pour une vente ou une option forfaitaire,
      // le prix est ajouté une seule fois.
      return sum + optionPrice;
    },
    0
  );

  // =========================
  // PRIX TOTAL
  // =========================

  const totalPrice = basePrice + optionalPrice;

  // =========================
  // FINANCEMENT
  // =========================

  // Le financement concerne uniquement
  // les véhicules vendus.
  const durationMonths = isSale
    ? Math.max(0, Number(form?.duration_months ?? 36))
    : 0;

const downPayment = isSale
  ? Number(form?.down_payment)
  : null;
  const discount = isSale ? Math.max(0, Number(form?.discount ?? 0)) : 0;

  const normalizedTradeInValue = isSale
    ? Math.max(0, Number(tradeInValue ?? 0))
    : 0;

  // =========================
  // MONTANT À FINANCER
  // =========================

  const rawFinancedAmount =
    totalPrice - downPayment - normalizedTradeInValue - discount;

  // Le montant financé ne peut pas être négatif.
  const financedAmount = Math.max(rawFinancedAmount, 0);

  // Indique si les réductions dépassent
  // le montant total du véhicule.
  const isInvalidFinance = isSale && rawFinancedAmount < 0;

  // Si aucun montant ne reste à financer,
  // le paiement est considéré comme comptant.
  const isCash = isSale && financedAmount === 0;

  // =========================
  // MENSUALITÉ
  // =========================

  // Calcul simplifié sans intérêts.
  const monthlyPayment =
    isSale && durationMonths > 0
      ? Math.round((financedAmount / durationMonths) * 100) / 100
      : 0;

  // =========================
  // RÉSULTAT
  // =========================

  return {
    // Location
    selectedDays,

    // Prix
    basePrice,
    optionalPrice,
    totalPrice,

    // Financement
    durationMonths,
    downPayment,
    discount,
    tradeInValue: normalizedTradeInValue,
    financedAmount,
    rawFinancedAmount,
    isInvalidFinance,
    isCash,
    monthlyPayment,

    // Type de transaction
    isSale,
    isRent,
  };
};
