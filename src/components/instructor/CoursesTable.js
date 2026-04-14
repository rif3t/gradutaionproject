import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

function CoursesTable({ courses, activeCourseId, onStartLecture }) {
  return (
    <Card className="instructor-surface" id="my-courses">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">My Courses</h5>
          <p className="section-subtitle">
            Start attendance session per lecture
          </p>
        </div>

        <div className="table-wrap">
          <Table responsive hover className="instructor-table mb-0">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Students</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.code}</td>
                  <td>{course.students}</td>
                  <td className="text-end">
                    <Button
                      className="quickbtn instructor-btn"
                      variant="light"
                      onClick={() => onStartLecture(course)}
                      disabled={activeCourseId === course.id}
                    >
                      <span>
                        <FontAwesomeIcon icon={faPlay} />
                      </span>
                      {activeCourseId === course.id
                        ? "Session Active"
                        : "Start Lecture"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CoursesTable;
