import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/dateUtils";

// ==========================================================
// CONSTANTES
// ==========================================================

const MAX_NOTIFICATIONS_DISPLAYED = 5;

// ==========================================================
// COMPOSANT
// ==========================================================

export default function NotificationBell() {
  // ========================================================
  // ÉTAT ET CONTEXTE
  // ========================================================

  const { notifications = [], unreadNotificationCount = 0 } =
    useNotifications();

  const { isAdmin, isClient, isSavAgent, isSalesAgent } = useAuth();

  const [open, setOpen] = useState(false);

  // Référence du composant pour détecter les clics extérieurs.
  const notificationRef = useRef(null);

  // ========================================================
  // CHEMIN DES NOTIFICATIONS SELON LE RÔLE
  // ========================================================

  const notificationsPath = isAdmin
    ? "/admin/notifications"
    : isSalesAgent
      ? "/sales/notifications"
      : isSavAgent
        ? "/sav/notifications"
        : isClient
          ? "/notifications"
          : "/notifications";

  // ========================================================
  // FERMETURE AU CLIC EXTÉRIEUR
  // ========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========================================================
  // FERMETURE AVEC LA TOUCHE ÉCHAP
  // ========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ========================================================
  // NOTIFICATIONS À AFFICHER
  // ========================================================

  const displayedNotifications = notifications.slice(
    0,
    MAX_NOTIFICATIONS_DISPLAYED
  );

  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (
    <li ref={notificationRef} className="nav-item position-relative">
      {/* ====================================================
          BOUTON DE NOTIFICATIONS
      ==================================================== */}

      <button
        type="button"
        className="btn btn-dark position-relative"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Afficher les notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <i className="bi bi-bell" aria-hidden="true" />

        {/* Badge du nombre de notifications non lues */}
        {unreadNotificationCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}

            <span className="visually-hidden">notifications non lues</span>
          </span>
        )}
      </button>

      {/* ====================================================
          MENU DÉROULANT
      ==================================================== */}

      {open && (
        <div
          className="card shadow position-absolute end-0 mt-2 notification-dropdown"
          role="dialog"
          aria-label="Liste des notifications"
        >
          <div className="card-body p-3">
            {/* En-tête */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">Notifications</h6>

              {unreadNotificationCount > 0 && (
                <span className="badge bg-primary">
                  {unreadNotificationCount} non lue
                  {unreadNotificationCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Liste vide */}
            {displayedNotifications.length === 0 && (
              <div className="text-center py-3">
                <i
                  className="bi bi-bell-slash text-muted fs-3"
                  aria-hidden="true"
                />

                <p className="text-muted small mb-0 mt-2">
                  Aucune notification
                </p>
              </div>
            )}

            {/* Liste des notifications */}
            {displayedNotifications.length > 0 && (
              <div className="notification-list">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item p-2 border-bottom rounded ${
                      notification.status === "unread" ? "bg-light" : ""
                    }`}
                  >
                    <div className="d-flex align-items-start gap-2">
                      {notification.status === "unread" && (
                        <span
                          className="badge bg-primary rounded-circle p-1 mt-1"
                          aria-label="Notification non lue"
                        />
                      )}

                      <div className="flex-grow-1">
                        <p className="fw-semibold small mb-1">
                          {notification.title || "Nouvelle notification"}
                        </p>

                        <p className="text-muted small mb-1">
                          {notification.message
                            ? notification.message.length > 60
                              ? `${notification.message.slice(0, 60)}...`
                              : notification.message
                            : "Aucun message disponible"}
                        </p>

                        <small className="text-muted">
                          {formatDate(notification.created_at)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton vers toutes les notifications */}
            <Link
              to={notificationsPath}
              className="btn btn-primary btn-sm w-100 mt-3"
              onClick={() => setOpen(false)}
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
