import { useEffect, useMemo, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPen,
  faPlus,
  faRotateRight,
  faClock,
  faQrcode,
  faCalendarDay,
  faUsers,
  faBookOpen,
  faLayerGroup,
  faCircle,
  faChevronRight,
  faChevronLeft,
  faSearch,
  faXmark,
  faCheckCircle,
  faArrowRight,
  faGraduationCap,
  faBolt,
  faEye,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";

const buildQrUrl = (payload) => {
  const value = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${value}&bgcolor=ffffff&color=1a1a2e&qzone=2`;
};

// ─── Utility sub-components ───────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    live: { label: "Live", cls: "status-live" },
    Active: { label: "Active", cls: "status-live" },
    scheduled: { label: "Scheduled", cls: "status-scheduled" },
    Scheduled: { label: "Scheduled", cls: "status-scheduled" },
    completed: { label: "Ended", cls: "status-ended" },
    Completed: { label: "Completed", cls: "status-ended" },
    Draft: { label: "Draft", cls: "status-draft" },
    Archived: { label: "Archived", cls: "status-draft" },
  };
  const s = map[status] || { label: status || "Unknown", cls: "status-draft" };
  return <span className={`ic-status-badge ${s.cls}`}>{s.label}</span>;
}

function AttendancePie({ rate }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = ((rate || 0) / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="ic-pie">
      <circle cx="22" cy="22" r={r} strokeWidth="4" className="ic-pie-bg" />
      <circle
        cx="22"
        cy="22"
        r={r}
        strokeWidth="4"
        className="ic-pie-fill"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
      />
      <text x="22" y="26" textAnchor="middle" className="ic-pie-text">
        {rate || 0}%
      </text>
    </svg>
  );
}

// ─── STEP 1: Courses Grid ─────────────────────────────────────────────────────

function CoursesGrid({
  courses,
  coursesMeta,
  query,
  selectedCourseId,
  coursesState,
  actionState,
  onQueryChange,
  onPageChange,
  onSelectCourse,
  onCourseAction,
  sessionDuration,
  setSessionDuration,
}) {
  return (
    <div className="ic-panel" id="ic-courses-panel">
      {/* Header */}
      <div className="ic-panel-header">
        <div className="ic-panel-title-group">
          <div className="ic-panel-icon">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div>
            <h2 className="ic-panel-title">My Courses</h2>
            <p className="ic-panel-sub">Select a course to manage its lectures and sessions</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ic-toolbar">
        <div className="ic-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="ic-search-icon" />
          <input
            type="search"
            className="ic-search-input"
            placeholder="Search by name or code…"
            value={query.search}
            onChange={(e) => onQueryChange({ search: e.target.value, page: 1 })}
          />
        </div>
        <select
          className="ic-select"
          value={query.status}
          onChange={(e) => onQueryChange({ status: e.target.value, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>
        <select
          className="ic-select"
          value={query.semester}
          onChange={(e) => onQueryChange({ semester: e.target.value, page: 1 })}
        >
          <option value="">All Semesters</option>
          <option value="First">First</option>
          <option value="Second">Second</option>
          <option value="Summer">Summer</option>
        </select>
        <select
          className="ic-select"
          value={`${query.sortBy}:${query.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(":");
            onQueryChange({ sortBy, order });
          }}
        >
          <option value="name:asc">Name A→Z</option>
          <option value="name:desc">Name Z→A</option>
          <option value="studentsCount:desc">Most Students</option>
          <option value="attendanceRate:desc">Best Attendance</option>
        </select>
      </div>

      {/* Grid */}
      <DataStateView
        loading={coursesState.loading}
        error={coursesState.error}
        isEmpty={(courses || []).length === 0}
        emptyMessage="No courses match your current filters."
      >
        <div className="ic-courses-grid">
          {(courses || []).map((course) => {
            const isSelected = selectedCourseId === course.id;
            return (
              <article
                key={course.id}
                className={`ic-course-card${isSelected ? " selected" : ""}`}
                onClick={() => onSelectCourse(course.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectCourse(course.id);
                }}
                id={`course-card-${course.id}`}
              >
                {/* Card glow accent */}
                <div className="ic-card-glow" />

                <div className="ic-course-card-top">
                  <div className="ic-course-avatar">
                    {(course.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <StatusBadge status={course.status} />
                </div>

                <div className="ic-course-card-body">
                  <h3 className="ic-course-name">{course.name}</h3>
                  <p className="ic-course-code">{course.code || "—"}</p>

                  <div className="ic-course-meta">
                    <span className="ic-meta-chip">
                      <FontAwesomeIcon icon={faLayerGroup} />
                      {course.semester || "N/A"}
                    </span>
                    <span className="ic-meta-chip">
                      <FontAwesomeIcon icon={faUsers} />
                      {course.studentsCount || 0} students
                    </span>
                  </div>
                </div>

                <div className="ic-course-card-footer">
                  <AttendancePie rate={course.attendanceRate} />
                  <button
                    className={`ic-cta-btn${isSelected ? " active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course.id);
                    }}
                    id={`open-course-${course.id}`}
                  >
                    {isSelected ? (
                      <>Opened <FontAwesomeIcon icon={faCheckCircle} /></>
                    ) : (
                      <>View Course <FontAwesomeIcon icon={faChevronRight} /></>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <DataPagination meta={coursesMeta} onPageChange={onPageChange} />
      </DataStateView>

      {(actionState.error || actionState.success) && (
        <Alert
          className="mt-3 mb-0 ic-feedback-alert"
          variant={actionState.error ? "danger" : "success"}
        >
          {actionState.error || actionState.success}
        </Alert>
      )}
    </div>
  );
}

// ─── STEP 2: Lectures Panel ───────────────────────────────────────────────────

function LectureRow({ lecture, isSelected, onSelect, onEdit }) {
  const statusClass =
    lecture.status === "live"
      ? "lec-live"
      : lecture.status === "scheduled"
      ? "lec-scheduled"
      : "lec-ended";

  return (
    <div
      className={`ic-lecture-row${isSelected ? " selected" : ""} ${statusClass}`}
      onClick={() => onSelect(lecture.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(lecture.id);
      }}
      id={`lecture-row-${lecture.id}`}
    >
      <div className="ic-lec-status-dot" />
      <div className="ic-lec-info">
        <span className="ic-lec-title">{lecture.title || `Lecture ${lecture.id}`}</span>
        <span className="ic-lec-meta">
          {lecture.date && (
            <><FontAwesomeIcon icon={faCalendarDay} /> {lecture.date}</>
          )}
          {lecture.startTime && (
            <><FontAwesomeIcon icon={faClock} /> {lecture.startTime}</>
          )}
          {lecture.location && (
            <><FontAwesomeIcon icon={faBookOpen} /> {lecture.location}</>
          )}
        </span>
      </div>
      <div className="ic-lec-actions">
        <StatusBadge status={lecture.status} />
        <button
          className="ic-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(lecture);
          }}
          title="Edit lecture"
          id={`edit-lecture-${lecture.id}`}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
        <FontAwesomeIcon icon={faChevronRight} className="ic-lec-chevron" />
      </div>
    </div>
  );
}

function LectureFormModal({ form, actionState, onChange, onSave, onClose }) {
  const isCreation = form.mode === "add";
  const busy = actionState.busy === (isCreation ? "lecture-create" : "lecture-update");
  const error = actionState.error && (actionState.busy === (isCreation ? "lecture-create" : "lecture-update") || !actionState.busy) ? actionState.error : "";

  return (
    <div className="ic-modal-overlay" onClick={onClose} id="lecture-form-modal">
      <div
        className="ic-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lec-form-title"
      >
        <div className="ic-modal-header">
          <h3 id="lec-form-title" className="ic-modal-title">
            {isCreation ? (
              <><FontAwesomeIcon icon={faPlus} /> Add New Lecture</>
            ) : (
              <><FontAwesomeIcon icon={faPen} /> Edit Lecture</>
            )}
          </h3>
          <button className="ic-modal-close" onClick={onClose} id="close-lecture-modal">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="ic-modal-body" onSubmit={onSave}>
          {error && (
            <Alert variant="danger" className="py-2 mb-3 small">
              {error}
            </Alert>
          )}
          <div className="ic-field-group">
            <label className="ic-label">Lecture Title *</label>
            <input
              className="ic-input"
              placeholder="e.g. Introduction to Algorithms"
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
              autoFocus
              id="lecture-title-input"
            />
          </div>
          <div className="ic-field-row">
            <div className="ic-field-group">
              <label className="ic-label">Date</label>
              <input
                type="date"
                className="ic-input"
                value={form.date}
                onChange={(e) => onChange({ date: e.target.value })}
                id="lecture-date-input"
              />
            </div>
            <div className="ic-field-group">
              <label className="ic-label">Start Time</label>
              <input
                type="time"
                className="ic-input"
                value={form.startTime}
                onChange={(e) => onChange({ startTime: e.target.value })}
                id="lecture-time-input"
              />
            </div>
          </div>
          <div className="ic-field-group">
            <label className="ic-label">Location</label>
            <input
              className="ic-input"
              placeholder="e.g. Hall B – Room 201"
              value={form.location}
              onChange={(e) => onChange({ location: e.target.value })}
              id="lecture-location-input"
            />
          </div>
          <div className="ic-modal-footer">
            <button type="button" className="ic-btn-ghost" onClick={onClose} id="cancel-lecture-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              className="ic-btn-primary" 
              id="save-lecture-btn"
              disabled={busy}
            >
              {busy ? (
                <>Saving... <FontAwesomeIcon icon={faRotateRight} className="fa-spin ms-1" /></>
              ) : isCreation ? (
                "Save Lecture"
              ) : (
                "Update Lecture"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LecturesPanel({
  course,
  filteredLectures,
  selectedLecture,
  lectureSearch,
  lectureFilter,
  lectureForm,
  courseDetailsState,
  actionState,
  onBack,
  onSelectLecture,
  setLectureSearch,
  setLectureFilter,
  onSessionFilter,
  openAddLectureForm,
  openEditLectureForm,
  saveLectureForm,
  resetLectureForm,
  setLectureFormField,
}) {
  return (
    <div className="ic-panel" id="ic-lectures-panel">
      {/* Header */}
      <div className="ic-panel-header">
        <div className="ic-panel-title-group">
          <button className="ic-back-btn" onClick={onBack} id="back-to-courses-btn">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="ic-panel-icon secondary">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <div>
            <h2 className="ic-panel-title">{course?.name}</h2>
            <p className="ic-panel-sub">
              <span className="ic-label-chip">{course?.code}</span>
              {course?.semester && <span className="ic-label-chip">{course.semester}</span>}
            </p>
          </div>
        </div>
        <button
          className="ic-btn-primary"
          onClick={openAddLectureForm}
          id="add-lecture-btn"
        >
          <FontAwesomeIcon icon={faPlus} /> Add Lecture
        </button>
      </div>

      {/* Toolbar */}
      <div className="ic-toolbar ic-lectures-toolbar">
        <div className="ic-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="ic-search-icon" />
          <input
            type="search"
            className="ic-search-input"
            placeholder="Search lectures…"
            value={lectureSearch}
            onChange={(e) => setLectureSearch(e.target.value)}
            id="lecture-search-input"
          />
        </div>
        <select
          className="ic-select"
          value={lectureFilter}
          onChange={(e) => {
            setLectureFilter(e.target.value);
            onSessionFilter(e.target.value);
          }}
          id="lecture-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="live">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Ended</option>
        </select>
      </div>

      {/* List */}
      <DataStateView
        loading={courseDetailsState.loading}
        error={courseDetailsState.error}
        isEmpty={filteredLectures.length === 0}
        emptyMessage="No lectures yet. Click '+ Add Lecture' to create your first one."
      >
        <div className="ic-lectures-list" id="ic-lectures-list">
          {filteredLectures.map((lecture) => (
            <LectureRow
              key={lecture.id}
              lecture={lecture}
              isSelected={selectedLecture?.id === lecture.id}
              onSelect={onSelectLecture}
              onEdit={openEditLectureForm}
            />
          ))}
        </div>
      </DataStateView>

      {/* Lecture form modal */}
      {lectureForm.open && (
        <LectureFormModal
          form={lectureForm}
          actionState={actionState}
          onChange={setLectureFormField}
          onSave={saveLectureForm}
          onClose={resetLectureForm}
        />
      )}
    </div>
  );
}

// ─── STEP 3: Session & QR Panel ───────────────────────────────────────────────

function SessionQrPanel({
  lecture,
  course,
  sessionDuration,
  setSessionDuration,
  qrRefreshSeconds,
  setQrRefreshSeconds,
  timeLeft,
  qrImageUrl,
  actionState,
  students,
  onStartSession,
  onReopenSession,
  onEndSession,
  onEditLecture,
  onBack,
}) {
  const isLive = lecture?.status === "live";

  return (
    <div className="ic-panel" id="ic-session-panel">
      {/* Header */}
      <div className="ic-panel-header">
        <div className="ic-panel-title-group">
          <button className="ic-back-btn" onClick={onBack} id="back-to-lectures-btn">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className={`ic-panel-icon${isLive ? " live" : ""}`}>
            <FontAwesomeIcon icon={faQrcode} />
          </div>
          <div>
            <h2 className="ic-panel-title">{lecture?.title || "Session"}</h2>
            <p className="ic-panel-sub">
              {course?.name}
              {lecture?.date && (
                <span className="ic-label-chip ms-1">
                  <FontAwesomeIcon icon={faCalendarDay} /> {lecture.date}
                </span>
              )}
              {lecture?.startTime && (
                <span className="ic-label-chip ms-1">
                  <FontAwesomeIcon icon={faClock} /> {lecture.startTime}
                </span>
              )}
            </p>
          </div>
          <div className="ms-auto">
            <span className={`ic-session-pill${isLive ? " live" : ""}`}>
              <span className="ic-live-dot" />
              {isLive ? "Session Active" : "No Active Session"}
            </span>
          </div>
        </div>
      </div>

      <div className="ic-session-layout">
        {/* LEFT: QR Code */}
        <div className="ic-qr-zone">
          <div className={`ic-qr-card${isLive ? " live" : ""}`} id="qr-code-display">
            <div className="ic-qr-inner">
              <img
                src={qrImageUrl}
                alt="Attendance QR Code"
                className={`ic-qr-img${isLive ? " pulse" : " dimmed"}`}
              />
              {!isLive && (
                <div className="ic-qr-overlay">
                  <FontAwesomeIcon icon={faBolt} />
                  <span>Start session to activate QR</span>
                </div>
              )}
            </div>

            <div className="ic-qr-footer">
              <div className="ic-qr-label">
                <FontAwesomeIcon icon={faQrcode} />
                Lecture Session QR
              </div>
              <span className="ic-qr-id">{lecture?.id}</span>
            </div>
          </div>

          {isLive && (
            <div className="ic-qr-refresh-note">
              <FontAwesomeIcon icon={faRotateRight} className="spin-slow" />
              QR refreshes in {timeLeft}s
            </div>
          )}
        </div>

        {/* RIGHT: Controls */}
        <div className="ic-session-controls">
          {/* Session settings */}
          <div className="ic-control-card" id="session-settings-card">
            <h4 className="ic-control-card-title">Session Settings</h4>
            <div className="ic-settings-grid">
              <div className="ic-field-group">
                <label className="ic-label">
                  <FontAwesomeIcon icon={faClock} /> Duration
                </label>
                <select
                  className="ic-select"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  id="session-duration-select"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              <div className="ic-field-group">
                <label className="ic-label">
                  <FontAwesomeIcon icon={faRotateRight} /> QR Refresh
                </label>
                <select
                  className="ic-select"
                  value={qrRefreshSeconds}
                  onChange={(e) => setQrRefreshSeconds(Number(e.target.value))}
                  id="qr-refresh-select"
                >
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session actions */}
          <div className="ic-control-card" id="session-actions-card">
            <h4 className="ic-control-card-title">Session Control</h4>
            <div className="ic-session-action-btn-group">
              <button
                className="ic-start-btn"
                onClick={() => onStartSession(lecture?.id)}
                disabled={
                  !lecture?.id ||
                  actionState.busy === `course-${lecture?.courseId}-create-session`
                }
                id="start-session-btn"
              >
                <FontAwesomeIcon icon={faPlay} />
                Start Session
              </button>
              <button
                className="ic-reopen-btn"
                onClick={() => onReopenSession(lecture?.id)}
                disabled={
                  !lecture?.id ||
                  actionState.busy === `course-${lecture?.courseId}-reopen-session`
                }
                id="reopen-session-btn"
              >
                <FontAwesomeIcon icon={faRotateRight} />
                Reopen
              </button>
              {isLive && (
                <button
                  className="ic-end-btn"
                  onClick={() => onEndSession(lecture?.id)}
                  disabled={
                    !lecture?.id ||
                    actionState.busy === `course-${lecture?.courseId}-end-session`
                  }
                  id="end-session-btn"
                >
                  <FontAwesomeIcon icon={faStopCircle} />
                  End Session
                </button>
              )}
              <button
                className="ic-edit-btn"
                onClick={() => onEditLecture(lecture)}
                id="edit-lecture-details-btn"
              >
                <FontAwesomeIcon icon={faPen} />
                Edit Lecture
              </button>
            </div>
          </div>

          {/* Session info */}
          <div className="ic-control-card" id="session-info-card">
            <h4 className="ic-control-card-title">Session Info</h4>
            <ul className="ic-info-list">
              <li>
                <span className="ic-info-key">Status</span>
                <StatusBadge status={lecture?.status} />
              </li>
              <li>
                <span className="ic-info-key">Lecture ID</span>
                <span className="ic-info-val">{lecture?.id}</span>
              </li>
              <li>
                <span className="ic-info-key">Duration</span>
                <span className="ic-info-val">{sessionDuration} min</span>
              </li>
              <li>
                <span className="ic-info-key">QR Cycle</span>
                <span className="ic-info-val">{qrRefreshSeconds}s</span>
              </li>
              {lecture?.location && (
                <li>
                  <span className="ic-info-key">Location</span>
                  <span className="ic-info-val">{lecture.location}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Students preview */}
          {(students || []).length > 0 && (
            <div className="ic-control-card" id="students-preview-card">
              <h4 className="ic-control-card-title">
                <FontAwesomeIcon icon={faUsers} /> Students Preview
              </h4>
              <ul className="ic-students-list">
                {(students || []).slice(0, 6).map((s) => (
                  <li key={s.id} className="ic-student-row">
                    <div className="ic-student-avatar">
                      {(s.fullName || "?").charAt(0)}
                    </div>
                    <span className="ic-student-name">{s.fullName}</span>
                    <span
                      className={`ic-student-status ${
                        s.status === "Present"
                          ? "present"
                          : s.status === "Late"
                          ? "late"
                          : "absent"
                      }`}
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {(actionState.error || actionState.success) && (
        <Alert
          className="ic-feedback-alert mt-3 mb-0"
          variant={actionState.error ? "danger" : "success"}
        >
          {actionState.error || actionState.success}
        </Alert>
      )}
    </div>
  );
}

// ─── Flow Breadcrumb ──────────────────────────────────────────────────────────

function FlowBreadcrumb({ step, courseName, lectureName }) {
  return (
    <div className="ic-breadcrumb" id="ic-flow-breadcrumb">
      <span className={`ic-bc-step${step === 1 ? " active" : " done"}`}>
        <span className="ic-bc-num">{step > 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : "1"}</span>
        Courses
      </span>
      <FontAwesomeIcon icon={faArrowRight} className="ic-bc-sep" />
      <span
        className={`ic-bc-step${
          step === 2 ? " active" : step > 2 ? " done" : ""
        }`}
      >
        <span className="ic-bc-num">{step > 2 ? <FontAwesomeIcon icon={faCheckCircle} /> : "2"}</span>
        {step > 1 ? courseName || "Lectures" : "Lectures"}
      </span>
      <FontAwesomeIcon icon={faArrowRight} className="ic-bc-sep" />
      <span className={`ic-bc-step${step === 3 ? " active" : ""}`}>
        <span className="ic-bc-num">3</span>
        {step === 3 ? lectureName || "Session + QR" : "Session + QR"}
      </span>
    </div>
  );
}

// ─── Root CoursesTable ────────────────────────────────────────────────────────

function CoursesTable({
  courses,
  coursesMeta,
  query,
  selectedCourseId,
  students,
  sessions,
  coursesState,
  courseDetailsState,
  actionState,
  onQueryChange,
  onPageChange,
  onSelectCourse,
  onStudentsSearch,
  onSessionFilter,
  onCourseAction,
  onLectureAction,
}) {
  // Navigation step: 1 = courses, 2 = lectures, 3 = session/QR
  const [step, setStep] = useState(1);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [qrRefreshSeconds, setQrRefreshSeconds] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [qrSeed, setQrSeed] = useState(Date.now());
  const [lectureSearch, setLectureSearch] = useState("");
  const [lectureFilter, setLectureFilter] = useState("");
  const [lectureForm, setLectureForm] = useState({
    open: false,
    mode: "add",
    id: "",
    title: "",
    date: "",
    startTime: "",
    location: "",
  });

  // Derived
  const selectedCourse = useMemo(
    () => (courses || []).find((c) => c.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const mergedLectures = useMemo(() => sessions || [], [sessions]);

  const filteredLectures = useMemo(() => {
    return mergedLectures.filter((item) => {
      if (lectureFilter && item.status !== lectureFilter) return false;
      if (!lectureSearch) return true;
      const needle = lectureSearch.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(needle) ||
        (item.id || "").toLowerCase().includes(needle)
      );
    });
  }, [mergedLectures, lectureFilter, lectureSearch]);

  const selectedLecture = useMemo(
    () =>
      filteredLectures.find((l) => l.id === selectedLectureId) ||
      filteredLectures[0] ||
      null,
    [filteredLectures, selectedLectureId],
  );

  const qrPayload = `${selectedLecture?.id || selectedCourseId || "SESSION"}-${qrSeed}`;
  const qrImageUrl = buildQrUrl(qrPayload);

  // Auto-select first lecture
  useEffect(() => {
    if (!selectedLectureId && filteredLectures[0]) {
      setSelectedLectureId(filteredLectures[0].id);
    }
  }, [filteredLectures, selectedLectureId]);

  // QR auto-refresh when live + Countdown logic
  useEffect(() => {
    if (!selectedLecture || selectedLecture.status !== "live") {
      setTimeLeft(qrRefreshSeconds);
      return;
    }

    // Refresh interval
    const refreshTimer = setInterval(() => {
      setQrSeed(Date.now());
      setTimeLeft(qrRefreshSeconds);
    }, Math.max(5, Number(qrRefreshSeconds) || 15) * 1000);

    // Visual countdown interval
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => (prev > 1 ? prev - 1 : qrRefreshSeconds));
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [qrRefreshSeconds, selectedLecture]);

  // Sync timeLeft if settings change
  useEffect(() => {
    setTimeLeft(qrRefreshSeconds);
  }, [qrRefreshSeconds]);

  // Reset step when course changes
  useEffect(() => {
    if (selectedCourseId) {
      setStep(2);
      setSelectedLectureId("");
    }
  }, [selectedCourseId]);

  // Handlers
  const handleStartSession = (lectureId) => {
    onCourseAction("create-session", selectedCourseId, {
      lectureId,
      durationInMinutes: sessionDuration,
    });
  };

  const handleReopenSession = (lectureId) => {
    onCourseAction("reopen-session", selectedCourseId, {
      lectureId,
      durationInMinutes: sessionDuration,
    });
  };

  const handleEndSession = (lectureId) => {
    onCourseAction("end-session", selectedCourseId, {
      lectureId,
    });
  };

  const resetLectureForm = () =>
    setLectureForm({ open: false, mode: "add", id: "", title: "", date: "", startTime: "", location: "" });

  const openAddLectureForm = () =>
    setLectureForm({ open: true, mode: "add", id: "", title: "", date: "", startTime: "", location: "" });

  const openEditLectureForm = (lecture) =>
    setLectureForm({
      open: true,
      mode: "edit",
      id: lecture.id,
      title: lecture.title || "",
      date: lecture.date || "",
      startTime: lecture.startTime || "",
      location: lecture.location || "",
    });

  const setLectureFormField = (patch) =>
    setLectureForm((prev) => ({ ...prev, ...patch }));

  const saveLectureForm = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !lectureForm.title.trim()) return;

    if (onLectureAction) {
      const result = await onLectureAction(lectureForm.mode === "add" ? "create" : "update", {
        ...lectureForm,
        courseId: selectedCourseId,
      });
      
      // Only close if successful
      if (result) {
        resetLectureForm();
      }
    }
  };

  const handleSelectLecture = (id) => {
    setSelectedLectureId(id);
    setStep(3);
  };

  return (
    <div className="ic-workspace" id="instructor-courses-workspace">
      <FlowBreadcrumb
        step={step}
        courseName={selectedCourse?.name}
        lectureName={selectedLecture?.title}
      />

      {(actionState.error || actionState.success) && (
        <Alert
          className="mx-3 mt-3 mb-0 ic-feedback-alert"
          variant={actionState.error ? "danger" : "success"}
          dismissible
          onClose={() => {}} // Usually clearActionFeedback is needed but I can just rely on the next action clearing it
        >
          {actionState.error || actionState.success}
        </Alert>
      )}

      <div className="ic-step-container">
        {/* STEP 1 — Courses */}
        <div className={`ic-step-pane${step === 1 ? " visible" : ""}`} aria-hidden={step !== 1}>
          {step === 1 && (
            <CoursesGrid
              courses={courses}
              coursesMeta={coursesMeta}
              query={query}
              selectedCourseId={selectedCourseId}
              coursesState={coursesState}
              actionState={actionState}
              onQueryChange={onQueryChange}
              onPageChange={onPageChange}
              onSelectCourse={(id) => {
                onSelectCourse(id);
                setStep(2);
              }}
              onCourseAction={onCourseAction}
              sessionDuration={sessionDuration}
              setSessionDuration={setSessionDuration}
            />
          )}
        </div>

        {/* STEP 2 — Lectures */}
        <div className={`ic-step-pane${step === 2 ? " visible" : ""}`} aria-hidden={step !== 2}>
          {step === 2 && (
            <LecturesPanel
              course={selectedCourse}
              filteredLectures={filteredLectures}
              selectedLecture={selectedLecture}
              lectureSearch={lectureSearch}
              lectureFilter={lectureFilter}
              lectureForm={lectureForm}
              courseDetailsState={courseDetailsState}
              actionState={actionState}
              onBack={() => setStep(1)}
              onSelectLecture={handleSelectLecture}
              setLectureSearch={setLectureSearch}
              setLectureFilter={setLectureFilter}
              onSessionFilter={onSessionFilter}
              openAddLectureForm={openAddLectureForm}
              openEditLectureForm={openEditLectureForm}
              saveLectureForm={saveLectureForm}
              resetLectureForm={resetLectureForm}
              setLectureFormField={setLectureFormField}
            />
          )}
        </div>

        {/* STEP 3 — Session + QR */}
        <div className={`ic-step-pane${step === 3 ? " visible" : ""}`} aria-hidden={step !== 3}>
          {step === 3 && selectedLecture && (
            <SessionQrPanel
              lecture={selectedLecture}
              course={selectedCourse}
              sessionDuration={sessionDuration}
              setSessionDuration={setSessionDuration}
              qrRefreshSeconds={qrRefreshSeconds}
              setQrRefreshSeconds={setQrRefreshSeconds}
              timeLeft={timeLeft}
              qrImageUrl={qrImageUrl}
              actionState={actionState}
              students={students}
              onStartSession={handleStartSession}
              onReopenSession={handleReopenSession}
              onEndSession={handleEndSession}
              onEditLecture={openEditLectureForm}
              onBack={() => setStep(2)}
            />
          )}
          {step === 3 && !selectedLecture && (
            <div className="ic-panel">
              <div className="ic-empty-state">
                <FontAwesomeIcon icon={faBookOpen} className="ic-empty-icon" />
                <p>No lecture selected. Go back and pick a lecture.</p>
                <button className="ic-btn-primary" onClick={() => setStep(2)} id="back-from-empty-btn">
                  <FontAwesomeIcon icon={faChevronLeft} /> Back to Lectures
                </button>
              </div>
            </div>
          )}
          {/* Lecture edit modal available from step 3 */}
          {lectureForm.open && (
            <LectureFormModal
              form={lectureForm}
              actionState={actionState}
              onChange={setLectureFormField}
              onSave={saveLectureForm}
              onClose={resetLectureForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesTable;
