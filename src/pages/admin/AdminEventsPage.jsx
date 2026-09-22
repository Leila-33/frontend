import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import EventDetailModal from "../../components/events/EventDetailModal";
import EventFilters from "../../components/events/EventFilters";
import apiFetch from "../../services/apiFetch";
import Pagination from "../../components/common/Pagination";

/* =========================================================
   LABELS DES ÉVÉNEMENTS
========================================================= */

const EVENT_TYPE_LABELS = {
  // USERS
  user_registered: "Utilisateur inscrit",
  user_email_verified: "Email vérifié",
  user_activated: "Utilisateur activé",
  user_deactivated: "Utilisateur désactivé",
  user_created: "Utilisateur créé",
  user_archived: "Utilisateur archivé",
  user_unarchived: "Utilisateur désarchivé",
  user_role_updated: "Rôle utilisateur modifié",
  user_account_activated: "Compte activé",

  // LEADS
  lead_created: "Lead créé",
  lead_assigned: "Lead assigné",
  lead_contacted: "Lead contacté",
  lead_won: "Lead gagné",
  lead_deleted: "Lead supprimé",

  // QUOTES
  quote_created: "Offre créée",
  quote_updated: "Offre modifiée",
  quote_sent: "Offre envoyée",
  quote_accepted: "Offre acceptée",
  quote_refused: "Offre refusée",
  quote_deleted: "Offre supprimée",
  quote_expired: "Offre expirée",

  // OPTIONS
  option_created: "Option créée",
  option_updated: "Option modifiée",
  option_activated: "Option activée",
  option_deactivated: "Option désactivée",

  // APPLICATIONS
  application_created: "Dossier créé",
  application_submitted: "Dossier soumis",
  application_processing: "Dossier en traitement",
  application_approved: "Dossier accepté",
  application_rejected: "Dossier refusé",
  application_archived: "Dossier archivé",
  application_unarchived: "Dossier désarchivé",
  application_restored: "Dossier restauré",
  application_cancelled: "Dossier annulé",
  application_soft_deleted: "Dossier supprimé",
  application_status_updated: "Statut du dossier modifié",

  // DOCUMENTS
  document_validated: "Document validé",
  document_rejected: "Document refusé",

  // VEHICLES
  vehicle_created: "Véhicule créé",
  vehicle_updated: "Véhicule modifié",
  vehicle_deleted: "Véhicule supprimé",
  vehicle_archived: "Véhicule archivé",
  vehicle_published: "Véhicule publié",
  vehicle_unpublished: "Véhicule dépublié",
  vehicle_availability_changed: "Disponibilité modifiée",

  // INSPECTION
  inspection_started: "Inspection démarrée",
  inspection_completed: "Inspection terminée",

  // RECONDITIONING
  reconditioning_started: "Reconditionnement démarré",
  reconditioning_completed: "Reconditionnement terminé",

  // FINAL CHECK
  final_check_completed: "Contrôle final terminé",

  // PAYMENTS
  payment_initiated: "Paiement initié",
  payment_succeeded: "Paiement réussi",
  payment_failed: "Paiement échoué",
  deposit_paid: "Acompte payé",

  // FINANCING
  financing_contract_created: "Contrat de financement créé",
  financing_completed: "Financement terminé",

  // SUBSCRIPTIONS
  subscription_created: "Abonnement créé",

  // INSTALLMENTS
  installment_paid: "Échéance payée",
  installment_failed: "Échéance échouée",

  // RENTALS
  rental_created: "Location créée",
  rental_payment_paid: "Paiement de location effectué",
  rental_completed: "Location terminée",
  rental_cancelled: "Location annulée",

  // TEST DRIVES
  test_drive_created: "Essai créé",
  test_drive_confirmed: "Essai confirmé",
  test_drive_rejected: "Essai refusé",
  test_drive_cancelled: "Essai annulé",
  test_drive_completed: "Essai terminé",

  // WARRANTIES
  warranty_plan_created: "Plan de garantie créé",
  warranty_plan_updated: "Plan de garantie modifié",
  warranty_plan_activated: "Plan de garantie activé",
  warranty_plan_deactivated: "Plan de garantie désactivé",
  warranty_activated: "Garantie activée",

  // SUPPORT / SAV
  support_ticket_created: "Ticket SAV créé",
  support_ticket_archived: "Ticket SAV archivé",
  support_ticket_status_changed: "Statut du ticket modifié",

  // ADMIN
  admin_action: "Action administrateur",
};


