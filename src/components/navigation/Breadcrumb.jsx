import { Link } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";

/**
 * Affiche un fil d'Ariane.
 *
 * Chaque élément doit avoir la structure :
 *
 * {
 *   label: "Tickets",
 *   path: "/sav/tickets"
 * }
 *
 * Le dernier élément représente la page actuelle
 * et n'est donc pas cliquable.
 */
export default function Breadcrumb({ items = [] }) {
  // =====================================================
  // SÉCURITÉ
  // =====================================================

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <div className="d-flex align-items-center flex-wrap gap-2 small">
        {items.map((item, index) => {
          // =================================================
          // VÉRIFICATION DE L'ÉLÉMENT
          // =================================================

          if (!item || typeof item !== "object") {
            return null;
          }

          const isLast = index === items.length - 1;

          return (
            <div
              key={`${item.label}-${index}`}
              className="d-flex align-items-center gap-2"
            >
              {/* =============================================
                  ÉLÉMENT DU BREADCRUMB
                  ============================================= */}

              {isLast || !item.path ? (
                <span className="fw-semibold text-dark">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-decoration-none text-secondary"
                  style={{
                    transition: "color .2s",
                  }}
                >
                  {item.label}
                </Link>
              )}

              {/* =============================================
                  SÉPARATEUR
                  ============================================= */}

              {!isLast && (
                <BsChevronRight
                  size={12}
                  className="text-muted"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
