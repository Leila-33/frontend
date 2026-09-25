export const REQUIRED_DOCUMENT_TYPES = [
  "identity",
  "address_proof",
  "payslip",
  "rib",
];

/**
 * Statuts possibles d'un document.
 *
 * La configuration centralise :
 * - le libellé affiché ;
 * - la description ;
 * - la couleur Bootstrap ;
 * - l'icône associée.
 */
export const DOCUMENT_STATUS = {
  missing: {
    label: "Manquant",
    description: "Document requis",
    color: "secondary",
    icon: "bi-file-earmark",
  },

  pending: {
    label: "En attente",
    description: "En attente de validation",
    color: "warning",
    icon: "bi-hourglass-split",
  },

  validated: {
    label: "Validé",
    description: "Document validé",
    color: "success",
    icon: "bi-check-lg",
  },

  rejected: {
    label: "Refusé",
    description: "Document refusé",
    color: "danger",
    icon: "bi-x-lg",
  },
};

/**
 * Libellés des types de documents utilisés
 * dans les dossiers de financement.
 */
export const DOCUMENT_LABELS = {
  identity: "Pièce d'identité",
  address_proof: "Justificatif de domicile",
  payslip: "Bulletin de salaire",
  rib: "RIB",
};