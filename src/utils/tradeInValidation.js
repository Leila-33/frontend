// ==========================================================
// VALIDATION DE LA REPRISE
// ==========================================================

/**
 * Valide les informations d'un véhicule repris.
 *
 * La reprise est obligatoire uniquement lorsque
 * `trade_in_enabled` est activé.
 *
 * @param {Object} data
 * @param {boolean} [checkEnabled=true]
 * @returns {Object}
 */
export function validateTradeIn(
  data = {},
) {
  const errors = {};

  // ========================================================
  // ACTIVATION DE LA REPRISE
  // ========================================================

  // Dans QuoteForm, la reprise peut être désactivée.
  //
  // Dans ce cas, aucune information de reprise
  // n'est obligatoire.
  if (
    !data.trade_in_enabled
  ) {
    return errors;
  }

  const currentYear = new Date().getFullYear();

  // ========================================================
  // MARQUE
  // ========================================================

  if (!data.trade_brand?.trim()) {
    errors.trade_brand = "Marque requise";
  }

  // ========================================================
  // MODÈLE
  // ========================================================

  if (!data.trade_model?.trim()) {
    errors.trade_model = "Modèle requis";
  }

  // ========================================================
  // ANNÉE
  // ========================================================

  if (
    data.trade_year === "" ||
    data.trade_year == null
  ) {
    errors.trade_year = "Année requise";
  } else {
    const year = Number(data.trade_year);

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      errors.trade_year = "Année invalide";
    }
  }

  // ========================================================
  // KILOMÉTRAGE
  // ========================================================

  if (
    data.trade_mileage === "" ||
    data.trade_mileage == null
  ) {
    errors.trade_mileage = "Kilométrage requis";
  } else {
    const mileage = Number(data.trade_mileage);

    if (
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      errors.trade_mileage = "Kilométrage invalide";
    }
  }

  // ========================================================
  // ÉTAT
  // ========================================================

  if (!data.trade_condition) {
    errors.trade_condition = "État requis";
  }

  return errors;
}