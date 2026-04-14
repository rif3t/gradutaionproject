import Container from "react-bootstrap/Container";
import CoursesTable from "../../components/instructor/CoursesTable";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorCoursesPage() {
  const { courses, activeCourse, startLecture } = useInstructorWorkspace();

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="My Courses"
          subtitle="Manage your course list and start a lecture attendance session."
        />

        <div className="dash-main-row">
          <CoursesTable
            courses={courses}
            activeCourseId={activeCourse?.id}
            onStartLecture={startLecture}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorCoursesPage;
