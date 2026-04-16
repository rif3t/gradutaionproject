
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEye,
  faEnvelope,
  faPhone,
  faIdCard,
  faCircleCheck,
  faCircleXmark,
  faGraduationCap,
  faArrowLeft,
  faMagnifyingGlass,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../../services/studentservcies";
import { showConfirmAlert, showWarningAlert } from "../../utils/sweetAlerts";
import "./Students.css";

function StudentsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    departmentName: "Computer Science",
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    departmentName: "Computer Science",
    isActive: true,
  });

  const yearsQueries = useQueries({
    queries: [1, 2, 3, 4].map((level) => ({
      queryKey: ["students-count", level],
      queryFn: () => getStudents({ Level: level, PageSize: 1 }),
      staleTime: 60000,
    })),
  });
  const yearsStats = [1, 2, 3, 4].map((level, index) => ({
    level,
    count: yearsQueries[index]?.data?.totalCount ?? 0,
    isLoading: yearsQueries[index]?.isLoading,
  }));
  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["students", selectedLevel, searchTerm],
    queryFn: () =>
      getStudents({
        Search: searchTerm,
        Level: selectedLevel,
        PageNumber: 1,
        PageSize: 100,
      }),
    enabled: !!selectedLevel,
  });

  const {
    data: selectedStudentDetails,
    isLoading: isDetailsLoading,
  } = useQuery({
    queryKey: ["student-details", selectedStudentId],
    queryFn: () => getStudentById(selectedStudentId),
    enabled: !!selectedStudentId && (showViewModal || showEditModal),
  });

  useEffect(() => {
    if (showEditModal && selectedStudentDetails) {
      setEditForm({
        fullName: selectedStudentDetails.fullName || "",
        email: selectedStudentDetails.email || "",
        phoneNumber: selectedStudentDetails.phoneNumber || "",
        nationalId: selectedStudentDetails.nationalId || "",
        password: "",
        departmentName: selectedStudentDetails.departmentName || "Computer Science",
        isActive: Boolean(selectedStudentDetails.isActive),
      });
    }
  }, [selectedStudentDetails, showEditModal]);

  const invalidateCounts = () => {
    queryClient.invalidateQueries({ queryKey: ["students-count"] });
  };

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      invalidateCounts();
      handleCloseCreateModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student-details"] });
      invalidateCounts();
      handleCloseEditModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      invalidateCounts();
    },
  });

  const students = studentsResponse?.students || [];

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setSearchTerm("");
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setSearchTerm("");
  };

  const handleOpenCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      password: "",
      departmentName: "Computer Science",
      isActive: true,
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStudentId(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedStudentId(null);
    setEditForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      password: "",
      departmentName: "Computer Science",
      isActive: true,
    });
  };

  const handleCreateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddStudent = () => {
    if (
      !createForm.fullName ||
      !createForm.email ||
      !createForm.phoneNumber ||
      !createForm.nationalId ||
      !createForm.password
    ) {
      showWarningAlert("Missing Data", "Please complete all required fields (including password).");
      return;
    }
    createMutation.mutate({
      fullName: createForm.fullName,
      email: createForm.email,
      phoneNumber: createForm.phoneNumber,
      nationalId: createForm.nationalId,
      password: createForm.password,
      level: selectedLevel,
      departmentName: createForm.departmentName,
      isActive: createForm.isActive,
    });
  };

  const handleView = (id) => {
    setSelectedStudentId(id);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    setSelectedStudentId(id);
    setShowEditModal(true);
  };

  const handleUpdateStudent = () => {
    if (
      !editForm.fullName ||
      !editForm.email ||
      !editForm.phoneNumber ||
      !editForm.nationalId
    ) {
      showWarningAlert("Missing Data", "Please complete all required fields.");
      return;
    }
    const payload = {
      fullName: editForm.fullName,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber,
      nationalId: editForm.nationalId,
      level: selectedStudentDetails?.level || selectedLevel,
      departmentName: editForm.departmentName,
      isActive: editForm.isActive,
    };
    if (editForm.password) {
      payload.password = editForm.password;
    }
    updateMutation.mutate({
      id: selectedStudentId,
      payload,
    });
  };

  const handleDelete = async (student) => {
    const confirmed = await showConfirmAlert({
      title: "Delete Student",
      text: `Are you sure you want to delete ${student.fullName}?`,
      confirmText: "Delete",
    });
    if (confirmed) {
      deleteMutation.mutate(student.studentId);
    }
  };

  const studentInitials = selectedStudentDetails?.fullName
    ? selectedStudentDetails.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "ST";

  if (!selectedLevel) {
    return (
      <div className="students-page-wrap">
        <header className="students-header">
          <h2>Student Management</h2>
          <p>Select an academic year to view and manage students</p>
        </header>
        <section className="years-grid">
          {yearsStats.map(({ level, count, isLoading }) => (
            <button
              key={level}
              type="button"
              className="year-card"
              onClick={() => handleLevelSelect(level)}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="year-icon" />
              <h3>
                {level === 1 ? "First" : level === 2 ? "Second" : level === 3 ? "Third" : "Fourth"} Year
              </h3>
              <p>{isLoading ? "Loading..." : `${count} student${count !== 1 ? 's' : ''}`}</p>
            </button>
          ))}
        </section>
      </div>
    );
  }
  return (
    <div className="students-page-wrap">
      <header className="students-header students-header-list">
        <div>
          <button type="button" className="back-btn" onClick={handleBackToLevels}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to years
          </button>
          <h2>
            Students -{" "}
            {selectedLevel === 1 ? "First" : selectedLevel === 2 ? "Second" : selectedLevel === 3 ? "Third" : "Fourth"} Year
          </h2>
        </div>
      </header>

      <div className="students-toolbar">
        <label className="search-shell" htmlFor="students-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            id="students-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, ID, email, or national ID"
          />
        </label>
        <button type="button" className="btn-primary" onClick={handleOpenCreateModal}>
          <FontAwesomeIcon icon={faUserPlus} /> Add Student
        </button>
      </div>

      <section className="students-table-card">
        <h3>Students List</h3>
        {isLoading || isFetching ? (
          <div className="loading-spinner">Loading...</div>
        ) : isError ? (
          <Alert variant="danger">{error.message}</Alert>
        ) : (
          <div className="table-scroll">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>National ID</th>
                  {selectedLevel === 4 && <th>Department</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.studentId}>
                      <td className="student-id">{student.studentId}</td>
                      <td>
                        <div className="student-name-wrap">
                          <span className="avatar-pill">{student.fullName?.charAt(0).toUpperCase()}</span>
                          <span>{student.fullName}</span>
                        </div>
                      </td>
                      <td className="student-email">{student.email}</td>
                      <td>{student.phoneNumber || "—"}</td>
                      <td>{student.nationalId || "—"}</td>
                      {selectedLevel === 4 && <td>{student.departmentName || "—"}</td>}
                      <td>
                        <span className={`status-pill ${student.isActive ? "status-active" : "status-inactive"}`}>
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button type="button" title="View" onClick={() => handleView(student.studentId)}>
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button type="button" title="Edit" onClick={() => handleEdit(student.studentId)}>
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button type="button" title="Delete" onClick={() => handleDelete(student)}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedLevel === 4 ? 8 : 7} className="empty-state">
                      {searchTerm ? `No students match "${searchTerm}".` : "No students found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* المودالات كما هي (لم تتغير) */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered dialogClassName="app-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add New Student - Year {selectedLevel}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="app-modal-form">
            <Form.Control name="fullName" placeholder="Full Name *" onChange={handleCreateInputChange} value={createForm.fullName} className="mb-2" />
            <Form.Control name="email" placeholder="Email *" onChange={handleCreateInputChange} value={createForm.email} className="mb-2" />
            <Form.Control name="phoneNumber" placeholder="Phone Number *" onChange={handleCreateInputChange} value={createForm.phoneNumber} className="mb-2" />
            <Form.Control name="nationalId" placeholder="National ID (14 digits) *" onChange={handleCreateInputChange} value={createForm.nationalId} className="mb-2" />
            <Form.Control name="password" type="password" placeholder="Password *" onChange={handleCreateInputChange} value={createForm.password} className="mb-2" />
            <Form.Select name="departmentName" onChange={handleCreateInputChange} value={createForm.departmentName} className="mb-2">
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Information Technology">Information Technology</option>
            </Form.Select>
            <Form.Check type="switch" label="Active" name="isActive" checked={createForm.isActive} onChange={handleCreateInputChange} className="mb-2" />
            {createMutation.isError && <Alert variant="danger">{createMutation.error.message}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>Cancel</Button>
          <Button variant="success" onClick={handleAddStudent} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add Student"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={handleCloseViewModal} centered dialogClassName="app-modal instructor-details-modal">
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? <p>Loading details...</p> : selectedStudentDetails ? (
            <div className="instructor-details-shell">
              <div className="instructor-details-hero">
                <div className="instructor-details-avatar-fallback">{studentInitials}</div>
                <div className="instructor-details-title-block">
                  <h4>{selectedStudentDetails.fullName}</h4>
                  <span className="instructor-details-subtitle">Student Profile</span>
                  <span className={`instructor-status-chip ${selectedStudentDetails.isActive ? "instructor-status-active" : "instructor-status-inactive"}`}>
                    <FontAwesomeIcon icon={selectedStudentDetails.isActive ? faCircleCheck : faCircleXmark} />
                    {selectedStudentDetails.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="instructor-details-grid">
                <div className="instructor-detail-card">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <div><p>Email</p><h6>{selectedStudentDetails.email}</h6></div>
                </div>
                <div className="instructor-detail-card">
                  <FontAwesomeIcon icon={faPhone} />
                  <div><p>Phone</p><h6>{selectedStudentDetails.phoneNumber}</h6></div>
                </div>
                <div className="instructor-detail-card">
                  <FontAwesomeIcon icon={faIdCard} />
                  <div><p>National ID</p><h6>{selectedStudentDetails.nationalId}</h6></div>
                </div>
                <div className="instructor-detail-card">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <div><p>Year / Dept</p><h6>Year {selectedStudentDetails.level} - {selectedStudentDetails.departmentName}</h6></div>
                </div>
              </div>
            </div>
          ) : <p>No details available.</p>}
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered dialogClassName="app-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? <p>Loading...</p> : (
            <Form className="app-modal-form">
              <Form.Control name="fullName" placeholder="Full Name *" onChange={handleEditInputChange} value={editForm.fullName} className="mb-2" />
              <Form.Control name="email" placeholder="Email *" onChange={handleEditInputChange} value={editForm.email} className="mb-2" />
              <Form.Control name="phoneNumber" placeholder="Phone Number *" onChange={handleEditInputChange} value={editForm.phoneNumber} className="mb-2" />
              <Form.Control name="nationalId" placeholder="National ID *" onChange={handleEditInputChange} value={editForm.nationalId} className="mb-2" />
              <Form.Control name="password" type="password" placeholder="New Password (leave blank to keep current)" onChange={handleEditInputChange} value={editForm.password} className="mb-2" />
              <Form.Select name="departmentName" onChange={handleEditInputChange} value={editForm.departmentName} className="mb-2">
                <option value="Computer Science">Computer Science</option>
                <option value="Information Systems">Information Systems</option>
                <option value="Information Technology">Information Technology</option>
              </Form.Select>
              <Form.Check type="switch" label="Active" name="isActive" checked={editForm.isActive} onChange={handleEditInputChange} />
              {updateMutation.isError && <Alert variant="danger">{updateMutation.error.message}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Cancel</Button>
          <Button variant="success" onClick={handleUpdateStudent} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentsPage;