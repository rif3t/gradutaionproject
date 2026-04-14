import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function StudentDetailsModal({ show, student, onHide }) {
  const safeStudent = student || {
    studentName: "N/A",
    totalLectures: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="app-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {safeStudent.studentName} - Attendance Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col sm={6}>
            <div className="student-stat-box">
              <p>Total Lectures</p>
              <h4>{safeStudent.totalLectures}</h4>
            </div>
          </Col>
          <Col sm={6}>
            <div className="student-stat-box">
              <p>Present</p>
              <h4>{safeStudent.present}</h4>
            </div>
          </Col>
          <Col sm={6}>
            <div className="student-stat-box">
              <p>Absent</p>
              <h4>{safeStudent.absent}</h4>
            </div>
          </Col>
          <Col sm={6}>
            <div className="student-stat-box">
              <p>Attendance %</p>
              <h4>{safeStudent.percentage}%</h4>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default StudentDetailsModal;
