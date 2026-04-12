import { Outlet } from "react-router-dom";
import TopNavbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

function MainLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <TopNavbar />
      <Outlet />
    </div>
  );
}

export default MainLayout;