/* =========================================================
   CATÉGORIES D'ÉVÉNEMENTS
========================================================= */

const EVENT_CATEGORIES = {
  user: {
    label: "Utilisateurs",
    color: "primary",
  },

  lead: {
    label: "Leads",
    color: "info",
  },

  quote: {
    label: "Offres",
    color: "secondary",
  },

  option: {
    label: "Options",
    color: "dark",
  },

  application: {
    label: "Dossiers",
    color: "info",
  },

  document: {
    label: "Documents",
    color: "warning",
  },

  vehicle: {
    label: "Véhicules",
    color: "primary",
  },

  inspection: {
    label: "Inspection",
    color: "secondary",
  },

  reconditioning: {
    label: "Reconditionnement",
    color: "secondary",
  },

  final_check: {
    label: "Contrôle final",
    color: "secondary",
  },

  payment: {
    label: "Paiements",
    color: "success",
  },

  financing: {
    label: "Financement",
    color: "success",
  },

  subscription: {
    label: "Abonnements",
    color: "info",
  },

  installment: {
    label: "Échéances",
    color: "success",
  },

  rental: {
    label: "Locations",
    color: "primary",
  },

  test_drive: {
    label: "Essais",
    color: "info",
  },

  warranty: {
    label: "Garanties",
    color: "dark",
  },

  support_ticket: {
    label: "SAV",
    color: "warning",
  },

  admin: {
    label: "Administration",
    color: "danger",
  },
};


/* =========================================================
   UTILITAIRES
========================================================= */

/**
 * Retourne le label lisible d'un événement.
 */
const getTypeLabel = (type) => {
  return (
    EVENT_TYPE_LABELS[type] ??
    type?.replaceAll("_", " ") ??
    "Événement"
  );
};


/**
 * Détermine la catégorie d'un événement
 * à partir de son type.
 */
const getEventCategory = (type) => {
  if (!type) {
    return null;
  }

  const category = type.split("_")[0];

  /*
   * Certaines catégories comportent plusieurs mots.
   */
  if (type.startsWith("deposit")) {
    return "payment";
  }

  if (type.startsWith("support_ticket_")) {
    return "support_ticket";
  }

  if (type.startsWith("test_drive_")) {
    return "test_drive";
  }

  if (type.startsWith("final_check_")) {
    return "final_check";
  }

  if (type.startsWith("reconditioning_")) {
    return "reconditioning";
  }

  return category;
};


/**
 * Retourne la couleur Bootstrap associée
 * à la catégorie de l'événement.
 */
const getTypeColor = (type) => {
  const category = getEventCategory(type);

  return (
    EVENT_CATEGORIES[category]?.color ??
    "secondary"
  );
};


/**
 * Retourne le nom de la catégorie.
 */
const getCategoryLabel = (type) => {
  const category = getEventCategory(type);

  return (
    EVENT_CATEGORIES[category]?.label ??
    "Autre"
  );
};


/* =========================================================
   PAGE
========================================================= */

