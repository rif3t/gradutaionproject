import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faEye,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import "./Courses.css";

const courses = [
  {
    code: "CS201",
    name: "Data Structures",
    semester: "Fall 2024",
    year: "2nd Year",
    instructor: "Ahmed Alamer",
    students: 120,
  },
  {
    code: "CS301",
    name: "Algorithms",
    semester: "Fall 2024",
    year: "3rd Year",
    instructor: "Sara Mohamed",
    students: 95,
  },
  {
    code: "CS401",
    name: "Advanced Databases",
    semester: "Spring 2025",
    year: "4th Year",
    instructor: "Mostafa Adel",
    students: 60,
  },
];

function CoursesPage() {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter(
      (course) =>
        course.code.toLowerCase().includes(term) ||
        course.name.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <div className="courses-page-wrap">
      <header className="courses-header">
        <h2>Course Management</h2>
      </header>

      <div className="courses-toolbar">
        <label className="courses-search-shell" htmlFor="course-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            id="course-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code or name"
          />
        </label>

        <button type="button" className="courses-add-btn">
          <FontAwesomeIcon icon={faPlus} /> Add Course
        </button>
      </div>

      <section className="courses-table-card">
        <h3>Courses List</h3>

        <div className="courses-table-scroll">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Semester</th>
                <th>Year</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.code}>
                    <td className="course-code">{course.code}</td>
                    <td className="course-name">{course.name}</td>
                    <td>
                      <span className="course-semester-pill">
                        {course.semester}
                      </span>
                    </td>
                    <td>{course.year}</td>
                    <td>{course.instructor}</td>
                    <td className="course-students">{course.students}</td>
                    <td>
                      <div className="course-action-icons">
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
                  <td className="courses-empty-state" colSpan="7">
                    No courses match "{search}".
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

export default CoursesPage;
