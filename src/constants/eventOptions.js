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

// ==========================================================
// CONFIGURATION DES TYPES D'ÉVÉNEMENTS
// ==========================================================

/**
 * Configuration visuelle des événements.
 *
 * Les clés correspondent exactement aux valeurs de EventType
 * définies côté backend.
 *
 * Chaque événement définit :
 * - icon : icône Bootstrap Icons ;
 * - color : couleur Bootstrap utilisée pour l'affichage.
 */
export const EVENT_TYPE_CONFIG = {
    // ========================================================
    // USERS
    // ========================================================

    user_registered: {
        icon: "bi-plus-circle",
        color: "primary",
    },

    user_email_verified: {
        icon: "bi-envelope-check",
        color: "success",
    },

    user_activated: {
        icon: "bi-check-circle",
        color: "success",
    },

    user_deactivated: {
        icon: "bi-x-circle",
        color: "danger",
    },

    user_created: {
        icon: "bi-plus-circle",
        color: "primary",
    },

    user_archived: {
        icon: "bi-archive",
        color: "warning",
    },

    user_unarchived: {
        icon: "bi-arrow-counterclockwise",
        color: "info",
    },

    user_role_updated: {
        icon: "bi-shield-check",
        color: "info",
    },

    user_account_activated: {
        icon: "bi-check-circle-fill",
        color: "success",
    },

    // ========================================================
    // LEADS
    // ========================================================

    // ========================================================
    // LEADS
    // ========================================================

    lead_created: {
        icon: "bi-plus-circle",
        color: "primary",
    },

    lead_assigned: {
        icon: "bi-arrow-right-circle",
        color: "info",
    },

    lead_contacted: {
        icon: "bi-telephone",
        color: "info",
    },

    lead_won: {
        icon: "bi-trophy",
        color: "success",
    },

    lead_deleted: {
        icon: "bi-trash",
        color: "danger",
    },

    // ========================================================
    // QUOTES
    // ========================================================

    quote_created: {
        icon: "bi-file-earmark-plus",
        color: "primary",
    },

    quote_updated: {
        icon: "bi-file-earmark-text",
        color: "info",
    },

    quote_sent: {
        icon: "bi-send",
        color: "primary",
    },

    quote_accepted: {
        icon: "bi-check-circle",
        color: "success",
    },

    quote_refused: {
        icon: "bi-x-circle",
        color: "danger",
    },

    quote_deleted: {
        icon: "bi-trash",
        color: "danger",
    },

    quote_expired: {
        icon: "bi-clock-history",
        color: "secondary",
    },

    // ========================================================
    // OPTIONS
    // ========================================================

    option_created: {
        icon: "bi-plus-circle",
        color: "primary",
    },

    option_updated: {
        icon: "bi-pencil",
        color: "info",
    },

    option_activated: {
        icon: "bi-toggle-on",
        color: "success",
    },

    option_deactivated: {
        icon: "bi-toggle-off",
        color: "secondary",
    },

    // ========================================================
    // APPLICATIONS
    // ========================================================

    application_created: {
        icon: "bi-file-earmark-plus",
        color: "secondary",
    },

    application_submitted: {
        icon: "bi-send",
        color: "primary",
    },

    application_processing: {
        icon: "bi-hourglass-split",
        color: "info",
    },

    application_approved: {
        icon: "bi-check-circle",
        color: "success",
    },

    application_rejected: {
        icon: "bi-x-circle",
        color: "danger",
    },

    application_archived: {
        icon: "bi-archive",
        color: "warning",
    },

    application_unarchived: {
        icon: "bi-archive-fill",
        color: "info",
    },

    application_restored: {
        icon: "bi-arrow-counterclockwise",
        color: "info",
    },

    application_cancelled: {
        icon: "bi-x-circle",
        color: "danger",
    },

    application_soft_deleted: {
        icon: "bi-trash",
        color: "danger",
    },

    application_status_updated: {
        icon: "bi-arrow-repeat",
        color: "primary",
    },

    // ========================================================
    // DOCUMENTS
    // ========================================================

    document_validated: {
        icon: "bi-file-check",
        color: "success",
    },

    document_rejected: {
        icon: "bi-file-x",
        color: "danger",
    },

    // ========================================================
    // VEHICLES
    // ========================================================

    vehicle_created: {
        icon: "bi-car-front",
        color: "primary",
    },

    vehicle_updated: {
        icon: "bi-pencil-square",
        color: "info",
    },

    vehicle_deleted: {
        icon: "bi-trash",
        color: "danger",
    },

    vehicle_archived: {
        icon: "bi-archive",
        color: "warning",
    },

    vehicle_published: {
        icon: "bi-globe",
        color: "success",
    },

    vehicle_unpublished: {
        icon: "bi-eye-slash",
        color: "secondary",
    },

    vehicle_availability_changed: {
        icon: "bi-car-front-fill",
        color: "info",
    },

    // ========================================================
    // INSPECTION
    // ========================================================

    inspection_started: {
        icon: "bi-search",
        color: "primary",
    },

    inspection_completed: {
        icon: "bi-clipboard-check",
        color: "success",
    },

    // ========================================================
    // RECONDITIONING
    // ========================================================

    reconditioning_started: {
        icon: "bi-tools",
        color: "warning",
    },

    reconditioning_completed: {
        icon: "bi-check2-circle",
        color: "success",
    },

    // ========================================================
    // FINAL CHECK
    // ========================================================

    final_check_completed: {
        icon: "bi-shield-check",
        color: "success",
    },

    // ========================================================
    // PAYMENTS
    // ========================================================

    payment_initiated: {
        icon: "bi-credit-card",
        color: "primary",
    },

    payment_succeeded: {
        icon: "bi-credit-card-2-front",
        color: "success",
    },

    payment_failed: {
        icon: "bi-credit-card-2-back",
        color: "danger",
    },

    deposit_paid: {
        icon: "bi-cash-coin",
        color: "success",
    },

    // ========================================================
    // FINANCING
    // ========================================================

    financing_contract_created: {
        icon: "bi-file-earmark-text",
        color: "primary",
    },

    financing_completed: {
        icon: "bi-file-earmark-check",
        color: "success",
    },

    // ========================================================
    // SUBSCRIPTIONS
    // ========================================================

    subscription_created: {
        icon: "bi-calendar-check",
        color: "info",
    },

    // ========================================================
    // INSTALLMENTS
    // ========================================================

    installment_paid: {
        icon: "bi-check2-circle",
        color: "success",
    },

    installment_failed: {
        icon: "bi-exclamation-circle",
        color: "danger",
    },

    // ========================================================
    // RENTALS
    // ========================================================

    rental_created: {
        icon: "bi-calendar-plus",
        color: "primary",
    },

    rental_payment_paid: {
        icon: "bi-credit-card",
        color: "success",
    },

    rental_completed: {
        icon: "bi-flag-fill",
        color: "success",
    },

    rental_cancelled: {
        icon: "bi-calendar-x",
        color: "danger",
    },

    // ========================================================
    // TEST DRIVES
    // ========================================================

    test_drive_created: {
        icon: "bi-calendar-plus",
        color: "primary",
    },

    test_drive_confirmed: {
        icon: "bi-check-circle",
        color: "success",
    },

    test_drive_rejected: {
        icon: "bi-x-circle",
        color: "danger",
    },

    test_drive_cancelled: {
        icon: "bi-calendar-x",
        color: "warning",
    },

    test_drive_completed: {
        icon: "bi-flag-fill",
        color: "success",
    },

    // ========================================================
    // WARRANTIES
    // ========================================================

    warranty_plan_created: {
        icon: "bi-shield-plus",
        color: "primary",
    },

    warranty_plan_updated: {
        icon: "bi-shield",
        color: "info",
    },

    warranty_plan_activated: {
        icon: "bi-shield-check",
        color: "success",
    },

    warranty_plan_deactivated: {
        icon: "bi-shield-x",
        color: "secondary",
    },

    warranty_activated: {
        icon: "bi-shield-check",
        color: "success",
    },

    // ========================================================
    // SUPPORT / SAV
    // ========================================================

    support_ticket_created: {
        icon: "bi-ticket-detailed",
        color: "primary",
    },

    support_ticket_archived: {
        icon: "bi-archive",
        color: "warning",
    },

    support_ticket_status_changed: {
        icon: "bi-arrow-repeat",
        color: "info",
    },

    // ========================================================
    // ADMIN
    // ========================================================

    admin_action: {
        icon: "bi-shield-lock",
        color: "danger",
    },
};

// ==========================================================
// CONFIGURATION PAR DÉFAUT
// ==========================================================

/**
 * Configuration utilisée lorsqu'un événement provenant
 * du backend ne possède pas encore de configuration dédiée.
 */
export const DEFAULT_EVENT_TYPE_CONFIG = {
    icon: "bi-clock-history",
    color: "dark",
};