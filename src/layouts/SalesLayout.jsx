import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import SalesSidebar from "../components/layout/SalesSidebar";
import useSalesNotifications from "../sales/hooks/useSalesNotifications";
import { useNotifications } from "../context/NotificationContext";

export default function SalesLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    newLeadsCount,
    myLeadsCount,
    quotesCount,
    applicationsCount,
  } = useSalesNotifications();

const { notifications, unreadNotificationCount } = useNotifications();

  
  return (
    <div className="d-flex">

      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}
      <SalesSidebar
        mobile={false}
        newLeadsCount={newLeadsCount}
        myLeadsCount={myLeadsCount}
        quotesCount={quotesCount}
        applicationsCount={applicationsCount}
        unreadNotificationCount={unreadNotificationCount}

      />

      {/* =========================
          MOBILE SIDEBAR OVERLAY
      ========================= */}
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
            <SalesSidebar
              mobile={true}
              newLeadsCount={newLeadsCount}
              myLeadsCount={myLeadsCount}
              quotesCount={quotesCount}
              applicationsCount={applicationsCount}
              unreadNotificationCount={unreadNotificationCount}
              onClickLink={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <div className="flex-grow-1">

        {/* MOBILE TOP BAR */}
        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setMobileOpen(true)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <h5 className="mb-0 fw-bold">Mmotors • Espace commercial</h5>

          <div />
        </div>

        {/* PAGE CONTENT */}
        <div className="p-3 p-lg-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}