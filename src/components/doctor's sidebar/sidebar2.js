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
import './sidebar2.css'

function Sidebar2() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", icon: faGauge, to: "/dashboard" },
    { label: "Instructors", icon: faUserTie, to: "/Instracpage" },
    { label: "Students", icon: faGraduationCap, to: "/students" },
    { label: "Courses", icon: faBookOpen, to: "/courses" },
    { label: "Enrollment", icon: faClipboardCheck, to: "/enrollment" },
    { label: "Reports", icon: faChartLine, to: "/reports" },
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

export default Sidebar2;
