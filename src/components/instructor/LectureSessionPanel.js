import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStop,
  faRotateRight,
  faTriangleExclamation,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const toClock = (secondsLeft) => {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

function LectureSessionPanel({
  activeCourse,
  session,
  timerLeft,
  onEndSession,
  onReopenSession,
}) {
  return (
    <Card className="instructor-surface" id="session-control">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">Session Control</h5>
          <p className="section-subtitle">
            Manage running lecture attendance session
          </p>
        </div>

        {!session ? (
          <p className="empty-hint">
            Select a course and start lecture to create a session.
          </p>
        ) : (
          <>
            <div className="session-meta-grid">
              <div>
                <p className="session-label">Active Course</p>
                <h6 className="session-value">{activeCourse?.name || "N/A"}</h6>
              </div>
              <div>
                <p className="session-label">Course Code</p>
                <h6 className="session-value">{activeCourse?.code || "N/A"}</h6>
              </div>
              <div>
                <p className="session-label">Session Timer</p>
                <h6 className="session-value timer-value">
                  <FontAwesomeIcon icon={faClock} /> {toClock(timerLeft)}
                </h6>
              </div>
            </div>

            {!session.isActive && (
              <Alert variant="warning" className="session-warning">
                <FontAwesomeIcon icon={faTriangleExclamation} /> This session is
                closed. Reopen only if attendance was interrupted.
              </Alert>
            )}

            <div className="session-actions">
              <Button
                variant="light"
                className="quickbtn instructor-btn"
                onClick={onEndSession}
                disabled={!session.isActive}
              >
                <span>
                  <FontAwesomeIcon icon={faStop} />
                </span>
                End Session
              </Button>

              <Button
                variant="light"
                className="quickbtn instructor-btn warning"
                onClick={onReopenSession}
                disabled={session.isActive}
              >
                <span>
                  <FontAwesomeIcon icon={faRotateRight} />
                </span>
                Reopen Session
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default LectureSessionPanel;
