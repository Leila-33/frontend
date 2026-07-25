import { useNavigate } from "react-router-dom";

export default function LeadCard({
  lead,
  mode = "my-leads",
  onTakeLead,
  loading
}) {
  const navigate = useNavigate();

  return (
    <div className="card p-3 shadow-sm">

      <div
        onClick={() =>
          mode === "my-leads" &&
          navigate(`/sales/leads/${lead.id}`)
        }
        style={{ cursor: mode === "my-leads" ? "pointer" : "default" }}
      >

        {/* NAME */}
        <div className="fw-bold">
          {lead.first_name} {lead.last_name}
        </div>

        {/* VEHICLE */}
        <div className="text-muted small">
          {lead.vehicle?.brand} {lead.vehicle?.model}
        </div>

        <div className="small">
          {lead.vehicle?.price} €
        </div>

      </div>

      {/* ACTION ZONE */}
      {mode === "available" && (
        <button
          className="btn btn-dark btn-sm mt-3 w-100"
          onClick={() => onTakeLead(lead.id)     
          }
          disabled={loading}
>
{
 loading
 ?
 "Attribution..."
 :
 "Prendre ce lead"
}        </button>
      )}

    </div>
  );
}