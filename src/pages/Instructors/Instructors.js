import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEdit,
  faTrash,
  faEye,
  faEnvelope,
  faPhone,
  faIdCard,
  faCircleCheck,
  faCircleXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstructor,
  deleteInstructor,
  getInstructorById,
  getInstructors,
  updateInstructor,
} from "../../services/instructors";
import { showConfirmAlert, showWarningAlert } from "../../utils/sweetAlerts";
import "./Instructors.css";

function InstructorsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    nationalId: "",
    isActive: true,
    profilePicture: null,
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    isActive: true,
    profilePicture: null,
  });

  const {
    data: instructorsResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["instructors", searchTerm],
    queryFn: () =>
      getInstructors({
        Search: searchTerm,
        PageNumber: 1,
        PageSize: 100,
      }),
  });

  const {
    data: selectedInstructorDetails,
    isLoading: isDetailsLoading,
  } = useQuery({
    queryKey: ["instructor-details", selectedInstructorId],
    queryFn: () => getInstructorById(selectedInstructorId),
    enabled: !!selectedInstructorId && (showViewModal || showEditModal),
  });

  useEffect(() => {
    if (showEditModal && selectedInstructorDetails) {
      setEditForm({
        fullName: selectedInstructorDetails.fullName || "",
        email: selectedInstructorDetails.email || "",
        phoneNumber: selectedInstructorDetails.phoneNumber || "",
        nationalId: selectedInstructorDetails.nationalId || "",
        isActive: Boolean(selectedInstructorDetails.isActive),
        profilePicture: null,
      });
    }
  }, [selectedInstructorDetails, showEditModal]);

  const createMutation = useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      handleCloseCreateModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateInstructor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-details"] });
      handleCloseEditModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });

  const instructors = instructorsResponse?.data || [];

  const handleOpenCreateModal = () => setShowCreateModal(true);

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      nationalId: "",
      isActive: true,
      profilePicture: null,
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedInstructorId(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedInstructorId(null);
    setEditForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      isActive: true,
      profilePicture: null,
    });
  };

  const handleCreateInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const handleAddInstructor = () => {
    if (
      !createForm.fullName ||
      !createForm.email ||
      !createForm.phoneNumber ||
      !createForm.password ||
      !createForm.nationalId
    ) {
      showWarningAlert("Missing Data", "Please complete all required fields.");
      return;
    }

    createMutation.mutate({
      FullName: createForm.fullName,
      Email: createForm.email,
      PhoneNumber: createForm.phoneNumber,
      Password: createForm.password,
      NationalId: createForm.nationalId,
      IsActive: createForm.isActive,
      ProfilePicture: createForm.profilePicture,
    });
  };

  const handleView = (id) => {
    setSelectedInstructorId(id);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    setSelectedInstructorId(id);
    setShowEditModal(true);
  };

  const handleUpdateInstructor = () => {
    if (
      !editForm.fullName ||
      !editForm.email ||
      !editForm.phoneNumber ||
      !editForm.nationalId
    ) {
      showWarningAlert("Missing Data", "Please complete all required fields.");
      return;
    }

    updateMutation.mutate({
      id: selectedInstructorId,
      payload: {
        FullName: editForm.fullName,
        Email: editForm.email,
        PhoneNumber: editForm.phoneNumber,
        NationalId: editForm.nationalId,
        IsActive: editForm.isActive,
        ProfilePicture: editForm.profilePicture,
      },
    });
  };

  const handleDelete = async (instructor) => {
    const confirmed = await showConfirmAlert({
      title: "Delete Instructor",
      text: `Are you sure you want to delete ${instructor.fullName}?`,
      confirmText: "Delete",
    });

    if (confirmed) {
      deleteMutation.mutate(instructor.instructorID);
    }
  };

  const instructorInitials = selectedInstructorDetails?.fullName
    ? selectedInstructorDetails.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "IN";

  return (
    <div className="instructors-page-wrap">
      <header className="instructors-header">
        <h2>Instructor Management</h2>
      </header>

      {/* Modals */}
      <Modal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        centered
        dialogClassName="app-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="app-modal-form">
            <Form.Control
              name="fullName"
              placeholder="Full Name *"
              onChange={handleCreateInputChange}
              value={createForm.fullName}
              className="mb-2"
            />
            <Form.Control
              name="email"
              placeholder="Email *"
              className="mb-2"
              onChange={handleCreateInputChange}
              value={createForm.email}
            />
            <Form.Control
              name="phoneNumber"
              placeholder="Phone Number *"
              className="mb-2"
              onChange={handleCreateInputChange}
              value={createForm.phoneNumber}
            />
            <Form.Control
              name="password"
              type="password"
              placeholder="Password *"
              className="mb-2"
              onChange={handleCreateInputChange}
              value={createForm.password}
            />
            <Form.Control
              name="nationalId"
              placeholder="National ID (14 digits) *"
              className="mb-2"
              onChange={handleCreateInputChange}
              value={createForm.nationalId}
            />
            <Form.Check
              type="switch"
              id="create-is-active"
              label="Active"
              name="isActive"
              className="mb-2"
              checked={createForm.isActive}
              onChange={handleCreateInputChange}
            />
            <Form.Control
              type="file"
              name="profilePicture"
              accept="image/*"
              className="mb-2"
              onChange={handleCreateInputChange}
            />
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
            onClick={handleAddInstructor}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Add Instructor"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        centered
        dialogClassName="app-modal instructor-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Instructor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : selectedInstructorDetails ? (
            <div className="instructor-details-shell">
              <div className="instructor-details-hero">
                {selectedInstructorDetails.profilePictureUrl ? (
                  <img
                    src={selectedInstructorDetails.profilePictureUrl}
                    alt={selectedInstructorDetails.fullName || "Instructor"}
                    className="instructor-details-avatar"
                  />
                ) : (
                  <div className="instructor-details-avatar-fallback">
                    {instructorInitials}
                  </div>
                )}

                <div className="instructor-details-title-block">
                  <h4>{selectedInstructorDetails.fullName || "No Name"}</h4>
                  <span className="instructor-details-subtitle">
                    Instructor Profile Overview
                  </span>
                  <span
                    className={`instructor-status-chip ${
                      selectedInstructorDetails.isActive
                        ? "instructor-status-active"
                        : "instructor-status-inactive"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedInstructorDetails.isActive
                          ? faCircleCheck
                          : faCircleXmark
                      }
                    />
                    {selectedInstructorDetails.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="instructor-details-grid">
                <article className="instructor-detail-card">
                  <span className="instructor-detail-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <div>
                    <p>Email Address</p>
                    <h6>{selectedInstructorDetails.email || "-"}</h6>
                  </div>
                </article>

                <article className="instructor-detail-card">
                  <span className="instructor-detail-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                  <div>
                    <p>Phone Number</p>
                    <h6>{selectedInstructorDetails.phoneNumber || "-"}</h6>
                  </div>
                </article>

                <article className="instructor-detail-card instructor-detail-card-wide">
                  <span className="instructor-detail-icon">
                    <FontAwesomeIcon icon={faIdCard} />
                  </span>
                  <div>
                    <p>National ID</p>
                    <h6>{selectedInstructorDetails.nationalId || "-"}</h6>
                  </div>
                </article>
              </div>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        dialogClassName="app-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : (
            <Form className="app-modal-form">
              <Form.Control
                name="fullName"
                placeholder="Full Name *"
                onChange={handleEditInputChange}
                value={editForm.fullName}
                className="mb-2"
              />
              <Form.Control
                name="email"
                placeholder="Email *"
                className="mb-2"
                onChange={handleEditInputChange}
                value={editForm.email}
              />
              <Form.Control
                name="phoneNumber"
                placeholder="Phone Number *"
                className="mb-2"
                onChange={handleEditInputChange}
                value={editForm.phoneNumber}
              />
              <Form.Control
                name="nationalId"
                placeholder="National ID (14 digits) *"
                className="mb-2"
                onChange={handleEditInputChange}
                value={editForm.nationalId}
              />
              <Form.Check
                type="switch"
                id="edit-is-active"
                label="Active"
                name="isActive"
                className="mb-2"
                checked={editForm.isActive}
                onChange={handleEditInputChange}
              />
              <Form.Control
                type="file"
                name="profilePicture"
                accept="image/*"
                className="mb-2"
                onChange={handleEditInputChange}
              />
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
            onClick={handleUpdateInstructor}
            disabled={updateMutation.isPending || isDetailsLoading}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toolbar */}
      <div className="instructors-toolbar">
        <div className="instructors-search-shell">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search instructors by name or email..."
          />
        </div>

        <button
          type="button"
          className="instructors-add-btn"
          onClick={handleOpenCreateModal}
        >
          <FontAwesomeIcon icon={faUserPlus} /> Add Instructor
        </button>
      </div>

      {/* Table */}
      <section className="instructors-table-card">
        <h3>Instructors List</h3>

        <div className="instructors-table-scroll">
          <table className="instructors-table">
            <thead>
              <tr>
                <th>Instructor Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td className="instructors-empty-state" colSpan="5">
                    Loading instructors...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="5">
                    <Alert variant="danger" className="mb-0">
                      {error.message}
                    </Alert>
                  </td>
                </tr>
              ) : instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <tr key={instructor.instructorID}>
                    <td className="instructor-name">
                      <div className="instructor-name-wrap">
                        <span className="avatar-pill">
                          {instructor.fullName?.charAt(0).toUpperCase()}
                        </span>
                        <span>{instructor.fullName}</span>
                      </div>
                    </td>
                    <td className="instructor-email">{instructor.email}</td>
                    <td>{instructor.phoneNumber || "—"}</td>
                    <td>
                      <span className={`status-pill ${instructor.isActive ? "status-active" : "status-inactive"}`}>
                        {instructor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="instructor-action-icons">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleView(instructor.instructorID)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(instructor.instructorID)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(instructor)}
                          disabled={deleteMutation.isPending}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="instructors-empty-state" colSpan="5">
                    {searchTerm ? `No instructors match "${searchTerm}".` : "No instructors found"}
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

export default InstructorsPage;