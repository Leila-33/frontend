import React from "react";

export default function TicketToolbar({
  filters,
  setFilters,
  filter
}) {

  const updateFilter = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1
    });
  };


  return (
    <div className="card shadow-sm p-3 mb-3">


      {/* =====================
          SEARCH
      ===================== */}
      <div className="position-relative mb-3">

        <input
          className="form-control ps-5"
          placeholder="Rechercher un ticket..."
          value={filters.search}
          onChange={(e) =>
            updateFilter(
              "search",
              e.target.value
            )
          }
        />


        <i
          className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
        />


        {filters.search && (

          <button
            className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
            onClick={() =>
              updateFilter(
                "search",
                ""
              )
            }
          >
            <i className="bi bi-x-lg"/>
          </button>

        )}

      </div>



      <div className="row g-2">


        {/* =====================
            STATUS
            caché sur OPEN
        ===================== */}
        {filter !== "open" && (

          <div className="col-md">

            <select
              className="form-select"
              value={filters.status}
              onChange={(e)=>
                updateFilter(
                  "status",
                  e.target.value
                )
              }
            >

              <option value="ALL">
                Tous les statuts
              </option>

              <option value="OPEN">
                Ouvert
              </option>

              <option value="IN_PROGRESS">
                En cours
              </option>

              <option value="WAITING_CUSTOMER">
                En attente client
              </option>

              <option value="RESOLVED">
                Résolu
              </option>

              <option value="CLOSED">
                Fermé
              </option>

            </select>

          </div>

        )}



        {/* =====================
            PRIORITY
            caché sur URGENT
        ===================== */}
        {filter !== "urgent" && (

          <div className="col-md">

            <select
              className="form-select"
              value={filters.priority}
              onChange={(e)=>
                updateFilter(
                  "priority",
                  e.target.value
                )
              }
            >

              <option value="ALL">
                Toutes les priorités
              </option>

              <option value="LOW">
                Faible
              </option>

              <option value="MEDIUM">
                Moyenne
              </option>

              <option value="HIGH">
                Haute
              </option>

              <option value="URGENT">
                Urgente
              </option>

            </select>

          </div>

        )}



        {/* =====================
            CATEGORY
            toujours utile
        ===================== */}

        <div className="col-md">

          <select
            className="form-select"
            value={filters.category}
            onChange={(e)=>
              updateFilter(
                "category",
                e.target.value
              )
            }
          >

            <option value="ALL">
              Toutes les catégories
            </option>

            <option value="GENERAL">
              Général
            </option>

            <option value="FINANCING">
              Financement
            </option>

            <option value="DELIVERY">
              Livraison
            </option>

            <option value="WARRANTY">
              Garantie
            </option>

            <option value="VEHICLE_ISSUE">
              Problème véhicule
            </option>

            <option value="DOCUMENTS">
              Documents
            </option>

            <option value="PAYMENT">
              Paiement
            </option>

            <option value="OTHER">
              Autre
            </option>

          </select>

        </div>



        {/* =====================
            TRI
        ===================== */}

        <div className="col-md">

          <select
            className="form-select"
            value={filters.sort}
            onChange={(e)=>
              updateFilter(
                "sort",
                e.target.value
              )
            }
          >

            <option value="activity_desc">
              Dernière activité
            </option>

            <option value="created_at_desc">
              Plus récents
            </option>

            <option value="priority">
              Priorité
            </option>

          </select>

        </div>


      </div>

    </div>
  );
}