import {
    BsShieldCheck,
    BsLightningCharge,
    BsCheckCircle,
    BsXCircle,
    BsPencil,
    BsToggleOff,
    BsToggleOn
} from "react-icons/bs";


export default function WarrantyPlansComparisonTable({
    plans,
    onToggle,
    onEdit
}) {


    const features = [

        {
            key: "covers_engine",
            label: "Moteur",
            icon: <BsShieldCheck />
        },

        {
            key: "covers_transmission",
            label: "Transmission",
            icon: <BsShieldCheck />
        },

        {
            key: "covers_electronics",
            label: "Électronique",
            icon: <BsLightningCharge />
        },

        {
            key: "covers_assistance",
            label: "Assistance",
            icon: <BsShieldCheck />
        },

        {
            key: "covers_wear_parts",
            label: "Pièces d'usure",
            icon: <BsShieldCheck />
        },

    ];



    const formatPlanType = (type) => {

        if (!type) return "";

        return type
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                c => c.toUpperCase()
            );

    };



    return (

        <div className="table-responsive">


            <table
                className="
                table
                align-middle
                text-center
                shadow-sm
                rounded-4
                overflow-hidden
                "
            >


                {/* =========================
                    HEADER
                ========================= */}

                <thead className="table-dark">


                    <tr>


                        <th className="text-start">
                            Garanties
                        </th>



                        {
                            plans.map(plan => (

                                <th key={plan.id}>


                                    <div className="fw-bold fs-6">

                                        {plan.name}

                                    </div>



                                    <div className="small mt-1">

                                        {plan.price} €

                                    </div>



                                    <span
                                        className={
                                            plan.active
                                            ?
                                            "badge bg-success mt-2"
                                            :
                                            "badge bg-secondary mt-2"
                                        }
                                    >

                                        {
                                            plan.active
                                            ?
                                            "Actif"
                                            :
                                            "Inactif"
                                        }


                                    </span>


                                </th>

                            ))
                        }


                    </tr>


                </thead>





                <tbody>



                    {/* =========================
                        PLAN INFO
                    ========================= */}



                    <tr className="table-light">


                        <td className="text-start fw-semibold">

                            Informations

                        </td>




                        {
                            plans.map(plan => (


                                <td
                                    key={plan.id}
                                    className="small"
                                >



                                    <div className="mb-2">

                                        <span className="text-muted">
                                            Type
                                        </span>


                                        <br />


                                        <span className="badge bg-primary">

                                            {
                                                formatPlanType(
                                                    plan.plan_type
                                                )
                                            }

                                        </span>


                                    </div>





                                    <div className="mb-2">

                                        <span className="text-muted">

                                            Durée

                                        </span>


                                        <br />


                                        <strong>

                                            {
                                                plan.duration_months
                                            }
                                            {" "}
                                            mois

                                        </strong>


                                    </div>





                                    <div>


                                        <span className="text-muted">

                                            Kilométrage

                                        </span>


                                        <br />


                                        {

                                            plan.mileage_limit

                                            ?

                                            `${plan.mileage_limit.toLocaleString()} km`

                                            :

                                            "Illimité"

                                        }


                                    </div>



                                </td>


                            ))
                        }



                    </tr>







                    {/* =========================
                        FEATURES
                    ========================= */}



                    {
                        features.map(feature => (


                            <tr key={feature.key}>


                                <td
                                    className="
                                    text-start
                                    fw-semibold
                                    "
                                >

                                    <span
                                        className="
                                        text-primary
                                        me-2
                                        "
                                    >

                                        {feature.icon}

                                    </span>


                                    {feature.label}


                                </td>






                                {
                                    plans.map(plan => (



                                        <td key={plan.id}>


                                            {
                                                plan[feature.key]

                                                ?

                                                <BsCheckCircle
                                                    className="
                                                    text-success
                                                    fs-5
                                                    "
                                                />


                                                :


                                                <BsXCircle
                                                    className="
                                                    text-danger
                                                    fs-5
                                                    "
                                                />

                                            }


                                        </td>



                                    ))
                                }





                            </tr>


                        ))
                    }







                    {/* =========================
                        ACTIONS
                    ========================= */}




                    <tr>


                        <td></td>




                        {
                            plans.map(plan => (


                                <td key={plan.id}>


                                    <div className="d-grid gap-2">



                                        <button
                                            className="
                                            btn
                                            btn-outline-warning
                                            btn-sm
                                            "
                                            onClick={() =>
                                                onEdit(plan)
                                            }
                                        >

                                            <BsPencil
                                                className="me-1"
                                            />

                                            Modifier


                                        </button>






                                        <button

                                            className={
                                                plan.active

                                                ?

                                                `
                                                btn
                                                btn-outline-danger
                                                btn-sm
                                                `

                                                :

                                                `
                                                btn
                                                btn-outline-success
                                                btn-sm
                                                `
                                            }


                                            onClick={() =>
                                                onToggle(
                                                    plan.id,
                                                    plan.active
                                                )
                                            }

                                        >


                                            {

                                                plan.active

                                                ?

                                                <>

                                                    <BsToggleOff
                                                        className="me-1"
                                                    />

                                                    Désactiver

                                                </>


                                                :


                                                <>

                                                    <BsToggleOn
                                                        className="me-1"
                                                    />

                                                    Activer

                                                </>


                                            }


                                        </button>



                                    </div>


                                </td>


                            ))
                        }



                    </tr>




                </tbody>



            </table>


        </div>

    );

}