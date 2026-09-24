/**
 * Formate un montant financier.
 *
 * Une valeur null ou undefined est affichée comme 0.
 */
const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR");

/**
 * Affiche le détail financier d'une offre :
 * - prix du véhicule ;
 * - remise ;
 * - apport ;
 * - reprise ;
 * - montant financé ;
 * - durée ;
 * - mensualité.
 */
export default function QuoteFinancingCard({
  quote,
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        <h2 className="h5 fw-semibold mb-4">
          Financement
        </h2>

        {/* =====================================================
            PRIX DU VÉHICULE
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-2">
          <span>
            Prix véhicule
          </span>

          <strong>
            {formatAmount(quote?.base_price)} €
          </strong>
        </div>

        {/* =====================================================
            REMISE
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-2">
          <span>
            Remise
          </span>

          <strong>
            - {formatAmount(quote?.discount)} €
          </strong>
        </div>

        {/* =====================================================
            APPORT
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-2">
          <span>
            Apport
          </span>

          <strong>
            - {formatAmount(quote?.down_payment)} €
          </strong>
        </div>

        {/* =====================================================
            REPRISE
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-3">
          <span>
            Reprise
          </span>

          <strong>
            - {formatAmount(quote?.trade_in_value)} €
          </strong>
        </div>

        <hr />

        {/* =====================================================
            MONTANT FINANCÉ
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-2">
          <span>
            Montant financé
          </span>

          <strong>
            {formatAmount(quote?.financed_amount)} €
          </strong>
        </div>

        {/* =====================================================
            DURÉE
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3 mb-2">
          <span>
            Durée
          </span>

          <strong>
            {quote?.duration_months != null
              ? `${quote.duration_months} mois`
              : "Non renseignée"}
          </strong>
        </div>

        {/* =====================================================
            MENSUALITÉ
        ===================================================== */}

        <div className="d-flex justify-content-between gap-3">
          <span>
            Mensualité
          </span>

          <strong>
            {quote?.monthly_payment != null
              ? `${formatAmount(quote.monthly_payment)} €/mois`
              : "Non renseignée"}
          </strong>
        </div>

      </div>
    </div>
  );
}