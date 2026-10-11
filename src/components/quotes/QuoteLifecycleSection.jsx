import QuoteInfoItem from "./QuoteInfoItem";
import QuoteSectionCard from "./QuoteSectionCard";
import { formatDateTimeLong } from "../../utils/dateUtils";
import { QUOTE_REFUSAL_REASONS } from "../../constants/quoteOptions";

export default function QuoteLifecycleSection({ quote, hideWhenEmpty = true }) {
  if (!quote) {
    return null;
  }

  const {
    expires_at,
    accepted_at,
    refused_at,
    refusal_reason,
    refusal_comment,
  } = quote;

  const hasLifecycleInformation = Boolean(
    expires_at || accepted_at || refused_at || refusal_reason || refusal_comment
  );

  if (hideWhenEmpty && !hasLifecycleInformation) {
    return null;
  }

  // Traduit le code du motif en libellé lisible.
  // Si le code est inconnu, conserve sa valeur d'origine.
  const refusalReasonLabel = refusal_reason
    ? (QUOTE_REFUSAL_REASONS[refusal_reason] ?? refusal_reason)
    : null;

  return (
    <QuoteSectionCard
      icon="bi-clock-history"
      title="Suivi du devis"
      description="Retrouvez les dates importantes et l'historique de votre décision."
    >
      {/* Dates importantes du cycle de vie */}
      {(expires_at || accepted_at || refused_at) && (
        <div className="quote-info-grid">
          {expires_at && (
            <QuoteInfoItem
              label="Date d'expiration"
              value={formatDateTimeLong(expires_at)}
            />
          )}

          {accepted_at && (
            <QuoteInfoItem
              label="Date d'acceptation"
              value={formatDateTimeLong(accepted_at)}
              highlight
            />
          )}

          {refused_at && (
            <QuoteInfoItem
              label="Date de refus"
              value={formatDateTimeLong(refused_at)}
            />
          )}
        </div>
      )}

      {/* Informations relatives au refus */}
      {(refusalReasonLabel || refusal_comment) && (
        <div className="quote-decision-details">
          <h3>
            <i className="bi bi-chat-square-text" aria-hidden="true" />
            Informations sur le refus
          </h3>

          {refusalReasonLabel && (
            <div className="quote-decision-note">
              <span className="quote-decision-note__label">Motif du refus</span>

              <p>{refusalReasonLabel}</p>
            </div>
          )}

          {refusal_comment && (
            <div className="quote-decision-note">
              <span className="quote-decision-note__label">Commentaire</span>

              <p>{refusal_comment}</p>
            </div>
          )}
        </div>
      )}
    </QuoteSectionCard>
  );
}
