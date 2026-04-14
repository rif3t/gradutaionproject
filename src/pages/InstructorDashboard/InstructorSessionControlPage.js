import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import LectureSessionPanel from "../../components/instructor/LectureSessionPanel";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorSessionControlPage() {
  const {
    activeCourse,
    session,
    timerLeft,
    warning,
    closeSession,
    reopenSession,
  } = useInstructorWorkspace();

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Session Control"
          subtitle="End or reopen lecture session with clear state and warnings."
        />

        {warning && (
          <Alert variant="warning" className="mt-3 mb-0">
            {warning}
          </Alert>
        )}

        <div className="dash-main-row">
          <LectureSessionPanel
            activeCourse={activeCourse}
            session={session}
            timerLeft={timerLeft}
            onEndSession={closeSession}
            onReopenSession={reopenSession}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorSessionControlPage;
