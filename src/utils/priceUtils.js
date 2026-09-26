/**
 * Formate un montant financier.
 *
 * Une valeur null ou undefined est affichée comme 0.
 */
export const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
