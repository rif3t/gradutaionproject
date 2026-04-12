import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import InstructorsPage from "./pages/Instructors/Instructors";
import MainLayout from "./layouts/MainLayout/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Instracpage" element={<InstructorsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
