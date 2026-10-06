import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import apiFetch from "../services/apiFetch";
import useNotificationSocket from "../hooks/useNotificationSocket";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

// ============================================================
// CONTEXT
// ============================================================

const NotificationContext = createContext();

// ============================================================
// PROVIDER
// ============================================================

export function NotificationProvider({ children }) {
  // ==========================================================
  // UTILISATEUR CONNECTÉ
  // ==========================================================

  const { user, isClient, isAdmin, isSalesAgent, isSavAgent } = useAuth();

  // ==========================================================
  // ÉTATS
  // ==========================================================

  // ----------------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------------

  // Liste des notifications de l'utilisateur.
  const [notifications, setNotifications] = useState([]);

  // Nombre total de notifications non lues.
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // ----------------------------------------------------------
  // LEADS COMMERCIAUX
  // ----------------------------------------------------------

  // Nombre de nouveaux leads disponibles pour les commerciaux.
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  // Nombre de leads actuellement attribués
  // au commercial connecté.
  const [myLeadsCount, setMyLeadsCount] = useState(0);
  // ----------------------------------------------------------
  // SUPPORT
  // ----------------------------------------------------------

  // Nombre de tickets support contenant
  // de nouveaux éléments non lus.
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);

  // ----------------------------------------------------------
  // DEVIS
  // ----------------------------------------------------------

  // Nombre de devis nécessitant une action du client.
  const [actionRequiredQuoteCount, setActionRequiredQuoteCount] = useState(0);

  // ----------------------------------------------------------
  // ESSAIS ROUTIERS
  // ----------------------------------------------------------

  // Nombre d'essais routiers nécessitant
  // une action de l'administrateur.
  const [pendingTestDriveCount, setPendingTestDriveCount] = useState(0);

  // ==========================================================
  // CHARGER LES NOTIFICATIONS
  // ==========================================================

  /**
   * Récupère toutes les notifications de l'utilisateur
   * actuellement connecté.
   */
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications/me");

      setNotifications(res.notifications ?? []);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications :", error);

      toast.error("Erreur chargement notifications");
    }
  }, []);

  // ==========================================================
  // CHARGER LE NOMBRE DE NOTIFICATIONS NON LUES
  // ==========================================================

  /**
   * Récupère le nombre de notifications non lues.
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await apiFetch("/notifications/unread-count");

      const count = Number(data?.count ?? 0);

      setUnreadNotificationCount(
        Number.isFinite(count) ? Math.max(0, count) : 0
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement du nombre de notifications non lues :",
        error
      );

      toast.error("Erreur chargement nombre de notifications non lues");
    }
  }, []);

  // ==========================================================
  // CHARGER LE NOMBRE DE LEADS COMMERCIAUX
  // ==========================================================

  /**
   * Récupère les statistiques CRM du commercial connecté.
   *
   * L'API retourne notamment :
   * - le nombre de nouveaux leads disponibles ;
   * - le nombre de leads actuellement attribués au commercial.
   */
  const fetchSalesStats = useCallback(async () => {
    try {
      const data = await apiFetch("/agent/leads/notifications", {
        method: "GET",
      });

      const newLeadsCount = Number(data?.new_leads_count ?? 0);

      const myLeadsCount = Number(data?.my_leads_count ?? 0);

      setNewLeadsCount(
        Number.isFinite(newLeadsCount) ? Math.max(0, newLeadsCount) : 0
      );

      setMyLeadsCount(
        Number.isFinite(myLeadsCount) ? Math.max(0, myLeadsCount) : 0
      );
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques CRM :", error);

      toast.error("Impossible de charger les données CRM.");
    }
  }, []);

  // ==========================================================
  // CHARGER LE NOMBRE DE TICKETS NON LUS
  // ==========================================================

  /**
   * Récupère le nombre de tickets support
   * contenant de nouveaux éléments non lus.
   */
  const fetchUnreadTickets = useCallback(async () => {
    try {
      const res = await apiFetch("/support-tickets/unread-count");

      const count = Number(res?.count ?? 0);

      setUnreadTicketCount(Number.isFinite(count) ? Math.max(0, count) : 0);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets non lus :", error);
    }
  }, []);

  // ==========================================================
  // CHARGER LE NOMBRE DE DEVIS NÉCESSITANT UNE ACTION
  // ==========================================================

  /**
   * Récupère le nombre de devis nécessitant
   * une action de la part du client.
   */
  const fetchActionRequiredQuotes = useCallback(async () => {
    try {
      const res = await apiFetch("/quotes/action-required-count");

      const count = Number(res?.count ?? 0);

      setActionRequiredQuoteCount(
        Number.isFinite(count) ? Math.max(0, count) : 0
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des devis nécessitant une action :",
        error
      );
    }
  }, []);

  // ==========================================================
  // CHARGER LE NOMBRE D'ESSAIS ROUTIERS EN ATTENTE
  // ==========================================================

  /**
   * Récupère le nombre d'essais routiers
   * nécessitant une action de l'administrateur.
   */
  const fetchPendingTestDriveCount = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/test-drives/pending-count");

      const count = Number(res?.count ?? 0);

      setPendingTestDriveCount(Number.isFinite(count) ? Math.max(0, count) : 0);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des essais routiers en attente :",
        error
      );
    }
  }, []);

  // ==========================================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ==========================================================

  const markAsRead = useCallback(async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                status: "READ",
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Erreur lors de la lecture de la notification :", error);

      toast.error("Erreur lecture notification");
    }
  }, []);

  // ==========================================================
  // SUPPRIMER UNE NOTIFICATION
  // ==========================================================

  const handleDelete = useCallback(async (id) => {
    try {
      await apiFetch(`/notifications/${id}`, {
        method: "DELETE",
      });

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la notification :",
        error
      );

      toast.error("Erreur suppression notification");
    }
  }, []);

  // ==========================================================
  // WEBSOCKET
  // ==========================================================

  /**
   * Ouvre une connexion WebSocket pour l'utilisateur connecté
   * et permet de recevoir les mises à jour en temps réel.
   */
  const handleSocketEvent = useCallback(
    (data) => {
      switch (data.type) {
        // ====================================================
        // NOUVELLE NOTIFICATION
        // ====================================================

        case "notification":
          setNotifications((prev) => [data.notification, ...prev]);
          break;

        // ====================================================
        // NOUVEAUX LEADS DISPONIBLES
        // ====================================================

        case "NEW_LEADS_UPDATED": {
          const count = Number(data.count ?? 0);

          setNewLeadsCount(Number.isFinite(count) ? Math.max(0, count) : 0);

          break;
        }

        // ====================================================
        // LEADS DU COMMERCIAL
        // ====================================================

        case "MY_LEADS_UPDATED": {
          const count = Number(data.count ?? 0);

          setMyLeadsCount(Number.isFinite(count) ? Math.max(0, count) : 0);

          break;
        }

        // ====================================================
        // NOTIFICATIONS NON LUES
        // ====================================================

        case "UNREAD_NOTIFICATIONS_UPDATED": {
          const count = Number(data.count ?? 0);

          setUnreadNotificationCount(
            Number.isFinite(count) ? Math.max(0, count) : 0
          );

          break;
        }

        // ====================================================
        // TICKETS NON LUS
        // ====================================================

        case "UNREAD_TICKETS_UPDATED": {
          const count = Number(data.count ?? 0);

          setUnreadTicketCount(Number.isFinite(count) ? Math.max(0, count) : 0);

          break;
        }

        // ====================================================
        // DEVIS NÉCESSITANT UNE ACTION
        // ====================================================

        case "QUOTE_UPDATED": {
          const count = Number(data.count ?? 0);

          setActionRequiredQuoteCount(
            Number.isFinite(count) ? Math.max(0, count) : 0
          );

          break;
        }

        // ====================================================
        // ESSAIS ROUTIERS EN ATTENTE
        // ====================================================

        case "TEST_DRIVE_PENDING_UPDATED": {
          const count = Number(data.count ?? 0);

          setPendingTestDriveCount(
            Number.isFinite(count) ? Math.max(0, count) : 0
          );

          break;
        }

        // ====================================================
        // ÉVÉNEMENT INCONNU
        // ====================================================

        default:
          // Les événements inconnus sont ignorés.
          break;
      }
    },
    [
      setNotifications,
      setNewLeadsCount,
      setMyLeadsCount,
      setUnreadNotificationCount,
      setUnreadTicketCount,
      setActionRequiredQuoteCount,
      setPendingTestDriveCount,
    ]
  );

  useNotificationSocket(handleSocketEvent, !!user);

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {
    // Aucun chargement de données personnelles
    // lorsqu'aucun utilisateur n'est connecté.
    if (!user) {
      return;
    }

    // --------------------------------------------------------
    // NOTIFICATIONS
    // --------------------------------------------------------

    fetchNotifications();
    loadUnreadCount();

    // --------------------------------------------------------
    // LEADS COMMERCIAUX
    // --------------------------------------------------------

    if (isSalesAgent) {
      fetchSalesStats();
    }

    // --------------------------------------------------------
    // TICKETS SUPPORT
    // --------------------------------------------------------

    if (isClient || isSavAgent) {
      fetchUnreadTickets();
    }

    // --------------------------------------------------------
    // DEVIS
    // --------------------------------------------------------

    if (isClient) {
      fetchActionRequiredQuotes();
    }

    // --------------------------------------------------------
    // ESSAIS ROUTIERS
    // --------------------------------------------------------

    if (isAdmin) {
      fetchPendingTestDriveCount();
    }
  }, [
    user,
    isClient,
    isAdmin,
    isSalesAgent,
    isSavAgent,
    fetchNotifications,
    loadUnreadCount,
    fetchSalesStats,
    fetchUnreadTickets,
    fetchActionRequiredQuotes,
    fetchPendingTestDriveCount,
  ]);

  // ==========================================================
  // CONTEXT PROVIDER
  // ==========================================================

  return (
    <NotificationContext.Provider
      value={{
        // ------------------------------------------------------
        // NOTIFICATIONS
        // ------------------------------------------------------

        notifications,
        unreadNotificationCount,

        // ------------------------------------------------------
        // LEADS COMMERCIAUX
        // ------------------------------------------------------

        newLeadsCount,
        myLeadsCount,

        // ------------------------------------------------------
        // SUPPORT
        // ------------------------------------------------------

        unreadTicketCount,

        // ------------------------------------------------------
        // DEVIS
        // ------------------------------------------------------

        actionRequiredQuoteCount,

        // ------------------------------------------------------
        // ESSAIS ROUTIERS
        // ------------------------------------------------------

        pendingTestDriveCount,

        // ------------------------------------------------------
        // FONCTIONS
        // ------------------------------------------------------

        fetchNotifications,
        loadUnreadCount,
        fetchSalesStats,
        fetchUnreadTickets,
        fetchActionRequiredQuotes,
        fetchPendingTestDriveCount,

        markAsRead,
        handleDelete,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================
// HOOK PERSONNALISÉ
// ============================================================

/**
 * Permet aux composants d'accéder facilement
 * au NotificationContext.
 */
export const useNotifications = () => useContext(NotificationContext);
