import { useCallback, useEffect } from "react";
import Container from "react-bootstrap/Container";
import LectureSessionPanel from "../../components/instructor/LectureSessionPanel";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorSessionControlPage() {
  const {
    sessionControlQuery,
    sessionControlData,
    sessionControlState,
    actionState,
    loadSessionControl,
    setSessionControlSelection,
    runSessionAction,
  } = useInstructorWorkspace();

  useEffect(() => {
    loadSessionControl();
    // Initial load only to avoid callback-identity loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilters = useCallback(
    (patch) => {
      loadSessionControl(patch);
    },
    [loadSessionControl],
  );

  const handleAction = useCallback(
    async (action) => {
      await runSessionAction(action);
    },
    [runSessionAction],
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Session Control"
          subtitle="End or reopen lecture session with clear state and warnings."
        />

        <div className="dash-main-row">
          <LectureSessionPanel
            query={sessionControlQuery}
            sessions={sessionControlData.items}
            meta={sessionControlData.meta}
            selectedSessionId={sessionControlData.selectedSessionId}
            timeline={sessionControlData.timeline}
            logs={sessionControlData.logs}
            state={sessionControlState}
            actionState={actionState}
            onFilterChange={handleFilters}
            onPageChange={(page) => handleFilters({ page })}
            onSelectSession={setSessionControlSelection}
            onAction={handleAction}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorSessionControlPage;
