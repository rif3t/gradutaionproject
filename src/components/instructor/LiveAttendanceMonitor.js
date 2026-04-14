import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

function LiveAttendanceMonitor({ attendance }) {
  const total = attendance.total || 0;
  const present = attendance.present || 0;
  const absent = attendance.absent || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <Card className="instructor-surface" id="live-monitor">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">Live Attendance Monitor</h5>
          <p className="section-subtitle">
            Real-time attendance performance during session
          </p>
        </div>

        <div className="live-grid">
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
          className="attendance-progress"
          label={`${percentage}%`}
        />
      </Card.Body>
    </Card>
  );
}

export default LiveAttendanceMonitor;
