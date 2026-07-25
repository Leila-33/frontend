import { useState } from "react";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";
import apiFetch from "../services/apiFetch";
import { toast } from "react-toastify";

export default function AvailabilityModal({
    vehicle,
    dateCheck,
    setDateCheck,
    onClose
}) {



    const [dateErrors, setDateErrors] = useState({});

    const [availability, setAvailability] =
        useState(null);

    // =========================
    // VALIDATION
    // =========================
    const validateDates = (start, end) => {

        const newErrors = {};

        if (!start) {
            newErrors.start =
                "Date de départ requise";
        }

        if (!end) {
            newErrors.end =
                "Date de retour requise";
        }
     

        if (start && end) {

            const today = new Date();
 
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(start);

            const endDate = new Date(end);

            if (startDate < today) {
                newErrors.start =
                    "La date de départ doit être aujourd'hui ou ultérieure";
            }

            if (endDate <= startDate) {
                newErrors.end =
                    "La date de retour doit être après le départ";
            }
        }

        setDateErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================
    // HANDLERS
    // =========================
    const handleStartChange = (value) => {

        const newState = {
            ...dateCheck,
            start: value
        };

        setDateCheck(newState);

        validateDates(
            newState.start,
            newState.end
        );
    };

    const handleEndChange = (value) => {

        const newState = {
            ...dateCheck,
            end: value
        };

        setDateCheck(newState);

        validateDates(
            newState.start,
            newState.end
        );
    };

    // =========================
    // API CHECK
    // =========================
    const handleCheck = async () => {

        try {

            const res = await apiFetch(
                "/reservations/check",
                {
                    method: "POST",
                    body: {
                        vehicle_id: vehicle.id,
                        start_date: dateCheck.start,
                        end_date: dateCheck.end
                    }
                }
            );

            setAvailability(res.available);

        } catch (err) {

            toast.error(err.message);
        }
    };

    if (!vehicle) return null;

    return (
        <div
            className="modal d-block"
            style={{
                background: "rgba(0,0,0,0.6)"
            }}
        >
            <div className="modal-dialog">
                <div className="modal-content p-4 rounded-4">

                    <h5 className="mb-3">
                        Disponibilité
                    </h5>

                    <input
                        type="date"
                        className="form-control mb-2"
                        value={dateCheck.start}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                            handleStartChange(e.target.value)
                        }
                    />

                    {dateErrors.start && (
                        <small className="text-danger">
                            {dateErrors.start}
                        </small>
                    )}

                    <input
                        type="date"
                        className="form-control mb-2"
                        value={dateCheck.end}
                        min={dateCheck.start}
                        onChange={(e) =>
                            handleEndChange(e.target.value)
                        }
                    />

                    {dateErrors.end && (
                        <small className="text-danger">
                            {dateErrors.end}
                        </small>
                    )}

                    <button
                        className="btn btn-dark w-100"
                        onClick={handleCheck}
                        disabled={
                            !dateCheck.start ||
                            !dateCheck.end ||
                            Object.keys(dateErrors).length > 0
                        }
                    >
                        Vérifier
                    </button>

                    {availability !== null && (
                        <div className="mt-3 text-center">

                            {availability ? (
                                <span className="text-success fw-bold">
                                    <BsCheckCircle />
                                    {" "}Disponible
                                </span>
                            ) : (
                                <span className="text-danger fw-bold">
                                    <BsXCircle />
                                    {" "}Indisponible
                                </span>
                            )}

                        </div>
                    )}

                    <button
                        className="btn btn-outline-dark mt-3 w-100"
                        onClick={onClose}
                    >
                        Fermer
                    </button>

                </div>
            </div>
        </div>
    );
}