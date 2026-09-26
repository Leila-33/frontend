function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className="
        d-flex
        justify-content-between
        align-items-center
        gap-3
      "
    >
      {/* =========================
          PAGE PRÉCÉDENTE
      ========================= */}

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <i className="bi bi-chevron-left me-1" />
        Précédent
      </button>

      {/* =========================
          PAGE ACTUELLE
      ========================= */}

      <div className="text-muted text-nowrap">
        Page <strong>{page}</strong> / {totalPages}
      </div>

      {/* =========================
          PAGE SUIVANTE
      ========================= */}

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
        <i className="bi bi-chevron-right ms-1" />
      </button>
    </div>
  );
}
export default Pagination;
