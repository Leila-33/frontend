import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SavSidebar from "../components/layout/SAVSidebar";
import { useNotifications } from "../context/NotificationContext";

export default function SavLayout() {

  const [mobileOpen, setMobileOpen] = useState(false);

  const { unreadTicketCount } = useNotifications();




  return (
    <div className="d-flex">

      <SavSidebar
        mobile={false}
        unreadTicketCount={unreadTicketCount}
      />

      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="position-absolute top-0 start-0 bg-white h-100 shadow"
            style={{ width: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <SavSidebar
              mobile={true}
              unreadTicketCount={unreadTicketCount}
              onClickLink={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-grow-1">

        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setMobileOpen(true)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <h5 className="mb-0 fw-bold">Mmotors</h5>

          <div />
        </div>

        <div className="p-3 p-lg-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}