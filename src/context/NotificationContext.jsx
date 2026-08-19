import { createContext, useContext, useEffect, useState } from "react";
import apiFetch from "../services/apiFetch";
import useNotificationSocket from "../components/useNotificationSocket";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {

  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);

  const [
    actionRequiredQuoteCount,
    setActionRequiredQuoteCount,
  ] = useState(0);

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  const fetchNotifications = async () => {

    try {


      const res = await apiFetch(
        "/notifications/me"
      );

      setNotifications(res);

    } catch {

      toast.error(
        "Erreur chargement notifications"
      );

    }

  };
  const loadUnreadCount = async () => {

    try {


      const data = await apiFetch(
        "/notifications/unread-count"
      );

      setUnreadNotificationCount(
            data.count
        );

    } catch {

      toast.error(
        "Erreur chargement nombre de notifications non lues"
      );

    }

  };
 
  // =========================
  // LOAD UNREAD TICKETS
  // =========================

  const fetchUnreadTickets = async () => {

    try {

      const res = await apiFetch(
        "/support-tickets/unread-count"
      );

      setUnreadTicketCount(
        res.count
      );

    } catch (err) {

      console.error(err);

    }

  };

  // =========================
  // LOAD QUOTES REQUIRING ACTION
  // =========================

  const fetchActionRequiredQuotes = async () => {

    try {

      const res = await apiFetch(
        "/quotes/action-required-count"
      );

      setActionRequiredQuoteCount(
        res.count
      );

    } catch (err) {

      console.error(err);

    }

  };

  // =========================
  // MARK NOTIFICATION AS READ
  // =========================

  const markAsRead = async (id) => {

    try {

      await apiFetch(
        `/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "READ",
              }
            : n
        )
      );

    } catch {

      toast.error(
        "Erreur lecture notification"
      );

    }

  };

  // =========================
  // DELETE NOTIFICATION
  // =========================

  const handleDelete = async (id) => {

    try {

      await apiFetch(
        `/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      setNotifications((prev) =>
        prev.filter(
          (n) => n.id !== id
        )
      );

    } catch {

      toast.error(
        "Erreur suppression notification"
      );

    }

  };

  // =========================
  // SOCKET
  // =========================

  useNotificationSocket(
    user?.id,
    (data) => {

      switch (data.type) {

        case "notification":

          setNotifications((prev) => [
            data.notification,
            ...prev,
          ]);

          break;

        case "UNREAD_UPDATED":

          setUnreadTicketCount(
            data.count
          );

          break;

        case "QUOTE_SENT":

          setActionRequiredQuoteCount(
            (prev) => prev + 1
          );

          break;

        case "QUOTE_ACCEPTED":
          setActionRequiredQuoteCount(
            (prev) =>
              Math.max(
                0,
                prev - 1
              )
          );

          break;

        case "QUOTE_REFUSED":

          setActionRequiredQuoteCount(
            (prev) =>
              Math.max(
                0,
                prev - 1
              )
          );

          break;

        default:
          break;
      }

    }
  );

  // =========================
  // INIT
  // =========================

  useEffect(() => {

    if (!user)
      return;

    fetchNotifications();
    loadUnreadCount();

    fetchUnreadTickets();

    fetchActionRequiredQuotes();

  }, [user]);

  return (

    <NotificationContext.Provider
      value={{

        notifications,
        
        unreadNotificationCount,

        unreadTicketCount,

        actionRequiredQuoteCount,

        fetchNotifications,

        fetchUnreadTickets,

        fetchActionRequiredQuotes,

        markAsRead,

        handleDelete,

      }}
    >

      {children}

    </NotificationContext.Provider>

  );

}

export const useNotifications = () =>
  useContext(NotificationContext);