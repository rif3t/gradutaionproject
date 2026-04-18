import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faStop,
  faPause,
  faRotateRight,
  faXmark,
  faUnlock,
  faLock,
  faClock,
  faFlagCheckered,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

function LectureSessionPanel({
  query,
  sessions,
  meta,
  selectedSessionId,
  timeline,
  logs,
  state,
  actionState,
  onFilterChange,
  onPageChange,
  onSelectSession,
  onAction,
}) {
  const selectedSession = sessions.find(
    (item) => item.id === selectedSessionId,
  );

  return (
    <div className="stack-section" id="session-control">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">Session Control</h5>
            <p className="section-subtitle">
              /instructor/sessions with filters, sorting, and pagination
            </p>
          </div>

          <div className="toolbar-grid">
            <Form.Control
              type="search"
              placeholder="Search session id or title"
              value={query.search}
              onChange={(event) =>
                onFilterChange({ search: event.target.value, page: 1 })
              }
            />
            <Form.Select
              value={query.status}
              onChange={(event) =>
                onFilterChange({ status: event.target.value, page: 1 })
              }
            >
              <option value="">All statuses</option>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </Form.Select>
            <Form.Select
              value={`${query.sortBy}:${query.order}`}
              onChange={(event) => {
                const [sortBy, order] = event.target.value.split(":");
                onFilterChange({ sortBy, order });
              }}
            >
              <option value="date:desc">Date (Latest)</option>
              <option value="date:asc">Date (Oldest)</option>
              <option value="status:asc">Status</option>
            </Form.Select>
          </div>

          <DataStateView
            loading={state.loading}
            error={state.error}
            isEmpty={sessions.length === 0}
            emptyMessage="No sessions found for current query."
          >
            <>
              <div className="table-wrap mt-3">
                <Table responsive hover className="instructor-table mb-0">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th className="text-end">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className={
                          selectedSessionId === session.id
                            ? "table-row-selected"
                            : ""
                        }
                      >
                        <td>
                          <strong>{session.title}</strong>
                          <p className="mb-0 text-muted small">{session.id}</p>
                        </td>
                        <td>{session.date}</td>
                        <td>{session.durationMinutes} mins</td>
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

              <DataPagination meta={meta} onPageChange={onPageChange} />
            </>
          </DataStateView>
        </Card.Body>
      </Card>

      <Card className="instructor-surface mt-3">
        <Card.Body>
          <div className="section-head section-head-row">
            <div>
              <h5 className="section-title">Session Actions</h5>
              <p className="section-subtitle">
                Start, stop, pause, resume, attendance lock, and lifecycle
                actions
              </p>
            </div>

            <div className="session-actions">
              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("start")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faPlay} />
                </span>
                Start
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("pause")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faPause} />
                </span>
                Pause
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("resume")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faRotateRight} />
                </span>
                Resume
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("stop")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faStop} />
                </span>
                Stop
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("open-attendance")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faUnlock} />
                </span>
                Open Attendance
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={() => onAction("close-attendance")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faLock} />
                </span>
                Close Attendance
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn warning"
                onClick={() => onAction("cancel")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faXmark} />
                </span>
                Cancel
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn warning"
                onClick={() => onAction("end")}
                disabled={!selectedSession}
              >
                <span>
                  <FontAwesomeIcon icon={faFlagCheckered} />
                </span>
                End
              </Button>
            </div>

            {(selectedSession && (
              <div className="session-meta-grid mt-3">
                <div>
                  <p className="session-label">Session ID</p>
                  <h6 className="session-value">{selectedSession.id}</h6>
                </div>
                <div>
                  <p className="session-label">Status</p>
                  <h6 className="session-value">{selectedSession.status}</h6>
                </div>
                <div>
                  <p className="session-label">Duration</p>
                  <h6 className="session-value timer-value">
                    <FontAwesomeIcon icon={faClock} />{" "}
                    {selectedSession.durationMinutes} mins
                  </h6>
                </div>
              </div>
            )) || <p className="empty-hint">Select a session to manage.</p>}

            <div className="session-logs-grid mt-3">
              <div className="details-box">
                <h6>Timeline</h6>
                <ul className="plain-list mb-0">
                  {timeline.map((item) => (
                    <li key={item.id}>
                      <span>{item.title}</span>
                      <span className="text-muted small">{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="details-box">
                <h6>Logs</h6>
                <ul className="plain-list mb-0">
                  {logs.map((item) => (
                    <li key={item.id}>
                      <span>{item.message}</span>
                      <span className="text-muted small">
                        {item.at || item.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

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

export default LectureSessionPanel;
