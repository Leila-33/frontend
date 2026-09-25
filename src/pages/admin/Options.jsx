import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import { OPTION_BILLING_TYPES } from "../../constants/optionsOptions";

export default function AdminOptions() {
  // =========================
  // ÉTATS
  // =========================

  // Liste des options récupérées depuis l'API
  const [options, setOptions] = useState([]);

  // Données du formulaire de création / modification
  const [form, setForm] = useState({
    name: "",
    price: "",
    billing_type: "fixed",
  });

  // Identifiant de l'option en cours de modification
  const [editId, setEditId] = useState(null);

  // Erreurs de validation du formulaire
  const [errors, setErrors] = useState({});

  // Gestion de l'ouverture du formulaire et de la confirmation de désactivation
  const [showModal, setShowModal] = useState(false);
  const [disableModal, setDisableModal] = useState(false);

  // Option sélectionnée pour une action de désactivation
  const [selectedOption, setSelectedOption] = useState(null);

  /* ================= FETCH ================= */

// Récupère les options depuis l'API
const fetchOptions = useCallback(async () => {
  try {
    const data = await apiFetch("/admin/options");
    setOptions(data.options);
  } catch (err) {
    toast.error(err.message || "Erreur chargement options");
  }
}, []);

// Chargement initial des options
useEffect(() => {
  fetchOptions();
}, [fetchOptions]);

  /* ================= GROUPING ================= */

  // Options système fournies par défaut
  const includedOptions = options.filter(
    o => o.type === "included"
  );

  // Options personnalisées actuellement actives
  const customActiveOptions = options.filter(
    o =>
      o.type === "custom" &&
      o.is_active
  );

  // Options personnalisées actuellement désactivées
  const customInactiveOptions = options.filter(
    o =>
      o.type === "custom" &&
      !o.is_active
  );

  /* ================= VALIDATION ================= */

  // Vérifie les données saisies dans le formulaire
  const validate = (f) => {
    const e = {};

    if (!f.name || f.name.trim() === "") {
      e.name = "Nom requis";
    }

    if (f.price === "" || isNaN(Number(f.price))) {
      e.price = "Prix invalide";
    }

    return e;
  };

  // Met à jour une valeur du formulaire et relance la validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updated = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    setForm(updated);
    setErrors(validate(updated));
  };

  // Détermine si le formulaire peut être soumis
  const isValid =
    Object.keys(errors).length === 0 &&
    form.name.trim() !== "" &&
    form.price !== "" &&
    !isNaN(Number(form.price));

  /* ================= CRUD ================= */

  // Crée une nouvelle option ou modifie une option existante
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Empêche l'envoi si le formulaire est invalide
    if (!isValid) return;

    try {
      await apiFetch(
        editId
          ? `/admin/options/${editId}`
          : "/admin/options",
        {
          method: editId ? "PUT" : "POST",
          body: {
            name: form.name,
            price: Number(form.price),
            billing_type: form.billing_type
          }
        }
      );

      toast.success(
        editId
          ? "Option modifiée ✅"
          : "Option créée ✅"
      );

      // Recharge la liste après l'opération
      await fetchOptions();

      closeModal();

    } catch (err) {
      toast.error(
        err.message || "Erreur sauvegarde"
      );
    }
  };

  // Active ou désactive une option via l'API
  const updateOptionStatus = async (
    id,
    is_active
  ) => {
    try {
      await apiFetch(
        `/admin/options/${id}/status`,
        {
          method: "PATCH",
          body: {
            is_active
          }
        }
      );

      toast.success(
        is_active
          ? "Option activée ✅"
          : "Option désactivée ❌"
      );

      // Recharge les données après modification
      await fetchOptions();

    } catch (err) {
      toast.error(
        err.message ||
        "Erreur mise à jour"
      );
    }
  };

  // Inverse l'état actif / inactif d'une option
  const toggleOptionStatus = async (option) => {
    await updateOptionStatus(
      option.id,
      !option.is_active
    );
  };

  // Ouvre la confirmation avant de désactiver une option
  const openDisableModal = (option) => {
    setSelectedOption(option);
    setDisableModal(true);
  };

  // Ferme la confirmation de désactivation
  const closeDisableModal = () => {
    setSelectedOption(null);
    setDisableModal(false);
  };

  // Désactive l'option après confirmation
  const handleDeactivate = async () => {
    if (!selectedOption) return;

    await toggleOptionStatus(selectedOption);

    closeDisableModal();
  };

  /* ================= SYSTEM LOGIC ================= */

  // Ouvre le formulaire en mode création ou modification
  const openModal = (o = null) => {
    if (o) {
      // Mode modification
      setEditId(o.id);

      setForm({
        name: o.name ?? "",
        price: o.price ?? "",
        billing_type: o.billing_type ?? "fixed",
      });

    } else {
      // Mode création
      setEditId(null);

      setForm({
        name: "",
        price: "",
        billing_type: "fixed",
      });
    }

    // Réinitialise les erreurs à l'ouverture
    setErrors({});
    setShowModal(true);
  };

  // Ferme le formulaire
  const closeModal = () => setShowModal(false);

  /* ================= UI ================= */

  return (
    <div className="container mt-4">

      {/* =========================
          EN-TÊTE DE LA PAGE
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          <i className="bi bi-sliders me-2"></i>
          Gestion des options
        </h2>

      </div>

      {/* =========================
          OPTIONS SYSTÈME
      ========================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white">

          <h5 className="mb-0">

            <i className="bi bi-shield-check me-2 text-primary"></i>

            Options système

          </h5>

        </div>

        <div className="card-body">

          <div className="row g-3">

            {includedOptions.map((opt) => (

              <div
                key={opt.id}
                className="col-md-6"
              >

                <div
                  className="
border
rounded
p-3
d-flex
justify-content-between
align-items-center
"
                >

                  <div>

                    <div className="fw-semibold">

                      {opt.name}

                    </div>

                    <div className="mt-2">

                      {/* Affichage de l'état de l'option */}
                      <span
                        className={
                          opt.is_active
                            ?
                            "badge bg-success me-2"
                            :
                            "badge bg-secondary me-2"
                        }
                      >

                        <i
                          className={
                            opt.is_active
                              ?
                              "bi bi-check-circle me-1"
                              :
                              "bi bi-x-circle me-1"
                          }
                        />

                        {
                          opt.is_active
                            ?
                            "Active"
                            :
                            "Désactivée"
                        }

                      </span>

                      {/* Affichage du prix uniquement s'il est supérieur à zéro */}
                      {opt.price > 0 && (

                        <span className="badge bg-light text-dark border">

                          {opt.price} €

                        </span>

                      )}

                    </div>

                  </div>

                  {/* Activation / désactivation de l'option système */}
                  <button
                    className={
                      opt.is_active
                        ? "btn btn-outline-success btn-sm"
                        : "btn btn-outline-danger btn-sm"
                    }
                    onClick={() => {
                      if (opt.is_active) {
                        openDisableModal(opt);
                      } else {
                        toggleOptionStatus(opt);
                      }
                    }}
                  >
                    <i
                      className={
                        opt.is_active
                          ? "bi bi-toggle-on"
                          : "bi bi-toggle-off"
                      }
                    />
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* =========================
          EN-TÊTE OPTIONS PERSONNALISÉES
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">

        <div>

          <h5 className="mb-1">

            Options personnalisées

          </h5>

          <small className="text-muted">

            Gérez les options proposées aux clients

          </small>

        </div>

        {/* Ouverture du formulaire en mode création */}
        <button
          className="btn btn-primary"
          onClick={() => openModal()}
        >

          <i className="bi bi-plus-lg me-2"></i>

          Ajouter une option

        </button>

      </div>

      {/* =========================
          OPTIONS PERSONNALISÉES ACTIVES
      ========================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white">

          <strong>
            Options actives
          </strong>

          <span className="badge bg-success ms-2">

            {customActiveOptions.length}

          </span>

        </div>

        <div className="card-body">

          <div className="row g-3">

            {customActiveOptions.map((o) => (

              <div
                key={o.id}
                className="col-md-6"
              >

                <div
                  className="
border
rounded
p-3
"
                >

                  <div className="d-flex justify-content-between">

                    <div>

                      <h6 className="mb-1">

                        {o.name}

                      </h6>

                      <span className="badge bg-success me-2">

                        Active

                      </span>

                      <span className="badge bg-light text-dark border">

                        {
                          o.billing_type === "fixed"
                            ?
                            "Forfait"
                            :
                            "Journalier"
                        }

                      </span>

                    </div>

                    <strong>

                      {o.price ?? 0} €

                    </strong>

                  </div>

                  <hr />

                  <div className="d-flex gap-2">

                    {/* Modification de l'option */}
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => openModal(o)}
                    >

                      <i className="bi bi-pencil"></i>

                    </button>

                    {/* Désactivation avec confirmation */}
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => openDisableModal(o)}
                    >

                      <i className="bi bi-toggle-on"></i>

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* =========================
          OPTIONS PERSONNALISÉES DÉSACTIVÉES
      ========================= */}

      <div className="card shadow-sm">

        <div className="card-header bg-white">

          <strong>
            Options désactivées
          </strong>

          <span className="badge bg-secondary ms-2">

            {customInactiveOptions.length}

          </span>

        </div>

        <div className="card-body">

          {/* État vide lorsqu'aucune option n'est désactivée */}
          {customInactiveOptions.length === 0 ? (

            <p className="text-muted text-center mb-0">

              Aucune option désactivée

            </p>

          ) : (

            <div className="row g-3">

              {customInactiveOptions.map((o) => (

                <div
                  key={o.id}
                  className="col-md-6"
                >

                  <div
                    className="
border
rounded
p-3
bg-light
"
                  >

                    <div className="d-flex justify-content-between">

                      <div>

                        <h6>

                          {o.name}

                        </h6>

                        <span className="badge bg-secondary">

                          Désactivée

                        </span>

                      </div>

                      <strong>

                        {o.price ?? 0} €

                      </strong>

                    </div>

                    <hr />

                    {/* Réactivation de l'option */}
                    <button
                      className="btn btn-outline-danger btn-sm me-2"
                      onClick={() => toggleOptionStatus(o)}
                    >

                      <i className="bi bi-toggle-off me-1"></i>

                    </button>

                    {/* Modification de l'option désactivée */}
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => openModal(o)}
                    >

                      <i className="bi bi-pencil"></i>

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* =========================
          MODALE CRÉATION / MODIFICATION
      ========================= */}

      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >

          <div className="modal-dialog">

            <div className="modal-content p-3">

              <h5>
                {editId ? "Modifier" : "Ajouter"} option
              </h5>

              <form onSubmit={handleSubmit}>

                {/* Nom de l'option */}
                <input
                  name="name"
                  className="form-control mb-2"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nom"
                />

                {errors.name && (
                  <small className="text-danger">
                    {errors.name}
                  </small>
                )}

                {/* Prix de l'option */}
                <input
                  name="price"
                  className="form-control mb-2"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Prix"
                />

                {errors.price && (
                  <small className="text-danger">
                    {errors.price}
                  </small>
                )}

                {/* Mode de facturation */}
                <div className="mb-3">

                  <label className="form-label">
                    Mode de facturation
                  </label>

<select
  className="form-select"
  name="billing_type"
  value={form.billing_type}
  onChange={handleChange}
>
  {Object.entries(OPTION_BILLING_TYPES).map(
    ([value, label]) => (
      <option key={value} value={value}>
        {label}
      </option>
    )
  )}
</select>

                </div>

                {/* Actions de la modale */}
                <div className="d-flex justify-content-end gap-2">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>

                  <button
                    className="btn btn-primary"
                    disabled={!isValid}
                  >
                    Enregistrer
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          CONFIRMATION DE DÉSACTIVATION
      ========================= */}

      <ConfirmActionModal
        open={disableModal}
        type="disable"
        title="Désactiver l'option ?"
        description={
          <>
            L'option{" "}
            <strong>{selectedOption?.name}</strong>{" "}
            ne sera plus disponible pour les nouveaux clients.
          </>
        }
        onConfirm={handleDeactivate}
        onCancel={closeDisableModal}
      />

    </div>
  );
}
