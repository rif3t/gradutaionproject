import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faGraduationCap,
  faFileImport,
  faPlus,
  faArrowLeft,
  faEye,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import "./Students.css";

const academicYears = [
  { key: "first", title: "First Year", count: 120 },
  { key: "second", title: "Second Year", count: 180 },
  { key: "third", title: "Third Year", count: 95 },
  { key: "fourth", title: "Fourth Year", count: 60 },
];

const studentsByYear = {
  first: [
    {
      id: "2024001",
      name: "Alaa Ahmed",
      email: "alaa@fcai.edu.eg",
      gender: "Female",
      status: "Active",
    },
    {
      id: "2024002",
      name: "Omar Khaled",
      email: "omar@fcai.edu.eg",
      gender: "Male",
      status: "Active",
    },
    {
      id: "2024003",
      name: "Noha Samy",
      email: "noha@fcai.edu.eg",
      gender: "Female",
      status: "Inactive",
    },
  ],
  second: [
    {
      id: "2023001",
      name: "Ali Mohamed",
      email: "ali@fcai.edu.eg",
      gender: "Male",
      status: "Active",
    },
    {
      id: "2023002",
      name: "Mona Ahmed",
      email: "mona@fcai.edu.eg",
      gender: "Female",
      status: "Active",
    },
    {
      id: "2023003",
      name: "Youssef Hassan",
      email: "youssef@fcai.edu.eg",
      gender: "Male",
      status: "Inactive",
    },
  ],
  third: [
    {
      id: "2023001",
      name: "Ali Mohamed",
      email: "ali@fcai.edu.eg",
      gender: "Male",
      status: "Active",
    },
    {
      id: "2023002",
      name: "Mona Ahmed",
      email: "mona@fcai.edu.eg",
      gender: "Female",
      status: "Active",
    },
    {
      id: "2023003",
      name: "Youssef Hassan",
      email: "youssef@fcai.edu.eg",
      gender: "Male",
      status: "Inactive",
    },
    {
      id: "2023004",
      name: "Sara Ibrahim",
      email: "sara@fcai.edu.eg",
      gender: "Female",
      status: "Active",
    },
    {
      id: "2023005",
      name: "Mostafa Adel",
      email: "mostafa@fcai.edu.eg",
      gender: "Male",
      status: "Active",
    },
  ],
  fourth: [
    {
      id: "2021001",
      name: "Nada Hany",
      email: "nada@fcai.edu.eg",
      gender: "Female",
      status: "Active",
    },
    {
      id: "2021002",
      name: "Karim Wael",
      email: "karim@fcai.edu.eg",
      gender: "Male",
      status: "Active",
    },
  ],
};

function StudentsPage() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const currentStudents = studentsByYear[selectedYear] || [];
    const term = search.trim().toLowerCase();
    if (!term) return currentStudents;
    return currentStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term),
    );
  }, [selectedYear, search]);

  const selectedYearLabel =
    academicYears.find((year) => year.key === selectedYear)?.title || "";

  return (
    <div className="students-page-wrap">
      {!selectedYear ? (
        <>
          <header className="students-header">
            <h2>Student Management</h2>
            <p>Select an academic year to view and manage students</p>
          </header>

          <section className="years-grid">
            {academicYears.map((year) => (
              <button
                key={year.key}
                type="button"
                className="year-card"
                onClick={() => setSelectedYear(year.key)}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="year-icon" />
                <h3>{year.title}</h3>
                <p>{year.count} students</p>
              </button>
            ))}
          </section>
        </>
      ) : (
        <>
          <header className="students-header students-header-list">
            <div>
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setSelectedYear(null);
                  setSearch("");
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back to years
              </button>
              <h2>Students - {selectedYearLabel}</h2>
            </div>
          </header>

          <div className="students-toolbar">
            <label className="search-shell" htmlFor="students-search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                id="students-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name, ID, or email"
              />
            </label>

            <button type="button" className="btn-secondary">
              <FontAwesomeIcon icon={faFileImport} /> Import Students
            </button>

            <button type="button" className="btn-primary">
              <FontAwesomeIcon icon={faPlus} /> Add Student
            </button>
          </div>

          <section className="students-table-card">
            <h3>Students List</h3>

            <div className="table-scroll">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="student-id">{student.id}</td>
                        <td>
                          <div className="student-name-wrap">
                            <span className="avatar-pill">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="student-email">{student.email}</td>
                        <td>{student.gender}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              student.status === "Active"
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-icons">
                            <button type="button" title="View">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button type="button" title="Edit">
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </button>
                            <button type="button" title="Delete">
                              <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No students match "{search}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default StudentsPage;
