import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChalkboardTeacher,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "./Enrollment.css";

const availableCourses = [
  "Data Structures",
  "Algorithms",
  "Database Systems",
  "Operating Systems",
];

const availableInstructors = [
  "Ahmed Alamer",
  "Sara Mohamed",
  "Mostafa Adel",
  "Nouran Ali",
];

const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const yearlyStudentCounts = {
  "1st Year": 240,
  "2nd Year": 210,
  "3rd Year": 185,
  "4th Year": 160,
};

function EnrollmentPage() {
  const [assignCourse, setAssignCourse] = useState("");
  const [assignInstructor, setAssignInstructor] = useState("");
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollYear, setEnrollYear] = useState("");

  const [currentEnrollments, setCurrentEnrollments] = useState([
    {
      id: 1,
      course: "Data Structures",
      instructor: "Ahmed Alamer",
      students: 210,
      year: "2nd Year",
    },
    {
      id: 2,
      course: "Algorithms",
      instructor: "Sara Mohamed",
      students: 185,
      year: "3rd Year",
    },
  ]);

  const handleAssignInstructor = () => {
    if (!assignCourse || !assignInstructor) return;

    setCurrentEnrollments((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.course === assignCourse,
      );

      if (existingIndex !== -1) {
        const updated = [...previous];
        updated[existingIndex] = {
          ...updated[existingIndex],
          instructor: assignInstructor,
        };
        return updated;
      }

      return [
        ...previous,
        {
          id: Date.now(),
          course: assignCourse,
          instructor: assignInstructor,
          students: "-",
          year: "-",
        },
      ];
    });

    setAssignCourse("");
    setAssignInstructor("");
  };

  const handleEnrollStudents = () => {
    if (!enrollCourse || !enrollYear) return;

    setCurrentEnrollments((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.course === enrollCourse,
      );

      const studentsCount = yearlyStudentCounts[enrollYear] || 0;

      if (existingIndex !== -1) {
        const updated = [...previous];
        updated[existingIndex] = {
          ...updated[existingIndex],
          year: enrollYear,
          students: studentsCount,
        };
        return updated;
      }

      return [
        ...previous,
        {
          id: Date.now(),
          course: enrollCourse,
          instructor: "-",
          students: studentsCount,
          year: enrollYear,
        },
      ];
    });

    setEnrollCourse("");
    setEnrollYear("");
  };

  const handleRemoveEnrollment = (id) => {
    setCurrentEnrollments((previous) =>
      previous.filter((item) => item.id !== id),
    );
  };

  return (
    <div className="enrollment-page-wrap">
      <header className="enrollment-page-head">
        <h2 className="enrollment-page-title">Enrollment Management</h2>
        <p className="enrollment-page-subtitle">
          Assign instructors and enroll students with fewer steps.
        </p>
      </header>

      <div className="enrollment-forms-grid">
        <section className="enrollment-card">
          <div className="enrollment-card-head">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
            <h3>Assign Instructor to Course</h3>
          </div>

          <div className="enrollment-field-group">
            <label className="enrollment-field-label" htmlFor="assign-course">
              Select Course
            </label>
            <select
              id="assign-course"
              value={assignCourse}
              onChange={(event) => setAssignCourse(event.target.value)}
            >
              <option value="">Choose a course</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="enrollment-field-group">
            <label
              className="enrollment-field-label"
              htmlFor="assign-instructor"
            >
              Select Instructor
            </label>
            <select
              id="assign-instructor"
              value={assignInstructor}
              onChange={(event) => setAssignInstructor(event.target.value)}
            >
              <option value="">Choose an instructor</option>
              {availableInstructors.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="enrollment-primary-btn"
            onClick={handleAssignInstructor}
            disabled={!assignCourse || !assignInstructor}
          >
            <FontAwesomeIcon icon={faCheck} /> Assign
          </button>
        </section>

        <section className="enrollment-card">
          <div className="enrollment-card-head">
            <FontAwesomeIcon icon={faUsers} />
            <h3>Enroll Students in Course</h3>
          </div>

          <div className="enrollment-field-group">
            <label className="enrollment-field-label" htmlFor="enroll-course">
              Select Course
            </label>
            <select
              id="enroll-course"
              value={enrollCourse}
              onChange={(event) => setEnrollCourse(event.target.value)}
            >
              <option value="">Choose a course</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="enrollment-field-group">
            <label className="enrollment-field-label" htmlFor="enroll-year">
              Select Year
            </label>
            <select
              id="enroll-year"
              value={enrollYear}
              onChange={(event) => setEnrollYear(event.target.value)}
            >
              <option value="">Choose a year</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="enrollment-primary-btn"
            onClick={handleEnrollStudents}
            disabled={!enrollCourse || !enrollYear}
          >
            <FontAwesomeIcon icon={faCheck} /> Enroll All Students
          </button>
        </section>
      </div>

      <section className="enrollment-table-card">
        <h3>Current Enrollments</h3>

        <div className="enrollment-table-scroll">
          <table className="enrollment-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Enrolled Students</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEnrollments.length > 0 ? (
                currentEnrollments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.course}</td>
                    <td>{item.instructor}</td>
                    <td>{item.students}</td>
                    <td>{item.year}</td>
                    <td>
                      <button
                        type="button"
                        className="enrollment-remove-btn"
                        onClick={() => handleRemoveEnrollment(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="enrollment-empty-row">
                    No enrollments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default EnrollmentPage;
