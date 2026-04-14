import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMagnifyingGlass,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import "../Navbar/Navbar.css";

function TopNavbar2() {
  const fullName = localStorage.getItem("adminName") || "Instructor";
  const avatarLetter = fullName.charAt(0).toUpperCase();

  return (
    <Navbar expand="lg" className="top-navbar-shell">
      <Container fluid className="top-navbar-inner">
        <Navbar.Brand className="top-navbar-title">
          FCAI Attendance Instructor
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
