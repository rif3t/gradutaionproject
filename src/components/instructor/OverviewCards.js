import Card from "react-bootstrap/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faUserGraduate,
  faChalkboard,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

function OverviewCards({ overview }) {
  const safeOverview = {
    coursesCount: overview?.coursesCount || 0,
    studentsCount: overview?.studentsCount || 0,
    lecturesCount: overview?.lecturesCount || 0,
    attendanceRate: overview?.attendanceRate || 0,
  };

  const cards = [
    {
      title: "Current Courses",
      value: safeOverview.coursesCount,
      subtitle: "GET /instructor/dashboard",
      icon: faBookOpen,
      tone: "blue",
    },
    {
      title: "Total Students",
      value: safeOverview.studentsCount,
      subtitle: "GET /instructor/dashboard/stats",
      icon: faUserGraduate,
      tone: "green",
    },
    {
      title: "Total Lectures",
      value: safeOverview.lecturesCount,
      subtitle: "GET /instructor/dashboard/summary",
      icon: faChalkboard,
      tone: "orange",
    },
    {
      title: "Attendance Rate",
      value: `${safeOverview.attendanceRate}%`,
      subtitle: "GET /instructor/dashboard/attendance-overview",
      icon: faChartSimple,
      tone: "navy",
    },
  ];

  return (
    <section className="stats-grid">
      {cards.map((item) => (
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
            <p className="stat-delta">{item.subtitle}</p>
          </Card.Body>
        </Card>
      ))}
    </section>
  );
}

export default OverviewCards;
