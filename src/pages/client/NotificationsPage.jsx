import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";
import { useMemo } from "react";
import "../../styles/notifications.css";
import { useAuth } from "../../contexts/AuthContext";

export default function NotificationsPage() {

  const {
    notifications,
    unreadNotificationCount,
    markAsRead,
    loading,
    handleDelete
  } = useNotifications();

  const navigate = useNavigate();

  const { isAdmin } = useAuth();

  /* =========================
     SORT
  ========================= */
  const sortedNotifications = useMemo(() => {

    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

  }, [notifications]);

  /* =========================
     CLICK
  ========================= */
const handleClick = async (notification) => {

  if (notification.status === "unread") {

    await markAsRead(notification.id);

  }

  switch (notification.entity_type) {

    case "application":

      navigate(
        `/applications/${notification.entity_id}`
      );

      break;

    case "quote":

      if (isAdmin) {

        navigate(
          `/sales/quotes/${notification.entity_id}`
        );

      } else {

        navigate(
          `/quotes/${notification.entity_id}`
        );

      }

      break;

    case "test_drive":

      navigate(
        `/mytestdrives/${notification.entity_id}`
      );

      break;

    default:

      navigate("/notifications");

  }

};

  /* =========================
     MARK ALL AS READ
  ========================= */
  const markAllAsRead = async () => {

    for (const n of notifications) {

      if (n.status === "unread") {
        await markAsRead(n.id);
      }
    }
  };



  /* =========================
     UI
  ========================= */
  return (

    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h3 className="fw-bold mb-1">
            🔔 Notifications
          </h3>

          <small className="text-muted">
            Centre de notifications
          </small>

        </div>

        {unreadNotificationCount > 0 && (

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={markAllAsRead}
          >
            Tout marquer comme lu ({unreadNotificationCount})
          </button>

        )}

      </div>

      {/* EMPTY */}
      {!loading && notifications.length === 0 && (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              style={{
                fontSize: "64px"
              }}
            >
              🔔
            </div>

            <h5 className="fw-bold mt-3">
              Aucune notification
            </h5>

            <p className="text-muted mb-0">
              Vous êtes à jour.
            </p>

          </div>

        </div>

      )}

      {/* LIST */}
     {!loading &&
  sortedNotifications.map((notification) => (

    <div
      key={notification.id}
      className={`card border-0 shadow-sm mb-3 ${
        notification.status === "unread"
          ? "border-start border-4 border-warning"
          : ""
      }`}
      onClick={() => handleClick(notification)}
      style={{
        cursor: "pointer",
        transition: "all .2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start mb-2">

          <div className="flex-grow-1">

            <strong className="d-flex align-items-center">

              {notification.title}

              {notification.status === "unread" && (

                <span className="badge bg-warning text-dark ms-2">
                  Nouveau
                </span>

              )}

            </strong>

          </div>

          <div className="d-flex align-items-center gap-2">

            <small className="text-muted">

              {new Date(
                notification.created_at
              ).toLocaleDateString()}

            </small>

            <button
              className="btn btn-sm btn-light text-danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(notification.id);
              }}
            >
              <i className="bi bi-trash"></i>
            </button>

          </div>

        </div>

        <p className="mb-2 text-muted">
          {notification.message}
        </p>

        {notification.entity_type && notification.entity_id && (

          <small className="text-muted d-block">

            {notification.entity_type === "application" && "Dossier"}

            {notification.entity_type === "quote" && "Offre"}

            {notification.entity_type === "document" && "Document"}

            {notification.entity_type === "test_drive" && "Essai"}

            {" #"}
            {notification.entity_id}

          </small>

        )}

      </div>

    </div>

))}

    </div>
  );
}