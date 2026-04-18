import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faEye,
  faPenToSquare,
  faTrashCan,
  faBookOpen,
  faLayerGroup,
  faCalendarDays,
  faBuildingColumns,
  faChalkboardUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
  assignInstructorToCourse,
} from "../../services/courses";
import { getInstructors } from "../../services/instructors";
import { showConfirmAlert, showWarningAlert, showSuccessAlert } from "../../utils/sweetAlerts";
import "./Courses.css";

const semesterOptions = [
  { value: 1, label: "First" },
  { value: 2, label: "Second" },
  { value: 3, label: "Summer" },
];

const getSemesterLabel = (semesterValue) => {
  const matched = semesterOptions.find(
    (option) => option.value === Number(semesterValue),
  );
  return matched ? matched.label : "-";
};

function CoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [createForm, setCreateForm] = useState({
    courseCode: "",
    courseName: "",
    level: 1,
    semester: 1,
  });
  const [editForm, setEditForm] = useState({
    courseCode: "",
    courseName: "",
    level: 1,
    semester: 1,
  });

  const {
    data: coursesResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses", search, levelFilter, semesterFilter],
    queryFn: () =>
      getCourses({
        Search: search,
        PageNumber: 1,
        PageSize: 100,
        ...(levelFilter ? { Level: Number(levelFilter) } : {}),
        ...(semesterFilter ? { Semester: Number(semesterFilter) } : {}),
      }),
  });

  const { data: selectedCourseDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["course-details", selectedCourseId],
    queryFn: () => getCourseById(selectedCourseId),
    enabled: !!selectedCourseId && (showViewModal || showEditModal),
  });

  const { data: instructorsResponse } = useQuery({
    queryKey: ["instructors"],
    queryFn: () => getInstructors({ PageSize: 100 }),
  });

  useEffect(() => {
    if (showEditModal && selectedCourseDetails) {
      setEditForm({
        courseCode: selectedCourseDetails.courseCode || "",
        courseName: selectedCourseDetails.courseName || "",
        level: Number(selectedCourseDetails.level) || 1,
        semester: Number(selectedCourseDetails.semester) || 1,
      });
    }
  }, [selectedCourseDetails, showEditModal]);

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleCloseCreateModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCourse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-details"] });
      handleCloseEditModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ courseId, instructorId }) =>
      assignInstructorToCourse(courseId, instructorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-details", selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // لتحديث الجدول
      setShowAssignModal(false);
      setSelectedInstructorId("");
      showSuccessAlert("Success", "Instructor assigned successfully.");
    },
    onError: (error) => {
      showWarningAlert("Error", error.message);
    },
  });

  const courses = coursesResponse?.data || [];

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      courseCode: "",
      courseName: "",
      level: 1,
      semester: 1,
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedCourseId(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCourseId(null);
    setEditForm({
      courseCode: "",
      courseName: "",
      level: 1,
      semester: 1,
    });
  };

  const handleCreateCourse = () => {
    if (!createForm.courseCode || !createForm.courseName) {
      showWarningAlert(
        "Missing Data",
        "Course code and course name are required.",
      );
      return;
    }

    createMutation.mutate({
      courseCode: createForm.courseCode,
      courseName: createForm.courseName,
      level: Number(createForm.level),
      semester: Number(createForm.semester),
    });
  };

  const handleUpdateCourse = () => {
    if (!editForm.courseCode || !editForm.courseName) {
      showWarningAlert(
        "Missing Data",
        "Course code and course name are required.",
      );
      return;
    }

    updateMutation.mutate({
      id: selectedCourseId,
      payload: {
        courseCode: editForm.courseCode,
        courseName: editForm.courseName,
        level: Number(editForm.level),
        semester: Number(editForm.semester),
      },
    });
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = await showConfirmAlert({
      title: "Delete Course",
      text: `Are you sure you want to delete ${course.courseCode}?`,
      confirmText: "Delete",
    });

    if (confirmed) {
      deleteMutation.mutate(course.courseId);
    }
  };

  const handleViewCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setShowViewModal(true);
  };

  const handleEditCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setShowEditModal(true);
  };
  const handleOpenAssignModal = (courseId) => {
    setSelectedCourseId(courseId);
    setShowAssignModal(true);
  };

  const handleAssignInstructor = () => {
    if (!selectedInstructorId) {
      showWarningAlert("No selection", "Please select an instructor.");
      return;
    }
    const instructorIdNumber = Number(selectedInstructorId);
    if (isNaN(instructorIdNumber) || instructorIdNumber <= 0) {
      showWarningAlert("Invalid selection", "Selected instructor ID is not valid.");
      return;
    }
    assignMutation.mutate({
      courseId: selectedCourseId,
      instructorId: instructorIdNumber,
    });
  };

  const courseBadgeText = selectedCourseDetails?.courseCode
    ? selectedCourseDetails.courseCode.slice(0, 6).toUpperCase()
    : "CRS";

  return (
    <div className="courses-page-wrap">
      <header className="courses-header">
        <h2>Course Management</h2>
      </header>
      <Modal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        centered
        dialogClassName="app-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="app-modal-form">
            <Form.Control
              className="mb-2"
              placeholder="Course Code"
              value={createForm.courseCode}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  courseCode: e.target.value,
                }))
              }
            />
            <Form.Control
              className="mb-2"
              placeholder="Course Name"
              value={createForm.courseName}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  courseName: e.target.value,
                }))
              }
            />
            <Form.Select
              className="mb-2"
              value={createForm.level}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  level: Number(e.target.value),
                }))
              }
            >
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
              <option value={4}>Level 4</option>
            </Form.Select>
            <Form.Select
              className="mb-2"
              value={createForm.semester}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  semester: Number(e.target.value),
                }))
              }
            >
              {semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} Semester
                </option>
              ))}
            </Form.Select>
            {createMutation.isError && (
              <Alert variant="danger" className="mb-0 mt-2">
                {createMutation.error.message}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCreateCourse}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Add Course"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        centered
        dialogClassName="app-modal course-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Course Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : selectedCourseDetails ? (
            <div className="course-details-shell">
              <div className="course-details-hero">
                <div className="course-details-badge">{courseBadgeText}</div>
                <div className="course-details-title-block">
                  <h4>
                    {selectedCourseDetails.courseName || "Untitled Course"}
                  </h4>
                  <span className="course-details-subtitle">
                    Academic Course Information
                  </span>
                </div>
              </div>

              <div className="course-details-grid">
                <article className="course-detail-card">
                  <span className="course-detail-icon">
                    <FontAwesomeIcon icon={faBookOpen} />
                  </span>
                  <div>
                    <p>Course Code</p>
                    <h6>{selectedCourseDetails.courseCode || "-"}</h6>
                  </div>
                </article>

                <article className="course-detail-card">
                  <span className="course-detail-icon">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </span>
                  <div>
                    <p>Level</p>
                    <h6>Level {selectedCourseDetails.level || "-"}</h6>
                  </div>
                </article>

                <article className="course-detail-card">
                  <span className="course-detail-icon">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </span>
                  <div>
                    <p>Semester</p>
                    <h6>{getSemesterLabel(selectedCourseDetails.semester)}</h6>
                  </div>
                </article>

                <article className="course-detail-card">
                  <span className="course-detail-icon">
                    <FontAwesomeIcon icon={faBuildingColumns} />
                  </span>
                  <div>
                    <p>Department</p>
                    <h6>{selectedCourseDetails.departmentName || "-"}</h6>
                  </div>
                </article>

                <article className="course-detail-card course-detail-card-wide">
                  <span className="course-detail-icon">
                    <FontAwesomeIcon icon={faChalkboardUser} />
                  </span>
                  <div>
                    <p>Instructor</p>
                    <h6>{selectedCourseDetails.instructorName || "-"}</h6>
                  </div>
                </article>
              </div>

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  onClick={() => setShowAssignModal(true)}
                  disabled={assignMutation.isPending}
                >
                  <FontAwesomeIcon icon={faChalkboardUser} /> Assign Instructor
                </Button>
              </div>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
      </Modal>


      <Modal
        show={showAssignModal}
        onHide={() => {
          setShowAssignModal(false);
          setSelectedInstructorId("");
          setSelectedCourseId(null);
        }}
        centered
        dialogClassName="app-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Instructor to Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedInstructorId}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
          >
            <option value="">-- Select an instructor --</option>
            {instructorsResponse?.data?.map((instructor) => {
              const idValue = instructor?.id ?? instructor?.instructorId ?? instructor?.instructorID ?? instructor?._id;
              if (!idValue) {
                console.warn("Instructor missing ID field", instructor);
                return null;
              }
              return (
                <option key={idValue} value={idValue}>
                  {instructor.fullName} {instructor.email ? `(${instructor.email})` : ""}
                </option>
              );
            })}
          </Form.Select>
          {assignMutation.isError && (
            <Alert variant="danger" className="mt-2">
              {assignMutation.error.message}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAssignModal(false);
              setSelectedInstructorId("");
              setSelectedCourseId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleAssignInstructor}
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? "Assigning..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        dialogClassName="app-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : (
            <Form className="app-modal-form">
              <Form.Control
                className="mb-2"
                placeholder="Course Code"
                value={editForm.courseCode}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    courseCode: e.target.value,
                  }))
                }
              />
              <Form.Control
                className="mb-2"
                placeholder="Course Name"
                value={editForm.courseName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    courseName: e.target.value,
                  }))
                }
              />
              <Form.Select
                className="mb-2"
                value={editForm.level}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    level: Number(e.target.value),
                  }))
                }
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
              </Form.Select>
              <Form.Select
                className="mb-2"
                value={editForm.semester}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    semester: Number(e.target.value),
                  }))
                }
              >
                {semesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} Semester
                  </option>
                ))}
              </Form.Select>
              {updateMutation.isError && (
                <Alert variant="danger" className="mb-0 mt-2">
                  {updateMutation.error.message}
                </Alert>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpdateCourse}
            disabled={updateMutation.isPending || isDetailsLoading}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>


      <div className="courses-toolbar">
        <label className="courses-search-shell" htmlFor="course-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            id="course-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code or name"
          />
        </label>

        <Form.Select
          className="courses-filter-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
          <option value="4">Level 4</option>
        </Form.Select>

        <Form.Select
          className="courses-filter-select"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
        >
          <option value="">All Semesters</option>
          {semesterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} Semester
            </option>
          ))}
        </Form.Select>

        <button
          type="button"
          className="courses-add-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Course
        </button>
      </div>

      <section className="courses-table-card">
        <h3>Courses List</h3>

        <div className="courses-table-scroll">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Semester</th>
                <th>Year</th>
                <th>Instructor</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td className="courses-empty-state" colSpan="7">
                    Loading courses...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7">
                    <Alert variant="danger" className="mb-0">
                      {error.message}
                    </Alert>
                  </td>
                </tr>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.courseId}>
                    <td className="course-code">{course.courseCode}</td>
                    <td className="course-name">{course.courseName}</td>
                    <td>
                      <span className="course-semester-pill">
                        {getSemesterLabel(course.semester)}
                      </span>
                    </td>
                    <td>Level {course.level}</td>
                    <td>{course.instructorName || "-"}</td>
                    <td className="course-students">
                      {course.departmentName || "-"}
                    </td>
                    <td>
                      <div className="course-action-icons">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleViewCourse(course.courseId)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEditCourse(course.courseId)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
  

                        <button
                          type="button"
                          title="Assign Instructor"
                          onClick={() => handleOpenAssignModal(course.courseId)}
                        >
                          <FontAwesomeIcon icon={faUserPlus} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deleteMutation.isPending}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="courses-empty-state" colSpan="7">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CoursesPage;