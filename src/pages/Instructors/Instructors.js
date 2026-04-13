import Button from "react-bootstrap/Button";
import { Col, Container, Form, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEdit,
  faTrash,
  faEye,
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

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="instracontent">
      <h3 className="dashtext">Instructor Management</h3>

      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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

      <Modal show={showViewModal} onHide={handleCloseViewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Instructor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : selectedInstructorDetails ? (
            <div>
              <p>
                <strong>Name:</strong> {selectedInstructorDetails.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedInstructorDetails.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedInstructorDetails.phoneNumber}
              </p>
              <p>
                <strong>National ID:</strong>{" "}
                {selectedInstructorDetails.nationalId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedInstructorDetails.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailsLoading ? (
            <p>Loading details...</p>
          ) : (
            <Form>
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

      <Container>
        <Row>
          <Col lg={12}>
            <Form className="d-flex" inline onSubmit={handleSearch}>
              <Form.Control
                type="text"
                placeholder="Search instructors by name or email..."
                className="search-input-custom"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                className="add-btn-custom searchbtn"
                variant="success"
                onClick={handleOpenCreateModal}
              >
                <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Add
                Instructor
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>

      <Container>
        <Row>
          <Col>
            <Card className="instracinfo">
              <Card.Body>
                <Card.Title>Instructors List</Card.Title>
                <div className="nesa">
                  <p className="nesaph">Doctor's Profile</p>
                </div>
                <div className="listtab">
                  <Card className="instructor-table-card">
                    <Card.Body>
                      {isLoading || isFetching ? (
                        <div className="no-results">Loading instructors...</div>
                      ) : isError ? (
                        <Alert variant="danger" className="mb-0">
                          {error.message}
                        </Alert>
                      ) : (
                        <div className="custom-table-new">
                          {instructors.length > 0 ? (
                            instructors.map((instructor) => (
                              <div
                                className="table-row-new"
                                key={instructor.instructorID}
                              >
                                <div className="row-all-items">
                                  <span className="instructor-name-new">
                                    {instructor.fullName}
                                  </span>
                                  <span className="instructor-email">
                                    {instructor.email}
                                  </span>
                                  <span className="status">
                                    {instructor.isActive
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                  <div className="action-buttons-new">
                                    <button
                                      className="eyebtn"
                                      onClick={() =>
                                        handleView(instructor.instructorID)
                                      }
                                      title="View"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                      className="editbtn"
                                      onClick={() =>
                                        handleEdit(instructor.instructorID)
                                      }
                                      title="Edit"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                      className="delbtn"
                                      disabled={deleteMutation.isPending}
                                      onClick={() => handleDelete(instructor)}
                                      title="Delete"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-results">
                              No instructors found for "{searchTerm}"
                            </div>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default InstructorsPage;
