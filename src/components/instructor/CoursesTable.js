import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPen,
  faTrash,
  faCirclePlus,
  faUsers,
  faChalkboard,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

function CoursesTable({
  courses,
  coursesMeta,
  query,
  selectedCourseId,
  students,
  sessions,
  coursesState,
  courseDetailsState,
  actionState,
  onQueryChange,
  onPageChange,
  onSelectCourse,
  onStudentsSearch,
  onSessionFilter,
  onCourseAction,
}) {
  const selectedCourse = (courses || []).find(
    (item) => item.id === selectedCourseId,
  );

  return (
    <div className="stack-section" id="my-courses">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">My Courses</h5>
            <p className="section-subtitle">
              GET /instructor/courses with search, filtering, and pagination
            </p>
          </div>

          <div className="toolbar-grid">
            <Form.Control
              type="search"
              placeholder="Search course by name or code"
              value={query.search}
              onChange={(event) =>
                onQueryChange({ search: event.target.value, page: 1 })
              }
            />

            <Form.Select
              value={query.status}
              onChange={(event) =>
                onQueryChange({ status: event.target.value, page: 1 })
              }
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </Form.Select>

            <Form.Select
              value={query.department}
              onChange={(event) =>
                onQueryChange({ department: event.target.value, page: 1 })
              }
            >
              <option value="">All departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
            </Form.Select>

            <Form.Select
              value={`${query.sortBy}:${query.order}`}
              onChange={(event) => {
                const [sortBy, order] = event.target.value.split(":");
                onQueryChange({ sortBy, order });
              }}
            >
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="studentsCount:desc">Students (High-Low)</option>
              <option value="attendanceRate:desc">Attendance (High-Low)</option>
            </Form.Select>
          </div>

          <DataStateView
            loading={coursesState.loading}
            error={coursesState.error}
            isEmpty={(courses || []).length === 0}
            emptyMessage="No courses match your current filters."
          >
            <>
              <div className="table-wrap mt-3">
                <Table responsive hover className="instructor-table mb-0">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Students</th>
                      <th>Attendance</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(courses || []).map((course) => (
                      <tr
                        key={course.id}
                        className={
                          selectedCourseId === course.id
                            ? "table-row-selected"
                            : ""
                        }
                      >
                        <td>
                          <strong>{course.name}</strong>
                          <p className="mb-0 text-muted small">{course.code}</p>
                        </td>
                        <td>{course.semester || "N/A"}</td>
                        <td>{course.studentsCount || 0}</td>
                        <td>{course.attendanceRate || 0}%</td>
                        <td>
                          <Badge
                            bg={
                              course.status === "Active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {course.status || "Unknown"}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="actions-inline">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => onSelectCourse(course.id)}
                            >
                              Open
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onCourseAction("start", course.id)}
                              disabled={
                                actionState.busy === `course-${course.id}-start`
                              }
                            >
                              <FontAwesomeIcon icon={faPlay} />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onCourseAction("edit", course.id)}
                              disabled={
                                actionState.busy === `course-${course.id}-edit`
                              }
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() =>
                                onCourseAction("delete", course.id)
                              }
                              disabled={
                                actionState.busy ===
                                `course-${course.id}-delete`
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <DataPagination meta={coursesMeta} onPageChange={onPageChange} />
            </>
          </DataStateView>

          {(actionState.error || actionState.success) && (
            <Alert
              className="mt-3 mb-0"
              variant={actionState.error ? "danger" : "success"}
            >
              {actionState.error || actionState.success}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="instructor-surface mt-3">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">Course Details Workspace</h5>
            <p className="section-subtitle">
              Students and sessions are loaded from selected course endpoints
            </p>
          </div>

          <DataStateView
            loading={courseDetailsState.loading}
            error={courseDetailsState.error}
            isEmpty={!selectedCourse || (!students.length && !sessions.length)}
            emptyMessage="Select a course to view students and sessions."
          >
            <>
              <Row className="g-3">
                <Col lg={6}>
                  <div className="details-box">
                    <div className="details-head">
                      <h6>
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Students
                      </h6>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          onCourseAction("add-student", selectedCourseId)
                        }
                      >
                        <FontAwesomeIcon icon={faCirclePlus} className="me-1" />
                        Add Student
                      </Button>
                    </div>

                    <Form.Control
                      type="search"
                      className="mb-2"
                      placeholder="Search students"
                      onChange={(event) => onStudentsSearch(event.target.value)}
                    />

                    <ul className="plain-list mb-0">
                      {students.map((student) => (
                        <li key={student.id}>
                          <span>{student.fullName}</span>
                          <Badge
                            bg={
                              student.status === "Present"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {student.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="details-box">
                    <div className="details-head">
                      <h6>
                        <FontAwesomeIcon icon={faChalkboard} className="me-2" />
                        Sessions
                      </h6>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          onCourseAction("create-session", selectedCourseId)
                        }
                      >
                        <FontAwesomeIcon icon={faCirclePlus} className="me-1" />
                        New Session
                      </Button>
                    </div>

                    <Form.Select
                      className="mb-2"
                      onChange={(event) => onSessionFilter(event.target.value)}
                    >
                      <option value="">All session statuses</option>
                      <option value="live">Live</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </Form.Select>

                    <ul className="plain-list mb-0">
                      {sessions.map((session) => (
                        <li key={session.id}>
                          <div>
                            <span>{session.title}</span>
                            <p className="mb-0 text-muted small">
                              {session.date}
                            </p>
                          </div>
                          <Badge
                            bg={
                              session.status === "live"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            </>
          </DataStateView>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CoursesTable;
