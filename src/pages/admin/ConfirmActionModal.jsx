import React from "react";

export default function ConfirmActionModal({
  open,
  type,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  const config = {
  delete: {
    className: "btn-danger",
    icon: "bi-trash",
    label: "Supprimer"
  },
  archive: {
    className: "btn-warning",
    icon: "bi-archive",
    label: "Archiver"
  },
  restore: {
    className: "btn-success",
    icon: "bi-arrow-counterclockwise",
    label: "Désarchiver"
  },
  restore_cancelled: {
    className: "btn-success",
    icon: "bi-arrow-counterclockwise",
    label: "Restaurer"
  },
  cancel: {
    className: "btn-secondary",
    icon: "bi-x-circle",
    label: "Annuler"
  }
}[type];

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">

        <div className="modal-content rounded-4 shadow">

          <div className="modal-header border-0">
            <h5 className="modal-title fw-semibold">
              <i className={`bi ${config.icon} me-2`} />
              {title}
            </h5>

            <button
              className="btn-close"
              onClick={onCancel}
            />
          </div>

          <div className="modal-body pt-0">
            <p className="text-muted mb-0">
              {description}
            </p>
          </div>

          <div className="modal-footer border-0">

            <button
              className="btn btn-light"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              className={`btn ${config.className}`}
              onClick={onConfirm}
              disabled={loading}
            >
              <i className={`bi ${config.icon} me-1`} />
              {config.label}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}