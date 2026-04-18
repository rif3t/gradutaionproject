import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

function AttendanceRecordsTable({
  records,
  summary,
  query,
  meta,
  state,
  actionState,
  onFilterChange,
  onPageChange,
  onSortChange,
  onBulkAction,
  onReview,
  onExport,
}) {
  return (
    <Card className="instructor-surface" id="attendance-records">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">Attendance Records</h5>
          <p className="section-subtitle">
            GET /instructor/attendance-records + summary, bulk, review, export
            actions
          </p>
        </div>

        <div className="summary-grid mb-3">
          <div className="live-box present">
            <p>Present</p>
            <h4>{summary.present || 0}</h4>
          </div>
          <div className="live-box absent">
            <p>Absent</p>
            <h4>{summary.absent || 0}</h4>
          </div>
          <div className="live-box percent">
            <p>Rate</p>
            <h4>{summary.attendanceRate || 0}%</h4>
          </div>
        </div>

        <Row className="g-2 record-filters">
          <Col lg={3}>
            <Form.Control
              type="search"
              placeholder="Search student"
              value={query.search}
              onChange={(event) =>
                onFilterChange({ search: event.target.value, page: 1 })
              }
            />
          </Col>
          <Col lg={2}>
            <Form.Control
              type="date"
              value={query.from}
              onChange={(event) =>
                onFilterChange({ from: event.target.value, page: 1 })
              }
            />
          </Col>
          <Col lg={2}>
            <Form.Control
              type="date"
              value={query.to}
              onChange={(event) =>
                onFilterChange({ to: event.target.value, page: 1 })
              }
            />
          </Col>
          <Col lg={2}>
            <Form.Select
              value={query.status}
              onChange={(event) =>
                onFilterChange({ status: event.target.value, page: 1 })
              }
            >
              <option value="">All statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </Form.Select>
          </Col>
          <Col lg={3}>
            <Form.Select
              value={`${query.sortBy}:${query.order}`}
              onChange={(event) => {
                const [sortBy, order] = event.target.value.split(":");
                onSortChange(sortBy, order);
              }}
            >
              <option value="date:desc">Date (Latest)</option>
              <option value="date:asc">Date (Oldest)</option>
              <option value="studentName:asc">Student (A-Z)</option>
              <option value="studentName:desc">Student (Z-A)</option>
            </Form.Select>
          </Col>
        </Row>

        <DataStateView
          loading={state.loading}
          error={state.error}
          isEmpty={records.length === 0}
          emptyMessage="No attendance records for current filters."
        >
          <>
            <div className="table-wrap mt-3">
              <Table responsive hover className="instructor-table mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Session</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.studentName}</td>
                      <td>{record.courseCode}</td>
                      <td>{record.sessionId}</td>
                      <td>
                        <Badge
                          bg={
                            record.status === "Present"
                              ? "success"
                              : "secondary"
                          }
                          className="record-badge"
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td>
                        <span>{record.date}</span>
                        <p className="mb-0 text-muted small">{record.time}</p>
                      </td>
                      <td className="text-end">
                        <div className="actions-inline">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => onReview(record.id, "approve")}
                          >
                            <FontAwesomeIcon icon={faCircleCheck} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => onReview(record.id, "reject")}
                          >
                            <FontAwesomeIcon icon={faCircleXmark} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <DataPagination meta={meta} onPageChange={onPageChange} />
          </>
        </DataStateView>

        <div className="actions-bar mt-3">
          <div className="actions-inline">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onBulkAction("post")}
            >
              Bulk Add
            </Button>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onBulkAction("patch")}
            >
              Bulk Update
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => onBulkAction("delete")}
            >
              Bulk Delete
            </Button>
          </div>

          <div className="actions-inline">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => onExport("csv")}
            >
              <FontAwesomeIcon icon={faFileCsv} className="me-1" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => onExport("xlsx")}
            >
              <FontAwesomeIcon icon={faFileExcel} className="me-1" />
              Export XLSX
            </Button>
          </div>
        </div>

        {(actionState.error || actionState.success) && (
          <Alert
            className="mt-3 mb-0"
            variant={actionState.error ? "danger" : "success"}
          >
            {actionState.error || actionState.success}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default AttendanceRecordsTable;
