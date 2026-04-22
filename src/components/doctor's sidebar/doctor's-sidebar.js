import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faBookOpen,
  faQrcode,
  faAddressCard,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/logo.png";
import "./sidebar2.css";

function Sidebar2() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: faGauge, to: "/instructor-dashboard" },
    { label: "My Courses", icon: faBookOpen, to: "/instructor-courses" },
    {
      label: "Attendance Records",
      icon: faAddressCard,
      to: "/instructor-attendance-records",
    },
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
        {navItems.map((item) => (
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
        ))}
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
