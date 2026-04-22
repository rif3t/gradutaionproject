import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar2 from "../components/doctor's sidebar/doctor's-sidebar";
import TopNavbar2 from "../components/doctor's navbar/navbar-doctor's";
import { InstructorWorkspaceProvider } from "../context/InstructorWorkspaceContext";

function DoctorsLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <InstructorWorkspaceProvider>
      <div className="layout-root">
        <Sidebar2 isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Overlay for mobile */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} 
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="main-viewport">
          <TopNavbar2 onToggleSidebar={toggleSidebar} />
          <main className="content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </InstructorWorkspaceProvider>
  );
}

export default DoctorsLayout;
