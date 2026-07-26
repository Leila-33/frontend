import React from "react";

export default function Pagination({
  page,
  pages,
  onPageChange,
}) {
  if (!pages || pages <= 1) return null;

  const goTo = (p) => {
    if (p < 1 || p > pages) return;
    onPageChange(p);
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">

      {/* PREV */}
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={page === 1}
        onClick={() => goTo(page - 1)}
      >
        ← Précédent
      </button>

      {/* INFO */}
      <div className="text-muted">
        Page <strong>{page}</strong> / {pages}
      </div>

      {/* NEXT */}
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={page === pages}
        onClick={() => goTo(page + 1)}
      >
        Suivant →
      </button>

    </div>
  );
}