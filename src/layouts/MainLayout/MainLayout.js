import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout-root">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="main-viewport">
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="content-area admin-dashboard">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
