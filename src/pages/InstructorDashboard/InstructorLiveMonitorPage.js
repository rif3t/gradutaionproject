import Container from "react-bootstrap/Container";
import LiveAttendanceMonitor from "../../components/instructor/LiveAttendanceMonitor";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorLiveMonitorPage() {
  const { attendance } = useInstructorWorkspace();

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Live Monitor"
          subtitle="Monitor present, absent, and attendance percentage in real-time."
        />

        <div className="dash-main-row">
          <LiveAttendanceMonitor attendance={attendance} />
        </div>
      </Container>
    </div>
  );
}

export default InstructorLiveMonitorPage;
