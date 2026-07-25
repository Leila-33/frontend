import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";


export default function ActivateAccountPage() {
const {
  login,
  setPostLoginRedirect,
} = useAuth();

const [form, setForm] = useState({
  password: "",
  confirmPassword: "",
  cgu: false,
});

const [
  loading,
  setLoading
] = useState(false);

const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();


  const token = searchParams.get("token");




  const [checking, setChecking] = useState(true);


  const [user, setUser] = useState(null);


  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [expired, setExpired] = useState(false);


  const [validToken, setValidToken] = useState(false);
useEffect(() => {

  validate();

}, [form]);


const validate = () => {

  const errors = {};

if (!form.password) {
    errors.password = "Mot de passe requis";
  } else if (
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(form.password)
  ) {
    errors.password =
      "8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial";
  }


  if (
    form.password !== form.confirmPassword
  ) {

    errors.confirmPassword =
      "Les mots de passe ne correspondent pas";

  }


  if (!form.cgu) {

    errors.cgu =
      "Vous devez accepter les CGU";

  }


  setErrors(errors);


  return Object.keys(errors).length === 0;

};
const handleChange = (e) => {

  const {
    name,
    value,
    checked,
    type
  } = e.target;


  setForm({

    ...form,

    [name]:
      type === "checkbox"
        ? checked
        : value

  });

};
  // =========================
  // CHECK TOKEN
  // =========================

  useEffect(() => {


    if (!token) {

      setChecking(false);

      return;

    }


    checkToken();


  }, [token]);



  const checkToken = async () => {


    try {


      const data = await apiFetch(

        `/auth/activation/check?token=${token}`

      );


      setUser(data);


      setAlreadyVerified(
        data.already_verified
      );
      setExpired(data.expired)


      setValidToken(true);



    } catch(err) {

toast.error(
      err.message ||
      "Erreur validation token"
    );
      setValidToken(false);


    } finally {


      setChecking(false);


    }

  };



  // =========================
  // ACTIVATE ACCOUNT
  // =========================


const handleSubmit = async () => {


  if (!validate()) {

    return;

  }



  try {

    setLoading(true);

    const res = await apiFetch(

      "/auth/activate-account",

      {

        method:"POST",

        body: {

          token,

          password:
            form.password,

          accepted_cgu:
            form.cgu

        }

      }

    );


    toast.success(
      "Votre compte est activé."
    );



login(
    res.access_token,
    res.refresh_token
);

navigate(res.redirect);


setPostLoginRedirect(res.redirect);

login(
    res.access_token,
    res.refresh_token
);

  } catch(err) {


    toast.error(
      err.message ||
      "Erreur activation"
    );

  }finally{

    setLoading(false);

  }

};

const isFormValid =
  form.password.trim() !== "" &&
  form.password === form.confirmPassword &&
  form.cgu;


console.log({
  password: JSON.stringify(form.password),
  confirmPassword: JSON.stringify(form.confirmPassword),
  equal: form.password === form.confirmPassword,
  isFormValid
});
  // =========================
  // LOADING
  // =========================

  if(checking) {


    return (

      <div className="container min-vh-100 d-flex align-items-center justify-content-center">

        Vérification du lien...

      </div>

    );

  }




  // =========================
  // TOKEN INVALID
  // =========================

  if(!token || !validToken) {


    return (

      <div className="container min-vh-100 d-flex align-items-center justify-content-center">


        <div
          className="card shadow-sm"
          style={{
            maxWidth:"450px",
            width:"100%"
          }}
        >

          <div className="card-body text-center p-4">


            <h4 className="text-danger mb-3">

              Lien invalide

            </h4>


            <p className="text-muted">

              Ce lien d'activation est invalide.

            </p>


            <button

              className="btn btn-dark"

              onClick={() => navigate("/")}

            >

              Retour

            </button>


          </div>

        </div>


      </div>

    );

  }

  // =========================
  // EXPIRED
  // =========================
if (expired) {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">

      <div className="alert alert-warning text-center">

        <h4 className="mb-3">
          Lien expiré
        </h4>

        <p className="mb-0">
          Ce lien d'activation a expiré.
          Veuillez demander un nouveau lien.
        </p>

      </div>

    </div>
  );
}

  // =========================
  // ALREADY VERIFIED
  // =========================

  if(alreadyVerified) {


    return (

      <div className="container min-vh-100 d-flex align-items-center justify-content-center">


        <div
          className="card shadow-sm"
          style={{
            maxWidth:"450px",
            width:"100%"
          }}
        >

          <div className="card-body text-center p-4">


            <h4 className="fw-bold mb-3">

              Compte déjà activé

            </h4>


            <p className="text-muted">

              Bonjour {user.first_name}, votre compte
              est déjà activé.

              <br />

              Vous pouvez vous connecter
              pour consulter vos offres.

            </p>


            <button

              className="btn btn-dark w-100"

              onClick={() => navigate("/login")}

            >

              Se connecter

            </button>


          </div>

        </div>


      </div>

    );

  }




  // =========================
  // ACTIVATION FORM
  // =========================

  return (

    <div className="container min-vh-100 d-flex align-items-center justify-content-center">


      <div

        className="card shadow-sm"

        style={{
          maxWidth:"450px",
          width:"100%"
        }}

      >

        <div className="card-body p-4">


          <h3 className="fw-bold mb-2">

            Bienvenue {user?.first_name}

          </h3>


          <p className="text-muted mb-4">

            Choisissez votre mot de passe
            pour accéder à votre espace client.

          </p>



          <div className="mb-3">

  <label className="form-label">
    Mot de passe
  </label>

  <input
    type="password"
    className={`form-control ${
      errors.password
        ? "is-invalid"
        : ""
    }`}
    name="password"
    value={form.password}
    onChange={handleChange}
  />

  {errors.password && (
    <div className="invalid-feedback">
      {errors.password}
    </div>
  )}

</div>


<div className="mb-3">

  <label className="form-label">
    Confirmation
  </label>

  <input
    type="password"
    className={`form-control ${
      errors.confirmPassword
        ? "is-invalid"
        : ""
    }`}
    name="confirmPassword"
    value={form.confirmPassword}
    onChange={handleChange}
  />

  {errors.confirmPassword && (
    <div className="invalid-feedback">
      {errors.confirmPassword}
    </div>
  )}

</div>


<div className="form-check mb-3">

  <input
    className="form-check-input"
    type="checkbox"
    name="cgu"
    checked={form.cgu}
    onChange={handleChange}
  />

  <label className="form-check-label">

    J’accepte les{" "}

    <a href="/cgu" target="_blank">
      CGU
    </a>

  </label>

</div>


{errors.cgu && (
  <p className="text-danger">
    {errors.cgu}
  </p>
)}

          <button
  className="btn btn-dark w-100"
  disabled={loading || !isFormValid}
  onClick={handleSubmit}
>
  Activer mon compte
</button>


        </div>

      </div>


    </div>

  );

}