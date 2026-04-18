import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import LiveAttendanceMonitor from "../../components/instructor/LiveAttendanceMonitor";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import { useRealtimePolling } from "../../hooks/useRealtimePolling";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorLiveMonitorPage() {
  const {
    liveData,
    liveState,
    actionState,
    loadLiveMonitor,
    setLiveSession,
    runLiveAction,
  } = useInstructorWorkspace();
  const [participantsSearch, setParticipantsSearch] = useState("");
  const [participantsStatus, setParticipantsStatus] = useState("");

  useEffect(() => {
    loadLiveMonitor();
    // Initial load only to avoid callback-identity loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useRealtimePolling(
    () => {
      loadLiveMonitor(liveData.activeSessionId);
    },
    6000,
    true,
  );

  const handleAction = useCallback(
    async (action, payload = {}) => {
      if (action === "delete-attendance" && payload.attendanceId) {
        await runLiveAction("mark-attendance", {
          attendanceId: payload.attendanceId,
          status: "Removed",
        });
        return;
      }

      await runLiveAction(action, payload);
    },
    [runLiveAction],
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Live Monitor"
          subtitle="Monitor present, absent, and attendance percentage in real-time."
        />

        <div className="dash-main-row">
          <LiveAttendanceMonitor
            liveOverview={liveData.overview || {}}
            sessions={liveData.sessions.items || []}
            activeSessionId={liveData.activeSessionId}
            details={liveData.sessionDetails}
            state={liveState}
            actionState={actionState}
            participantsSearch={participantsSearch}
            participantsStatus={participantsStatus}
            onSelectSession={setLiveSession}
            onParticipantsSearch={setParticipantsSearch}
            onParticipantsStatus={setParticipantsStatus}
            onAction={handleAction}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorLiveMonitorPage;
