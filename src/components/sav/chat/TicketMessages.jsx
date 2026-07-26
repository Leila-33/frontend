export default function TicketMessages({
  messages,
  currentRole,
  messagesEndRef,
}) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        Aucun message.
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => {

        const isMine =
          msg.sender_role === currentRole;

        return (
          <div
            key={msg.id}
            className={`d-flex mb-3 ${
              isMine
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >

            <div
              className={`rounded-3 p-3 ${
                isMine
                  ? "bg-primary text-white"
                  : "bg-light border"
              }`}
              style={{ maxWidth: "70%" }}
            >

              <div
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.message}
              </div>

              <small
                className={`d-block mt-2 ${
                  isMine
                    ? "text-white-50"
                    : "text-muted"
                }`}
              >
                {new Date(
                  msg.created_at
                ).toLocaleString()}
              </small>

            </div>

          </div>
        );

      })}

      <div ref={messagesEndRef} />
    </>
  );
}