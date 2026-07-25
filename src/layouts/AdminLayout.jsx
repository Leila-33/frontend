import AdminSidebar from "../components/layout/AdminSidebar";
import { Outlet } from "react-router-dom";
import apiFetch from "../services/apiFetch";
import { useEffect, useRef, useState } from "react";
export default function AdminLayout() {

  const [open, setOpen] = useState(false);
  // =========================
  // PENDING COUNT (GLOBAL)
  // =========================
  const [pendingCount, setPendingCount] = useState(0);
const intervalRef = useRef(null);
  // =========================
  // FETCH COUNT
  // =========================
  const fetchPendingCount = async () => {
    try {
      const res = await apiFetch(
        "/admin/test-drives/pending-count"
      );

      setPendingCount(res.count);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // INIT + POLLING
  // =========================


useEffect(() => {
  fetchPendingCount();

  intervalRef.current = setInterval(() => {
    fetchPendingCount();
  }, 30000);

  return () => {
    clearInterval(intervalRef.current);
  };
}, []);
  return (
    <div className="d-flex">

      {/* =======================
          DESKTOP SIDEBAR
      ======================= */}
      <AdminSidebar
  pendingCount={pendingCount}
/>

      {/* CONTENT */}
      <div className="flex-grow-1 p-3">

        {/* MOBILE BUTTON */}
        <div className="d-lg-none mb-3">

          <button
            className="btn btn-dark"
            onClick={() => setOpen(true)}
          >
            <i className="bi bi-list" />
          </button>

        </div>

        <Outlet />

      </div>

      {/* ======================= */}
      {/* MOBILE SIDEBAR */}
      {/* ======================= */}
      {open && (
        <>
          {/* BACKDROP */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
            style={{ opacity: 0.5, zIndex: 1040 }}
            onClick={() => setOpen(false)}
          />

          {/* SIDEBAR */}
          <div
            className="position-fixed top-0 start-0 h-100 bg-white shadow"
            style={{
              width: "280px",
              zIndex: 1050
            }}
          >

            {/* CLOSE */}
            <div className="p-3 border-bottom d-flex justify-content-between">

              <strong>Menu</strong>

              <button
                className="btn btn-sm btn-light"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

            </div>

            {/* SIDEBAR CONTENT */}
            <AdminSidebar
  mobile
  pendingCount={pendingCount}
  onClickLink={() => setOpen(false)}
/>

          </div>
        </>
      )}

    </div>
  );
}