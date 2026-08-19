import ActionButton from "../common/ActionButton";

export default function ApplicationActions({
  application,
  viewMode,
  onAction,
}) {
  const openModal = (type) => {
    onAction({
      open: true,
      type,
      id: application.id,
    });
  };

  return (
    <>
      {/* =========================
          ACTIVE
      ========================= */}
      {viewMode === "active" && (
        <>
          {application.can_archive && (
            <ActionButton
              color="warning"
              icon="bi-archive"
              title="Archiver le dossier"
              onClick={() => openModal("archive")}
            />
          )}

          {application.can_cancel && (
            <ActionButton
              color="warning"
              icon="bi-x-circle"
              title="Annuler le dossier"
              onClick={() => openModal("cancel")}
            />
          )}

          {application.can_delete && (
            <ActionButton
              color="danger"
              icon="bi-trash"
              title="Supprimer définitivement le dossier"
              onClick={() => openModal("delete")}
            />
          )}
        </>
      )}

      {/* =========================
          CANCELLED
      ========================= */}
      {viewMode === "cancelled" && (
        <>
          {application.can_restore_cancelled && (
            <ActionButton
              color="success"
              icon="bi-arrow-counterclockwise"
              title="Restaurer le dossier annulé"
              onClick={() => openModal("restore_cancelled")}
            />
          )}

          {application.can_archive && (
            <ActionButton
              color="warning"
              icon="bi-archive"
              title="Archiver le dossier"
              onClick={() => openModal("archive")}
            />
          )}

          {application.can_delete && (
            <ActionButton
              color="danger"
              icon="bi-trash"
              title="Supprimer définitivement le dossier"
              onClick={() => openModal("delete")}
            />
          )}
        </>
      )}

      {/* =========================
          ARCHIVED
      ========================= */}
      {viewMode === "archived" && (
        <>
          <ActionButton
            color="success"
            icon="bi-arrow-counterclockwise"
            title="Restaurer le dossier"
            onClick={() => openModal("restore")}
          />

          {application.can_delete && (
            <ActionButton
              color="danger"
              icon="bi-trash"
              title="Supprimer définitivement le dossier"
              onClick={() => openModal("delete")}
            />
          )}
        </>
      )}
    </>
  );
}