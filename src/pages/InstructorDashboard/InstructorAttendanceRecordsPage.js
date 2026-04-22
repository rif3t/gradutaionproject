import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import AttendanceRecordsTable from "../../components/instructor/AttendanceRecordsTable";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorAttendanceRecordsPage() {
  const {
    attendanceQuery,
    attendanceData,
    attendanceSummary,
    attendanceState,
    actionState,
    loadAttendanceRecords,
    attendanceBulkAction,
    reviewAttendance,
    exportAttendance,
  } = useInstructorWorkspace();

  const location = useLocation();

  useEffect(() => {
    const initialState = {};
    if (location.state?.courseId) initialState.courseId = location.state.courseId;
    if (location.state?.sessionId) initialState.sessionId = location.state.sessionId;
    
    loadAttendanceRecords(initialState);
    // Initial load only to avoid callback-identity loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilters = useCallback(
    (patch) => {
      loadAttendanceRecords(patch);
    },
    [loadAttendanceRecords],
  );

  const handleSort = useCallback(
    (sortBy, order) => {
      loadAttendanceRecords({ sortBy, order, page: 1 });
    },
    [loadAttendanceRecords],
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Attendance Records"
          subtitle="Review student attendance history with quick date and name filters."
        />

        <div className="dash-main-row">
          <AttendanceRecordsTable
            records={attendanceData.items}
            summary={attendanceSummary}
            query={attendanceQuery}
            meta={attendanceData.meta}
            state={attendanceState}
            actionState={actionState}
            onFilterChange={handleFilters}
            onPageChange={(page) => handleFilters({ page })}
            onSortChange={handleSort}
            onBulkAction={(action) => attendanceBulkAction(action, { ids: [] })}
            onReview={reviewAttendance}
            onExport={exportAttendance}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorAttendanceRecordsPage;
