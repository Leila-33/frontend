import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

import "../../styles/notifications.css";


// ==========================================================
// COMPOSANT
// ==========================================================

export default function NotificationsPage() {

  // ========================================================
  // CONTEXTES
  // ========================================================

  const {
    notifications = [],
    unreadNotificationCount = 0,
    markAsRead,
    loading,
    handleDelete
  } = useNotifications();

  const {
    isAuthenticated,
    isAdmin,
    isClient,
    isSavAgent,
    isSalesAgent,
  } = useAuth();

  const navigate = useNavigate();


  // ========================================================
  // TRI DES NOTIFICATIONS
  // ========================================================

  const sortedNotifications = useMemo(() => {

    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

  }, [notifications]);


  // ========================================================
  // NAVIGATION SELON LE RÔLE
  // ========================================================

  const getNotificationPath = (notification) => {

    const {
      entity_type: entityType,
      entity_id: entityId
    } = notification;


    // ------------------------------------------------------
    // DOSSIER
    // ------------------------------------------------------

    if (entityType === "application") {

      // Administration
      if (isAdmin) {
        return `/admin/applications/${entityId}`;
      }
      // Client
      if (isClient) {
        return `/applications/${entityId}`;
      }

    }


    // ------------------------------------------------------
    // OFFRE
    // ------------------------------------------------------

    if (entityType === "quote") {

      // Commercial
      if (isSalesAgent) {
        return `/sales/quotes/${entityId}`;
      }

      // Client
      if (isClient) {
        return `/quotes/${entityId}`;
      }

    }


    // ------------------------------------------------------
    // ESSAI ROUTIER
    // ------------------------------------------------------

    if (entityType === "test_drive") {

      // Administration
      if (isAdmin) {
        return `/admin/test-drives/${entityId}`;
      }
      // Client
      if (isClient) {
        return `/testdrives/${entityId}`;
      }

    }


    // ------------------------------------------------------
    // TICKET SAV
    // ------------------------------------------------------

    if (entityType === "support_ticket") {

      // SAV
      if (isSavAgent) {
        return `/sav/tickets/${entityId}`;
      }

      // Client
      if (isClient) {
        return `/support/tickets/${entityId}`;
      }

    }


    // ------------------------------------------------------
    // PAR DÉFAUT
    // ------------------------------------------------------

    return "/notifications";

  };


  // ========================================================
  // CLIC SUR UNE NOTIFICATION
  // ========================================================

  const handleClick = async (notification) => {

    // Une notification non lue devient lue
    // avant la navigation.
    if (notification.status === "unread") {

      await markAsRead(notification.id);

    }

    const path = getNotificationPath(notification);

    navigate(path);

  };


  // ========================================================
  // MARQUER TOUTES LES NOTIFICATIONS COMME LUES
  // ========================================================

  const markAllAsRead = async () => {

    const unreadNotifications = notifications.filter(
      (notification) =>
        notification.status === "unread"
    );

    await Promise.all(
      unreadNotifications.map(
        (notification) =>
          markAsRead(notification.id)
      )
    );

  };


  // ========================================================
  // FORMATAGE DE LA DATE
  // ========================================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  };


  // ========================================================
  // FORMATAGE DE L'HEURE
  // ========================================================

  const formatTime = (date) => {

    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "fr-FR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  // ========================================================
  // TYPE D'ENTITÉ
  // ========================================================

  const getEntityLabel = (entityType) => {

    switch (entityType) {

      case "application":
        return "Dossier";

      case "quote":
        return "Offre";

      case "test_drive":
        return "Essai";

      case "support_ticket":
        return "Ticket SAV";

      default:
        return null;

    }

  };


  // ========================================================
  // UTILISATEUR NON AUTHENTIFIÉ
  // ========================================================

  if (!isAuthenticated) {

    return null;

  }


  // ========================================================
  // UI
  // ========================================================

  return (

    <div className="container mt-4 mb-5">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h3 className="fw-bold mb-1">

            <i className="bi bi-bell me-2"></i>

            Notifications

          </h3>

          <small className="text-muted">
            Centre de notifications
          </small>

        </div>


        {/* Marquer toutes comme lues */}

        {unreadNotificationCount > 0 && (

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={markAllAsRead}
          >

            <i className="bi bi-check2-all me-1"></i>

            Tout marquer comme lu

            <span className="ms-1">
              ({unreadNotificationCount})
            </span>

          </button>

        )}

      </div>


      {/* ====================================================
          CHARGEMENT
      ==================================================== */}

      {loading && (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >

              <span className="visually-hidden">
                Chargement...
              </span>

            </div>

            <p className="text-muted mb-0">
              Chargement des notifications...
            </p>

          </div>

        </div>

      )}


      {/* ====================================================
          AUCUNE NOTIFICATION
      ==================================================== */}

      {!loading &&
        notifications.length === 0 && (

          <div className="card border-0 shadow-sm">

            <div className="card-body text-center py-5">

              <i
                className="bi bi-bell-slash text-muted"
                style={{
                  fontSize: "64px"
                }}
              ></i>

              <h5 className="fw-bold mt-3">
                Aucune notification
              </h5>

              <p className="text-muted mb-0">
                Vous êtes à jour.
              </p>

            </div>

          </div>

        )}


      {/* ====================================================
          LISTE DES NOTIFICATIONS
      ==================================================== */}

      {!loading &&
        sortedNotifications.map(
          (notification) => {

            const isUnread =
              notification.status === "unread";

            const entityLabel =
              getEntityLabel(
                notification.entity_type
              );


            return (

              <div
                key={notification.id}
                className={`card border-0 shadow-sm mb-3 notification-card ${
                  isUnread
                    ? "notification-unread"
                    : ""
                }`}
                onClick={() =>
                  handleClick(notification)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {

                    event.preventDefault();

                    handleClick(notification);

                  }

                }}
              >

                <div className="card-body">


                  {/* ==========================================
                      EN-TÊTE NOTIFICATION
                  ========================================== */}

                  <div className="d-flex justify-content-between align-items-start mb-2">

                    <div className="flex-grow-1">

                      <strong className="d-flex align-items-center">

                        {notification.title ||
                          "Notification"}

                        {isUnread && (

                          <span className="badge bg-warning text-dark ms-2">

                            Nouveau

                          </span>

                        )}

                      </strong>

                    </div>


                    {/* DATE + SUPPRESSION */}

                    <div className="d-flex align-items-center gap-2">

                      <div className="text-end">

                        <small className="text-muted d-block">

                          {formatDate(
                            notification.created_at
                          )}

                        </small>

                        <small className="text-muted">

                          {formatTime(
                            notification.created_at
                          )}

                        </small>

                      </div>


                      {/* Bouton suppression */}

                      <button
                        type="button"
                        className="btn btn-sm btn-light text-danger"
                        aria-label="Supprimer la notification"
                        title="Supprimer"
                        onClick={(event) => {

                          // Empêche le clic de remonter
                          // jusqu'à la carte.
                          event.stopPropagation();

                          handleDelete(
                            notification.id
                          );

                        }}
                      >

                        <i
                          className="bi bi-trash"
                          aria-hidden="true"
                        ></i>

                      </button>

                    </div>

                  </div>


                  {/* ==========================================
                      MESSAGE
                  ========================================== */}

                  <p className="mb-2 text-muted">

                    {notification.message ||
                      "Aucun message disponible."}

                  </p>


                  {/* ==========================================
                      ENTITÉ ASSOCIÉE
                  ========================================== */}

                  {entityLabel &&
                    notification.entity_id && (

                      <small className="text-muted d-block">

                        <i className="bi bi-link-45deg me-1"></i>

                        {entityLabel}

                        {" #"}

                        {notification.entity_id}

                      </small>

                    )}

                </div>

              </div>

            );

          }
        )}

    </div>

  );

}
