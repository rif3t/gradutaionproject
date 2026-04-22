import { useCallback, useEffect, useRef } from "react";
import Container from "react-bootstrap/Container";
import CoursesTable from "../../components/instructor/CoursesTable";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorCoursesPage() {
  const {
    coursesQuery,
    coursesData,
    coursesState,
    selectedCourseId,
    courseStudents,
    courseSessions,
    courseDetailsState,
    actionState,
    loadCourses,
    loadCourseDetails,
    setSelectedCourseId,
    runCourseAction,
    handleLectureAction,
  } = useInstructorWorkspace();

  const studentsSearchRef = useRef("");
  const sessionsStatusRef = useRef("");

  useEffect(() => {
    loadCourses();
    // Initial load only to avoid callback-identity loops from query state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId, {
        studentsSearch: studentsSearchRef.current,
        sessionStatus: sessionsStatusRef.current,
      });
    }
  }, [selectedCourseId, loadCourseDetails]);

  const handleQueryChange = useCallback(
    (patch) => {
      loadCourses(patch);
    },
    [loadCourses],
  );

  const handleSelectCourse = useCallback(
    (courseId) => {
      setSelectedCourseId(courseId);
      loadCourseDetails(courseId, {
        studentsSearch: studentsSearchRef.current,
        sessionStatus: sessionsStatusRef.current,
      });
    },
    [loadCourseDetails, setSelectedCourseId],
  );

  const handleStudentsSearch = useCallback(
    (searchValue) => {
      studentsSearchRef.current = searchValue;
      loadCourseDetails(selectedCourseId, {
        studentsSearch: searchValue,
        sessionStatus: sessionsStatusRef.current,
      });
    },
    [loadCourseDetails, selectedCourseId],
  );

  const handleSessionFilter = useCallback(
    (statusValue) => {
      sessionsStatusRef.current = statusValue;
      loadCourseDetails(selectedCourseId, {
        studentsSearch: studentsSearchRef.current,
        sessionStatus: statusValue,
      });
    },
    [loadCourseDetails, selectedCourseId],
  );

  const handleCourseAction = useCallback(
    async (action, courseId, actionOptions = {}) => {
      await runCourseAction(action, courseId, actionOptions);
    },
    [runCourseAction],
  );

  const handleLectureActionUI = useCallback(
    async (action, data) => {
      await handleLectureAction(action, data);
    },
    [handleLectureAction],
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="My Courses"
          subtitle="Pick a course, open its lectures, start or reopen a session, then monitor QR attendance live."
        />

        <div className="dash-main-row">
          <CoursesTable
            courses={coursesData.items}
            coursesMeta={coursesData.meta}
            query={coursesQuery}
            selectedCourseId={selectedCourseId}
            students={courseStudents.items}
            sessions={courseSessions.items}
            coursesState={coursesState}
            courseDetailsState={courseDetailsState}
            actionState={actionState}
            onQueryChange={handleQueryChange}
            onPageChange={(page) => handleQueryChange({ page })}
            onSelectCourse={handleSelectCourse}
            onStudentsSearch={handleStudentsSearch}
            onSessionFilter={handleSessionFilter}
            onCourseAction={handleCourseAction}
            onLectureAction={handleLectureActionUI}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorCoursesPage;
