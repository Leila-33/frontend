import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationBell() {

  const { notifications, unreadNotificationCount } = useNotifications();
  const [open, setOpen] = useState(false);



  return (
    <li className="nav-item position-relative">

      {/* BELL BUTTON */}
      <button
        className="btn btn-dark position-relative"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-bell"></i>

        {unreadNotificationCount > 0 && (
          <span
            className="badge bg-danger"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              fontSize: 10
            }}
          >
            {unreadNotificationCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
       <div
  className="card shadow-sm"
  style={{
    position: "absolute",
    top: "120%",
    right: window.innerWidth < 768 ? "50%" : 0,
    transform: window.innerWidth < 768 ? "translateX(50%)" : "none",
    width: "320px",
    maxWidth: "95vw",
    zIndex: 999
  }}
>
          <div className="card-body p-2">

            <h6 className="mb-2">Notifications</h6>

            {notifications.length === 0 && (
              <small className="text-muted">
                Aucune notification
              </small>
            )}

            {notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`p-2 border-bottom ${
                  n.status === "unread" ? "bg-light" : ""
                }`}
              >
                <small className="fw-bold">
                  {n.title}
                </small>

                <br />

                <small className="text-muted">
                  {n.message?.slice(0, 60)}
                </small>
              </div>
            ))}

            <Link
              to="/notifications"
              className="btn btn-sm btn-primary w-100 mt-2"
              onClick={() => setOpen(false)}
            >
              Voir tout
            </Link>

          </div>
        </div>
      )}

    </li>
  );
}