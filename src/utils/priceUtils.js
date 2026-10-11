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

// Formate un montant en euros selon les conventions françaises.
// Exemple : 12500 devient 12 500 €.
export const formatCurrency = (value) => {
  // Évite d'afficher NaN ou un montant incorrect lorsque
  // la donnée n'est pas fournie.
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Non renseigné";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
};