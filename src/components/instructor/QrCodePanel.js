import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

const buildQrUrl = (payload) => {
  const value = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${value}`;
};

function QrCodePanel({ session, qrPayload, qrRefreshSeconds, isQrAnimating }) {
  return (
    <Card className="instructor-surface" id="qr-section">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">QR Attendance</h5>
          <p className="section-subtitle">
            Students scan to mark attendance instantly
          </p>
        </div>

        {!session ? (
          <p className="empty-hint">
            QR code appears after starting a lecture session.
          </p>
        ) : (
          <div className="qr-shell">
            <div className={`qr-box${isQrAnimating ? " refreshing" : ""}`}>
              <img
                src={buildQrUrl(qrPayload)}
                alt="Lecture attendance QR"
                className="qr-image"
              />
            </div>

            <div className="qr-meta">
              <Badge bg="light" text="dark" className="qr-badge">
                <FontAwesomeIcon icon={faQrcode} /> Session ID: {session.id}
              </Badge>
              <p className="qr-note">
                <FontAwesomeIcon icon={faArrowsRotate} /> Auto-refresh every{" "}
                {qrRefreshSeconds} seconds
              </p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default QrCodePanel;
