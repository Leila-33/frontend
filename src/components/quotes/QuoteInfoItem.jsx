// Petit composant réutilisable pour afficher une information
// sous la forme d'un libellé et d'une valeur.
//
// La propriété highlight permet de mettre en avant certaines
// valeurs financières.

export default function QuoteInfoItem({ label, value, highlight = false }) {
  return (
    <div
      className={`quote-info-item ${
        highlight ? "quote-info-item--highlight" : ""
      }`}
    >
      <span className="quote-info-item__label">{label}</span>

      <span className="quote-info-item__value">{value ?? "Non renseigné"}</span>
    </div>
  );
}
