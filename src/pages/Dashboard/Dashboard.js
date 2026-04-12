import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import "./Dashboard.css";
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardUser,
  faClock,
  faLocationDot,
  faFileAlt,
  faUserPlus,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
  const features = [
    { icon: faUserGraduate, title: "Student Management", desc: "Create student profiles & manage accounts", color: "#4CAF50" },
    { icon: faUserPlus, title: "Add to Levels", desc: "Organize students by academic levels", color: "#2196F3" },
    { icon: faChalkboardUser, title: "Doctor Management", desc: "Add and manage instructors", color: "#FF9800" },
    { icon: faClock, title: "QR Control", desc: "Set refresh interval & expiry time", color: "#9C27B0" },
    { icon: faLocationDot, title: "Location Verification", desc: "Enable/Disable GPS & set radius", color: "#F44336" },
    { icon: faFileAlt, title: "Reports", desc: "Generate course & attendance reports", color: "#607D8B" },
  ];

  return (
    <div className="dashcontent">
      <h3 className="dashtext">Dashboard Overview</h3>
      
      {/* Cards Row */}
      <Container>
        <Row>
          <Col lg={4} md={6} sm={12} className="dashcol">
            <Card className="dashcard">
              <Card.Body>
                <Card.Title>👨‍🏫 Total Instructors</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} sm={12} className="dashcol">
            <Card className="dashcard">
              <Card.Body>
                <Card.Title>👥 Total Students</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={12} sm={12} className="dashcol">
            <Card className="dashcard dashcard3">
              <Card.Body>
                <Card.Title>📚 Total Subjects</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Container className="dashdigram">
        <Row>
          <Col lg={11} md={12} sm={12}>
            <Card className="quickuse">
              <Card.Body>
                <Card.Title className="actiontitle">⚡ Quick Admin Actions</Card.Title>
                <Button className="quickbtn" variant="outline-success">➕ Create New Course</Button>
                <Button className="quickbtn" variant="outline-success">👥 Bulk Student Enrollment</Button>
                <Button className="quickbtn" variant="outline-success">📈 Generate Department Report</Button>
                <Link to="/Setting">
                  <Button className="quickbtn" variant="outline-success">⚙️ Manage Admin Users</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* New Row - Website Guide Card */}
        <Row className="mt-4">
          <Col lg={12}>
            <Card className="guide-card">
              <Card.Body>
                <Card.Title className="guide-main-title">
                  ✨ What You Can Do In This Website
                </Card.Title>
                <Card.Text className="guide-main-subtitle">
                  Complete control over your attendance management system
                </Card.Text>

                <Row>
                  {features.map((feature, index) => (
                    <Col lg={4} md={6} sm={12} key={index}>
                      <div className="guide-feature-item">
                        <div 
                          className="guide-feature-icon" 
                          style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                        >
                          <FontAwesomeIcon icon={feature.icon} size="lg" />
                        </div>
                        <div className="guide-feature-content">
                          <h6 className="guide-feature-title">{feature.title}</h6>
                          <p className="guide-feature-desc">{feature.desc}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                <hr className="guide-divider" />
                
                <div className="guide-footer">
                  <p className="guide-footer-text">
                    <FontAwesomeIcon icon={faCheckCircle} className="guide-footer-icon" />
                    Full control over QR timing, location verification, and attendance reports
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;