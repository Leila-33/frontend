import { useMemo } from "react";

// =====================================================
// COMPOSANT : TEST DRIVE STATUS MODAL
// =====================================================

// Modale de confirmation utilisée par l'administration
// pour modifier le statut d'un essai routier.
//
// Actions possibles :
// - confirmed  → confirmer le rendez-vous
// - rejected   → refuser la demande
// - cancelled  → annuler le rendez-vous
// - completed  → terminer l'essai routier
//
// Le composant reste volontairement générique :
// l'action réelle est exécutée par le composant parent
// via la fonction `onConfirm`.
export default function TestDriveStatusModal({
  open,
  type,
  testDrive,
  onClose,
  onConfirm,
  loading = false,
}) {
  // =====================================================
  // CONFIGURATION DES ACTIONS
  // =====================================================

  // Chaque type d'action possède sa propre configuration.
  //
  // On utilise useMemo pour conserver la même référence
  // de l'objet entre les rendus.
  const config = useMemo(
    () => ({
      // ---------------------------------------------------
      // CONFIRMER
      // ---------------------------------------------------

      confirmed: {
        title: "Confirmer l'essai routier",

        icon: "bi bi-check-circle fs-4",

        color: "success",

        action: "Confirmation du rendez-vous",

        button: "Confirmer",
      },

      // ---------------------------------------------------
      // REFUSER
      // ---------------------------------------------------

      rejected: {
        title: "Refuser l'essai routier",

        icon: "bi bi-x-circle fs-4",

        color: "danger",

        action: "Refus de la demande",

        button: "Refuser",
      },

      // ---------------------------------------------------
      // ANNULER
      // ---------------------------------------------------

      cancelled: {
        title: "Annuler l'essai routier",

        icon: "bi bi-calendar-x fs-4",

        color: "danger",

        action: "Annulation du rendez-vous",

        button: "Annuler",
      },

      // ---------------------------------------------------
      // TERMINER
      // ---------------------------------------------------

      completed: {
        title: "Terminer l'essai routier",

        icon: "bi bi-flag fs-4",

        color: "success",

        action: "Essai routier terminé",

        button: "Terminer",
      },
    }),
    []
  );

  // =====================================================
  // CONFIGURATION COURANTE
  // =====================================================

  // Récupération de la configuration correspondant
  // au type d'action demandé.
  const current = config[type];

  // =====================================================
  // SÉCURITÉ
  // =====================================================

  // La modale n'est pas affichée lorsqu'elle est fermée.
  if (!open) {
    return null;
  }

  // Si un type inconnu est fourni, on évite une erreur
  // JavaScript du type :
  //
  // Cannot read properties of undefined
  //
  // Cela permet également de protéger l'interface
  // contre une mauvaise valeur provenant du parent.
  if (!current) {
    return null;
  }

  // =====================================================
  // RENDU
  // =====================================================

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-drive-status-modal-title"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          {/* =================================================
              HEADER
              ================================================= */}

          <div className="modal-header border-0">
            <div className="d-flex align-items-center gap-3">
              {/* ---------------------------------------------
                  ICÔNE DE L'ACTION
                  --------------------------------------------- */}

              <div
                className={`
                  rounded-circle
                  bg-${current.color}-subtle
                  text-${current.color}
                  d-flex
                  align-items-center
                  justify-content-center
                  flex-shrink-0
                `}
                style={{
                  width: "45px",
                  height: "45px",
                }}
                aria-hidden="true"
              >
                <i className={current.icon} />
              </div>

              {/* ---------------------------------------------
                  TITRE
                  --------------------------------------------- */}

              <div>
                <h5 id="test-drive-status-modal-title" className="fw-bold mb-1">
                  {current.title}
                </h5>

                <small className="text-muted">
                  Vérifiez les informations avant validation.
                </small>
              </div>
            </div>

            {/* ---------------------------------------------
                BOUTON FERMETURE
                --------------------------------------------- */}

            <button
              type="button"
              className="btn-close"
              aria-label="Fermer"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          {/* =================================================
              BODY
              ================================================= */}

          <div className="modal-body p-4">
            {/* ---------------------------------------------
              INFORMATIONS DE L'ESSAI
              --------------------------------------------- */}

            <div className="bg-light rounded-4 p-3">
              {/* ===========================================
                CLIENT
                =========================================== */}

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Client</small>

                <div className="fw-semibold">
                  <i
                    className="bi bi-person-circle me-2 text-primary"
                    aria-hidden="true"
                  />

                  {testDrive?.user?.name || "Client inconnu"}
                </div>
              </div>

              {/* ===========================================
                VÉHICULE
                =========================================== */}

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Véhicule</small>

                <div className="fw-semibold">
                  <i
                    className="bi bi-car-front me-2 text-primary"
                    aria-hidden="true"
                  />

                  {[testDrive?.vehicle?.brand, testDrive?.vehicle?.model]
                    .filter(Boolean)
                    .join(" ") || "Véhicule inconnu"}
                </div>
              </div>

              {/* ===========================================
                ACTION
                =========================================== */}

              <div>
                <small className="text-muted d-block mb-1">Action</small>

                <div className="fw-semibold">{current.action}</div>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="modal-footer border-0">
            {/* ---------------------------------------------
                ANNULATION
                --------------------------------------------- */}

            <button
              type="button"
              className="btn btn-light rounded-pill px-4"
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2" aria-hidden="true" />
              Retour
            </button>

            {/* ---------------------------------------------
                CONFIRMATION
                --------------------------------------------- */}

            <button
              type="button"
              className={`
                btn
                btn-${current.color}
                rounded-pill
                px-4
              `}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  {/* Spinner pendant l'appel API */}
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Traitement...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2" aria-hidden="true" />

                  {current.button}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
