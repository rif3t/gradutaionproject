// ==================== CoursesTable.jsx - الكود كامل ====================

import { useEffect, useMemo, useState, useCallback } from "react";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
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
  faChevronRight,
  faChevronLeft,
  faSearch,
  faXmark,
  faCheckCircle,
  faArrowRight,
  faGraduationCap,
  faBolt,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import DataStateView from "./shared/DataStateView";
import DataPagination from "./shared/DataPagination";
import { instructorDashboardApi } from "../../services/instructorDashboardApi";

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

      <DataStateView
        loading={courseDetailsState.loading}
        error={courseDetailsState.error}
        isEmpty={filteredLectures.length === 0}
        emptyMessage=" No lectures yet. Click '+ Add Lecture' to create your first one."
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

// ─── STEP 3: Session & QR Panel (WITH ALL STUDENTS LIST) ─────────────────────────────────

function SessionQrPanel({
  lecture,
  course,
  sessionDuration,
  setSessionDuration,
  qrRefreshSeconds,
  setQrRefreshSeconds,
  timeLeft,
  displayQrUrl,
  actionState,
  students,
  onStartSession,
  onReopenSession,
  onEndSession,
  onEditLecture,
  onBack,
  qrDetails,
}) {
  const isLive = lecture?.status === "live";
  const [directQrPayload, setDirectQrPayload] = useState(null);
  const [qrKey, setQrKey] = useState(0);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Present counter states
  const [presentCount, setPresentCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  // Fetch QR directly from API with present count
  const fetchDirectQr = async () => {
  if (!lecture?.id) return;
  setIsLoadingQr(true);
  setHasAttemptedFetch(true);
  try {
    console.log("🔄 Fetching QR directly for lecture:", lecture.id);
    // ✅ FIX: Pass the qrRefreshSeconds here!
    const data = await instructorDashboardApi.getQrCodeData(lecture.id, qrRefreshSeconds);
      let payload = null;
      if (data?.code?.value) {
        payload = data.code.value;
      } else if (data?.qrPayload) {
        payload = data.qrPayload;
      } else if (data?.payload) {
        payload = data.payload;
      }
      
      if (payload) {
        console.log("✅ Direct QR payload:", payload.substring(0, 50));
        setDirectQrPayload(payload);
        setQrKey(prev => prev + 1);
      }
      
      // Update present count from API response
      if (data?.presentCount !== undefined) {
        setPresentCount(data.presentCount);
        console.log(`📊 Present count updated: ${data.presentCount}`);
      }
      
      // Try to get total students count
      if (data?.totalStudents !== undefined) {
        setTotalStudentsCount(data.totalStudents);
      } else if (lecture?.id) {
        try {
          const sessionData = await instructorDashboardApi.getAttendanceSession(lecture.id);
          if (sessionData?.totalStudents) {
            setTotalStudentsCount(sessionData.totalStudents);
          }
        } catch (err) {
          console.warn("Could not fetch total students:", err);
        }
      }
      
    } catch (err) {
      console.error("❌ Direct QR fetch failed:", err);
    } finally {
      setIsLoadingQr(false);
    }
  };

  // Fetch QR immediately when lecture exists (first time)
  useEffect(() => {
    if (lecture?.id && !hasAttemptedFetch) {
      fetchDirectQr();
    }
  }, [lecture?.id]);

  // Fetch QR immediately when session becomes live
  useEffect(() => {
    if (lecture?.status === "live") {
      fetchDirectQr();
    }
  }, [lecture?.status]);

  // Periodic refresh only if session is live
  useEffect(() => {
    if (!lecture?.id || lecture?.status !== "live") return;
    
    const interval = setInterval(() => {
      fetchDirectQr();
    }, (qrRefreshSeconds || 30) * 1000);
    
    return () => clearInterval(interval);
  }, [lecture?.id, lecture?.status, qrRefreshSeconds]);

  // Use direct payload only - NO FALLBACK to prevent fake QR
  const finalPayload = directQrPayload;
  
  // Build QR URL only if we have real payload
  const finalQrUrl = finalPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalPayload)}&bgcolor=ffffff&color=1a1a2e&qzone=2&_t=${Date.now()}&_key=${qrKey}`
    : null;

  // Calculate attendance percentage
  const attendancePercentage = totalStudentsCount > 0 
    ? Math.round((presentCount / totalStudentsCount) * 100) 
    : 0;

  // Get students array safely
  const studentsList = students || [];
// في SessionQrPanel - أضف بعد useState

useEffect(() => {
  const fetchAndPrintSessionData = async () => {
    if (!lecture?.id) return;
    
    try {
      console.log("🔄 جاري جلب بيانات الجلسة من الـ API...");
      const sessionData = await instructorDashboardApi.getAttendanceSession(lecture.id);
      
      console.log("📋 ===== بيانات الجلسة كاملة =====");
      console.log(JSON.stringify(sessionData, null, 2));
      console.log("📋 =============================");
      
      // طباعة الحقول المهمة بشكل منفصل
      console.log("🔑 QR Payload:", sessionData?.qrPayload);
      console.log("⏱️ Expires At:", sessionData?.expiresAt);
      console.log("⏱️ QR Refresh Interval:", sessionData?.qrRefreshInSeconds || sessionData?.qrRefreshIntervalSeconds);
      console.log("📊 Session Status:", sessionData?.sessionStatus);
      console.log("👨‍🎓 Present Count:", sessionData?.presentCount);
      
      return sessionData;
    } catch (error) {
      console.error("❌ خطأ في جلب بيانات الجلسة:", error);
    }
  };
  
  fetchAndPrintSessionData();
}, [lecture?.id]);
  return (
    <div className="ic-panel" id="ic-session-panel">
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
              {isLoadingQr && !directQrPayload ? (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faRotateRight} spin size="2x" />
                  <p className="mt-2">Loading QR from backend...</p>
                </div>
              ) : finalQrUrl ? (
                <img
                  key={qrKey}
                  src={finalQrUrl}
                  alt="Attendance QR Code"
                  className={`ic-qr-img${isLive ? " pulse" : " dimmed"}`}
                  onError={(e) => {
                    console.error("❌ QR image failed to load");
                  }}
                  onLoad={() => console.log("✅ QR image loaded with payload:", finalPayload?.substring(0, 40))}
                />
              ) : (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faQrcode} size="3x" className="text-muted" />
                  <p className="mt-2">Click Start Session to generate QR code...</p>
                </div>
              )}
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
              QR refreshes every {timeLeft || qrRefreshSeconds} seconds
            </div>
          )}
          
          <div className="text-center mt-2 small">
            {directQrPayload ? (
              <span className="text-success">✓ Real QR Token Active</span>
            ) : isLoadingQr ? (
              <span className="text-warning">⏳ Loading QR from backend...</span>
            ) : (
              <span className="text-muted">⏳ Waiting for session to start...</span>
            )}
          </div>
        </div>

        {/* RIGHT: Session Controls */}
        <div className="ic-session-controls">
          
          {/* ATTENDANCE COUNTER CARD */}
          <div className="ic-control-card" id="attendance-counter-card">
            <h4 className="ic-control-card-title">
              <FontAwesomeIcon icon={faUsers} /> Students in Class
            </h4>
            
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: '#1e9c50',
                fontFamily: 'monospace'
              }}>
                {presentCount}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem' }}>
                Students Present
              </div>
              
              {totalStudentsCount > 0 && (
                <>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#666' }}>
                    out of {totalStudentsCount} total students
                  </div>
                  <div style={{ 
                    marginTop: '0.5rem',
                    width: '100%',
                    height: '4px',
                    background: '#2a2a3e',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${attendancePercentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #1e9c50, #2ecc71)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {attendancePercentage}% Attendance
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Session Settings Card */}
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

          {/* Session Control Card */}
          <div className="ic-control-card" id="session-actions-card">
            <h4 className="ic-control-card-title">Session Control</h4>
            <div className="ic-session-action-btn-group">
              {lecture?.status === "scheduled" && (
                <button
                  className="ic-start-btn"
                  onClick={() => onStartSession(lecture?.id)}
                  disabled={!lecture?.id || actionState.busy === `course-${lecture?.courseId}-create-session`}
                  id="start-session-btn"
                >
                  <FontAwesomeIcon icon={faPlay} /> Start Session
                </button>
              )}
              
              {lecture?.status === "completed" && (
                <button
                  className="ic-reopen-btn"
                  onClick={() => onReopenSession(lecture?.id)}
                  disabled={!lecture?.id || actionState.busy === `course-${lecture?.courseId}-reopen-session`}
                  id="reopen-session-btn"
                >
                  <FontAwesomeIcon icon={faRotateRight} /> Reopen Session
                </button>
              )}

              {isLive && (
                <button
                  className="ic-end-btn"
                  onClick={() => onEndSession(lecture?.id)}
                  disabled={!lecture?.id || actionState.busy === `course-${lecture?.courseId}-end-session`}
                  id="end-session-btn"
                >
                  <FontAwesomeIcon icon={faStopCircle} /> End Session
                </button>
              )}
              
              <button
                className="ic-edit-btn"
                onClick={() => onEditLecture(lecture)}
                id="edit-lecture-details-btn"
              >
                <FontAwesomeIcon icon={faPen} /> Edit Lecture
              </button>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="ic-control-card" id="session-info-card">
            <h4 className="ic-control-card-title">Session Info</h4>
            <ul className="ic-info-list">
              <li><span className="ic-info-key">Status</span><StatusBadge status={lecture?.status} /></li>
              <li><span className="ic-info-key">Lecture ID</span><span className="ic-info-val">{lecture?.id}</span></li>
              <li><span className="ic-info-key">Duration</span><span className="ic-info-val">{sessionDuration} min</span></li>
              <li><span className="ic-info-key">QR Cycle</span><span className="ic-info-val">{qrRefreshSeconds}s</span></li>
              {lecture?.location && <li><span className="ic-info-key">Location</span><span className="ic-info-val">{lecture.location}</span></li>}
            </ul>
          </div>

          {/* STUDENTS LIST CARD - NOW SHOWING ALL STUDENTS with scroll */}
          {studentsList.length > 0 && (
            <div className="ic-control-card" id="students-preview-card">
              <h4 className="ic-control-card-title">
                <FontAwesomeIcon icon={faUsers} /> Students List
                <Badge bg="secondary" className="ms-2">{studentsList.length} Total</Badge>
              </h4>
              
              {/* Scrollable students list */}
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                marginTop: '12px'
              }}>
                <ul className="ic-students-list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {studentsList.map((s, index) => (
                    <li key={s.id || index} className="ic-student-row">
                      <div className="ic-student-avatar">
                        {(s.fullName || s.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="ic-student-name">
                        {s.fullName || s.name || s.studentName || "Unknown"}
                      </span>
                      <span className={`ic-student-status ${s.status === "Present" ? "present" : s.status === "Late" ? "late" : "absent"}`}>
                        {s.status || "Absent"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Show total count indicator if many students */}
              {studentsList.length > 10 && (
                <div className="text-center mt-2 pt-1 small text-muted">
                  <FontAwesomeIcon icon={faUsers} className="me-1" />
                  Showing all {studentsList.length} students
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(actionState.error || actionState.success) && (
        <Alert className="ic-feedback-alert mt-3 mb-0" variant={actionState.error ? "danger" : "success"}>
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
      <span className={`ic-bc-step${step === 2 ? " active" : step > 2 ? " done" : ""}`}>
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
  qrDetails,
}) {
  const [step, setStep] = useState(1);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [qrRefreshSeconds, setQrRefreshSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrImageUrl, setQrImageUrl] = useState("");
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

  const fetchQrData = useCallback(async (lectureId, refreshInterval) => {
  if (!lectureId) return;
  try {
    // ✅ Pass it to the API
    const data = await instructorDashboardApi.getQrCodeData(lectureId, refreshInterval);
    if (data?.qrUrl) {
      setQrImageUrl(data.qrUrl);
    }
  } catch (error) {
    console.error("QR Refresh failed:", error);
  }
}, []);

  const qrPayload = selectedLecture?.id || selectedCourseId || "SESSION";
  const displayQrUrl = qrImageUrl || buildQrUrl(qrPayload);

  useEffect(() => {
    if (!selectedLectureId && filteredLectures[0]) {
      setSelectedLectureId(filteredLectures[0].id);
    }
  }, [filteredLectures, selectedLectureId]);

  useEffect(() => {
  if (!selectedLecture || selectedLecture.status !== "live") {
    setTimeLeft(qrRefreshSeconds);
    return;
  }

  // ✅ Pass qrRefreshSeconds here
  fetchQrData(selectedLecture.id, qrRefreshSeconds);

  const countdownTimer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // ✅ Pass qrRefreshSeconds here too
        fetchQrData(selectedLecture.id, qrRefreshSeconds);
        return qrRefreshSeconds;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    clearInterval(countdownTimer);
  };
}, [qrRefreshSeconds, selectedLecture, fetchQrData]);
  useEffect(() => {
    setTimeLeft(qrRefreshSeconds);
  }, [qrRefreshSeconds]);

  useEffect(() => {
    if (selectedCourseId) {
      setStep(2);
      setSelectedLectureId("");
    }
  }, [selectedCourseId]);

  // ⭐ MODIFIED: Added qrRefreshIntervalSeconds to payload
 const handleStartSession = (lectureId) => {
  const payload = {
    lectureId,
    durationInMinutes: sessionDuration,
    refreshInSeconds: qrRefreshSeconds,  // ✅ مهم جداً - القيمة 10 هتبعت صح
  };
  
  console.log("🔵 handleStartSession - Sending payload:", payload);
  
  onCourseAction("create-session", selectedCourseId, payload);
};

const handleReopenSession = (lectureId) => {
  const payload = {
    lectureId,
    durationInMinutes: sessionDuration,
    refreshInSeconds: qrRefreshSeconds,  // ✅ مهم جداً - القيمة 10 هتبعت صح
  };
  
  console.log("🔵 handleReopenSession - Sending payload:", payload);
  
  onCourseAction("reopen-session", selectedCourseId, payload);
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
          onClose={() => {}}
        >
          {actionState.error || actionState.success}
        </Alert>
      )}

      <div className="ic-step-container">
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
              displayQrUrl={displayQrUrl}
              actionState={actionState}
              students={students}
              onStartSession={handleStartSession}
              onReopenSession={handleReopenSession}
              onEndSession={handleEndSession}
              onEditLecture={openEditLectureForm}
              onBack={() => setStep(2)}
              qrDetails={qrDetails}
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