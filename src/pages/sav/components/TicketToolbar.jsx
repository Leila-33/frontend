import React from "react";

export default function TicketToolbar({ filters, setFilters }) {
  return (
    <div className="card p-3 mb-3">

      <input
        className="form-control mb-2"
        placeholder="Rechercher..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value, page: 1 })
        }
      />

      <div className="row g-2">

        <div className="col">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="ALL">Statut</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="col">
          <select
            className="form-select"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="ALL">Priorité</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div className="col">
          <select
            className="form-select"
            value={filters.sort}
            onChange={(e) =>
              setFilters({ ...filters, sort: e.target.value })
            }
          >
            <option value="activity_desc">Dernière activité</option>
            <option value="created_at_desc">Date création</option>
            <option value="priority">Priorité</option>
          </select>
        </div>

      </div>
    </div>
  );
}