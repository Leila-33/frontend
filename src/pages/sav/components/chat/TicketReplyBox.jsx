import { useState } from "react";

export default function TicketReplyBox({
  onSend,
  placeholder = "Écrire un message..."
}) {

  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const ok = onSend(message);

    if (ok !== false) {
      setMessage("");
    }
  };

  const isDisabled = !message.trim(); // 👈 logique propre

  return (
    <form
      onSubmit={handleSubmit}
      className="card shadow-sm"
    >

      <div className="card-body">

        <textarea
          rows={4}
          className="form-control mb-3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
        />

        <div className="text-end">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isDisabled}
          >
            Envoyer
          </button>

        </div>

      </div>

    </form>
  );
}