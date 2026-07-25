import { useState } from "react";
import apiFetch from "../services/apiFetch";
import { toast } from "react-toastify";

export default function TestDriveModal({
  show,
  onClose,
  vehicleId,
}) {

  const [comment, setComment] = useState("");
  const [availability, setAvailability] = useState([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // =========================
  // FETCH AVAILABILITY
  // =========================
  const fetchAvailability = async (date) => {
    try {
      const res = await apiFetch(
        `/test-drives/availability?vehicle_id=${vehicleId}&date=${date}`
      );

      setAvailability(res.available_slots || []);

    } catch (err) {
      toast.error("Impossible de charger les créneaux");
    }
  };

  // =========================
  // SUBMIT
  // =========================
  const submitTestDrive = async () => {

    if (!selectedDate || !selectedHour) {
      toast.error("Choisissez une date et un créneau");
      return;
    }

    // =========================
    // SAFE UTC BUILD (IMPORTANT FIX)
    // =========================
    const appointmentDate = new Date(selectedHour);

    // =========================
    // PAST VALIDATION
    // =========================
    if (appointmentDate < new Date()) {
      toast.error("La date ne peut pas être dans le passé");
      return;
    }

    try {

      await apiFetch("/test-drives", {
        method: "POST",
        body: {
          vehicle_id: vehicleId,
          appointment_date: appointmentDate.toISOString(),
          comment: comment || null
        }
      });

      toast.success("Demande envoyée ✔");

      setSelectedDate("");
      setSelectedHour("");
      setAvailability([]);

      onClose();

    } catch (err) {
      console.log(err);
      toast.error(err?.data?.detail || "Erreur réservation");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50">

      <div className="modal-dialog modal-dialog-centered">

        <div className="modal-content rounded-4 shadow">

          {/* HEADER */}
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">
              Réserver un essai routier
            </h5>

            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">

            <label className="form-label">Date</label>

            <input
              type="date"
              className="form-control mb-3"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchAvailability(e.target.value);
              }}
            />

            {/* SLOTS */}
            <div className="d-flex flex-wrap gap-2 mb-3">

              {availability.length === 0 && selectedDate && (
                <small className="text-muted">
                  Aucun créneau disponible
                </small>
              )}

              {availability.map((slot) => {

                const date = new Date(slot);

                return (
                  <button
                    key={slot}
                    className={`btn btn-sm ${
                      selectedHour === slot
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setSelectedHour(slot)}
                  >
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </button>
                );
              })}

            </div>

            {/* COMMENT */}
            <label className="form-label">
              Commentaire (optionnel)
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="Ex: je préfère une boîte automatique..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0">

            <button className="btn btn-light" onClick={onClose}>
              Annuler
            </button>

            <button className="btn btn-primary" onClick={submitTestDrive}>
              Confirmer
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}