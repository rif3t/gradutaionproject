import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardUser,
  faBookOpen,
  faCircleCheck,
  faClockRotateLeft,
  faBroadcastTower,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";

const statCards = [
  {
    title: "Total Students",
    value: "2,845",
    note: "+5.2% vs last month",
    icon: faUserGraduate,
  },
  {
    title: "Total Instructors",
    value: "128",
    note: "+3 new this week",
    icon: faChalkboardUser,
  },
  {
    title: "Total Courses",
    value: "74",
    note: "12 courses running now",
    icon: faBookOpen,
  },
  {
    title: "Overall Attendance Rate",
    value: "86%",
    note: "Strong performance this term",
    icon: faCircleCheck,
  },
];

const attendanceByCourse = [
  { course: "AI Fundamentals", rate: 91 },
  { course: "Data Structures", rate: 83 },
  { course: "Database Systems", rate: 76 },
  { course: "Operating Systems", rate: 68 },
  { course: "Computer Networks", rate: 59 },
];

const recentActivity = [
  {
    title: "Attendance session opened",
    desc: "AI Fundamentals - Section A",
    time: "2 min ago",
  },
  {
    title: "New student registered",
    desc: "Mariam Tarek added to Data Structures",
    time: "10 min ago",
  },
  {
    title: "New course created",
    desc: "Machine Learning Lab was added",
    time: "35 min ago",
  },
  {
    title: "Instructor assigned",
    desc: "Dr. Salma Hassan assigned to Networks",
    time: "1 hr ago",
  },
];

const activeSessions = [
  {
    course: "AI Fundamentals",
    room: "Lab 3",
    period: "09:00 - 10:30",
    status: "Open",
  },
  {
    course: "Database Systems",
    room: "Hall B2",
    period: "10:45 - 12:15",
    status: "Open",
  },
  {
    course: "Computer Networks",
    room: "Hall A1",
    period: "12:30 - 02:00",
    status: "Closed",
  },
];

const quickActions = [
  {
    key: "open-session",
    title: "Open Attendance Session",
    flow:
      "Select course and section, choose time window, then click Open Session to generate attendance code.",
  },
  {
    key: "add-student",
    title: "Register New Student",
    flow:
      "Enter student profile data, assign academic year and courses, then save to activate attendance access.",
  },
  {
    key: "add-course",
    title: "Create Course",
    flow:
      "Create course code and title, assign instructor and schedule, then publish to appear in dashboards.",
  },
  {
    key: "assign-instructor",
    title: "Assign Instructor",
    flow:
      "Choose a course, select instructor from list, confirm workload, then apply assignment instantly.",
  },
  {
    key: "review-alerts",
    title: "Review Attendance Alerts",
    flow:
      "Open alerts center, filter by low attendance threshold, then notify students or advisors directly.",
  },
  {
    key: "export-report",
    title: "Export Weekly Report",
    flow:
      "Pick date range and faculty filters, preview the summary, then export PDF/Excel for administration.",
  },
];

function Dashboard() {
  const [selectedActionKey, setSelectedActionKey] = useState(
    quickActions[0].key,
  );

  const selectedAction = useMemo(
    () =>
      quickActions.find((action) => action.key === selectedActionKey) ||
      quickActions[0],
    [selectedActionKey],
  );

  const getAttendanceLevel = (rate) => {
    if (rate > 80) return "good";
    if (rate >= 65) return "warn";
    return "critical";
  };

  return (
    <div className="dashcontent admin-dashboard">
      <header className="dash-hero">
        <div>
          <p className="dash-kicker">Admin Dashboard</p>
          <h2 className="dashtext">Attendance Control Center</h2>
          <p className="dash-subtext">
            Real-time visibility into attendance performance, active sessions,
            and daily academic operations.
          </p>
        </div>
      </header>

      <section className="stats-grid">
        {statCards.map((card) => (
          <article key={card.title} className="stat-card">
            <div className="stat-top">
              <span className="stat-title">{card.title}</span>
              <span className="stat-icon-wrap">
                <FontAwesomeIcon icon={card.icon} className="stat-icon" />
              </span>
            </div>
            <p className="stat-value">{card.value}</p>
            <p className="stat-note">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <h3>Attendance by Course</h3>
            <p>
              Color logic: Green above 80%, Yellow mid-range, Red below 65%.
            </p>
          </div>
          <div className="course-bars">
            {attendanceByCourse.map((item) => {
              const level = getAttendanceLevel(item.rate);
              return (
                <div key={item.course} className="course-row">
                  <div className="course-meta">
                    <span>{item.course}</span>
                    <strong>{item.rate}%</strong>
                  </div>
                  <div className="course-track">
                    <div
                      className={`course-fill ${level}`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-head">
            <h3>
              <FontAwesomeIcon icon={faClockRotateLeft} /> Recent Activity
            </h3>
            <p>Latest updates across attendance and course operations.</p>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div
                key={`${activity.title}-${activity.time}`}
                className="activity-item"
              >
                <div className="activity-dot" />
                <div>
                  <h4>{activity.title}</h4>
                  <p>{activity.desc}</p>
                </div>
                <span>{activity.time}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel sessions-panel">
          <div className="panel-head">
            <h3>
              <FontAwesomeIcon icon={faBroadcastTower} /> Active Sessions
            </h3>
            <p>Current lecture sessions and real-time status.</p>
          </div>
          <div className="sessions-table">
            {activeSessions.map((session) => (
              <div
                key={`${session.course}-${session.period}`}
                className="session-row"
              >
                <div>
                  <h4>{session.course}</h4>
                  <p>{session.room}</p>
                </div>
                <span className="session-period">{session.period}</span>
                <span
                  className={`session-status ${
                    session.status === "Open" ? "open" : "closed"
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel actions-panel">
          <div className="panel-head">
            <h3>Quick Actions</h3>
            <p>6 shortcuts to key admin flows.</p>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.key}
                type="button"
                className={`quick-action-btn ${
                  selectedActionKey === action.key ? "active" : ""
                }`}
                onClick={() => setSelectedActionKey(action.key)}
              >
                {action.title}
              </button>
            ))}
          </div>

          <div className="flow-explainer">
            <h4>{selectedAction.title}</h4>
            <p>{selectedAction.flow}</p>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
