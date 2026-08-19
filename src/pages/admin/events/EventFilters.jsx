export default function EventFilters({
    filters,
    setFilters,
    onRefresh
}) {


    const updateFilter = (key, value) => {

        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));

    };


    return (

        <div className="
            card
            p-3
            mb-4
            shadow-sm
            border-0
            rounded-4
        ">


            <div className="row g-3 align-items-center">


                {/* SEARCH */}

                <div className="col-lg-5">

                    <input

                        className="form-control"

                        placeholder="
                            Rechercher un événement...
                        "

                        value={filters.search}

                        onChange={(e) =>
                            updateFilter(
                                "search",
                                e.target.value
                            )
                        }

                    />

                </div>



                {/* TYPE */}

                <div className="col-lg-3">


                    <select

                        className="form-select"

                        value={filters.type}

                        onChange={(e) =>
                            updateFilter(
                                "type",
                                e.target.value
                            )
                        }

                    >

                        <option value="all">
                            Tous événements
                        </option>


                        <option value="application">
                            Applications
                        </option>


                        <option value="document">
                            Documents
                        </option>


                        <option value="payment">
                            Paiements
                        </option>


                        <option value="financing">
                            Financement
                        </option>


                        <option value="rental">
                            Locations
                        </option>


                        <option value="test_drive">
                            Essais véhicule
                        </option>


                        <option value="user">
                            Utilisateurs
                        </option>


                    </select>


                </div>



                {/* DATE */}

                <div className="col-lg-2">

                    <input
  type="date"
  className="form-control"
  value={filters.date}
  onChange={(e) => updateFilter("date", e.target.value)}
/>

                </div>



                {/* REFRESH */}

                <div className="col-lg-2">

                    <button

                        className="
                            btn
                            btn-outline-primary
                            w-100
                        "

                        onClick={onRefresh}

                    >

                        <i className="
                            bi bi-arrow-repeat
                        "/>

                    </button>


                </div>


            </div>


        </div>

    );

}