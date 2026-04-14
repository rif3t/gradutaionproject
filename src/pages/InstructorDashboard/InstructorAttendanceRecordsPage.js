import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import AttendanceRecordsTable from "../../components/instructor/AttendanceRecordsTable";
import StudentDetailsModal from "../../components/instructor/StudentDetailsModal";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorAttendanceRecordsPage() {
  const { records, studentStats } = useInstructorWorkspace();
  const [filterDate, setFilterDate] = useState("");
  const [filterStudent, setFilterStudent] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);

  const selectedStudent = useMemo(() => {
    return (
      studentStats.find((item) => item.studentName === selectedStudentName) ||
      null
    );
  }, [studentStats, selectedStudentName]);

  const handleViewStudent = (studentName) => {
    setSelectedStudentName(studentName);
    setShowStudentModal(true);
  };

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Attendance Records"
          subtitle="Review student attendance history with quick date and name filters."
        />

        <div className="dash-main-row">
          <AttendanceRecordsTable
            records={records}
            filterDate={filterDate}
            filterStudent={filterStudent}
            onFilterDateChange={setFilterDate}
            onFilterStudentChange={setFilterStudent}
            onViewStudent={handleViewStudent}
          />
        </div>
      </Container>

      <StudentDetailsModal
        show={showStudentModal}
        student={selectedStudent}
        onHide={() => setShowStudentModal(false)}
      />
    </div>
  );
}

export default InstructorAttendanceRecordsPage;
