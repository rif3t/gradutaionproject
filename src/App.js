import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import InstructorsPage from "./pages/Instructors/Instructors";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Setting from "./pages/setting/Setting";
import StudentsPage from "./pages/Students/Students";
import CoursesPage from "./pages/Courses/Courses";
import EnrollmentPage from "./pages/Enrollment/Enrollment";
import ReportsPage from "./pages/Reports/Reports";
import InstructorDashboard from "./doctorspages/Tashboar/instructor.dashboard";
import DoctorsLayout from "./layouts/doctor'slayout";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("adminRole")?.toLowerCase();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Instracpage"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <InstructorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollment"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Setting"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Setting />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route element={<DoctorsLayout />}>
        <Route
          path="//instructor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
