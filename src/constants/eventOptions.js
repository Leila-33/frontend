/**
 * Labels des types d'événements.
 *
 * La clé correspond à la valeur technique
 * enregistrée par le backend.
 */
export const EVENT_TYPE_LABELS = {
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


/**
 * Configuration des catégories d'événements.
 *
 * `color` correspond directement aux couleurs
 * disponibles dans Bootstrap.
 */
export const EVENT_CATEGORIES = {
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