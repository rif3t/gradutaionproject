import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faArrowsRotate,
  faCirclePlay,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

function QrCodePanel({
  query,
  qrSessions,
  qrMeta,
  selectedQrSession,
  qrDetails,
  qrState,
  actionState,
  onQueryChange,
  onPageChange,
  onSelectSession,
  onQrAction,
}) {
  const [nowMs, setNowMs] = useState(Date.now());
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  // تحديث العداد
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // مراقبة تغير الـ payload لتحديث الـ QR
  useEffect(() => {
    console.log("🟢 QrCodePanel - qrDetails:", qrDetails);
    const payload = qrDetails?.code?.value || qrDetails?.qrPayload || null;
    if (payload) {
      console.log("✅ New QR payload received:", payload.substring(0, 30));
      setQrKey(prev => prev + 1);
    }
  }, [qrDetails?.code?.value, qrDetails?.qrPayload]);

  const qrPayload = qrDetails?.code?.value || qrDetails?.qrPayload || null;
  const qrStatus = qrDetails?.sessionStatus || qrDetails?.code?.status || selectedQrSession?.status || "unknown";
  const expiresAt = qrDetails?.code?.expiresAt || qrDetails?.qrExpiresAt;

  let countdownLabel = "--:--";
  let isExpired = false;
  let isActive = qrStatus === "active";

  if (expiresAt) {
    const ms = new Date(expiresAt).getTime();
    if (!isNaN(ms)) {
      const secondsLeft = Math.max(0, Math.ceil((ms - nowMs) / 1000));
      isExpired = secondsLeft <= 0;
      isActive = !isExpired && qrStatus === "active";
      countdownLabel = formatCountdown(secondsLeft);
    }
  }

  const isValidForScanning = qrPayload && qrPayload.length > 5 && qrPayload !== String(selectedQrSession?.id) && isActive && !isExpired;
  const needsGeneration = !qrPayload && selectedQrSession && !generatingQr;

  const handleGenerateQR = async () => {
    console.log("🔘 Generate QR clicked");
    if (!selectedQrSession?.id) return;
    setGeneratingQr(true);
    try {
      await onQrAction(selectedQrSession.id, "generate");
      setQrKey(prev => prev + 1);
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleRegenerateQR = async () => {
    console.log("🔘 Regenerate QR clicked");
    if (!selectedQrSession?.id) return;
    setGeneratingQr(true);
    try {
      await onQrAction(selectedQrSession.id, "regenerate");
      setQrKey(prev => prev + 1);
    } finally {
      setGeneratingQr(false);
    }
  };

  const qrImageUrl = qrPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrPayload)}&_t=${Date.now()}&_key=${qrKey}`
    : null;

  return (
    <div className="stack-section" id="qr-section">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">QR Session Manager</h5>
            <p className="section-subtitle">Select a session to generate QR code for student attendance</p>
          </div>
          <div className="toolbar-grid">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={query.search}
              onChange={(e) => onQueryChange({ search: e.target.value, page: 1 })}
            />
            <select
              className="form-select"
              value={query.status}
              onChange={(e) => onQueryChange({ status: e.target.value, page: 1 })}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            <Button variant="primary" onClick={handleGenerateQR} disabled={!selectedQrSession?.id || generatingQr}>
              {generatingQr ? <><Spinner animation="border" size="sm" /> Generating...</> : <><FontAwesomeIcon icon={faCirclePlay} /> Generate QR</>}
            </Button>
          </div>
          <DataStateView loading={qrState.loading} error={qrState.error} isEmpty={qrSessions.length === 0} emptyMessage="No QR sessions found.">
            <div className="table-responsive mt-3">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Course</th>
                    <th>Scans</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qrSessions.map(session => (
                    <tr key={session.id} className={selectedQrSession?.id === session.id ? "table-active" : ""}>
                      <td>
                        <strong>{session.id}</strong><br />
                        <small className="text-muted">{session.sessionId}</small>
                      </td>
                      <td>{session.courseName}</td>
                      <td>{session.scansCount || 0}</td>
                      <td>
                        <span className={`badge bg-${session.status === "active" ? "success" : "secondary"}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-primary" onClick={() => onSelectSession(session.id)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataStateView>
        </Card.Body>
      </Card>

      <Card className="instructor-surface mt-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="section-title">QR Code</h5>
              <p className="section-subtitle">{selectedQrSession?.id || "No session selected"}</p>
            </div>
            <Button size="sm" variant="outline-primary" onClick={handleRegenerateQR} disabled={!selectedQrSession?.id || generatingQr}>
              <FontAwesomeIcon icon={faArrowsRotate} /> Regenerate
            </Button>
          </div>

          <DataStateView loading={qrState.loading} error="" isEmpty={!selectedQrSession} emptyMessage="Choose a QR session from the list.">
            {needsGeneration && (
              <Alert variant="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} /> Click "Generate QR" to create a valid QR code.
              </Alert>
            )}
            {!needsGeneration && !qrPayload && (
              <Alert variant="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} /> No QR payload received. Please regenerate.
              </Alert>
            )}
            {isValidForScanning && (
              <Alert variant="success">
                <FontAwesomeIcon icon={faCheckCircle} /> QR Code Ready! Students can scan this code.
              </Alert>
            )}

            <div className="text-center">
              {qrImageUrl ? (
                <div className="p-4 border rounded d-inline-block bg-white">
                  <img
                    key={qrKey}
                    src={qrImageUrl}
                    alt="QR Code"
                    width="260"
                    height="260"
                    style={{ border: "1px solid #ddd" }}
                    onError={(e) => console.error("Image load error", e)}
                    onLoad={() => console.log("✅ QR image loaded with payload:", qrPayload?.substring(0, 30))}
                  />
                </div>
              ) : (
                <div className="text-center p-5 border rounded">
                  <FontAwesomeIcon icon={faQrcode} size="4x" className="text-muted mb-3" />
                  <p>No QR code generated yet</p>
                  <Button variant="primary" size="sm" onClick={handleGenerateQR}>Generate QR</Button>
                </div>
              )}

              {qrPayload && (
                <div className="mt-2 small text-muted">
                  <strong>Payload (first 30):</strong> {qrPayload.substring(0, 30)}...
                  {qrPayload === String(selectedQrSession?.id) && (
                    <span className="text-danger ms-2">⚠️ Using Session ID!</span>
                  )}
                  {qrPayload !== String(selectedQrSession?.id) && qrPayload.length > 10 && (
                    <span className="text-success ms-2">✓ Valid QR Token</span>
                  )}
                </div>
              )}

              {selectedQrSession && (
                <div className="mt-3">
                  <p><strong>Session ID:</strong> {selectedQrSession.id}</p>
                  <p><strong>Status:</strong> <span className={qrStatus === "active" ? "text-success" : "text-danger"}>{qrStatus}</span></p>
                  <p><strong>Expires in:</strong> <span className={isExpired ? "text-danger" : "text-success"}>{countdownLabel}</span></p>
                </div>
              )}
            </div>
          </DataStateView>

          {(actionState.error || actionState.success) && (
            <Alert className="mt-3" variant={actionState.error ? "danger" : "success"} dismissible>
              {actionState.error || actionState.success}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default QrCodePanel;