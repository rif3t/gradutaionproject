import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGauge, 
  faBookOpen, 
  faCalendarCheck, 
  faQrcode, 
  faChartPie, 
  faPlus, 
  faChevronRight, 
  faStopCircle,
  faAddressCard,
  faUsers,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import DataStateView from "../../components/instructor/shared/DataStateView";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import "./InstructorDashboard.css";

function InstructorDashboard() {
  const navigate = useNavigate();
  const {
    dashboardData,
    dashboardState,
    loadDashboard,
    coursesData,
    coursesState,
    loadCourses,
    executeQrAction,
    runCourseAction: onCourseAction,
    actionState,
    clearActionFeedback
  } = useInstructorWorkspace();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
    loadCourses({ limit: 8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find if there is an active session in upcoming sessions
  const activeSession = useMemo(() => {
    return (dashboardData.upcomingSessions || []).find(s => s.status === "live");
  }, [dashboardData.upcomingSessions]);


  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page idb-container">
      <Container fluid>
        <InstructorPageHero
          title={`Welcome back, ${localStorage.getItem("adminName") || "Instructor"}`}
          subtitle="Your central command center for courses, lectures, and real-time attendance."
        />

        {actionState.success && (
          <Alert variant="success" dismissible onClose={clearActionFeedback} className="mt-3">
            {actionState.success}
          </Alert>
        )}

        {actionState.error && (
          <Alert variant="danger" dismissible onClose={clearActionFeedback} className="mt-3">
            {actionState.error}
          </Alert>
        )}

        <div className="idb-layout">
          {/* ─── Main Content Column ────────────────────────── */}
          <div className="idb-main-stack">
            
            {/* 1. Active Session Widget (Conditionally shown) */}

            {/* 2. Courses Overview (Cards) */}
            <div className="idb-section">
              <div className="idb-section-header">
                <h5 className="idb-section-title">
                  <FontAwesomeIcon icon={faBookOpen} /> My Courses
                </h5>
                <Link to="/instructor-courses" className="idb-btn-small px-3">View All</Link>
              </div>
              <div className="idb-section-body">
                <DataStateView
                  loading={coursesState.loading}
                  isEmpty={coursesData.items.length === 0}
                  emptyMessage="No courses assigned yet."
                >
                  <div className="idb-courses-list">
                    {coursesData.items.map(course => (
                      <div className="idb-course-card" key={course.id}>
                        <div className="idb-course-icon">
                          <FontAwesomeIcon icon={faBookOpen} />
                        </div>
                        <h6 className="idb-course-name">{course.name}</h6>
                        <div className="idb-course-meta">
                          <span><FontAwesomeIcon icon={faCalendarCheck} /> {course.level} Level</span>
                          <span><FontAwesomeIcon icon={faUsers} /> {course.studentsCount || 0} Students</span>
                        </div>
                        <div className="idb-course-actions">
                          <button 
                            className="idb-btn-small"
                            onClick={() => navigate("/instructor-courses", { state: { courseId: course.id } })}
                          >
                            Lectures
                          </button>
                          <button 
                            className="idb-btn-small"
                            onClick={() => navigate("/instructor-attendance-records", { state: { courseId: course.id } })}
                          >
                            Records
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DataStateView>
              </div>
            </div>

            {/* 3. Upcoming Lectures List */}
            <div className="idb-section">
              <div className="idb-section-header">
                <h5 className="idb-section-title">
                  <FontAwesomeIcon icon={faCalendarCheck} /> Upcoming Lectures
                </h5>
              </div>
              <div className="idb-section-body p-0">
                <DataStateView
                  loading={dashboardState.loading}
                  isEmpty={dashboardData.upcomingSessions.length === 0}
                  emptyMessage="No upcoming lectures for this week."
                >
                  <div className="idb-lectures-list">
                    {dashboardData.upcomingSessions.map(lec => {
                      const dateObj = new Date(lec.date || Date.now());
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleString('default', { month: 'short' });
                      
                      return (
                        <div className="idb-lecture-item" key={lec.id}>
                          <div className="idb-lec-date">
                            <span className="idb-lec-day">{day}</span>
                            <span className="idb-lec-month">{month}</span>
                          </div>
                          <div className="idb-lec-content">
                            <h6 className="idb-lec-name">{lec.title}</h6>
                            <p className="idb-lec-course">{lec.courseName || "General Course"}</p>
                          </div>
                          <div className="idb-lec-action">
                            <button 
                              className={`idb-btn-small px-3 ${lec.status === 'live' ? 'primary' : ''}`}
                              onClick={() => {
                                if (lec.status === 'live') navigate("/instructor-attendance-records");
                                else navigate("/instructor-courses", { state: { courseId: lec.courseId } });
                              }}
                            >
                              {lec.status === 'live' ? 'View Live' : 'Open Details'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DataStateView>
              </div>
            </div>
          </div>

          {/* ─── Sidebar Column ────────────────────────────── */}
          <div className="idb-side-stack">
            
            {/* 4. Quick Actions Panel */}
            <div className="idb-section">
              <div className="idb-section-header">
                <h5 className="idb-section-title">Quick Actions</h5>
              </div>
              <div className="idb-section-body">
                <div className="idb-quick-grid">
                  <div className="idb-quick-item" onClick={() => navigate("/instructor-courses")}>
                    <div className="idb-quick-icon"><FontAwesomeIcon icon={faPlus} /></div>
                    <span className="idb-quick-label">Add Lecture</span>
                  </div>
                  <div className="idb-quick-item" onClick={() => navigate("/instructor-courses")}>
                    <div className="idb-quick-icon"><FontAwesomeIcon icon={faQrcode} /></div>
                    <span className="idb-quick-label">Start Session</span>
                  </div>
                  <div className="idb-quick-item" onClick={() => navigate("/instructor-attendance-records")}>
                    <div className="idb-quick-icon"><FontAwesomeIcon icon={faAddressCard} /></div>
                    <span className="idb-quick-label">Attendance Records</span>
                  </div>
                  <div className="idb-quick-item" onClick={() => navigate("/instructor-dashboard")}>
                    <div className="idb-quick-icon"><FontAwesomeIcon icon={faChartPie} /></div>
                    <span className="idb-quick-label">Analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Attendance Summary & Chart */}
            <div className="idb-section">
              <div className="idb-section-header">
                <h5 className="idb-section-title">Summary Stats</h5>
              </div>
              <div className="idb-section-body">
                <div className="idb-summary-row">
                  <div className="idb-sum-card">
                    <span className="idb-sum-val">{dashboardData.overview?.studentsCount || 0}</span>
                    <span className="idb-sum-label">Students</span>
                  </div>
                  <div className="idb-sum-card">
                    <span className="idb-sum-val">{dashboardData.overview?.attendanceRate || 0}%</span>
                    <span className="idb-sum-label">Rate</span>
                  </div>
                </div>

                <div className="idb-mini-chart">
                  {(dashboardData.trends || [20, 50, 40, 70, 45, 90, 60]).map((item, i) => {
                    const val = typeof item === 'number' ? item : (item.attendanceRate || 0);
                    return (
                      <div 
                        key={i} 
                        className={`idb-chart-bar ${val > 80 ? 'highlight' : ''}`} 
                        style={{ height: `${val}%` }}
                        title={`${val}% Attendance`}
                      ></div>
                    );
                  })}
                </div>
                <div className="text-center mt-2 small text-muted">
                  Weekly Attendance Trend
                </div>
              </div>
            </div>

            {/* Notifications / Alerts - Minimal */}
            {dashboardData.alerts?.length > 0 && (
              <div className="idb-section">
                 <div className="idb-section-header pb-0 border-0">
                  <h5 className="idb-section-title" style={{fontSize: '0.9rem', color: 'var(--ic-text-muted)'}}>System Alerts</h5>
                </div>
                <div className="idb-section-body pt-2">
                  {dashboardData.alerts.slice(0, 2).map((alert, i) => (
                    <div key={i} className={`alert alert-${alert.severity || 'info'} py-2 px-3 small mb-2 border-0`} style={{borderRadius: '10px'}}>
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </Container>
    </div>
  );
}

export default InstructorDashboard;
