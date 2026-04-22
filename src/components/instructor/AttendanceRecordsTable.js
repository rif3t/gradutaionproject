import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faCircleCheck,
  faCircleXmark,
  faSearch,
  faChevronRight,
  faChevronLeft,
  faArrowRight,
  faGraduationCap,
  faBookOpen,
  faCalendarDay,
  faClock,
  faUsers,
  faLayerGroup,
  faFilter,
  faSort,
  faCheckCircle,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faDownload,
  faAngleUp,
  faAngleDown,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";
import { instructorDashboardApi } from "../../services/instructorDashboardApi";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(raw) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    Present:  { cls: "ar-status-present",  icon: faUserCheck,  label: "Present" },
    Absent:   { cls: "ar-status-absent",   icon: faUserTimes,  label: "Absent"  },
    Late:     { cls: "ar-status-late",     icon: faUserClock,  label: "Late"    },
    Excused:  { cls: "ar-status-excused",  icon: faUserClock,  label: "Excused" },
    live:     { cls: "ar-lec-live",        icon: faCheckCircle,label: "Live"    },
    scheduled:{ cls: "ar-lec-scheduled",   icon: faClock,      label: "Sched."  },
    completed:{ cls: "ar-lec-ended",       icon: faCircleCheck,label: "Ended"   },
    Active:   { cls: "ar-lec-live",        icon: faCheckCircle,label: "Active"  },
  };
  const s = map[status] || { cls: "ar-status-absent", icon: faFilter, label: status || "—" };
  return (
    <span className={`ar-status-chip ${s.cls}`}>
      <FontAwesomeIcon icon={s.icon} />
      {s.label}
    </span>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function ARBreadcrumb({ step, courseName, lectureName }) {
  return (
    <div className="ar-breadcrumb" id="ar-breadcrumb">
      <span className={`ar-bc-step${step === 1 ? " active" : " done"}`}>
        <span className="ar-bc-num">
          {step > 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : "1"}
        </span>
        Courses
      </span>
      <FontAwesomeIcon icon={faArrowRight} className="ar-bc-sep" />
      <span className={`ar-bc-step${step === 2 ? " active" : step > 2 ? " done" : ""}`}>
        <span className="ar-bc-num">
          {step > 2 ? <FontAwesomeIcon icon={faCheckCircle} /> : "2"}
        </span>
        {step > 1 && courseName ? courseName : "Lectures"}
      </span>
      <FontAwesomeIcon icon={faArrowRight} className="ar-bc-sep" />
      <span className={`ar-bc-step${step === 3 ? " active" : ""}`}>
        <span className="ar-bc-num">3</span>
        {step === 3 && lectureName ? lectureName : "Attendance"}
      </span>
    </div>
  );
}

// ─── STEP 1 ── Courses Grid ───────────────────────────────────────────────────
function ARCoursesStep({ courses, coursesLoading, coursesError, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const nd = search.toLowerCase();
    return courses.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(nd) ||
        (c.code || "").toLowerCase().includes(nd),
    );
  }, [courses, search]);

  return (
    <div className="ar-panel" id="ar-courses-panel">
      <div className="ar-panel-header">
        <div className="ar-panel-title-group">
          <div className="ar-panel-icon">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div>
            <h2 className="ar-panel-title">Select a Course</h2>
            <p className="ar-panel-sub">Choose a course to view its lectures</p>
          </div>
        </div>
      </div>

      <div className="ar-toolbar">
        <div className="ar-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="ar-search-icon" />
          <input
            className="ar-search-input"
            type="search"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="ar-course-search"
          />
        </div>
      </div>

      <div className="ar-panel-body">
        <DataStateView
          loading={coursesLoading}
          error={coursesError}
          isEmpty={filtered.length === 0}
          emptyMessage="No courses found."
        >
          <div className="ar-courses-grid">
            {filtered.map((course) => (
              <article
                key={course.id}
                className="ar-course-card"
                onClick={() => onSelect(course)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(course);
                }}
                id={`ar-course-${course.id}`}
              >
                <div className="ar-card-accent" />
                <div className="ar-course-card-top">
                  <div className="ar-course-avatar">
                    {(course.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <StatusChip status={course.status} />
                </div>
                <div className="ar-course-card-body">
                  <h3 className="ar-course-name">{course.name}</h3>
                  <p className="ar-course-code">{course.code || "—"}</p>
                  <div className="ar-course-meta">
                    <span className="ar-meta-chip">
                      <FontAwesomeIcon icon={faLayerGroup} />
                      {course.semester || "N/A"}
                    </span>
                    <span className="ar-meta-chip">
                      <FontAwesomeIcon icon={faUsers} />
                      {course.studentsCount || 0} students
                    </span>
                  </div>
                </div>
                <div className="ar-course-card-footer">
                  <button
                    className="ar-view-btn"
                    onClick={(e) => { e.stopPropagation(); onSelect(course); }}
                    id={`ar-open-course-${course.id}`}
                  >
                    View Lectures
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </DataStateView>
      </div>
    </div>
  );
}

// ─── STEP 2 ── Lectures List ──────────────────────────────────────────────────
function ARLecturesStep({ course, lectures, loading, error, onSelect, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    return lectures.filter((lec) => {
      if (filter && lec.status !== filter) return false;
      if (!search.trim()) return true;
      const nd = search.toLowerCase();
      return (
        (lec.title || "").toLowerCase().includes(nd) ||
        (lec.date || "").includes(nd)
      );
    });
  }, [lectures, search, filter]);

  return (
    <div className="ar-panel" id="ar-lectures-panel">
      <div className="ar-panel-header">
        <div className="ar-panel-title-group">
          <button className="ar-back-btn" onClick={onBack} id="ar-back-to-courses">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="ar-panel-icon secondary">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <div>
            <h2 className="ar-panel-title">{course.name}</h2>
            <p className="ar-panel-sub">
              <span className="ar-label-chip">{course.code}</span>
              {course.semester && (
                <span className="ar-label-chip">{course.semester}</span>
              )}
              &nbsp;— Select a lecture to view its attendance
            </p>
          </div>
        </div>
      </div>

      <div className="ar-toolbar">
        <div className="ar-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="ar-search-icon" />
          <input
            className="ar-search-input"
            type="search"
            placeholder="Search lectures…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="ar-lecture-search"
          />
        </div>
        <select
          className="ar-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          id="ar-lecture-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="live">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Ended</option>
        </select>
      </div>

      <div className="ar-panel-body">
        <DataStateView
          loading={loading}
          error={error}
          isEmpty={filtered.length === 0}
          emptyMessage="No lectures found for this course."
        >
          <div className="ar-lectures-list" id="ar-lectures-list">
            {filtered.map((lec) => (
              <div
                key={lec.id}
                className={`ar-lecture-row ar-lec-type-${lec.status}`}
                onClick={() => onSelect(lec)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(lec);
                }}
                id={`ar-lecture-${lec.id}`}
              >
                <div className="ar-lec-bar" />
                <div className="ar-lec-dot" />
                <div className="ar-lec-info">
                  <span className="ar-lec-title">
                    {lec.title || `Lecture ${lec.id}`}
                  </span>
                  <span className="ar-lec-meta">
                    {lec.date && (
                      <>
                        <FontAwesomeIcon icon={faCalendarDay} />
                        {fmtDate(lec.date)}
                      </>
                    )}
                    {lec.startTime && (
                      <>
                        <FontAwesomeIcon icon={faClock} />
                        {lec.startTime}
                      </>
                    )}
                    {lec.location && (
                      <>
                        <FontAwesomeIcon icon={faBookOpen} />
                        {lec.location}
                      </>
                    )}
                  </span>
                </div>
                <div className="ar-lec-right">
                  <StatusChip status={lec.status} />
                  <button
                    className="ar-view-btn"
                    onClick={(e) => { e.stopPropagation(); onSelect(lec); }}
                    id={`ar-open-lecture-${lec.id}`}
                  >
                    Attendance
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DataStateView>
      </div>
    </div>
  );
}

// ─── STEP 3 ── Attendance Table ───────────────────────────────────────────────
const SORT_FIELDS = ["studentName", "date", "status", "time"];

function ARAttendanceStep({
  records,
  summary,
  query,
  meta,
  state,
  actionState,
  course,
  lecture,
  onFilterChange,
  onPageChange,
  onSortChange,
  onBulkAction,
  onReview,
  onExport,
  onBack,
}) {
  const [sortField, setSortField]   = useState(query.sortBy || "date");
  const [sortOrder, setSortOrder]   = useState(query.order  || "desc");
  const [search,    setSearch]      = useState(query.search || "");
  const [status,    setStatus]      = useState(query.status || "");
  const [dateFrom,  setDateFrom]    = useState(query.from || "");
  const [dateTo,    setDateTo]      = useState(query.to   || "");

  const applyFilter = useCallback(
    (patch) => onFilterChange({ search, status, from: dateFrom, to: dateTo, sortBy: sortField, order: sortOrder, page: 1, ...patch }),
    [onFilterChange, search, status, dateFrom, dateTo, sortField, sortOrder],
  );

  const toggleSort = (field) => {
    const next = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(next);
    onSortChange(field, next);
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField) return <FontAwesomeIcon icon={faSort} className="ar-sort-inactive" />;
    return sortOrder === "asc"
      ? <FontAwesomeIcon icon={faAngleUp} className="ar-sort-active" />
      : <FontAwesomeIcon icon={faAngleDown} className="ar-sort-active" />;
  };

  // summary stats
  const present  = summary?.present        || 0;
  const absent   = summary?.absent         || 0;
  const late     = summary?.late           || 0;
  const rate     = summary?.attendanceRate || 0;

  return (
    <div className="ar-panel" id="ar-attendance-panel">
      {/* ── Header ── */}
      <div className="ar-panel-header">
        <div className="ar-panel-title-group">
          <button className="ar-back-btn" onClick={onBack} id="ar-back-to-lectures">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="ar-panel-icon tertiary">
            <FontAwesomeIcon icon={faListUl} />
          </div>
          <div>
            <h2 className="ar-panel-title">
              {lecture?.title || "Attendance Records"}
            </h2>
            <p className="ar-panel-sub">
              {course?.name && <span className="ar-label-chip">{course.name}</span>}
              {lecture?.date && (
                <span className="ar-label-chip">
                  <FontAwesomeIcon icon={faCalendarDay} /> {fmtDate(lecture.date)}
                </span>
              )}
              {lecture?.startTime && (
                <span className="ar-label-chip">
                  <FontAwesomeIcon icon={faClock} /> {lecture.startTime}
                </span>
              )}
            </p>
          </div>
          <div className="ar-export-group ms-auto">
            <button
              className="ar-export-btn"
              onClick={() => onExport("csv")}
              id="ar-export-csv"
            >
              <FontAwesomeIcon icon={faFileCsv} /> CSV
            </button>
            <button
              className="ar-export-btn"
              onClick={() => onExport("xlsx")}
              id="ar-export-xlsx"
            >
              <FontAwesomeIcon icon={faFileExcel} /> XLSX
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="ar-summary-row">
        <div className="ar-stat-card present">
          <div className="ar-stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div>
            <p className="ar-stat-label">Present</p>
            <h3 className="ar-stat-val">{present}</h3>
          </div>
        </div>
        <div className="ar-stat-card absent">
          <div className="ar-stat-icon">
            <FontAwesomeIcon icon={faUserTimes} />
          </div>
          <div>
            <p className="ar-stat-label">Absent</p>
            <h3 className="ar-stat-val">{absent}</h3>
          </div>
        </div>
        <div className="ar-stat-card late">
          <div className="ar-stat-icon">
            <FontAwesomeIcon icon={faUserClock} />
          </div>
          <div>
            <p className="ar-stat-label">Late</p>
            <h3 className="ar-stat-val">{late}</h3>
          </div>
        </div>
        <div className="ar-stat-card rate">
          <div className="ar-stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div>
            <p className="ar-stat-label">Attendance Rate</p>
            <h3 className="ar-stat-val">{rate}%</h3>
          </div>
          {/* mini bar */}
          <div className="ar-rate-bar-track">
            <div className="ar-rate-bar-fill" style={{ width: `${Math.min(100, rate)}%` }} />
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="ar-filters-row">
        <div className="ar-search-wrap flex-1">
          <FontAwesomeIcon icon={faSearch} className="ar-search-icon" />
          <input
            className="ar-search-input"
            type="search"
            placeholder="Search by student name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilter({ search: e.target.value });
            }}
            id="ar-student-search"
          />
        </div>
        <select
          className="ar-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            applyFilter({ status: e.target.value });
          }}
          id="ar-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Excused">Excused</option>
        </select>
        <input
          type="date"
          className="ar-select"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            applyFilter({ from: e.target.value });
          }}
          id="ar-date-from"
          title="From date"
        />
        <input
          type="date"
          className="ar-select"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            applyFilter({ to: e.target.value });
          }}
          id="ar-date-to"
          title="To date"
        />
        <select
          className="ar-select"
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [f, o] = e.target.value.split(":");
            setSortField(f); setSortOrder(o);
            onSortChange(f, o);
          }}
          id="ar-sort-select"
        >
          <option value="date:desc">Date (Latest)</option>
          <option value="date:asc">Date (Oldest)</option>
          <option value="studentName:asc">Name A→Z</option>
          <option value="studentName:desc">Name Z→A</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="ar-panel-body">
        <DataStateView
          loading={state.loading}
          error={state.error}
          isEmpty={(records || []).length === 0}
          emptyMessage="No attendance records for the current filters."
        >
          <>
            <div className="ar-table-wrap">
              <table className="ar-table" id="ar-attendance-table">
                <thead>
                  <tr>
                    <th className="ar-th-avatar" />
                    <th
                      className="ar-th-sortable"
                      onClick={() => toggleSort("studentName")}
                    >
                      Student <SortIcon field="studentName" />
                    </th>
                    <th>Student ID</th>
                    <th
                      className="ar-th-sortable"
                      onClick={() => toggleSort("status")}
                    >
                      Status <SortIcon field="status" />
                    </th>
                    <th
                      className="ar-th-sortable"
                      onClick={() => toggleSort("date")}
                    >
                      Date <SortIcon field="date" />
                    </th>
                    <th
                      className="ar-th-sortable"
                      onClick={() => toggleSort("time")}
                    >
                      Check-in <SortIcon field="time" />
                    </th>
                    <th className="ar-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(records || []).map((record, idx) => (
                    <tr
                      key={record.id}
                      className={`ar-tr ar-tr-${(record.status || "").toLowerCase()}`}
                      style={{ animationDelay: `${idx * 28}ms` }}
                    >
                      <td>
                        <div className="ar-student-avatar">
                          {initials(record.studentName)}
                        </div>
                      </td>
                      <td>
                        <span className="ar-student-name">
                          {record.studentName || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="ar-student-id">{record.studentId || record.sessionId || "—"}</span>
                      </td>
                      <td>
                        <StatusChip status={record.status} />
                      </td>
                      <td>
                        <span className="ar-date-val">{fmtDate(record.date)}</span>
                      </td>
                      <td>
                        <span className="ar-time-val">{record.time || "—"}</span>
                      </td>
                      <td>
                        <div className="ar-row-actions">
                          <button
                            className="ar-action-btn approve"
                            onClick={() => onReview(record.id, "approve")}
                            title="Approve"
                            id={`ar-approve-${record.id}`}
                          >
                            <FontAwesomeIcon icon={faCircleCheck} />
                          </button>
                          <button
                            className="ar-action-btn reject"
                            onClick={() => onReview(record.id, "reject")}
                            title="Reject"
                            id={`ar-reject-${record.id}`}
                          >
                            <FontAwesomeIcon icon={faCircleXmark} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ar-table-footer">
              <div className="ar-bulk-group">
                <button
                  className="ar-bulk-btn"
                  onClick={() => onBulkAction("post")}
                  id="ar-bulk-add"
                >
                  Bulk Add
                </button>
                <button
                  className="ar-bulk-btn"
                  onClick={() => onBulkAction("patch")}
                  id="ar-bulk-update"
                >
                  Bulk Update
                </button>
                <button
                  className="ar-bulk-btn danger"
                  onClick={() => onBulkAction("delete")}
                  id="ar-bulk-delete"
                >
                  Bulk Delete
                </button>
              </div>
              <DataPagination meta={meta} onPageChange={onPageChange} />
            </div>
          </>
        </DataStateView>
      </div>

      {(actionState?.error || actionState?.success) && (
        <Alert
          className="ar-feedback-alert mx-4 mb-4"
          variant={actionState.error ? "danger" : "success"}
        >
          {actionState.error || actionState.success}
        </Alert>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
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
  // step: 1=courses 2=lectures 3=attendance
  const [step,           setStep]           = useState(1);
  const [courses,        setCourses]        = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError,   setCoursesError]   = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lectures,       setLectures]       = useState([]);
  const [lecLoading,     setLecLoading]     = useState(false);
  const [lecError,       setLecError]       = useState("");
  const [selectedLecture,setSelectedLecture]= useState(null);

  // Load courses once
  useEffect(() => {
    setCoursesLoading(true);
    setCoursesError("");
    instructorDashboardApi
      .getCourses({ page: 1, limit: 50 })
      .then((res) => setCourses(res.items || []))
      .catch((err) => setCoursesError(err.message || "Failed to load courses."))
      .finally(() => setCoursesLoading(false));
  }, []);

  const handleSelectCourse = useCallback((course) => {
    setSelectedCourse(course);
    setLectures([]);
    setLecError("");
    setLecLoading(true);
    setStep(2);

    instructorDashboardApi
      .getCourseSessions(course.id, { page: 1, limit: 50 })
      .then((res) => setLectures(res.items || []))
      .catch((err) => setLecError(err.message || "Failed to load lectures."))
      .finally(() => setLecLoading(false));
  }, []);

  const handleSelectLecture = useCallback(
    (lecture) => {
      setSelectedLecture(lecture);
      setStep(3);
      // Trigger attendance load filtered by courseId + sessionId
      onFilterChange({
        courseId: selectedCourse?.id || "",
        sessionId: lecture.id,
        page: 1,
      });
    },
    [onFilterChange, selectedCourse],
  );

  const handleBackToCourses = () => {
    setStep(1);
    setSelectedCourse(null);
    setSelectedLecture(null);
  };

  const handleBackToLectures = () => {
    setStep(2);
    setSelectedLecture(null);
  };

  return (
    <div className="ar-workspace" id="attendance-records-workspace">
      <ARBreadcrumb
        step={step}
        courseName={selectedCourse?.name}
        lectureName={selectedLecture?.title}
      />

      <div className="ar-step-container">
        {/* STEP 1 */}
        <div className={`ar-step-pane${step === 1 ? " visible" : ""}`} aria-hidden={step !== 1}>
          {step === 1 && (
            <ARCoursesStep
              courses={courses}
              coursesLoading={coursesLoading}
              coursesError={coursesError}
              onSelect={handleSelectCourse}
            />
          )}
        </div>

        {/* STEP 2 */}
        <div className={`ar-step-pane${step === 2 ? " visible" : ""}`} aria-hidden={step !== 2}>
          {step === 2 && (
            <ARLecturesStep
              course={selectedCourse}
              lectures={lectures}
              loading={lecLoading}
              error={lecError}
              onSelect={handleSelectLecture}
              onBack={handleBackToCourses}
            />
          )}
        </div>

        {/* STEP 3 */}
        <div className={`ar-step-pane${step === 3 ? " visible" : ""}`} aria-hidden={step !== 3}>
          {step === 3 && (
            <ARAttendanceStep
              records={records}
              summary={summary}
              query={query}
              meta={meta}
              state={state}
              actionState={actionState}
              course={selectedCourse}
              lecture={selectedLecture}
              onFilterChange={onFilterChange}
              onPageChange={onPageChange}
              onSortChange={onSortChange}
              onBulkAction={onBulkAction}
              onReview={onReview}
              onExport={onExport}
              onBack={handleBackToLectures}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceRecordsTable;
