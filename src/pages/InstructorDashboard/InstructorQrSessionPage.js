import { useCallback, useEffect } from "react";
import Container from "react-bootstrap/Container";
import QrCodePanel from "../../components/instructor/QrCodePanel";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import { useRealtimePolling } from "../../hooks/useRealtimePolling";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

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

  useRealtimePolling(
    () => {
      if (selectedQrSessionId) {
        loadQrDetails(selectedQrSessionId);
      }
    },
    5000,
    Boolean(selectedQrSessionId),
  );

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
