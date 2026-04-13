import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import InstructorsPage from "./pages/Instructors/Instructors";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Setting from "./pages/setting/Setting";
import StudentsPage from "./pages/Students/Students";
import CoursesPage from "./pages/Courses/Courses";
import EnrollmentPage from "./pages/Enrollment/Enrollment";
import ReportsPage from "./pages/Reports/Reports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Instracpage" element={<InstructorsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/Setting" element={<Setting />} />
      </Route>
    </Routes>
  );
}

export default App;
