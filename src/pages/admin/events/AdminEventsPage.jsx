import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import EventDetailModal from "./EventDetailModal";
import EventFilters from "./EventFilters";
import apiFetch from "../../../services/apiFetch";
const getTypeLabel = (type) => {

    switch (type) {

        case "payment_success":
            return "Paiement";

        case "payment_failed":
            return "Paiement échoué";

        case "application_created":
            return "Dossier créé";

        case "application_approved":
            return "Dossier accepté";

        case "document_uploaded":
            return "Document";

        case "test_drive_created":
            return "Essai";

        case "subscription_created":
            return "Abonnement";

        default:
            return type.replaceAll("_", " ");

    }

};
export default function AdminEventsPage() {


  const [response, setResponse] = useState({
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
});

const [selectedEvent, setSelectedEvent] = useState(null);

const [filters, setFilters] = useState({
  search: "",
  type: "all",
  date: "",
  page: 1,
  limit: 20,
});


const fetchEvents = async (page = filters.page) => {
  try {
const params = new URLSearchParams({
  page,
  limit: filters.limit,
  search: filters.search,
  event_type: filters.type,
  date: filters.date,
});

    const data = await apiFetch(
      `/admin/events?${params}`
    );

    setResponse(data);

  } catch (err) {
    toast.error("Erreur lors du chargement des événements");
  }
};



useEffect(() => {
  fetchEvents(filters.page);
}, [
  filters.page,
  filters.limit,
  filters.search,
  filters.type,
  filters.date,
]);



  const getTypeColor = (type) => {

    if (type.includes("payment"))
      return "success";


    if (type.includes("document"))
      return "warning";


    if (type.includes("user"))
      return "primary";


    if (type.includes("application"))
      return "info";


    return "secondary";

  };



  return (

    <div className="container-fluid">


      <h2 className="mb-4">
        Historique des événements
      </h2>



      {/* FILTERS */}

<EventFilters
    filters={filters}
    setFilters={setFilters}
    onRefresh={() => fetchEvents(filters.page)}
/>



      {/* TABLE */}


      <div className="
        card
        shadow-sm
        border-0
        rounded-4
        overflow-hidden
      ">


        <div className="table-responsive">


          <table className="
            table
            align-middle
            mb-0
          ">


            <thead className="table-light">


              <tr>

                <th>
                  Date
                </th>


                <th>
                  Type
                </th>


                <th>
                  Message
                </th>


                <th>
                  Utilisateur
                </th>


                <th>
                  Actions
                </th>


              </tr>


            </thead>



            <tbody>


            {
              response.items.length === 0 &&

              <tr>

                <td
                  colSpan="5"
                  className="
                    text-center
                    py-5
                    text-muted
                  "
                >

                  Aucun événement

                </td>

              </tr>
            }



            {
              response.items.map((event) => (

                <tr key={event.id}>


                  <td>

                    {new Date(
                      event.created_at
                    )
                    .toLocaleString()}

                  </td>



                  <td>


<span
    className={`badge bg-${getTypeColor(event.type)}`}
>
    {getTypeLabel(event.type)}
</span>


                  </td>



                  <td>

                    {event.message}

                  </td>



                  <td>

                    {event.user_id ?? "-"}

                  </td>



                  <td>


                    <button

                      className="
                        btn
                        btn-sm
                        btn-outline-secondary
                      "

                      onClick={() =>
                        setSelectedEvent(event)
                      }

                    >

                      <i className="
                        bi bi-eye
                      "/>


                    </button>


                  </td>



                </tr>

              ))
            }


            </tbody>


          </table>


        </div>


      </div>


<div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2">

    <div className="text-muted">
        {response.total} événement(s)
    </div>

    <div className="btn-group">

        <button
            className="btn btn-outline-secondary"
            disabled={!response.has_previous}
            onClick={() =>
                setFilters(prev => ({
                    ...prev,
                    page: prev.page - 1
                }))
            }
        >
            <i className="bi bi-chevron-left" />
        </button>

        <button
            className="btn btn-light"
            disabled
        >
            Page {response.page} / {response.total_pages}
        </button>

        <button
            className="btn btn-outline-secondary"
            disabled={!response.has_next}
            onClick={() =>
                setFilters(prev => ({
                    ...prev,
                    page: prev.page + 1
                }))
            }
        >
            <i className="bi bi-chevron-right" />
        </button>

    </div>

</div>
      {
        selectedEvent &&

        <EventDetailModal

          event={selectedEvent}

          onClose={() =>
            setSelectedEvent(null)
          }

        />

      }


    </div>

  );

}