import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faCalendarDays,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import "./Reports.css";

const reportCards = [
  {
    id: "summary",
    title: "Attendance Summary",
    description: "View overall attendance rates by course",
    icon: faChartColumn,
  },
  {
    id: "weekly",
    title: "Weekly Report",
    description: "Attendance breakdown for the past week",
    icon: faCalendarDays,
  },
  {
    id: "student",
    title: "Student Report",
    description: "Individual student attendance records",
    icon: faGraduationCap,
  },
];

const reportRows = {
  summary: [
    { course: "Data Structures", lectures: 20, avg: "90%", rate: 90 },
    { course: "Algorithms", lectures: 18, avg: "80%", rate: 80 },
    { course: "Operating Systems", lectures: 16, avg: "72%", rate: 72 },
    { course: "Database Systems", lectures: 22, avg: "88%", rate: 88 },
  ],
  weekly: [
    { course: "Data Structures", lectures: 4, avg: "92%", rate: 92 },
    { course: "Algorithms", lectures: 4, avg: "81%", rate: 81 },
    { course: "Operating Systems", lectures: 3, avg: "74%", rate: 74 },
    { course: "Database Systems", lectures: 5, avg: "86%", rate: 86 },
  ],
  student: [
    { course: "Ahmed Hassan", lectures: 40, avg: "95%", rate: 95 },
    { course: "Mariam Ali", lectures: 39, avg: "89%", rate: 89 },
    { course: "Youssef Adel", lectures: 37, avg: "78%", rate: 78 },
    { course: "Nour Mohamed", lectures: 38, avg: "84%", rate: 84 },
  ],
};

function progressClass(rate) {
  if (rate >= 85) return "reports-rate-good";
  if (rate >= 75) return "reports-rate-mid";
  return "reports-rate-low";
}

function ReportsPage() {
  const [activeCard, setActiveCard] = useState("summary");

  const activeMeta = reportCards.find((card) => card.id === activeCard);

  const rows = useMemo(() => reportRows[activeCard] || [], [activeCard]);

  return (
    <div className="reports-page-wrap">
      <header className="reports-head">
        <h2>Reports</h2>
      </header>

      <section className="reports-card-grid">
        {reportCards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`reports-card${
              activeCard === card.id ? " reports-card-active" : ""
            }`}
            onClick={() => setActiveCard(card.id)}
          >
            <span className="reports-card-icon">
              <FontAwesomeIcon icon={card.icon} />
            </span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </button>
        ))}
      </section>

      <section className="reports-table-shell">
        <div className="reports-table-title">
          <h3>
            {activeCard === "summary"
              ? "Course Attendance Overview"
              : activeCard === "weekly"
              ? "Weekly Attendance Overview"
              : "Student Attendance Overview"}
          </h3>
          <p>{activeMeta?.description || "Attendance reporting details"}</p>
        </div>

        <div className="reports-table-scroll">
          <table className="reports-table">
            <thead>
              <tr>
                <th>{activeCard === "student" ? "Student" : "Course"}</th>
                <th>Total Lectures</th>
                <th>Avg. Attendance</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.course}-${row.lectures}`}>
                  <td>{row.course}</td>
                  <td>{row.lectures}</td>
                  <td>{row.avg}</td>
                  <td>
                    <div className="reports-rate-cell">
                      <div className="reports-rate-track">
                        <div
                          className={`reports-rate-fill ${progressClass(
                            row.rate,
                          )}`}
                          style={{ width: `${row.rate}%` }}
                        />
                      </div>
                      <span>{row.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;
