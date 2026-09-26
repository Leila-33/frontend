function NumberedPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-4" aria-label="Pagination">
      <ul className="pagination justify-content-center">
        {/* =========================
            PAGE PRÉCÉDENTE
        ========================= */}

        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            disabled={page === 1}
            aria-label="Page précédente"
            onClick={() => onPageChange(page - 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </li>

        {/* =========================
            NUMÉROS
        ========================= */}

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <li
              key={pageNumber}
              className={`page-item ${page === pageNumber ? "active" : ""}`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          )
        )}

        {/* =========================
            PAGE SUIVANTE
        ========================= */}

        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            disabled={page === totalPages}
            aria-label="Page suivante"
            onClick={() => onPageChange(page + 1)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default NumberedPagination;
