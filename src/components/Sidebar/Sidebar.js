import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faUserTie,
  faGraduationCap,
  faBookOpen,
  faClipboardCheck,
  faChartLine,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/logo.png";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", icon: faGauge, to: "/dashboard" },
    { label: "Instructors", icon: faUserTie, to: "/Instracpage" },
    { label: "Students", icon: faGraduationCap, to: "#" },
    { label: "Courses", icon: faBookOpen, to: "#" },
    { label: "Enrollment", icon: faClipboardCheck, to: "#" },
    { label: "Reports", icon: faChartLine, to: "#" },
    { label: "Settings", icon: faGear, to: "/Setting" },
  ];

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <h1>FCAI</h1>
        <img
          src={logoImage}
          alt="FCAI University Logo"
          className="sidebar-university-logo"
        />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.to === "#" ? (
            <button
              key={item.label}
              type="button"
              className="sidebar-item sidebar-item-muted"
            >
              <FontAwesomeIcon icon={item.icon} className="sidebar-item-icon" />
              <span>{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item${isActive ? " sidebar-item-active" : ""}`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="sidebar-item-icon" />
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="sidebar-item-icon"
          />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
