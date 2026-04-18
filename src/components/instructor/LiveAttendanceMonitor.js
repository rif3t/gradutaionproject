import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlay,
  faDoorOpen,
  faDoorClosed,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";

function LiveAttendanceMonitor({
  liveOverview,
  sessions,
  activeSessionId,
  details,
  state,
  actionState,
  participantsSearch,
  participantsStatus,
  onSelectSession,
  onParticipantsSearch,
  onParticipantsStatus,
  onAction,
}) {
  const safeDetails = details || {
    participants: [],
    events: [],
    attendanceLive: null,
  };
  const attendance = details?.attendanceLive || {
    present: 0,
    absent: 0,
    total: 0,
  };
  const total = attendance.total || 0;
  const present = attendance.present || 0;
  const absent = attendance.absent || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const participants = (safeDetails.participants || []).filter(
    (participant) => {
      const searchMatch =
        !participantsSearch ||
        participant.fullName
          .toLowerCase()
          .includes(participantsSearch.toLowerCase());
      const statusMatch =
        !participantsStatus || participant.status === participantsStatus;
      return searchMatch && statusMatch;
    },
  );

  return (
    <div className="stack-section" id="live-monitor">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">Live Monitor Overview</h5>
            <p className="section-subtitle">
              GET /instructor/live-monitor and /instructor/live-monitor/sessions
            </p>
          </div>

          <DataStateView
            loading={state.loading}
            error={state.error}
            isEmpty={sessions.length === 0}
            emptyMessage="No live sessions available."
          >
            <>
              <div className="live-grid">
                <div className="live-box present">
                  <p>Active Sessions</p>
                  <h4>{liveOverview.activeSessions || 0}</h4>
                </div>
                <div className="live-box absent">
                  <p>Participants</p>
                  <h4>{liveOverview.totalParticipants || 0}</h4>
                </div>
                <div className="live-box percent">
                  <p>Live Rate</p>
                  <h4>{liveOverview.liveAttendanceRate || 0}%</h4>
                </div>
              </div>

              <div className="table-wrap mt-3">
                <Table responsive hover className="instructor-table mb-0">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className={
                          activeSessionId === session.id
                            ? "table-row-selected"
                            : ""
                        }
                      >
                        <td>{session.title}</td>
                        <td>{session.date}</td>
                        <td>
                          <Badge
                            bg={
                              session.status === "live"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => onSelectSession(session.id)}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          </DataStateView>
        </Card.Body>
      </Card>

      <Card className="instructor-surface mt-3">
        <Card.Body>
          <div className="section-head section-head-row">
            <div>
              <h5 className="section-title">Live Session Details</h5>
              <p className="section-subtitle">
                /attendance/live, /attendance/stats, /participants, /events
              </p>
            </div>

            <div className="actions-inline">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onAction("check-in")}
              >
                <FontAwesomeIcon icon={faCirclePlay} className="me-1" />
                Check-in
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onAction("check-out")}
              >
                <FontAwesomeIcon icon={faDoorOpen} className="me-1" />
                Check-out
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onAction("lock-attendance")}
              >
                <FontAwesomeIcon icon={faLock} className="me-1" />
                Lock
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onAction("unlock-attendance")}
              >
                <FontAwesomeIcon icon={faLockOpen} className="me-1" />
                Unlock
              </Button>
            </div>
          </div>

          <DataStateView
            loading={state.loading}
            error=""
            isEmpty={!details}
            emptyMessage="Select a session to monitor attendance in real time."
          >
            <>
              <div className="live-grid mb-3">
                <div className="live-box present">
                  <p>Present</p>
                  <h4>{present}</h4>
                </div>
                <div className="live-box absent">
                  <p>Absent</p>
                  <h4>{absent}</h4>
                </div>
                <div className="live-box percent">
                  <p>Percentage</p>
                  <h4>{percentage}%</h4>
                </div>
              </div>

              <ProgressBar
                now={percentage}
                className="attendance-progress mb-3"
                label={`${percentage}%`}
              />

              <div className="toolbar-grid mb-2">
                <Form.Control
                  type="search"
                  placeholder="Search participant"
                  value={participantsSearch}
                  onChange={(event) => onParticipantsSearch(event.target.value)}
                />
                <Form.Select
                  value={participantsStatus}
                  onChange={(event) => onParticipantsStatus(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </Form.Select>
              </div>

              <div className="table-wrap">
                <Table responsive hover className="instructor-table mb-0">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Group</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td>{participant.fullName}</td>
                        <td>{participant.group || "N/A"}</td>
                        <td>
                          <Badge
                            bg={
                              participant.status === "Present"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {participant.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="actions-inline">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                onAction("mark-attendance", {
                                  studentId: participant.id,
                                })
                              }
                            >
                              Mark
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                onAction("delete-attendance", {
                                  attendanceId: participant.id,
                                })
                              }
                            >
                              <FontAwesomeIcon icon={faDoorClosed} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="details-box mt-3">
                <h6>Session Events</h6>
                <ul className="plain-list mb-0">
                  {(safeDetails.events || []).map((eventItem) => (
                    <li key={eventItem.id}>
                      <span>{eventItem.message}</span>
                      <span className="text-muted small">{eventItem.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
    </div>
  );
}

export default LiveAttendanceMonitor;
