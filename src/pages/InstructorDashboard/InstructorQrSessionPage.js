import { useCallback, useEffect } from "react";
import Container from "react-bootstrap/Container";
import QrCodePanel from "../../components/instructor/QrCodePanel";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

const QR_REFRESH_MARGIN_MS = 2000;
const QR_FALLBACK_REFRESH_MS = 30000;

function InstructorQrSessionPage() {
  const {
    qrQuery,
    qrData,
    qrState,
    selectedQrSessionId,
    qrDetails,
    actionState,
    loadQrSessions,
    loadQrDetails,
    setSelectedQrSessionId,
    executeQrAction,
  } = useInstructorWorkspace();

  useEffect(() => {
    loadQrSessions();
    // Initial load only to avoid callback-identity loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedQrSessionId) {
      loadQrDetails(selectedQrSessionId);
    }
  }, [selectedQrSessionId, loadQrDetails]);

  useEffect(() => {
    if (!selectedQrSessionId) {
      return undefined;
    }

    let refreshDelayMs = QR_FALLBACK_REFRESH_MS;
    const expiresAt = qrDetails?.qrExpiresAt;
    if (expiresAt) {
      const expiresAtMs = new Date(expiresAt).getTime();
      if (!Number.isNaN(expiresAtMs)) {
        refreshDelayMs = Math.max(
          1000,
          expiresAtMs - Date.now() - QR_REFRESH_MARGIN_MS,
        );
      }
    }

    const timerId = setTimeout(() => {
      loadQrDetails(selectedQrSessionId);
    }, refreshDelayMs);

    return () => clearTimeout(timerId);
  }, [selectedQrSessionId, qrDetails?.qrExpiresAt, loadQrDetails]);

  const selectedQrSession =
    qrData.items.find((item) => item.id === selectedQrSessionId) || null;

  const handleQueryChange = useCallback(
    (patch) => {
      loadQrSessions(patch);
    },
    [loadQrSessions],
  );

  const handleSelectSession = useCallback(
    (qrSessionId) => {
      setSelectedQrSessionId(qrSessionId);
      loadQrDetails(qrSessionId);
    },
    [loadQrDetails, setSelectedQrSessionId],
  );

  const handleQrAction = useCallback(
    async (qrSessionId, action) => {
      await executeQrAction(qrSessionId, action);
    },
    [executeQrAction],
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="QR Session"
          subtitle="Display and auto-refresh the lecture QR code for secure attendance."
        />

        <div className="dash-main-row">
          <QrCodePanel
            query={qrQuery}
            qrSessions={qrData.items}
            qrMeta={qrData.meta}
            selectedQrSession={selectedQrSession}
            qrDetails={qrDetails}
            qrState={qrState}
            actionState={actionState}
            onQueryChange={handleQueryChange}
            onPageChange={(page) => handleQueryChange({ page })}
            onSelectSession={handleSelectSession}
            onQrAction={handleQrAction}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorQrSessionPage;
