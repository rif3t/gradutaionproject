import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMagnifyingGlass,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";

function TopNavbar() {
  return (
    <Navbar expand="lg" className="top-navbar-shell">
      <Container fluid className="top-navbar-inner">
        <Navbar.Brand className="top-navbar-title">
          FCAI Attendance Admin
        </Navbar.Brand>

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
            <span className="profile-name">Dr. Ahmed Hassan (Admin)</span>
            <FontAwesomeIcon icon={faCaretDown} className="profile-caret" />
          </button>
        </div>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