export default function AdminEventsPage() {

  /* =======================================================
     ÉTAT DE LA RÉPONSE
  ======================================================= */

  const [response, setResponse] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 1,
  });


  /* =======================================================
     ÉVÉNEMENT SÉLECTIONNÉ
  ======================================================= */

  const [selectedEvent, setSelectedEvent] =
    useState(null);


  /* =======================================================
     FILTRES
  ======================================================= */

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    date: "",
    page: 1,
    limit: 20,
  });


  /* =======================================================
     CHARGEMENT DES ÉVÉNEMENTS
  ======================================================= */

  const fetchEvents = useCallback(
    async (page) => {

      try {

        const params = new URLSearchParams({
          page: String(page),
          limit: String(filters.limit),
          search: filters.search,
          event_type: filters.type,
          date: filters.date,
        });

        const data = await apiFetch(
          `/admin/events?${params.toString()}`
        );

        setResponse(data);

      } catch (err) {

        toast.error(
          "Erreur lors du chargement des événements"
        );

      }

    },
    [
      filters.limit,
      filters.search,
      filters.type,
      filters.date,
    ]
  );


  /* =======================================================
     RECHARGEMENT AUTOMATIQUE
  ======================================================= */

  useEffect(() => {

    fetchEvents(filters.page);

  }, [
    fetchEvents,
    filters.page,
  ]);


  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (

    <div className="container-fluid">

      {/* =================================================
          TITRE
      ================================================= */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          Historique des événements
        </h2>

        <p className="text-muted mb-0">
          Consultez l'ensemble des événements enregistrés
          sur la plateforme.
        </p>

      </div>


      {/* =================================================
          FILTRES
      ================================================= */}

      <EventFilters
        filters={filters}
        setFilters={setFilters}
        onRefresh={() => fetchEvents(filters.page)}
      />


      {/* =================================================
          TABLEAU
      ================================================= */}

      <div className="
        card
        shadow-sm
        border-0
        rounded-4
        overflow-hidden
      ">

        <div className="table-responsive">

          <table className="
            table
            align-middle
            mb-0
          ">

            {/* =============================================
                EN-TÊTE
            ============================================= */}

            <thead className="table-light">

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Type
                </th>

                <th>
                  Catégorie
                </th>

                <th>
                  Message
                </th>

                <th>
                  Utilisateur
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            {/* =============================================
                CORPS
            ============================================= */}

            <tbody>

              {/* -----------------------------------------
                  AUCUN ÉVÉNEMENT
              ----------------------------------------- */}

              {response.items.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      text-center
                      py-5
                      text-muted
                    "
                  >

                    <i className="
                      bi bi-clock-history
                      fs-1
                      d-block
                      mb-3
                    "/>

                    Aucun événement trouvé.

                  </td>

                </tr>

              )}


              {/* -----------------------------------------
                  ÉVÉNEMENTS
              ----------------------------------------- */}

              {response.items.map((event) => (

                <tr key={event.id}>

                  {/* DATE */}

                  <td>

                    <div className="fw-semibold">

                      {new Date(
                        event.created_at
                      ).toLocaleDateString()}

                    </div>

                    <small className="text-muted">

                      {new Date(
                        event.created_at
                      ).toLocaleTimeString()}

                    </small>

                  </td>


                  {/* TYPE */}

                  <td>

                    <span
                      className={`badge bg-${getTypeColor(
                        event.type
                      )}`}
                    >

                      {getTypeLabel(event.type)}

                    </span>

                  </td>


                  {/* CATÉGORIE */}

                  <td>

                    <span className="text-muted">

                      {getCategoryLabel(event.type)}

                    </span>

                  </td>


                  {/* MESSAGE */}

                  <td>

                    <span>

                      {event.message || "-"}

                    </span>

                  </td>


                  {/* UTILISATEUR */}

                  <td>

                    {event.user_id ?? "-"}

                  </td>


                  {/* ACTIONS */}

                  <td>

                    <button
                      type="button"
                      className="
                        btn
                        btn-sm
                        btn-outline-secondary
                      "
                      title="Voir les détails"
                      onClick={() =>
                        setSelectedEvent(event)
                      }
                    >

                      <i className="bi bi-eye" />

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="
          d-flex
          justify-content-between
          align-items-center
          flex-wrap
          gap-3
          px-3
          py-3
          border-top
        ">

          <div className="text-muted">

            {response.total} événement(s)

          </div>


      {/* =========================
          PAGINATION
      ========================= */}

      <Pagination
        page={filters.page}
        totalPages={response.total_pages}
        onPageChange={(newPage) =>
          setFilters((prev) => ({
            ...prev,
            page: newPage,
          }))
        }
      />

        </div>

      </div>


      {/* =================================================
          MODALE DE DÉTAIL
      ================================================= */}

      {selectedEvent && (

        <EventDetailModal
          event={selectedEvent}
          onClose={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>

  );
}