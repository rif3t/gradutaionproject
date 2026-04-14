import { Outlet } from "react-router-dom";
import Sidebar2 from "../components/doctor's sidebar/doctor's-sidebar";
import TopNavbar2 from "../components/doctor's navbar/navbar-doctor's";


function DoctorsLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar2/>
      <TopNavbar2/>
      <Outlet />
    </div>
  );
}

export default DoctorsLayout;
