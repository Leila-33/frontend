import React from "react";
import { useAuth } from "../../contexts/AuthContext";

// ==========================================================
// SIDEBAR GÉNÉRIQUE
// ==========================================================
// Ce composant centralise la structure commune des sidebars :
// - en-tête Mmotors
// - navigation
// - bloc utilisateur
//
// Les liens eux-mêmes restent dans les sidebars spécifiques
// (AdminSidebar, SalesSidebar, SavSidebar, UserSidebar).
// ==========================================================

export default function Sidebar({
  mobile = false,
  title,
  userRoleLabel,
  userIcon,
  children
}) {
  // Récupère l'utilisateur actuellement connecté.
  // Cela évite de renseigner manuellement son nom et son email
  // dans chaque sidebar.
  const { user } = useAuth();

  // Construit le nom complet de l'utilisateur.
  const userName = [
    user?.first_name,
    user?.last_name
  ]
    .filter(Boolean)
    .join(" ");

  // Si le nom n'est pas disponible, on utilise le libellé du rôle.
  const displayName = userName || userRoleLabel || "Utilisateur";

  return (
    <aside
      className={`bg-white border-end vh-100 p-3 d-flex flex-column ${
        mobile ? "" : "d-none d-lg-flex"
      }`}
      style={{ width: "280px" }}
    >
      {/* ======================================================
          EN-TÊTE
          ====================================================== */}

      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-1">
          Mmotors
        </h4>

        <p className="text-muted small mb-0">
          {title}
        </p>
      </div>

      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <nav className="d-flex flex-column gap-1">
        {children}
      </nav>

      {/* ======================================================
          INFORMATIONS UTILISATEUR
          ====================================================== */}

      <div className="mt-auto pt-4">
        <div className="border rounded-4 p-3 bg-light">
          <div className="d-flex align-items-center gap-3">

            {/* Icône utilisateur */}
            <div
              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42
              }}
            >
              <i className={`bi ${userIcon}`} />
            </div>

            {/* Nom et rôle */}
            <div className="overflow-hidden">

              <div className="fw-semibold small text-truncate">
                {displayName}
              </div>

              {userRoleLabel && (
                <div className="text-muted small text-truncate">
                  {userRoleLabel}
                </div>
              )}

              {/* Email réel de l'utilisateur connecté */}
              {user?.email && (
                <div className="text-muted small text-truncate">
                  {user.email}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}