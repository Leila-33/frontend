import { BrowserRouter, Routes, Route } from "react-router-dom";

// PUBLIC
import Home from "../pages/Home";
import Vehicles from "../pages/Vehicles.jsx";
import VehicleDetail from "../pages/public/VehicleDetail";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ApplicationDeleted from "../pages/ApplicationDeleted.jsx";
import ActivateAccountPage from "../pages/sales/client/ActivateAccountPage.jsx";

// CLIENT
import Applications from "../pages/client/Applications";
import ApplicationDetails from "../pages/client/ApplicationDetails";
import MyTestDrives from "../pages/client/MyTestDrives";
import DashboardPage from "../pages/client/Dashboard";
import FavoritesPage from "../pages/client/Favorites";
import PaymentSuccessPage from "../pages/client/PaymentSuccessPage";
import PaymentCancelPage from "../pages/client/PaymentCancelPage";
import ClientTicketsPage from "../pages/sav/client/ClientTicketsPage.jsx";
import CreateTicketPage from "../pages/sav/client/CreateTicketPage.jsx";
import ClientTicketDetailPage from "../pages/sav/client/ClientTicketDetailPage.jsx";
import CustomerQuotesPage from "../pages/sales/client/CustomerQuotesPage.jsx";
import CustomerQuoteDetailPage from "../pages/sales/client/CustomerQuoteDetailPage.jsx";

// ADMIN
import AdminApplications from "../pages/admin/Applications";
import AdminApplicationDetails from "../pages/admin/ApplicationDetails";
import AdminVehicles from "../pages/admin/Vehicles";
import AdminOptions from "../pages/admin/Options";
import Dashboard from "../pages/admin/Dashboard";
import Analytics from "../pages/admin/Analytics";
import Users from "../pages/admin/Users";
import TestDriveManagement from "../pages/admin/TestDriveManagement";
import WarrantyPlansPage from "../pages/admin/WarrantyPlansPage";
import AdminCreateUserPage from "../pages/admin/AdminCreateUserPage";
import AdminEventsPage from "../pages/admin/AdminEventsPage.jsx";

// SAV AGENT
import SavTicketsPage from "../pages/sav/agent/SavTicketsPage.jsx";
import SavDashboardPage from "../pages/sav/agent/SavDashboardPage.jsx";
import SavStatisticsPage from "../pages/sav/agent/SavStatisticsPage.jsx";
import AgentTicketDetailsPage from "../pages/sav/agent/AgentTicketDetailsPage.jsx";

// SALES AGENT
import SalesDashboard from "../pages/sales/agent/SalesDashboard.jsx";
import QuoteDetailPage from "../pages/sales/agent/QuoteDetailPage.jsx";
import LeadsPage from "../pages/sales/agent/LeadsPage.jsx";
import LeadDetailPage from "../pages/sales/agent/LeadDetailPage.jsx";
import QuoteFormContainer from "../pages/sales/agent/QuoteFormContainer.jsx";

// SHARED
import NotificationsPage from "../pages/shared/NotificationsPage";
import NotFound from "../pages/NotFound";
import TestDriveDetails from "../pages/client/TestDriveDetails.jsx";

// COMPONENTS
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ClientRoute from "../components/routes/ClientRoute.jsx";
import AdminRoute from "../components/routes/AdminRoute.jsx";
import GuestRoute from "../components/routes/GuestRoute.jsx";
import SavAgentRoute from "../components/routes/SavAgentRoute.jsx";
import SalesAgentRoute from "../components/routes/SalesAgentRoute.jsx";

// LAYOUTS
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import SavLayout from "../layouts/SavLayout";
import SalesLayout from "../layouts/SalesLayout.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* ========================= */}
        {/* PUBLIC */}
        {/* ========================= */}

        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />

        {/* ========================= */}
        {/* PROTECTED */}
        {/* ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="application-deleted" element={<ApplicationDeleted />} />
        </Route>

        {/* ========================= */}
        {/* GUEST */}
        {/* ========================= */}

        <Route
          path="/register"
          element={<GuestRoute><Register /></GuestRoute>}
        />

        <Route
          path="/login"
          element={<GuestRoute><Login /></GuestRoute>}
        />
        <Route
          path="/activate-account"
          element={<GuestRoute><ActivateAccountPage /></GuestRoute>}
        />

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ========================= */}
        {/* SAV AGENT */}
        {/* ========================= */}

        <Route element={<SavAgentRoute />}>
          <Route path="sav" element={<SavLayout />}>

            <Route index element={<SavDashboardPage />} />

            <Route path="dashboard" element={<SavDashboardPage />} />

            <Route path="tickets" element={<SavTicketsPage />} />
            <Route path="tickets/:id" element={<AgentTicketDetailsPage />} />

            <Route path="stats" element={<SavStatisticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

          </Route>
        </Route>

        {/* ========================= */}
        {/* SALES AGENT */}
        {/* ========================= */}

        <Route element={<SalesAgentRoute />}>
          <Route path="sales" element={<SalesLayout />}>

            {/* IMPORTANT */}
            <Route index element={<SalesDashboard />} />

            <Route path="dashboard" element={<SalesDashboard />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route
  path="/sales/quotes/new"
  element={<QuoteFormContainer />}
/>
            <Route
  path="/sales/quotes/:id/edit"
  element={<QuoteFormContainer />}
/>
            <Route path="quotes/:id" element={<QuoteDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

          </Route>
        </Route>

        {/* ========================= */}
        {/* CLIENT */}
        {/* ========================= */}

        <Route element={<ClientRoute />}>
          <Route element={<UserLayout />}>

            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="applications/new/:vehicleId" element={<ApplicationDetails />} />

            <Route path="mytestdrives" element={<MyTestDrives />} />
            <Route path="test-drives/:id" element={<TestDriveDetails />} />

            <Route path="support-tickets" element={<ClientTicketsPage />} />
            <Route path="support-tickets/create" element={<CreateTicketPage />} />
            <Route path="support-tickets/:id" element={<ClientTicketDetailPage />} />

            <Route path="favorites" element={<FavoritesPage />} />

            <Route path="payment/success" element={<PaymentSuccessPage />} />
            <Route path="payment/cancel" element={<PaymentCancelPage />} />
            <Route path="quotes" element={<CustomerQuotesPage />} />
            <Route path="quotes/:id" element={<CustomerQuoteDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

          </Route>
        </Route>



        {/* ========================= */}
        {/* ADMIN */}
        {/* ========================= */}

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="analytics" element={<Analytics />} />

            <Route path="applications" element={<AdminApplications />} />
            <Route path="applications/:id" element={<AdminApplicationDetails />} />

            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="vehicle/:id" element={<VehicleDetail />} />
            <Route path="options" element={<AdminOptions />} />

            <Route path="users" element={<Users />} />
            <Route path="users/create" element={<AdminCreateUserPage />} />

            <Route path="test-drives" element={<TestDriveManagement />} />
            <Route path="test-drives/:id" element={<TestDriveDetails />} />

            <Route path="warranty-plans" element={<WarrantyPlansPage />} />
            <Route path="activity" element={<AdminEventsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

          </Route>
        </Route>

        {/* ========================= */}
        {/* 404 */}
        {/* ========================= */}

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
}