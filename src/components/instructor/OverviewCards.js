import Card from "react-bootstrap/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faUserGraduate,
  faChalkboard,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

function OverviewCards({ overview }) {
  const cards = [
    {
      title: "Current Courses",
      value: overview.coursesCount,
      subtitle: "Assigned this semester",
      icon: faBookOpen,
      tone: "blue",
    },
    {
      title: "Total Students",
      value: overview.studentsCount,
      subtitle: "Across all your courses",
      icon: faUserGraduate,
      tone: "green",
    },
    {
      title: "Total Lectures",
      value: overview.lecturesCount,
      subtitle: "Completed this term",
      icon: faChalkboard,
      tone: "orange",
    },
    {
      title: "Attendance Rate",
      value: `${overview.attendanceRate}%`,
      subtitle: "Overall attendance performance",
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
