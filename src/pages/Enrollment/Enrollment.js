import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faMagnifyingGlass,
  faPlus,
  faCheck,
  faTimes,
  faUserGraduate,
  faSpinner,
  faRefresh,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import {
  getCourseStudents,
  getEligibleStudents,
  bulkEnrollStudents,
  removeStudentFromCourse,
} from "../../services/enrollments";
import { getCourses } from "../../services/courses";
import "./Enrollment.css";

// ========== دوال مساعدة لاستخراج بيانات المادة (متوافقة مع CoursesPage) ==========
const getCourseId = (course) => course?.courseId;
const getCourseName = (course) => course?.courseName || "Unknown Course";
const getCourseCode = (course) => course?.courseCode || "";
const getCourseLevel = (course) => course?.level;
const getCourseInstructor = (course) =>
  course?.instructorName || "Not Assigned";

// ========== دوال مساعدة لاستخراج بيانات الطالب (متوافقة مع StudentsPage) ==========
const getStudentId = (student) =>
  student?.studentId ?? student?.id ?? student?.Id;
const getStudentName = (student) =>
  student?.fullName ?? student?.name ?? student?.Name ?? "Unknown";
const getStudentYear = (student) => {
  const level = student?.level ?? student?.year ?? student?.academicYear;
  if (typeof level === "number") {
    const yearMap = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
    };
    return yearMap[level] || `${level}th Year`;
  }
  return level || "";
};
const getStudentMajor = (student) =>
  student?.departmentName ?? student?.major ?? student?.department ?? "";

// استخراج الرقم من السنة (للتصفية)
const extractYearNumber = (yearStr) => {
  if (!yearStr) return null;
  if (typeof yearStr === "number") return yearStr;
  const match = String(yearStr).match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

// تحويل المستوى إلى سنة أكاديمية
const getYearFromLevel = (level) => {
  if (!level) return "Not specified";
  const yearMap = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
  };
  return yearMap[level] || `${level}th Year`;
};

function EnrollmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [studentMajorFilter, setStudentMajorFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentCourseForEnrollment, setCurrentCourseForEnrollment] = useState(
    "",
  );

  const [coursesList, setCoursesList] = useState([]);
  const [currentEnrollments, setCurrentEnrollments] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourseForView, setSelectedCourseForView] = useState(null);
  const [courseStudentsList, setCourseStudentsList] = useState([]);
  const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);

  // جلب المواد من نفس API الخاص بـ CoursesPage
  const fetchCoursesLookup = async () => {
    setLoading(true);
    try {
      const response = await getCourses({
        PageNumber: 1,
        PageSize: 100,
      });

      const courses = response?.data || [];

      console.log("Courses loaded:", courses);
      if (courses.length > 0) {
        console.log("First course sample:", courses[0]);
      }

      setCoursesList(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setEnrollError(error.message);
      setCoursesList([]);
    } finally {
      setLoading(false);
    }
  };

  // جلب جميع التسجيلات
  const fetchAllEnrollments = useCallback(async () => {
    if (coursesList.length === 0) return;
    setLoading(true);
    try {
      const enrollmentsPromises = coursesList.map(async (course) => {
        const courseId = getCourseId(course);
        if (!courseId) return null;
        try {
          const studentsResponse = await getCourseStudents(courseId);

          let studentsArray = [];
          const data = studentsResponse?.data || studentsResponse;

          if (Array.isArray(data)) {
            studentsArray = data;
          } else if (data?.data && Array.isArray(data.data)) {
            studentsArray = data.data;
          } else if (data?.items && Array.isArray(data.items)) {
            studentsArray = data.items;
          } else if (data?.$values && Array.isArray(data.$values)) {
            studentsArray = data.$values;
          } else {
            studentsArray = [];
          }

          const level = getCourseLevel(course);
          const year = getYearFromLevel(level);
          const instructor = getCourseInstructor(course);

          return {
            id: courseId,
            course: getCourseName(course),
            courseCode: getCourseCode(course),
            instructor: instructor,
            studentsCount: studentsArray.length,
            year: year,
            level: level,
            enrolledStudents: studentsArray
              .map((s) => getStudentId(s))
              .filter(Boolean),
            studentsData: studentsArray,
          };
        } catch (err) {
          console.error(`Error fetching students for course ${courseId}:`, err);
          return null;
        }
      });
      const results = await Promise.all(enrollmentsPromises);
      setCurrentEnrollments(results.filter((r) => r !== null));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [coursesList]);

  // جلب الطلاب المؤهلين للتسجيل
  const fetchEligibleStudents = async (courseId) => {
    setLoadingStudents(true);
    try {
      const courseIdNumber = Number(courseId);
      console.log("Fetching eligible students for course ID:", courseIdNumber);
      const response = await getEligibleStudents(courseIdNumber);

      let students = [];
      const data = response?.data || response;

      if (Array.isArray(data)) {
        students = data;
      } else if (data?.data && Array.isArray(data.data)) {
        students = data.data;
      } else if (data?.items && Array.isArray(data.items)) {
        students = data.items;
      } else if (data?.$values && Array.isArray(data.$values)) {
        students = data.$values;
      } else {
        students = [];
      }

      console.log(
        "Eligible students sample:",
        students.slice(0, 3).map((s) => ({
          id: getStudentId(s),
          name: getStudentName(s),
          year: getStudentYear(s),
          major: getStudentMajor(s),
        })),
      );

      setEligibleStudents(students);
    } catch (error) {
      console.error(error);
      setEnrollError(error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // عرض الطلاب المسجلين في مادة
  const handleViewCourseStudents = async (courseId, courseName) => {
    setSelectedCourseForView({ id: courseId, name: courseName });
    setLoadingCourseStudents(true);
    try {
      const response = await getCourseStudents(courseId);
      console.log(`View: Raw response for course ${courseId}:`, response);

      let students = [];
      const data = response?.data || response;

      if (Array.isArray(data)) {
        students = data;
      } else if (data?.data && Array.isArray(data.data)) {
        students = data.data;
      } else if (data?.items && Array.isArray(data.items)) {
        students = data.items;
      } else if (data?.$values && Array.isArray(data.$values)) {
        students = data.$values;
      } else {
        students = [];
      }

      console.log(
        `View: Extracted ${students.length} students for ${courseName}`,
      );
      setCourseStudentsList(students);
      setShowStudentsModal(true);
    } catch (error) {
      console.error("Error fetching course students:", error);
      setEnrollError(error.message);
    } finally {
      setLoadingCourseStudents(false);
    }
  };

  // حذف طالب من مادة
  const handleRemoveStudent = async (courseId, studentId) => {
    if (!courseId || !studentId) return;
    try {
      await removeStudentFromCourse(courseId, studentId);
      await fetchAllEnrollments();
      if (selectedCourseForView?.id === courseId) {
        const updated = await getCourseStudents(courseId);
        let students = [];
        const data = updated?.data || updated;
        if (Array.isArray(data)) students = data;
        else if (data?.data) students = data.data;
        setCourseStudentsList(students);
      }
    } catch (error) {
      console.error(error);
      setEnrollError(error.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCoursesLookup();
    setRefreshing(false);
  };

  const handleOpenEnrollModal = () => {
    setEnrollCourse("");
    setEnrollError("");
    setStudentSearchTerm("");
    setStudentYearFilter("");
    setStudentMajorFilter("");
    setSelectedStudents([]);
    setCurrentCourseForEnrollment("");
    setEligibleStudents([]);
    setShowEnrollModal(true);
  };

  const handleCloseEnrollModal = () => {
    setShowEnrollModal(false);
    setEnrollCourse("");
    setEnrollError("");
    setStudentSearchTerm("");
    setStudentYearFilter("");
    setStudentMajorFilter("");
    setSelectedStudents([]);
    setCurrentCourseForEnrollment("");
    setEligibleStudents([]);
  };

  const handleProceedToStudentSelection = async () => {
    if (!enrollCourse) {
      setEnrollError("Please select a course.");
      return;
    }
    const courseIdNumber = Number(enrollCourse);
    console.log("Selected course ID (numeric):", courseIdNumber);

    setEnrollError("");
    setCurrentCourseForEnrollment(courseIdNumber);
    await fetchEligibleStudents(courseIdNumber);
  };

  // تصفية الطلاب
  const filteredStudents = eligibleStudents.filter((student) => {
    const studentId = getStudentId(student)?.toString() || "";
    const studentName = getStudentName(student).toLowerCase();
    const studentYearRaw = getStudentYear(student);
    const studentMajor = getStudentMajor(student);

    const studentYearNum = extractYearNumber(studentYearRaw);
    const filterYearNum = extractYearNumber(studentYearFilter);

    const matchesSearch =
      studentName.includes(studentSearchTerm.toLowerCase()) ||
      studentId.includes(studentSearchTerm);
    const matchesYear = !studentYearFilter || studentYearNum === filterYearNum;
    const matchesMajor =
      !studentMajorFilter || studentMajor === studentMajorFilter;

    return matchesSearch && matchesYear && matchesMajor;
  });

  const isStudentEnrolled = (studentId) => {
    const courseEnrollment = currentEnrollments.find(
      (item) => item.id?.toString() === enrollCourse?.toString(),
    );
    return courseEnrollment?.enrolledStudents?.includes(studentId) || false;
  };

  const toggleStudentSelection = (studentId) => {
    if (!studentId) return;
    if (isStudentEnrolled(studentId)) return;
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const toggleSelectAll = () => {
    const availableStudents = filteredStudents.filter((s) => {
      const sid = getStudentId(s);
      return !isStudentEnrolled(sid);
    });
    const availableIds = availableStudents
      .map((s) => getStudentId(s))
      .filter(Boolean);
    if (
      selectedStudents.length === availableIds.length &&
      availableIds.length > 0
    ) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableIds);
    }
  };

  const handleConfirmEnrollment = async () => {
    console.log("=== Enrollment Debug ===");
    console.log("Course ID being used:", enrollCourse);
    console.log("Selected student IDs:", selectedStudents);

    if (selectedStudents.length === 0) {
      setEnrollError("Please select at least one student.");
      return;
    }

    const courseIdNumber = Number(enrollCourse);
    console.log("Enrolling with course ID (numeric):", courseIdNumber);

    setLoading(true);
    try {
      await bulkEnrollStudents(courseIdNumber, selectedStudents);
      console.log("Enrollment successful!");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchAllEnrollments();
      if (selectedCourseForView?.id === courseIdNumber) {
        await handleViewCourseStudents(courseIdNumber, getCurrentCourseName());
      }
      handleCloseEnrollModal();
    } catch (error) {
      console.error("Error enrolling students:", error);
      setEnrollError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCourseSelection = () => {
    setCurrentCourseForEnrollment("");
    setStudentSearchTerm("");
    setStudentYearFilter("");
    setStudentMajorFilter("");
    setSelectedStudents([]);
    setEligibleStudents([]);
  };

  const isAllSelected = () => {
    const availableStudents = filteredStudents.filter((s) => {
      const sid = getStudentId(s);
      return !isStudentEnrolled(sid);
    });
    const availableIds = availableStudents
      .map((s) => getStudentId(s))
      .filter(Boolean);
    return (
      availableIds.length > 0 && selectedStudents.length === availableIds.length
    );
  };

  const filteredEnrollments = currentEnrollments.filter(
    (item) =>
      item.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCurrentCourseName = () => {
    if (!coursesList.length || !enrollCourse) return "";
    const course = coursesList.find(
      (c) => getCourseId(c)?.toString() === enrollCourse?.toString(),
    );
    return getCourseName(course);
  };

  useEffect(() => {
    fetchCoursesLookup();
  }, []);

  useEffect(() => {
    if (coursesList.length > 0) fetchAllEnrollments();
  }, [coursesList, fetchAllEnrollments]);

  return (
    <div className="enrollment-page-wrap">
      <header className="enrollment-page-head">
        <h2 className="enrollment-page-title">Enrollment Management</h2>
        <p className="enrollment-page-subtitle">
          Manage course enrollments and assignments.
        </p>
      </header>

      <section className="enrollment-table-card">
        <div className="enrollment-table-header">
          <h3>Current Enrollments</h3>
          <div className="enrollment-actions">
            <label className="enrollment-search-shell">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
            </label>
            <button
              className="enrollment-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FontAwesomeIcon icon={faRefresh} spin={refreshing} /> Refresh
            </button>
            <button
              className="enrollment-add-btn"
              onClick={handleOpenEnrollModal}
            >
              <FontAwesomeIcon icon={faPlus} /> Enroll Students
            </button>
          </div>
        </div>
        <div className="enrollment-table-scroll">
          <table className="enrollment-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Enrolled Students</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="enrollment-empty-row">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading...
                  </td>
                </tr>
              ) : filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.courseCode ? `${item.courseCode} - ` : ""}
                      {item.course}
                    </td>
                    <td>{item.instructor}</td>
                    <td>
                      <span className="students-count-badge">
                        {item.studentsCount} student
                        {item.studentsCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>{item.year}</td>
                    <td>
                      <button
                        className="enrollment-view-btn"
                        onClick={() =>
                          handleViewCourseStudents(item.id, item.course)
                        }
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="enrollment-empty-row">
                    No enrollments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal عرض الطلاب المسجلين */}
      <Modal
        show={showStudentsModal}
        onHide={() => setShowStudentsModal(false)}
        centered
        size="lg"
        dialogClassName="app-modal students-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
            Enrolled Students - {selectedCourseForView?.name}
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                handleViewCourseStudents(
                  selectedCourseForView?.id,
                  selectedCourseForView?.name,
                )
              }
              style={{ color: "white", marginLeft: "12px" }}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </Button>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCourseStudents ? (
            <div className="text-center p-4">
              <FontAwesomeIcon icon={faSpinner} spin /> Loading...
            </div>
          ) : courseStudentsList.length === 0 ? (
            <div className="text-center p-4">
              No students enrolled in this course.
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Major</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courseStudentsList.map((student) => {
                  const sid = getStudentId(student);
                  return (
                    <tr key={sid}>
                      <td>{sid}</td>
                      <td>{getStudentName(student)}</td>
                      <td>{getStudentYear(student) || "-"}</td>
                      <td>{getStudentMajor(student) || "-"}</td>
                      <td>
                        <button
                          className="enrollment-remove-btn"
                          onClick={() =>
                            handleRemoveStudent(selectedCourseForView?.id, sid)
                          }
                        >
                          <FontAwesomeIcon icon={faTrashCan} /> Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowStudentsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal اختيار المادة للتسجيل */}
      <Modal
        show={showEnrollModal && !currentCourseForEnrollment}
        onHide={handleCloseEnrollModal}
        centered
        dialogClassName="app-modal enroll-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserGraduate} /> Enroll Students
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="app-modal-form">
            <Form.Group className="mb-3">
              <Form.Label>Select Course</Form.Label>
              <Form.Select
                value={enrollCourse}
                onChange={(e) => setEnrollCourse(e.target.value)}
              >
                <option value="">Choose a course</option>
                {coursesList.map((course) => {
                  const cid = getCourseId(course);
                  const code = getCourseCode(course);
                  const name = getCourseName(course);
                  return (
                    <option key={cid} value={cid}>
                      {code ? `${code} - ` : ""}
                      {name}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            {enrollError && <Alert variant="danger">{enrollError}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEnrollModal}>
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </Button>
          <Button variant="success" onClick={handleProceedToStudentSelection}>
            <FontAwesomeIcon icon={faCheck} /> Next: Select Students
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal اختيار الطلاب للتسجيل */}
      <Modal
        show={showEnrollModal && !!currentCourseForEnrollment}
        onHide={handleCloseEnrollModal}
        centered
        size="lg"
        dialogClassName="app-modal students-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserGraduate} /> Enroll Students -{" "}
            {getCurrentCourseName()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="students-filters">
            <div className="students-search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="text"
                placeholder="Search..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters-row">
              <select
                className="filter-select"
                value={studentYearFilter}
                onChange={(e) => setStudentYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <select
                className="filter-select"
                value={studentMajorFilter}
                onChange={(e) => setStudentMajorFilter(e.target.value)}
              >
                <option value="">All Majors</option>
                <option>Computer Science</option>
                <option>Information Systems</option>
                <option>Information Technology</option>
              </select>
            </div>
          </div>
          <div className="students-table-container">
            {loadingStudents ? (
              <div className="text-center p-4">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading...
              </div>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={isAllSelected()}
                        onChange={toggleSelectAll}
                        disabled={
                          filteredStudents.filter(
                            (s) => !isStudentEnrolled(getStudentId(s)),
                          ).length === 0
                        }
                      />
                    </th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Year</th>
                    <th>Major</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const sid = getStudentId(student);
                      const already = isStudentEnrolled(sid);
                      return (
                        <tr
                          key={sid}
                          className={already ? "already-enrolled" : ""}
                        >
                          <td className="checkbox-col">
                            <input
                              type="checkbox"
                              checked={
                                selectedStudents.includes(sid) || already
                              }
                              onChange={() => toggleStudentSelection(sid)}
                              disabled={already}
                            />
                          </td>
                          <td>{sid}</td>
                          <td>{getStudentName(student)}</td>
                          <td>{getStudentYear(student) || "-"}</td>
                          <td>{getStudentMajor(student) || "-"}</td>
                          <td>
                            {already ? (
                              <span className="enrolled-badge">Enrolled</span>
                            ) : (
                              <span className="available-badge">Available</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-students">
                        No students found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="selected-summary">
            <strong>{selectedStudents.length}</strong> student(s) selected
          </div>
          {enrollError && (
            <Alert variant="danger" className="mt-2">
              {enrollError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleBackToCourseSelection}>
            <FontAwesomeIcon icon={faTimes} /> Back
          </Button>
          <Button variant="secondary" onClick={handleCloseEnrollModal}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmEnrollment}
            disabled={selectedStudents.length === 0 || loading}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faCheck} />
            )}{" "}
            Enroll Selected ({selectedStudents.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EnrollmentPage;
