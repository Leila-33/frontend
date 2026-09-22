// =========================================================
// FORMATAGE
// =========================================================

/**
 * Formate une date pour l'API.
 *
 * Le format retourné est YYYY-MM-DD.
 */
export const formatDate = (date) => {

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA")
    .format(date);
};


/**
 * Formate un prix selon les conventions françaises.
 */
export const formatPrice = (price) => {

  if (
    price === null ||
    price === undefined
  ) {
    return null;
  }

  return Number(price).toLocaleString(
    "fr-FR"
  );
};