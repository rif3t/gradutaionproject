import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import InstructorsPage from "./pages/Instructors/Instructors";
import MainLayout from "./layouts/MainLayout/MainLayout";
// import Setting from "./pages/setting/Setting";
import StudentsPage from "./pages/Students/Students";
import CoursesPage from "./pages/Courses/Courses";
import EnrollmentPage from "./pages/Enrollment/Enrollment";
// import ReportsPage from "./pages/Reports/Reports";
import InstructorDashboard from "./pages/InstructorDashboard/InstructorDashboard";
import InstructorCoursesPage from "./pages/InstructorDashboard/InstructorCoursesPage";
// import InstructorQrSessionPage from "./pages/InstructorDashboard/InstructorQrSessionPage";
import InstructorAttendanceRecordsPage from "./pages/InstructorDashboard/InstructorAttendanceRecordsPage";
import DoctorsLayout from "./layouts/doctor'slayout";
import { Helmet } from 'react-helmet-async';
import { ProtectedRoute } from "./routes/roleBasedRoutes";
import logoimg from "../src/assets/images/logo.png"

const Unauthorized = () => <Navigate to="/" replace />;

function App() {
  return (
  <>
   <Helmet>
        <title>FCAI Attendance System</title>
        <meta property="" content={logoimg} />
      </Helmet>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
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

        {/* <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/Setting"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Setting />
            </ProtectedRoute>
          }
        /> */}
      </Route>
      <Route element={<DoctorsLayout />}>
        <Route
          path="/instructor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor-courses"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorCoursesPage />
            </ProtectedRoute>
          }
        />
        {/* QR Session integrated into Courses drill-down */}
        <Route
          path="/instructor-attendance-records"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorAttendanceRecordsPage />
            </ProtectedRoute>
          }
        />

      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;
