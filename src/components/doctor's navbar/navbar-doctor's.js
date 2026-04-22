import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMagnifyingGlass,
  faCaretDown,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import "../Navbar/Navbar.css";

function TopNavbar2({ onToggleSidebar }) {
  const fullName = localStorage.getItem("adminName") || "Instructor";
  const avatarLetter = fullName.charAt(0).toUpperCase();

  return (
    <Navbar expand="lg" className="top-navbar-shell" fixed="top">
      <Container fluid className="top-navbar-inner">
        <div className="top-navbar-left">
          <button 
            type="button" 
            className="top-toggle-btn" 
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Navbar.Brand className="top-navbar-title">
            FCAI Instructor
          </Navbar.Brand>
        </div>

        <div className="top-navbar-actions">
          <button type="button" className="top-icon-btn" aria-label="Search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <button
            type="button"
            className="top-icon-btn"
            aria-label="Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
          </button>

          <button
            type="button"
            className="profile-chip"
            aria-label="Profile menu"
          >
            <span className="profile-avatar">{avatarLetter}</span>
            <span className="profile-name">{fullName} (Instructor)</span>
            <FontAwesomeIcon icon={faCaretDown} className="profile-caret" />
          </button>
        </div>
      </Container>
    </Navbar>
  );
}

export default TopNavbar2;
