import { useMemo } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

function AttendanceRecordsTable({
  records,
  filterDate,
  filterStudent,
  onFilterDateChange,
  onFilterStudentChange,
  onViewStudent,
}) {
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesDate = !filterDate || record.date === filterDate;
      const matchesStudent =
        !filterStudent ||
        record.studentName.toLowerCase().includes(filterStudent.toLowerCase());
      return matchesDate && matchesStudent;
    });
  }, [records, filterDate, filterStudent]);

  return (
    <Card className="instructor-surface" id="attendance-records">
      <Card.Body>
        <div className="section-head">
          <h5 className="section-title">Attendance Records</h5>
          <p className="section-subtitle">Filter by date and student name</p>
        </div>

        <div className="record-filters">
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(event) => onFilterDateChange(event.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="Search by student"
            value={filterStudent}
            onChange={(event) => onFilterStudentChange(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <Table responsive hover className="instructor-table mb-0">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
                <th>Time</th>
                <th className="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No attendance records for selected filter.
                  </td>
                </tr>
              )}

              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.studentName}</td>
                  <td>
                    <Badge
                      bg={record.status === "Present" ? "success" : "secondary"}
                      className="record-badge"
                    >
                      {record.status}
                    </Badge>
                  </td>
                  <td>{record.time}</td>
                  <td className="text-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onViewStudent(record.studentName)}
                    >
                      Student Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default AttendanceRecordsTable;
