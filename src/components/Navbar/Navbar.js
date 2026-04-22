import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMagnifyingGlass,
  faCaretDown,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";

function TopNavbar({ onToggleSidebar }) {
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
            FCAI Admin
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
            <span className="profile-avatar">A</span>
            <span className="profile-name">Admin User</span>
            <FontAwesomeIcon icon={faCaretDown} className="profile-caret" />
          </button>
        </div>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
