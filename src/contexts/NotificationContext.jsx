import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import apiFetch from "../services/apiFetch";


// Hook permettant d'établir une connexion WebSocket
// avec le backend.
//
// Il permet de recevoir en temps réel certains événements
// liés aux notifications, aux tickets et aux devis.
import useNotificationSocket
  from "../components/useNotificationSocket";

import { toast } from "react-toastify";


// Permet de récupérer l'utilisateur actuellement connecté.
//
// Le NotificationProvider utilise son identifiant pour
// savoir pour quel utilisateur ouvrir la connexion WebSocket.
import { useAuth } from "./AuthContext";


// ============================================================
// CONTEXT
// ============================================================

// Création du contexte global des notifications.
//
// Les composants placés sous NotificationProvider pourront
// accéder aux notifications et aux fonctions exposées
// dans le Provider.
const NotificationContext = createContext();


export function NotificationProvider({ children }) {


  // ==========================================================
  // UTILISATEUR CONNECTÉ
  // ==========================================================

  // Récupération de l'utilisateur depuis AuthContext.
  const { user } = useAuth();


  // ==========================================================
  // ÉTATS
  // ==========================================================

  // Liste des notifications de l'utilisateur.
  const [
    notifications,
    setNotifications
  ] = useState([]);


  // Nombre total de notifications non lues.
  // Cette valeur est notamment être utilisée dans
  // le badge de la cloche de notification.
  const [
    unreadNotificationCount,
    setUnreadNotificationCount
  ] = useState(0);


  // Nombre de tickets support contenant de nouveaux
  // éléments non lus.
// Est utilisé dans le badge du menu SAV.
  const [
    unreadTicketCount,
    setUnreadTicketCount
  ] = useState(0);


  // Nombre de devis nécessitant une action de l'utilisateur.
  //
  // Par exemple, lorsqu'un commercial envoie un devis
  // au client, celui-ci peut devoir l'accepter ou le refuser.
  const [
    actionRequiredQuoteCount,
    setActionRequiredQuoteCount,
  ] = useState(0);
 
  // Nombre d'essais routiers nécessitant une action de l'administrateur.
const [
  pendingTestDriveCount,
  setPendingTestDriveCount
] = useState(0);
  // ==========================================================
  // CHARGER LES NOTIFICATIONS
  // ==========================================================

  // Récupère toutes les notifications de l'utilisateur
  // depuis l'API FastAPI.
  const fetchNotifications = async () => {

    try {

      const res = await apiFetch(
        "/notifications/me"
      );
      setNotifications(
        res.notifications
      );

    } catch {
      toast.error(
        "Erreur chargement notifications"
      );

    }

  };


  // ==========================================================
  // CHARGER LE NOMBRE DE NOTIFICATIONS NON LUES
  // ==========================================================

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


  // ==========================================================
  // CHARGER LE NOMBRE DE TICKETS NON LUS
  // ==========================================================

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


  // ==========================================================
  // CHARGER LES DEVIS NÉCESSITANT UNE ACTION
  // ==========================================================

  const fetchActionRequiredQuotes = async () => {

    try {
      const res = await apiFetch(
        "/quotes/action-required-count"
      );
      // Mise à jour du compteur.
      setActionRequiredQuoteCount(
        res.count
      );

    } catch (err) {

      // Affichage de l'erreur dans la console.
      console.error(err);

    }

  };


  // ==========================================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ==========================================================

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


  // ==========================================================
  // SUPPRIMER UNE NOTIFICATION
  // ==========================================================

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

  // ==========================================================
  // CHARGER LE NOMBRE D'ESSAIS ROUTIERS NECESSITANT UNE ACTION
  // ==========================================================
  const fetchPendingTestDriveCount = async () => {
    try {
      const res = await apiFetch(
        "/admin/test-drives/pending-count"
      );

      setPendingTestDriveCount(res.count);

    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================================
  // WEBSOCKET
  // ==========================================================

  // Ouverture et gestion de la connexion WebSocket.
  //
  // user?.id :
  //
  // - si user existe → son id est transmis
  // - si user est null → undefined
  //
  // Le WebSocket permet de recevoir des événements
  // du backend en temps réel, sans devoir interroger
  // constamment l'API.
  useNotificationSocket(
    user?.id,

    // Fonction appelée lorsqu'un événement
    // est reçu depuis le WebSocket.
    (data) => {

      // "data.type" indique quel type d'événement
      // le backend vient d'envoyer.
      switch (data.type) {


        // ====================================================
        // NOUVELLE NOTIFICATION
        // ====================================================

        case "notification":

          // Ajout de la nouvelle notification
          // au début de la liste.
          setNotifications((prev) => [
            data.notification,
            ...prev,
          ]);

          break;


        // ====================================================
        // COMPTEUR DE TICKETS MIS À JOUR
        // ====================================================

        case "UNREAD_UPDATED":
          setUnreadTicketCount(
            data.count
          );

          break;


        // ====================================================
        // DEVIS ENVOYÉ
        // ====================================================

        case "QUOTE_SENT":
          setActionRequiredQuoteCount(
            (prev) => prev + 1
          );

          break;


        // ====================================================
        // DEVIS ACCEPTÉ
        // ====================================================

        case "QUOTE_ACCEPTED":

          // Le devis ne nécessite plus d'action.
          //
          // On diminue le compteur de 1.
          setActionRequiredQuoteCount(
            (prev) =>
              Math.max(
                0,
                prev - 1
              )
          );

          break;


        // ====================================================
        // DEVIS REFUSÉ
        // ====================================================

        case "QUOTE_REFUSED":

          // Même logique que pour l'acceptation :
          //
          // le devis ne nécessite plus d'action.
          //
          // On diminue donc le compteur.
          setActionRequiredQuoteCount(
            (prev) =>
              Math.max(
                0,
                prev - 1
              )
          );

          break;

        // ====================================================
        // COMPTEUR D'ESSAIS ROUTIERS NECESSITANT UNE ACTION
        // ====================================================
        case "TEST_DRIVE_PENDING_UPDATED":
            setPendingTestDriveCount(data.count);
            break;

        // ====================================================
        // ÉVÉNEMENT INCONNU
        // ====================================================

        default:

          // Si le backend envoie un type que le frontend
          // ne connaît pas encore, on ne fait rien.
          break;

      }

    }
  );


  // ==========================================================
  // INITIALISATION
  // ==========================================================

  // Cet effet est exécuté :
  //
  // - au montage du Provider
  // - lorsque "user" change
  //
  // Le tableau [user] signifie que l'effet dépend
  // de l'utilisateur connecté.
  useEffect(() => {


    // Si aucun utilisateur n'est connecté,
    // on ne charge aucune donnée personnelle.
    //
    // On évite donc d'appeler :
    //
    // /notifications/me
    // /notifications/unread-count
    // etc.
    if (!user)
      return;


    // ========================================================
    // CHARGEMENT INITIAL
    // ========================================================

    // Chargement de toutes les notifications.
    fetchNotifications();


    // Chargement du nombre de notifications non lues.
    loadUnreadCount();


    // Chargement du nombre de tickets non lus.
    fetchUnreadTickets();


    // Chargement du nombre de devis nécessitant une action.
    fetchActionRequiredQuotes();

    // Chargement du nombre d'essais routiers nécessitant une action.
    fetchPendingTestDriveCount();

  }, [user]);


  // ==========================================================
  // CONTEXT PROVIDER
  // ==========================================================

  // Les données et fonctions placées dans "value"
  // deviennent accessibles à tous les composants
  // enfants du NotificationProvider.
  return (

    <NotificationContext.Provider
      value={{

        // Liste des notifications.
        notifications,


        // Nombre de notifications non lues.
        unreadNotificationCount,


        // Nombre de tickets non lus.
        unreadTicketCount,


        // Nombre de devis nécessitant une action.
        actionRequiredQuoteCount,

        pendingTestDriveCount,


        // Fonctions permettant aux composants
        // de déclencher des opérations.
        fetchNotifications,

        fetchUnreadTickets,

        fetchActionRequiredQuotes,

        markAsRead,

        handleDelete,

        fetchPendingTestDriveCount

      }}
    >

      {/* Tous les composants enfants peuvent maintenant
          accéder au NotificationContext. */}
      {children}

    </NotificationContext.Provider>

  );

}


// ============================================================
// HOOK PERSONNALISÉ
// ============================================================

// Permet aux composants d'utiliser facilement
// le NotificationContext.
//
// Au lieu d'écrire :
//
// useContext(NotificationContext)
//
// on pourra simplement écrire :
//
// useNotifications()
//
// Exemple :
//
// const {
//   notifications,
//   unreadNotificationCount,
//   markAsRead
// } = useNotifications();
export const useNotifications = () =>
  useContext(NotificationContext);
