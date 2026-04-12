import Button from "react-bootstrap/Button";
import { Col, Container, Form, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEdit,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./Instructors.css";

function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    status: "Active",
  });
  const [instructors, setInstructors] = useState([
    {
      id: 1,
      name: "Ahmed Alamer",
      email: "a.alamer@fcai.edu.eg",
      status: "Active",
      department: "Computer Science",
    },
    {
      id: 2,
      name: "Sara Mohamed",
      email: "sara.mohamed@fcai.edu.eg",
      status: "Inactive",
      department: "AI",
    },
    {
      id: 3,
      name: "Mostafa Adel",
      email: "adel.mostafa@fcai.edu.eg",
      status: "Active",
      department: "Information Systems",
    },
    {
      id: 4,
      name: "Nada Ibrahim",
      email: "nada.ibrahim@fcai.edu.eg",
      status: "Active",
      department: "Computer Science",
    },
  ]);

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setNewInstructor({
      name: "",
      email: "",
      password: "",
      department: "",
      status: "Active",
    });
  };

  const handleInputChange = (e) => {
    setNewInstructor({ ...newInstructor, [e.target.name]: e.target.value });
  };

  const handleAddInstructor = () => {
    if (
      !newInstructor.name ||
      !newInstructor.email ||
      !newInstructor.password
    ) {
      alert("Please fill in all required fields (Name, Email, Password)");
      return;
    }
    const newId =
      instructors.length > 0
        ? Math.max(...instructors.map((i) => i.id)) + 1
        : 1;
    setInstructors([
      ...instructors,
      {
        id: newId,
        name: newInstructor.name,
        email: newInstructor.email,
        status: newInstructor.status,
        department: newInstructor.department || "Not specified",
      },
    ]);
    handleCloseModal();
  };

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleView = (instructor) => {
    alert(
      `Viewing: ${instructor.name}\nEmail: ${instructor.email}\nDepartment: ${instructor.department}\nStatus: ${instructor.status}`,
    );
  };

  const handleEdit = (instructor) => {
    alert(`Edit: ${instructor.name}`);
  };

  const handleDelete = (instructor) => {
    if (window.confirm(`Are you sure you want to delete ${instructor.name}?`)) {
      setInstructors(instructors.filter((i) => i.id !== instructor.id));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="instracontent">
      <h3 className="dashtext">Instructor Management</h3>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="name"
              placeholder="Full Name *"
              onChange={handleInputChange}
              value={newInstructor.name}
              className="mb-2"
            />
            <Form.Control
              name="email"
              placeholder="Email *"
              className="mb-2"
              onChange={handleInputChange}
              value={newInstructor.email}
            />
            <Form.Control
              name="password"
              type="password"
              placeholder="Password *"
              className="mb-2"
              onChange={handleInputChange}
              value={newInstructor.password}
            />
            <Form.Control
              name="department"
              placeholder="Department"
              className="mb-2"
              onChange={handleInputChange}
              value={newInstructor.department}
            />
            <Form.Select
              name="status"
              className="mb-2"
              onChange={handleInputChange}
              value={newInstructor.status}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddInstructor}>
            Add Instructor
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
                onClick={handleOpenModal}
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
                      <div className="custom-table-new">
                        {filteredInstructors.length > 0 ? (
                          filteredInstructors.map((instructor) => (
                            <div className="table-row-new" key={instructor.id}>
                              <div className="row-all-items">
                                <span className="instructor-name-new">
                                  {instructor.name}
                                </span>
                                <span className="instructor-dept-new">
                                  {instructor.department}
                                </span>
                                <span className="instructor-email">
                                  {instructor.email}
                                </span>
                                <span className="status">
                                  {instructor.status}
                                </span>
                                <div className="action-buttons-new">
                                  <button
                                    className="eyebtn"
                                    onClick={() => handleView(instructor)}
                                    title="View"
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                  <button
                                    className="editbtn"
                                    onClick={() => handleEdit(instructor)}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    className="delbtn"
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
