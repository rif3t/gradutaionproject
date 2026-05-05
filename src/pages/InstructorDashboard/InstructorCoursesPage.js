// ==================== InstructorCoursesPage.js - الكود كامل ====================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { instructorDashboardApi } from "../../services/instructorDashboardApi";
import CoursesTable from "../../components/instructor/CoursesTable";
import { getApiErrorMessage } from "../../services/apiClient";

const InstructorCoursesPage = () => {
  // State management
  const [courses, setCourses] = useState([]);
  const [coursesMeta, setCoursesMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Query state for courses filtering
  const [query, setQuery] = useState({
    search: "",
    status: "",
    semester: "",
    sortBy: "name",
    order: "asc",
    page: 1,
    limit: 10,
  });
  
  // Action state for feedback
  const [actionState, setActionState] = useState({
    busy: null,
    error: null,
    success: null,
  });
  
  const [courseDetailsState, setCourseDetailsState] = useState({
    loading: false,
    error: null,
  });

  // Fetch courses with current query
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await instructorDashboardApi.getCourses({
        page: query.page,
        limit: query.limit,
        search: query.search,
      });
      
      setCourses(result.items || []);
      setCoursesMeta(result.meta || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load courses"));
    } finally {
      setLoading(false);
    }
  }, [query.page, query.limit, query.search]);

  // Fetch course details (students and sessions) when a course is selected
  const fetchCourseDetails = useCallback(async (courseId) => {
    if (!courseId) return;
    
    setCourseDetailsState({ loading: true, error: null });
    try {
      const details = await instructorDashboardApi.loadCourseDetails(courseId);
      setStudents(details.students || []);
      setSessions(details.lectures || []);
    } catch (err) {
      setCourseDetailsState({ loading: false, error: getApiErrorMessage(err, "Failed to load course details") });
      setStudents([]);
      setSessions([]);
    } finally {
      setCourseDetailsState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Handle query changes
  const handleQueryChange = useCallback((updates) => {
    setQuery(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setQuery(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle course selection
  const handleSelectCourse = useCallback((courseId) => {
    setSelectedCourseId(courseId);
    fetchCourseDetails(courseId);
  }, [fetchCourseDetails]);

  // Handle student search
  const handleStudentsSearch = useCallback((searchTerm) => {
    if (!selectedCourseId) return;
    // Implement student search logic if needed
    console.log("Search students:", searchTerm);
  }, [selectedCourseId]);

  // Handle session filter
  const handleSessionFilter = useCallback((status) => {
    console.log("Filter sessions by status:", status);
  }, []);

  // ⭐ MAIN HANDLER FOR COURSE ACTIONS (START/REOPEN/END SESSION)
  const handleCourseAction = useCallback(async (action, courseId, payload) => {
    console.log("🟢 handleCourseAction - Action:", action);
    console.log("🟢 handleCourseAction - Course ID:", courseId);
    console.log("🟢 handleCourseAction - Payload:", payload);
    
    setActionState({ busy: action, error: null, success: null });
    
    try {
      let result;
      
      if (action === "create-session") {
        result = await instructorDashboardApi.sessionAction(
          payload.lectureId,
          "start",
          {
            durationInMinutes: payload.durationInMinutes,
            refreshInSeconds: payload.refreshInSeconds  // ✅ مهم جداً
          }
        );
        setActionState({ busy: null, error: null, success: "Session started successfully!" });
        // Refresh course details to update session status
        await fetchCourseDetails(courseId);
        return result;
      }
      
      if (action === "reopen-session") {
        result = await instructorDashboardApi.sessionAction(
          payload.lectureId,
          "reopen",
          {
            durationInMinutes: payload.durationInMinutes,
            refreshInSeconds: payload.refreshInSeconds  // ✅ مهم جداً
          }
        );
        setActionState({ busy: null, error: null, success: "Session reopened successfully!" });
        // Refresh course details to update session status
        await fetchCourseDetails(courseId);
        return result;
      }
      
      if (action === "end-session") {
        result = await instructorDashboardApi.sessionAction(
          payload.lectureId,
          "end"
        );
        setActionState({ busy: null, error: null, success: "Session ended successfully!" });
        // Refresh course details to update session status
        await fetchCourseDetails(courseId);
        return result;
      }
      
      if (action === "create-lecture") {
        result = await instructorDashboardApi.createLecture(courseId, payload);
        setActionState({ busy: null, error: null, success: "Lecture created successfully!" });
        await fetchCourseDetails(courseId);
        return result;
      }
      
      if (action === "update-lecture") {
        result = await instructorDashboardApi.updateLecture(payload.id, payload);
        setActionState({ busy: null, error: null, success: "Lecture updated successfully!" });
        await fetchCourseDetails(courseId);
        return result;
      }
      
    } catch (error) {
      console.error("Error in handleCourseAction:", error);
      setActionState({ 
        busy: null, 
        error: getApiErrorMessage(error, "Action failed"), 
        success: null 
      });
      throw error;
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setActionState(prev => ({ ...prev, success: null }));
    }, 3000);
    
    return null;
  }, [fetchCourseDetails]);

  // Handle lecture actions
  const handleLectureAction = useCallback(async (action, payload) => {
    console.log("📚 handleLectureAction - Action:", action);
    console.log("📚 handleLectureAction - Payload:", payload);
    
    setActionState({ busy: `lecture-${action}`, error: null, success: null });
    
    try {
      let result;
      
      if (action === "create") {
        result = await instructorDashboardApi.createLecture(payload.courseId, {
          lectureName: payload.title,
          lectureDate: payload.date ? `${payload.date}T${payload.startTime || "00:00"}` : null,
          location: payload.location,
        });
        setActionState({ busy: null, error: null, success: "Lecture created successfully!" });
        await fetchCourseDetails(payload.courseId);
        return result;
      }
      
      if (action === "update") {
        result = await instructorDashboardApi.updateLecture(payload.id, {
          lectureName: payload.title,
          lectureDate: payload.date ? `${payload.date}T${payload.startTime || "00:00"}` : null,
          location: payload.location,
        });
        setActionState({ busy: null, error: null, success: "Lecture updated successfully!" });
        await fetchCourseDetails(payload.courseId);
        return result;
      }
      
    } catch (error) {
      console.error("Error in handleLectureAction:", error);
      setActionState({ 
        busy: null, 
        error: getApiErrorMessage(error, "Lecture action failed"), 
        success: null 
      });
      throw error;
    }
    
    setTimeout(() => {
      setActionState(prev => ({ ...prev, success: null }));
    }, 3000);
    
    return null;
  }, [fetchCourseDetails]);

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset action state on unmount
  useEffect(() => {
    return () => {
      setActionState({ busy: null, error: null, success: null });
    };
  }, []);

  // Prepare props for CoursesTable
  const coursesState = {
    loading,
    error,
  };

  const qrDetails = null; // Can be expanded if needed

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">My Courses</h2>
          <p className="text-muted">Manage your courses, lectures, and attendance sessions</p>
        </Col>
      </Row>

      {actionState.error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setActionState(prev => ({ ...prev, error: null }))} dismissible>
              <Alert.Heading>Error</Alert.Heading>
              <p>{actionState.error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      {actionState.success && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" onClose={() => setActionState(prev => ({ ...prev, success: null }))} dismissible>
              <p>{actionState.success}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <CoursesTable
            courses={courses}
            coursesMeta={coursesMeta}
            query={query}
            selectedCourseId={selectedCourseId}
            students={students}
            sessions={sessions}
            coursesState={coursesState}
            courseDetailsState={courseDetailsState}
            actionState={actionState}
            onQueryChange={handleQueryChange}
            onPageChange={handlePageChange}
            onSelectCourse={handleSelectCourse}
            onStudentsSearch={handleStudentsSearch}
            onSessionFilter={handleSessionFilter}
            onCourseAction={handleCourseAction}
            onLectureAction={handleLectureAction}
            qrDetails={qrDetails}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default InstructorCoursesPage;