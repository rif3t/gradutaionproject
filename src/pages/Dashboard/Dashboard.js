// Dashboard.jsx
import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import "./Dashboard.css";
import Button from "react-bootstrap/Button";
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
  faBookOpen,
  faArrowRight,
  faWandMagicSparkles,
  faBolt,
  faShieldHalved,
  faQrcode,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { adminService } from "../../services/dashboard";

function Dashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total Instructors",
      value: "—",
      delta: "Loading...",
      icon: faChalkboardUser,
      tone: "blue",
    },
    {
      title: "Total Students",
      value: "—",
      delta: "Loading...",
      icon: faUserGraduate,
      tone: "green",
    },
    {
      title: "Active Courses",
      value: "—",
      delta: "Loading...",
      icon: faBookOpen,
      tone: "orange",
    },
    {
      title: "QR Sessions Today",
      value: "—",
      delta: "Loading...",
      icon: faQrcode,
      tone: "navy",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const features = [
    {
      icon: faUserGraduate,
      title: "Student Management",
      desc: "Create student profiles and keep enrollment structured.",
      color: "#35a17f",
    },
    {
      icon: faUserPlus,
      title: "Level Assignment",
      desc: "Move students between academic levels in seconds.",
      color: "#3d7bc9",
    },
    {
      icon: faChalkboardUser,
      title: "Instructor Control",
      desc: "Manage instructors, profile data, and activity status.",
      color: "#d18642",
    },
    {
      icon: faClock,
      title: "QR Timing",
      desc: "Fine tune token refresh intervals and expiry windows.",
      color: "#8762d6",
    },
  ];

  const quickActions = [
    {
      icon: faBolt,
      title: "Create New Course",
      to: "/courses",
    },
    {
      icon: faWandMagicSparkles,
      title: "Bulk Student Enrollment",
      to: "/enrollment",
    },
    {
      icon: faShieldHalved,
      title: "Generate Department Report",
      to: "/reports",
    },
    {
      icon: faGear,
      title: "Manage Admin Settings",
      to: "/Setting",
    },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getDashboardStats();
      console.log("Full response:", response);

      // التعامل مع هيكل الـ response (حسب ما يرجعه الـ API بتاعك)
      let data = response;
      
      // لو الـ response جوا data property
      if (response.data && typeof response.data === "object") {
        data = response.data;
      }
      
      // لو الـ response جوا success و data
      if (response.success && response.data) {
        data = response.data;
      }

      console.log("Extracted data:", data);

      // تحديث الـ stats بناءً على الـ API response
      const updatedStats = [
        {
          title: "Total Instructors",
          value: data.totalInstructors?.toString() || data.instructorsCount?.toString() || "0",
          icon: faChalkboardUser,
          tone: "blue",
        },
        {
          title: "Total Students",
          value: data.totalStudents?.toString() || data.studentsCount?.toString() || "0",
          icon: faUserGraduate,
          tone: "green",
        },
        {
          title: "Active Courses",
          value: data.activeCourses?.toString() || data.coursesCount?.toString() || "0",
          icon: faBookOpen,
          tone: "orange",
        },
        {
          title: "QR Sessions Today",
          value: data.qrSessionsToday?.toString() || data.todayQRSessions?.toString() || "0",
          icon: faQrcode,
          tone: "navy",
        },
      ];

      setStats(updatedStats);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to load dashboard statistics. Please refresh the page.");
      
      // في حالة الخطأ، نستخدم بيانات تجريبية للـ development
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback mock data");
        const mockStats = [
          {
            title: "Total Instructors",
            value: "42",
            delta: "+8% this month",
            icon: faChalkboardUser,
            tone: "blue",
          },
          {
            title: "Total Students",
            value: "1,284",
            delta: "+12% this month",
            icon: faUserGraduate,
            tone: "green",
          },
          {
            title: "Active Courses",
            value: "36",
            delta: "Across 4 levels",
            icon: faBookOpen,
            tone: "orange",
          },
          {
            title: "QR Sessions Today",
            value: "118",
            delta: "94% validated",
            icon: faQrcode,
            tone: "navy",
          },
        ];
        setStats(mockStats);
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry function
  const handleRetry = () => {
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <div className="dashcontent admin-dashboard">
        <Container fluid>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashcontent admin-dashboard">
      <Container fluid>
        {error && (
          <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
            <strong>⚠️ Warning:</strong> {error}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
              onClick={() => setError(null)}
            ></button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary ms-3"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        )}

        <section className="dash-hero">
          <div>
            <p className="dash-kicker">Attendance Control Center</p>
            <h3 className="dashtext">Dashboard Overview</h3>
            <p className="dash-subtext">
              Manage instructors, students, courses, QR attendance, and reports
              from one unified command panel.
            </p>
          </div>
          <div className="dash-hero-pulse" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item) => (
            <Card
              key={item.title}
              className={`dashcard stat-card stat-${item.tone}`}
            >
              <Card.Body>
                <div className="stat-top">
                  <span className="stat-title">{item.title}</span>
                  <span className="stat-icon-wrap">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                </div>
                <h4 className="stat-value">{item.value}</h4>
                <p className="stat-delta">{item.delta}</p>
              </Card.Body>
            </Card>
          ))}
        </section>

        <Row className="dash-main-row g-3 g-xl-4">
          <Col xl={4} lg={5}>
            <Card className="quickuse">
              <Card.Body>
                <Card.Title className="actiontitle">
                  Quick Admin Actions
                </Card.Title>
                <div className="quick-actions-list">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.to}
                      className="quick-link-btn"
                    >
                      <Button className="quickbtn" variant="light">
                        <span>
                          <FontAwesomeIcon icon={action.icon} />
                        </span>
                        {action.title}
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="quick-arrow"
                        />
                      </Button>
                    </Link>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={8} lg={7}>
            <Card className="guide-card">
              <Card.Body>
                <Card.Title className="guide-main-title">
                  Platform Capabilities
                </Card.Title>
                <Card.Text className="guide-main-subtitle">
                  Tools designed to keep attendance accurate, secure, and easy
                  to supervise.
                </Card.Text>

                <Row>
                  {features.map((feature) => (
                    <Col lg={6} md={6} sm={12} key={feature.title}>
                      <div className="guide-feature-item">
                        <div
                          className="guide-feature-icon"
                          style={{
                            backgroundColor: `${feature.color}20`,
                            color: feature.color,
                          }}
                        >
                          <FontAwesomeIcon icon={feature.icon} size="lg" />
                        </div>
                        <div className="guide-feature-content">
                          <h6 className="guide-feature-title">
                            {feature.title}
                          </h6>
                          <p className="guide-feature-desc">{feature.desc}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                <hr className="guide-divider" />

                <div className="guide-footer">
                  <p className="guide-footer-text">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="guide-footer-icon"
                    />
                    Full control over QR timing and department-level analytics.
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