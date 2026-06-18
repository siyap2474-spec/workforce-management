import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";

// Authentication components
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Protected Dashboard components
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";
import ResourceAllocation from "./pages/admin/ResourceAllocation";
import ManagerDashboard from "./pages/manager/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import Profile from "./pages/employee/Profile";
import Leaves from "./pages/employee/Leaves";
import LeaveManagement from "./pages/admin/LeaveManagement";
import Timesheets from "./pages/employee/Timesheets";
import TimesheetReview from "./pages/manager/TimesheetReview";
import Availability from "./pages/admin/Availability";
import Reports from "./pages/admin/Reports";

// Protected Route Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Global loading & error handling components
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalLoader from "./components/GlobalLoader";
import ToastContainer from "./components/ToastContainer";

const App: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Root redirect component based on authentication and user role
  const RootRedirect = () => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    const role = user.role.name.toLowerCase();
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === "manager" || role === "project manager") {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  };

  return (
    <ErrorBoundary>
      <GlobalLoader />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/allocations"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Project Manager"]}>
                <ResourceAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Manager", "Project Manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <Leaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Project Manager"]}>
                <LeaveManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/timesheets"
            element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <Timesheets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/timesheets"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Project Manager"]}>
                <TimesheetReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/availability"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Project Manager"]}>
                <Availability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Project Manager"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Global Fallbacks */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
