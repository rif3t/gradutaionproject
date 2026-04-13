import { Outlet } from "react-router-dom";
import TopNavbar from "../../src/components/Navbar/Navbar";
import Sidebar2 from "../components/doctor's sidebar/sidebar2";


function DoctorsLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar2/>
      <TopNavbar />
      <Outlet />
    </div>
  );
}

export default DoctorsLayout;
