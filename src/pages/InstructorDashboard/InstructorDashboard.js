import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import OverviewCards from "../../components/instructor/OverviewCards";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorDashboard() {
  const { overview, warning } = useInstructorWorkspace();

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Instructor Dashboard"
          subtitle="Quick overview of your courses, students, lectures, and attendance rate."
        />

        {warning && (
          <Alert variant="warning" className="mt-3 mb-0">
            {warning}
          </Alert>
        )}

        <OverviewCards overview={overview} />
      </Container>
    </div>
  );
}

export default InstructorDashboard;
