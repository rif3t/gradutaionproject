import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faArrowsRotate,
  faBolt,
  faPowerOff,
  faBan,
  faDownload,
  faCirclePlay,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

const buildQrUrl = (payload) => {
  const value = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${value}`;
};

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

  useEffect(() => {
    const timerId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const payload =
    qrDetails?.code?.value || selectedQrSession?.id || "FCAI-ATTENDANCE";
  const imageUrl = qrDetails?.image?.url || buildQrUrl(payload);
  const qrStatus =
    qrDetails?.sessionStatus ||
    qrDetails?.code?.status ||
    selectedQrSession?.status ||
    "unknown";

  const { countdownLabel, isExpired } = useMemo(() => {
    const expiresAt = qrDetails?.qrExpiresAt || qrDetails?.code?.expiresAt;
    if (!expiresAt) {
      return { countdownLabel: "--:--", isExpired: false };
    }

    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
      return { countdownLabel: "--:--", isExpired: false };
    }

    const secondsLeft = Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
    return {
      countdownLabel: formatCountdown(secondsLeft),
      isExpired: secondsLeft <= 0,
    };
  }, [nowMs, qrDetails?.qrExpiresAt, qrDetails?.code?.expiresAt]);

  return (
    <div className="stack-section" id="qr-section">
      <Card className="instructor-surface">
        <Card.Body>
          <div className="section-head">
            <h5 className="section-title">QR Session Manager</h5>
            <p className="section-subtitle">
              GET /instructor/qr-sessions with search, filtering, and status
              view
            </p>
          </div>

          <div className="toolbar-grid">
            <Form.Control
              type="search"
              placeholder="Search by course or QR session"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </Form.Select>

            <Button
              variant="outline-primary"
              onClick={() => onQrAction(selectedQrSession?.id, "generate")}
            >
              <FontAwesomeIcon icon={faCirclePlay} className="me-2" />
              Generate QR
            </Button>
          </div>

          <DataStateView
            loading={qrState.loading}
            error={qrState.error}
            isEmpty={qrSessions.length === 0}
            emptyMessage="No QR sessions found."
          >
            <>
              <div className="table-wrap mt-3">
                <Table responsive hover className="instructor-table mb-0">
                  <thead>
                    <tr>
                      <th>QR Session</th>
                      <th>Course</th>
                      <th>Scans</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrSessions.map((session) => (
                      <tr
                        key={session.id}
                        className={
                          selectedQrSession?.id === session.id
                            ? "table-row-selected"
                            : ""
                        }
                      >
                        <td>
                          <strong>{session.id}</strong>
                          <p className="mb-0 text-muted small">
                            {session.sessionId}
                          </p>
                        </td>
                        <td>{session.courseName}</td>
                        <td>{session.scansCount}</td>
                        <td>
                          <Badge
                            bg={
                              session.status === "active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="actions-inline">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => onSelectSession(session.id)}
                            >
                              Open
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onQrAction(session.id, "activate")}
                            >
                              <FontAwesomeIcon icon={faBolt} />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() =>
                                onQrAction(session.id, "deactivate")
                              }
                            >
                              <FontAwesomeIcon icon={faPowerOff} />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onQrAction(session.id, "expire")}
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <DataPagination meta={qrMeta} onPageChange={onPageChange} />
            </>
          </DataStateView>
        </Card.Body>
      </Card>

      <Card className="instructor-surface mt-3">
        <Card.Body>
          <div className="section-head section-head-row">
            <div>
              <h5 className="section-title">Selected QR Session</h5>
              <p className="section-subtitle">
                /code, /image, /scans, /scans/live are displayed here
              </p>
            </div>
            <div className="actions-inline">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onQrAction(selectedQrSession?.id, "regenerate")}
              >
                <FontAwesomeIcon icon={faArrowsRotate} className="me-1" />
                Regenerate
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onQrAction(selectedQrSession?.id, "download")}
              >
                <FontAwesomeIcon icon={faDownload} className="me-1" />
                Download
              </Button>
            </div>
          </div>

          <DataStateView
            loading={qrState.loading}
            error=""
            isEmpty={!selectedQrSession}
            emptyMessage="Choose a QR session from the list."
          >
            <div className="qr-two-col">
              <div className="qr-shell">
                <div className="qr-box refreshing">
                  <img
                    src={imageUrl}
                    alt="Lecture attendance QR"
                    className="qr-image"
                  />
                </div>

                <div className="qr-meta">
                  <Badge bg="light" text="dark" className="qr-badge">
                    <FontAwesomeIcon icon={faQrcode} /> Session ID:{" "}
                    {selectedQrSession?.id}
                  </Badge>
                  <p className="qr-note mb-0">Status: {qrStatus}</p>
                  <p className="qr-note mb-0">Expires in: {countdownLabel}</p>
                  <p className="qr-note mb-0">
                    {isExpired
                      ? "QR expired, refreshing..."
                      : "Auto refresh is scheduled before expiry."}
                  </p>
                </div>
              </div>

              <div className="details-box">
                <h6 className="mb-2">Live Scan Feed</h6>
                <ul className="plain-list mb-3">
                  {(qrDetails.liveScans || []).map((scan) => (
                    <li key={scan.id}>
                      <span>{scan.studentName}</span>
                      <Badge bg="success">{scan.at}</Badge>
                    </li>
                  ))}
                </ul>

                <h6 className="mb-2">All Scans</h6>
                <ul className="plain-list mb-0">
                  {(qrDetails.scans || []).map((scan) => (
                    <li key={scan.id}>
                      <span>{scan.studentName}</span>
                      <span className="text-muted small">{scan.at}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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

export default QrCodePanel;
