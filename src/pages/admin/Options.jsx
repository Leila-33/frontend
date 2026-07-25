import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../services/apiFetch";
import ConfirmModal from "../../sales/components/ConfirmModal";

export default function AdminOptions() {
  const [options, setOptions] = useState([]);

const [form, setForm] = useState({
  name: "",
  price: "",
  billing_type: "fixed",
});
  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
const [disableModal, setDisableModal] = useState(false);
const [selectedOption, setSelectedOption] = useState(null);

  /* ================= FETCH ================= */
  const fetchOptions = async () => {
    try {
      const data = await apiFetch("/admin/options");
      setOptions(data);
    } catch (err) {
      toast.error(err.message || "Erreur chargement options");
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  /* ================= GROUPING ================= */
const includedOptions = options.filter(
  o => o.type === "included"
);


const customActiveOptions = options.filter(
  o =>
    o.type === "custom" &&
    o.is_active
);


const customInactiveOptions = options.filter(
  o =>
    o.type === "custom" &&
    !o.is_active
);
  /* ================= VALIDATION ================= */
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

const handleChange = (e) => {

  const { name, value, type, checked } = e.target;

  const updated = {
    ...form,
    [name]: type === "checkbox" ? checked : value,
  };

  setForm(updated);
  setErrors(validate(updated));
};

const isValid =
  Object.keys(errors).length === 0 &&
  form.name.trim() !== "" &&
  form.price !== "" &&
  !isNaN(Number(form.price));

  /* ================= CRUD ================= */
const handleSubmit = async (e) => {
  e.preventDefault();

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

    await fetchOptions();

    closeModal();

  } catch (err) {

    toast.error(
      err.message || "Erreur sauvegarde"
    );

  }
};
const updateOptionStatus = async (
  id,
  is_active
) => {

  try {

    await apiFetch(
      `/admin/options/${id}/status`,
      {
        method:"PATCH",
        body:{
          is_active
        }
      }
    );


    toast.success(
      is_active
      ? "Option activée ✅"
      : "Option désactivée ❌"
    );


    await fetchOptions();


  } catch(err){

    toast.error(
      err.message ||
      "Erreur mise à jour"
    );

  }

};


const toggleOptionStatus = async(option)=>{

 await updateOptionStatus(
   option.id,
   !option.is_active
 );

};
const openDisableModal = (option) => {
  setSelectedOption(option);
  setDisableModal(true);
};


const closeDisableModal = () => {
  setSelectedOption(null);
  setDisableModal(false);
};


const handleDeactivate = async () => {

  if (!selectedOption) return;


  await toggleOptionStatus(selectedOption);


  closeDisableModal();

};

  /* ================= SYSTEM LOGIC ================= */
const openModal = (o = null) => {
  if (o) {
    setEditId(o.id);

 setForm({
  name: o.name ?? "",
  price: o.price ?? "",
  billing_type: o.billing_type ?? "fixed",
});

  } else {

    setEditId(null);

setForm({
  name: "",
  price: "",
  billing_type: "fixed",
});
  }

  setErrors({});
  setShowModal(true);
};

  const closeModal = () => setShowModal(false);

  /* ================= UI ================= */
return (
<div className="container mt-4">


<div className="d-flex justify-content-between align-items-center mb-4">

<h2>
<i className="bi bi-sliders me-2"></i>
Gestion des options
</h2>

</div>



{/* =========================
    OPTIONS SYSTEME
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


{includedOptions.map((opt)=>(


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



{opt.price > 0 && (

<span className="badge bg-light text-dark border">

{opt.price} €

</span>

)}


</div>


</div>




<button

className={
opt.is_active
?
"btn btn-outline-danger btn-sm"
:
"btn btn-outline-success btn-sm"
}

onClick={() =>
opt.is_active
?
openDisableModal(opt)
:
toggleOptionStatus(opt)
}

>


<i
className={
opt.is_active
?
"bi bi-toggle-off"
:
"bi bi-toggle-on"
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
    CUSTOM HEADER
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




<button
className="btn btn-primary"
onClick={() => openModal()}
>

<i className="bi bi-plus-lg me-2"></i>

Ajouter une option

</button>


</div>





{/* =========================
    ACTIVE OPTIONS
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


{customActiveOptions.map((o)=>(


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



<hr/>


<div className="d-flex gap-2">


<button
className="btn btn-outline-warning btn-sm"
onClick={()=>openModal(o)}
>

<i className="bi bi-pencil"></i>

</button>



<button
className="btn btn-outline-danger btn-sm"
onClick={()=>openDisableModal(o)}
>

<i className="bi bi-toggle-off"></i>

</button>


</div>



</div>


</div>


))}



</div>


</div>


</div>





{/* =========================
    INACTIVE OPTIONS
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


{customInactiveOptions.length === 0 ? (


<p className="text-muted text-center mb-0">

Aucune option désactivée

</p>


) : (


<div className="row g-3">


{customInactiveOptions.map((o)=>(


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



<hr/>


<button

className="btn btn-outline-success btn-sm me-2"

onClick={()=>toggleOptionStatus(o)}

>

<i className="bi bi-toggle-on me-1"></i>

Réactiver

</button>



<button

className="btn btn-outline-warning btn-sm"

onClick={()=>openModal(o)}

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



      {/* CUSTOM MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>{editId ? "Modifier" : "Ajouter"} option</h5>

<form onSubmit={handleSubmit}>
  
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

    <option value="fixed">
      Forfait
    </option>

    <option value="daily">
      Journalier
    </option>


  </select>

</div>
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

<ConfirmModal
  show={disableModal}
  title={
    <>
      <i className="bi bi-exclamation-triangle text-warning me-2"></i>
      Désactiver l'option ?
    </>
  }
  message={
    <>
      <p className="text-muted mb-0">
        L'option{" "}
        <strong>{selectedOption?.name}</strong>{" "}
        ne sera plus disponible pour les nouveaux clients.
      </p>
    </>
  }
  confirmText={
    <>
      <i className="bi bi-toggle-off me-1"></i>
      Confirmer
    </>
  }
  cancelText="Annuler"
  onConfirm={handleDeactivate}
  onClose={closeDisableModal}
/>
    </div>
  );
}
