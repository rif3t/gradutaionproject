import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import ProgressBar from "react-bootstrap/ProgressBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPen,
  faTrash,
  faRotateRight,
  faEye,
  faClock,
  faQrcode,
  faTowerBroadcast,
  faCircleCheck,
  faUsers,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

const buildQrUrl = (payload) => {
  const value = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${value}`;
};

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
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [qrRefreshSeconds, setQrRefreshSeconds] = useState(15);
  const [qrSeed, setQrSeed] = useState(Date.now());

  const selectedCourse = (courses || []).find(
    (item) => item.id === selectedCourseId,
  );

  const lectureSessions = useMemo(
    () =>
      (sessions || []).filter((item) =>
        ["live", "scheduled", "completed"].includes(item.status),
      ),
    [sessions],
  );

  const selectedSession = useMemo(
    () =>
      lectureSessions.find((item) => item.id === selectedSessionId) ||
      lectureSessions[0] ||
      null,
    [lectureSessions, selectedSessionId],
  );

  const liveAttendance = useMemo(
    () =>
      (students || [])
        .filter((student) => ["Present", "Late"].includes(student.status))
        .map((student, index) => ({
          id: `${student.id}-${index}`,
          studentName: student.fullName,
          at: new Date(Date.now() - index * 60 * 1000).toLocaleTimeString(),
          status: student.status,
        }))
        .slice(0, 8),
    [students],
  );

  const qrPayload = `${
    selectedSession?.id || selectedCourseId || "SESSION"
  }-${qrSeed}`;
  const qrImageUrl = buildQrUrl(qrPayload);

  useEffect(() => {
    if (!selectedSessionId && lectureSessions[0]) {
      setSelectedSessionId(lectureSessions[0].id);
    }
  }, [lectureSessions, selectedSessionId]);

  useEffect(() => {
    if (!selectedSession || selectedSession.status !== "live") {
      return undefined;
    }

    const timer = setInterval(() => {
      setQrSeed(Date.now());
    }, Math.max(5, Number(qrRefreshSeconds) || 15) * 1000);

    return () => clearInterval(timer);
  }, [qrRefreshSeconds, selectedSession]);

  const handleStartSession = () => {
    onCourseAction("create-session", selectedCourseId, {
      lectureId: selectedSession?.id,
      durationInMinutes: sessionDuration,
    });
  };

  const handleReopenSession = () => {
    onCourseAction("reopen-session", selectedCourseId, {
      lectureId: selectedSession?.id,
      durationInMinutes: sessionDuration,
    });
  };

  return (
    <div className="stack-section" id="my-courses">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">My Courses</h5>
            <p className="section-subtitle">
              Step 1: Select the course you are teaching across different
              levels.
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
                              onClick={() =>
                                onCourseAction("quick-start", course.id, {
                                  durationInMinutes: sessionDuration,
                                })
                              }
                              disabled={
                                actionState.busy ===
                                `course-${course.id}-quick-start`
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
            <h5 className="section-title">Instructor Session Flow</h5>
            <p className="section-subtitle">
              Step 2 and Step 3: Open lectures, start/reopen a session, then
              track QR attendance live.
            </p>
          </div>

          <div className="flow-rail mb-3">
            <div className={`flow-step ${selectedCourse ? "done" : "active"}`}>
              <span>1</span>
              Choose Course
            </div>
            <div
              className={`flow-step ${
                selectedCourse && lectureSessions.length > 0 ? "active" : ""
              }`}
            >
              <span>2</span>
              Open Lecture
            </div>
            <div className={`flow-step ${selectedSession ? "active" : ""}`}>
              <span>3</span>
              Session + QR + Attendance
            </div>
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
                        <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                        Lectures In This Course
                      </h6>
                    </div>

                    <Form.Select
                      className="mb-2"
                      onChange={(event) => onSessionFilter(event.target.value)}
                    >
                      <option value="">All lecture statuses</option>
                      <option value="live">Live</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </Form.Select>

                    <ul className="plain-list mb-0">
                      {lectureSessions.map((session) => (
                        <li
                          key={session.id}
                          className={
                            selectedSession?.id === session.id
                              ? "plain-list-selected"
                              : ""
                          }
                        >
                          <div>
                            <span>{session.title}</span>
                            <p className="mb-0 text-muted small">
                              {session.date} {session.startTime || ""}
                            </p>
                          </div>
                          <div className="actions-inline">
                            <Badge
                              bg={
                                session.status === "live"
                                  ? "success"
                                  : session.status === "completed"
                                  ? "secondary"
                                  : "warning"
                              }
                            >
                              {session.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => setSelectedSessionId(session.id)}
                            >
                              <FontAwesomeIcon icon={faEye} className="me-1" />
                              View
                            </Button>
                            {session.status === "completed" && (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() =>
                                  onCourseAction(
                                    "reopen-session",
                                    selectedCourseId,
                                    {
                                      lectureId: session.id,
                                      durationInMinutes: sessionDuration,
                                    },
                                  )
                                }
                                disabled={
                                  actionState.busy ===
                                  `course-${selectedCourseId}-reopen-session`
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faRotateRight}
                                  className="me-1"
                                />
                                Reopen
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {!lectureSessions.length && (
                      <Alert variant="info" className="mt-3 mb-0">
                        No lecture sessions yet. Start your first session now.
                      </Alert>
                    )}
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="details-box">
                    <div className="details-head">
                      <h6>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        Session Setup
                      </h6>
                    </div>

                    <Row className="g-2 mb-2">
                      <Col md={6}>
                        <Form.Label className="small text-muted mb-1">
                          Session Duration (minutes)
                        </Form.Label>
                        <Form.Select
                          value={sessionDuration}
                          onChange={(event) =>
                            setSessionDuration(Number(event.target.value))
                          }
                        >
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                          <option value={120}>120 min</option>
                        </Form.Select>
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small text-muted mb-1">
                          QR Refresh Every
                        </Form.Label>
                        <Form.Select
                          value={qrRefreshSeconds}
                          onChange={(event) =>
                            setQrRefreshSeconds(Number(event.target.value))
                          }
                        >
                          <option value={10}>10 sec</option>
                          <option value={15}>15 sec</option>
                          <option value={30}>30 sec</option>
                          <option value={60}>60 sec</option>
                        </Form.Select>
                      </Col>
                    </Row>

                    <div className="actions-inline mb-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleStartSession}
                        disabled={
                          !selectedCourseId ||
                          actionState.busy ===
                            `course-${selectedCourseId}-create-session`
                        }
                      >
                        <FontAwesomeIcon icon={faPlay} className="me-1" />
                        Start New Session
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={handleReopenSession}
                        disabled={
                          !selectedCourseId ||
                          actionState.busy ===
                            `course-${selectedCourseId}-start`
                        }
                      >
                        <FontAwesomeIcon
                          icon={faRotateRight}
                          className="me-1"
                        />
                        Reopen Last Closed
                      </Button>
                    </div>

                    <div className="student-search-box mb-3">
                      <h6 className="mb-2">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Quick Students Search
                      </h6>
                      <Form.Control
                        type="search"
                        className="mb-2"
                        placeholder="Search students"
                        onChange={(event) =>
                          onStudentsSearch(event.target.value)
                        }
                      />
                      <ul className="plain-list mb-0">
                        {students.slice(0, 5).map((student) => (
                          <li key={student.id}>
                            <span>{student.fullName}</span>
                            <Badge
                              bg={
                                student.status === "Present"
                                  ? "success"
                                  : student.status === "Late"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {student.status}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="session-health">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Expected session duration</span>
                        <strong>{sessionDuration} min</strong>
                      </div>
                      <ProgressBar
                        now={Math.min(100, (liveAttendance.length / 30) * 100)}
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col lg={5}>
                  <div className="details-box">
                    <div className="section-head mb-2">
                      <h6 className="mb-0">
                        <FontAwesomeIcon icon={faQrcode} className="me-2" />
                        Live QR Code
                      </h6>
                      <p className="section-subtitle mb-0">
                        QR updates every {qrRefreshSeconds} seconds while
                        session is live.
                      </p>
                    </div>

                    <div className="qr-shell">
                      <div className="qr-box refreshing">
                        <img
                          src={qrImageUrl}
                          alt="Lecture attendance QR"
                          className="qr-image"
                        />
                      </div>
                      <div className="qr-meta">
                        <Badge bg="light" text="dark" className="qr-badge">
                          Session: {selectedSession?.id || "N/A"}
                        </Badge>
                        <p className="qr-note mb-0">
                          {selectedSession?.status === "live"
                            ? "Attendance is live now."
                            : "Start or reopen a session to activate QR scanning."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col lg={7}>
                  <div className="details-box">
                    <div className="details-head">
                      <h6>
                        <FontAwesomeIcon
                          icon={faTowerBroadcast}
                          className="me-2"
                        />
                        Live Attendance Feed
                      </h6>
                      <Badge bg="success">
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="me-1"
                        />
                        Auto Refresh
                      </Badge>
                    </div>

                    <p className="small text-muted mb-2">
                      For now the UI uses polling every 5 seconds. You can
                      switch to server push later without changing this layout.
                    </p>

                    <div className="table-wrap">
                      <Table responsive className="instructor-table mb-0">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Scan Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveAttendance.length === 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="text-center text-muted py-3"
                              >
                                No scans yet.
                              </td>
                            </tr>
                          )}
                          {liveAttendance.map((scan) => (
                            <tr key={scan.id}>
                              <td>{scan.studentName}</td>
                              <td>{scan.at}</td>
                              <td>
                                <Badge
                                  bg={
                                    scan.status === "Present"
                                      ? "success"
                                      : "warning"
                                  }
                                >
                                  {scan.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
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
