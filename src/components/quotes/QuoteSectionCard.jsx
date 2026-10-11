// Uniformise la présentation des sections de la page :
// véhicule, détail financier, financement, reprise, etc.
//
// Les enfants sont transmis dans la propriété spéciale children.
export default function QuoteSectionCard({
  icon,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section className={`quote-card ${className}`}>
      <div className="quote-card__header">
        <div className="quote-card__icon" aria-hidden="true">
          <i className={`bi ${icon}`} />
        </div>

        <div>
          <h2 className="quote-card__title">{title}</h2>

          {description && (
            <p className="quote-card__description">{description}</p>
          )}
        </div>
      </div>

      <div className="quote-card__body">{children}</div>
    </section>
  );
}
