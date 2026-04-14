import { Outlet } from "react-router-dom";
import Sidebar2 from "../components/doctor's sidebar/doctor's-sidebar";
import TopNavbar2 from "../components/doctor's navbar/navbar-doctor's";
import { InstructorWorkspaceProvider } from "../context/InstructorWorkspaceContext";


function DoctorsLayout() {
  return (
    <InstructorWorkspaceProvider>
      <div style={{ display: "flex" }}>
        <Sidebar2 />
        <TopNavbar2 />
        <Outlet />
      </div>
    </InstructorWorkspaceProvider>
  );
}

export default DoctorsLayout;
