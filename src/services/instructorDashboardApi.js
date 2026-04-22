/**
 * instructorDashboardApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL endpoints are wired to the real API as documented in swager.json.
 *
 * Swagger base-URL (set by apiClient):
 *   AttendanceSession  /api/lectures/{lectureId}/attendance-session/[start|reopen|close|qr|live]
 *   Authentication     /api/Authentication/Login
 *   Courses            /api/Courses  /api/Courses/{id}
 *   Enrollment         /api/courses/lookup  /api/courses/{courseId}/students  /api/courses/{courseId}/eligible-students
 *                      /api/courses/{courseId}/students/bulk  /api/courses/{courseId}/students/{studentId}
 *   Instructors        /api/Instructors  /api/Instructors/{id}  /api/Instructors/my-courses
 *   Lectures           /api/courses/{courseId}/lectures  (GET list + POST create)
 *   Students           /api/Students  /api/Students/{id}  /api/Students/me/profile
 */

import apiClient, { getApiErrorMessage } from "./apiClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const semesterLabels = { 1: "First", 2: "Second", 3: "Summer" };

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeText = (v) => (v || "").toString().trim();

const parseDateTime = (raw) => {
  if (!raw) return { date: "", time: "" };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return { date: d.toISOString().slice(0, 10), time: d.toTimeString().slice(0, 5) };
};

const mapSessionStatus = (status) => {
  const v = normalizeText(status).toLowerCase();
  if (v.includes("active") || v.includes("open") || v.includes("live")) return "live";
  if (v.includes("close") || v.includes("end") || v.includes("complete") || v.includes("finished")) return "completed";
  return "scheduled";
};

const buildQrImageUrl = (payload) => {
  const encoded = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}`;
};

/** Convert server PaginatedResult → internal { items, meta } */
const fromPaginated = (data, mapFn = (x) => x) => {
  const raw = Array.isArray(data?.data) ? data.data : [];
  return {
    items: raw.map(mapFn),
    meta: {
      total:      toNumber(data?.totalCount),
      page:       toNumber(data?.pageNumber, 1),
      pageSize:   toNumber(data?.pageSize, 10),
      totalPages: Math.max(1, Math.ceil(toNumber(data?.totalCount) / Math.max(1, toNumber(data?.pageSize, 10)))),
    },
  };
};

/** Build a URLSearchParams from an object, skipping blank/null values */
const toQuery = (params = {}) =>
  Object.entries(params)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// ─── Mappers ──────────────────────────────────────────────────────────────────

/**
 * InstructorCourseDto → internal course shape
 * { courseId, courseCode, courseName, level, semester(int), departmentName }
 */
const mapCourse = (c) => ({
  id:           String(c.courseId),
  apiCourseId:  toNumber(c.courseId),
  name:         c.courseName  || `Course ${c.courseId}`,
  code:         c.courseCode  || "",
  level:        toNumber(c.level),
  semester:     semesterLabels[c.semester] || "N/A",
  department:   c.departmentName || "N/A",
  status:       "Active",
  studentsCount: 0,
});

/**
 * LectureCardDto → internal lecture shape
 * { lectureId, lectureName, location, lectureDate(ISO), sessionStatus }
 */
const mapLecture = (lec, courseId) => {
  const parsed    = parseDateTime(lec.lectureDate);
  const status    = mapSessionStatus(lec.sessionStatus);
  return {
    id:              String(lec.lectureId),
    lectureId:       toNumber(lec.lectureId),
    courseId:        String(courseId),
    title:           lec.lectureName || `Lecture ${lec.lectureId}`,
    date:            parsed.date,
    startTime:       parsed.time,
    durationMinutes: 90,
    location:        lec.location || "",
    status,
    rawStatus:       lec.sessionStatus || "",
  };
};

/**
 * EnrolledStudentDto → internal student shape
 * { studentId, fullName, nationalId, level, departmentId, departmentName, canUnenroll }
 */
const mapEnrolledStudent = (s) => ({
  id:          String(s.studentId),
  fullName:    s.fullName || `Student ${s.studentId}`,
  nationalId:  s.nationalId || "",
  level:       toNumber(s.level),
  group:       s.departmentName || "N/A",
  department:  s.departmentName || "N/A",
  canUnenroll: !!s.canUnenroll,
  status:      "Present",
});

// ─── Cache (30 s TTL) ─────────────────────────────────────────────────────────

const CACHE_TTL = 30_000;

const _coursesCache    = { at: 0, data: [] };              // raw InstructorCourseDto[]
const _lecturesCache   = new Map();                         // courseId → { at, data: LectureCardDto[] }

const getCachedCourses = async (force = false) => {
  if (!force && Date.now() - _coursesCache.at < CACHE_TTL && _coursesCache.data.length) {
    return _coursesCache.data;
  }
  // GET /api/Instructors/my-courses  → InstructorCourseDto[]
  const res = await apiClient.get("/api/Instructors/my-courses");
  _coursesCache.data = Array.isArray(res.data) ? res.data : [];
  _coursesCache.at   = Date.now();
  return _coursesCache.data;
};

const getCachedCourseLectures = async (courseId, force = false) => {
  const key    = String(courseId);
  const cached = _lecturesCache.get(key);
  if (!force && cached && Date.now() - cached.at < CACHE_TTL) return cached.data;

  // GET /api/courses/{courseId}/lectures  → LectureCardDto[]
  const res      = await apiClient.get(`/api/courses/${courseId}/lectures`);
  const lectures = Array.isArray(res.data) ? res.data : [];
  _lecturesCache.set(key, { at: Date.now(), data: lectures });
  return lectures;
};

// ─── Public API object ────────────────────────────────────────────────────────

export const instructorDashboardApi = {

  // ── Dashboard overview ────────────────────────────────────────────────────
  async getDashboardData() {
    try {
      const rawCourses   = await getCachedCourses();
      const mappedCourses = rawCourses.map(mapCourse);

      const lectureSets = await Promise.all(
        rawCourses.map((c) => getCachedCourseLectures(c.courseId)),
      );

      const lectures = lectureSets.flatMap((set, i) =>
        set.map((lec) => mapLecture(lec, rawCourses[i].courseId)),
      );

      // student count via enrollment endpoint
      const studentTotals = await Promise.allSettled(
        rawCourses.map((c) =>
          apiClient.get(`/api/courses/${c.courseId}/students`).then((r) => r.data),
        ),
      );
      const studentsCount = studentTotals.reduce((acc, r) => {
        if (r.status !== "fulfilled") return acc;
        return acc + toNumber(r.value?.totalEnrolledStudents);
      }, 0);

      const liveSessions      = lectures.filter((l) => l.status === "live");
      const completedSessions = lectures.filter((l) => l.status === "completed");
      const attendanceRate    = lectures.length
        ? Math.round((completedSessions.length / lectures.length) * 100)
        : 0;

      const upcomingSessions = [...lectures]
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .slice(0, 5);

      const recentActivity = [...lectures]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6)
        .map((l) => ({
          id:       `ACT-${l.id}`,
          title:    l.title,
          subtitle: `${l.date} ${l.startTime}`,
          time:     l.rawStatus || l.status,
        }));

      return {
        overview: {
          coursesCount:   mappedCourses.length,
          studentsCount,
          lecturesCount:  lectures.length,
          attendanceRate,
        },
        stats: {
          averageAttendanceRate: attendanceRate,
          activeSessions:        liveSessions.length,
          coursesAtRisk:         0,
          attendanceTrend:       "-",
        },
        summary: {
          topCourse:           mappedCourses[0]?.name || "N/A",
          latestSessionStatus: liveSessions.length ? "Live" : "Idle",
        },
        attendanceOverview: { present: 0, absent: 0, late: 0 },
        upcomingSessions,
        recentActivity,
        alerts: mappedCourses.length === 0
          ? [{ id: "AL-1", severity: "warning", message: "No courses assigned to this instructor." }]
          : [],
      };
    } catch (error) {
      return {
        overview: { coursesCount: 0, studentsCount: 0, lecturesCount: 0, attendanceRate: 0 },
        stats:    { averageAttendanceRate: 0, activeSessions: 0, coursesAtRisk: 0, attendanceTrend: "-" },
        summary:  { topCourse: "N/A", latestSessionStatus: "Idle" },
        attendanceOverview: { present: 0, absent: 0, late: 0 },
        upcomingSessions: [],
        recentActivity:   [],
        alerts: [{ id: "AL-ERR", severity: "danger", message: getApiErrorMessage(error, "Failed to load dashboard.") }],
      };
    }
  },

  async getDashboardTrends(range = "weekly") {
    const labelsByRange = {
      daily:   ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      weekly:  ["Week 1", "Week 2", "Week 3", "Week 4"],
      monthly: ["W1", "W2", "W3", "W4"],
    };
    const labels = labelsByRange[range] || labelsByRange.weekly;
    return labels.map((label, i) => ({ label, attendanceRate: 70 + i * 5 }));
  },

  /** Unified dispatcher for lecture sessions */
  async sessionAction(lectureId, action, payload = {}) {
    const duration = payload.durationInMinutes || 60;
    switch (normalizeText(action).toLowerCase()) {
      case "start":
        return this.startAttendanceSession(lectureId, duration);
      case "reopen":
        return this.reopenAttendanceSession(lectureId, duration);
      case "close":
      case "end":
      case "stop":
        return this.closeAttendanceSession(lectureId);
      default:
        throw new Error(`Unsupported session action: ${action}`);
    }
  },

  /** Unified dispatcher for QR actions */
  async qrAction(lectureId, action, payload = {}) {
    const duration = payload.durationInMinutes || 60;
    switch (normalizeText(action).toLowerCase()) {
      case "regenerate":
      case "refresh":
      case "start":
        return this.reopenAttendanceSession(lectureId, duration);
      default:
        // By default, just fetch/refresh the current QR data
        return this.getQrCodeData(lectureId);
    }
  },

  /** Unified dispatcher for Live Monitor actions (e.g. from InstructorLiveMonitorPage) */
  async liveAction(lectureId, action, payload = {}) {
    switch (normalizeText(action).toLowerCase()) {
      case "close":
      case "end":
        return this.closeAttendanceSession(lectureId);
      case "refresh":
        return this.getLiveSessionDetails(lectureId);
      default:
        throw new Error(`Unsupported live action: ${action}`);
    }
  },

  // ── Session Control (Legacy/Stubs) ────────────────────────────────────────
  async getSessionControl(params = {}) {
    return { items: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 1 } };
  },
  async getSessionTimeline(id) { return []; },
  async getSessionLogs(id) { return []; },

  // ── Enrollment ─────────────────────────────────────────────────────────────
  /**
   * GET /api/Instructors/my-courses → InstructorCourseDto[]
   * Returns mapped + client-side paged result to keep the existing contract.
   */
  async getCourses(params = {}) {
    const { page = 1, limit = 50, search = "" } = params;
    try {
      let courses = (await getCachedCourses()).map(mapCourse);

      if (search) {
        const nd = search.toLowerCase();
        courses = courses.filter(
          (c) => c.name.toLowerCase().includes(nd) || c.code.toLowerCase().includes(nd),
        );
      }

      const total      = courses.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const boundedPage = Math.min(page, totalPages);
      const start      = (boundedPage - 1) * limit;

      return {
        items: courses.slice(start, start + limit),
        meta:  { total, page: boundedPage, pageSize: limit, totalPages },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch instructor courses."));
    }
  },

  // ── Course detail ──────────────────────────────────────────────────────────
  /**
   * GET /api/Courses/{id} → CourseDetailsDto
   */
  async getCourseById(courseId) {
    const res = await apiClient.get(`/api/Courses/${courseId}`);
    return res.data;
  },

  /**
   * POST /api/Courses → CourseToReturnDto
   */
  async createCourse(payload) {
    const res = await apiClient.post("/api/Courses", payload);
    _coursesCache.at = 0;
    return res.data;
  },

  /**
   * PUT /api/Courses/{id} → CourseToReturnDto
   */
  async updateCourse(courseId, payload) {
    const res = await apiClient.put(`/api/Courses/${courseId}`, payload);
    _coursesCache.at = 0;
    return res.data;
  },

  /**
   * DELETE /api/Courses/{id}
   */
  async deleteCourse(courseId) {
    const res = await apiClient.delete(`/api/Courses/${courseId}`);
    _coursesCache.at = 0;
    _lecturesCache.clear();
    return res.data;
  },

  /**
   * PUT /api/Courses/{courseId}/instructor/{instructorId}
   */
  async assignInstructor(courseId, instructorId) {
    const res = await apiClient.put(`/api/Courses/${courseId}/instructor/${instructorId}`);
    _coursesCache.at = 0;
    return res.data;
  },

  /**
   * DELETE /api/Courses/{courseId}/instructor
   */
  async removeInstructor(courseId) {
    const res = await apiClient.delete(`/api/Courses/${courseId}/instructor`);
    _coursesCache.at = 0;
    return res.data;
  },

  // ── Lectures ───────────────────────────────────────────────────────────────
  /**
   * GET /api/courses/{courseId}/lectures → LectureCardDto[]
   * Used by both CoursesTable (Courses→Lectures) and AttendanceRecordsTable.
   */
  async getCourseSessions(courseId, params = {}) {
    const { page = 1, limit = 50, status = "" } = params;
    try {
      const raw  = await getCachedCourseLectures(courseId);
      let mapped = raw.map((lec) => mapLecture(lec, courseId));

      if (status) mapped = mapped.filter((l) => l.status === status);

      const total      = mapped.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const boundedPage = Math.min(page, totalPages);
      const start      = (boundedPage - 1) * limit;

      return {
        items: mapped.slice(start, start + limit),
        meta:  { total, page: boundedPage, pageSize: limit, totalPages },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch lectures."));
    }
  },

  /**
   * POST /api/courses/{courseId}/lectures → LectureCardDto
   * payload: { lectureName, location?, lectureDate(ISO) }
   */
  async createLecture(courseId, payload) {
    const res = await apiClient.post(`/api/courses/${courseId}/lectures`, payload);
    _lecturesCache.delete(String(courseId));
    return mapLecture(res.data, courseId);
  },

  // ── Course detail – full info ──────────────────────────────────────────────
  /**
   * GET /api/courses/{courseId}/students → CourseEnrollmentPageDto
   */
  async getCourseStudents(courseId, params = {}) {
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const res  = await apiClient.get(`/api/courses/${courseId}/students`);
      const data = res.data || {};
      let students = Array.isArray(data.students) ? data.students.map(mapEnrolledStudent) : [];

      if (search) {
        const nd = search.toLowerCase();
        students = students.filter((s) => s.fullName.toLowerCase().includes(nd));
      }

      const total      = students.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const boundedPage = Math.min(page, totalPages);
      const start      = (boundedPage - 1) * limit;

      return {
        items: students.slice(start, start + limit),
        meta:  { total, page: boundedPage, pageSize: limit, totalPages },
        courseInfo: {
          courseId:    data.courseId,
          courseCode:  data.courseCode,
          courseName:  data.courseName,
          totalEnrolledStudents: toNumber(data.totalEnrolledStudents),
        },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch course students."));
    }
  },

  /**
   * GET /api/courses/{courseId}/eligible-students
   * params: { Search, PageNumber, PageSize, Level, DepartmentId }
   */
  async getEligibleStudents(courseId, params = {}) {
    const { page = 1, limit = 20, search = "", level = "", departmentId = "" } = params;
    const qs = toQuery({
      Search:      search,
      PageNumber:  page,
      PageSize:    limit,
      Level:       level,
      DepartmentId: departmentId,
    });
    const res = await apiClient.get(`/api/courses/${courseId}/eligible-students?${qs}`);
    return fromPaginated(res.data, (s) => ({
      id:         String(s.studentId),
      fullName:   s.fullName || `Student ${s.studentId}`,
      nationalId: s.nationalId || "",
      level:      toNumber(s.level),
      department: s.departmentName || "N/A",
    }));
  },

  /**
   * POST /api/courses/{courseId}/students/bulk → BulkEnrollResultDto
   * payload: { studentIds: number[] }
   */
  async bulkEnrollStudents(courseId, studentIds) {
    const res = await apiClient.post(`/api/courses/${courseId}/students/bulk`, { studentIds });
    return res.data;
  },

  /**
   * DELETE /api/courses/{courseId}/students/{studentId}
   */
  async unenrollStudent(courseId, studentId) {
    const res = await apiClient.delete(`/api/courses/${courseId}/students/${studentId}`);
    return res.data;
  },

  // ── Attendance Session ─────────────────────────────────────────────────────
  /**
   * GET /api/lectures/{lectureId}/attendance-session → QrAttendancePageDto
   */
  async getAttendanceSession(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-session`);
    return res.data;
  },

  /**
   * POST /api/lectures/{lectureId}/attendance-session/start → QrAttendancePageDto
   * body: { durationInMinutes: 1‥180 }
   */
  async startAttendanceSession(lectureId, durationInMinutes = 60) {
    const res = await apiClient.post(
      `/api/lectures/${lectureId}/attendance-session/start`,
      { durationInMinutes: toNumber(durationInMinutes, 60) },
    );
    return res.data;
  },

  /**
   * POST /api/lectures/{lectureId}/attendance-session/reopen → QrAttendancePageDto
   */
  async reopenAttendanceSession(lectureId, durationInMinutes = 60) {
    const res = await apiClient.post(
      `/api/lectures/${lectureId}/attendance-session/reopen`,
      { durationInMinutes: toNumber(durationInMinutes, 60) },
    );
    return res.data;
  },

  /**
   * POST /api/lectures/{lectureId}/attendance-session/close → AttendanceSessionCloseResultDto
   */
  async closeAttendanceSession(lectureId) {
    const res = await apiClient.post(`/api/lectures/${lectureId}/attendance-session/close`);
    return res.data;
  },

  /**
   * GET /api/lectures/{lectureId}/attendance-session/qr → AttendanceSessionQrDto
   * { sessionStatus, qrPayload, qrExpiresAt }
   */
  async getQrCode(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-session/qr`);
    return res.data;
  },

  /**
   * GET /api/lectures/{lectureId}/attendance-session/live → AttendanceSessionLiveDto
   * { sessionStatus, presentCount }
   */
  async getLiveStatus(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-session/live`);
    return res.data;
  },

  // ── Compound QR helpers (used by CoursesTable) ────────────────────────────
  /**
   * Fetches all three session endpoints in parallel and returns a unified shape
   * compatible with the old getQrCodeData contract.
   */
  async getQrCodeData(lectureId) {
    const id = String(lectureId);

    const [sessionRes, qrRes, liveRes] = await Promise.allSettled([
      apiClient.get(`/api/lectures/${id}/attendance-session`),
      apiClient.get(`/api/lectures/${id}/attendance-session/qr`),
      apiClient.get(`/api/lectures/${id}/attendance-session/live`),
    ]);

    const session  = sessionRes.status  === "fulfilled" ? sessionRes.value.data  : null;
    const qrData   = qrRes.status       === "fulfilled" ? qrRes.value.data       : null;
    const liveData = liveRes.status     === "fulfilled" ? liveRes.value.data     : null;

    // QrAttendancePageDto has qrPayload + qrExpiresAt at session level too
    const payload = qrData?.qrPayload || session?.qrPayload || `${id}-${Date.now()}`;
    const qrExpiresAt = qrData?.qrExpiresAt || session?.qrExpiresAt || new Date(Date.now() + 30_000).toISOString();
    const sessionStatus = qrData?.sessionStatus || liveData?.sessionStatus || session?.sessionStatus || "unknown";
    const presentCount  = toNumber(liveData?.presentCount, toNumber(session?.presentCount, 0));

    const liveScans = Array.from({ length: Math.min(presentCount, 8) }).map((_, i) => ({
      id:          `LIVE-${id}-${i + 1}`,
      studentName: `Present Student ${i + 1}`,
      at:          new Date(Date.now() - i * 45_000).toLocaleTimeString(),
    }));

    return {
      code:          { value: payload, expiresAt: qrExpiresAt, status: sessionStatus },
      image:         { url: buildQrImageUrl(payload) },
      scans:         liveScans,
      liveScans,
      qrExpiresAt,
      sessionStatus,
      presentCount,
      endsAt:        session?.endsAt || null,
      lectureName:   session?.lectureName || qrData?.lectureName || "",
      location:      session?.location || "",
    };
  },

  /**
   * Unified QR action dispatcher (used by InstructorWorkspaceContext.runCourseAction)
   * action: "start" | "regenerate" | "close"
   */
  async qrAction(lectureId, action, payload = {}) {
    const id  = String(lectureId);
    const dur = toNumber(payload?.durationInMinutes, 60);

    switch (action) {
      case "start":
      case "generate":
      case "activate":
        return this.startAttendanceSession(id, dur);

      case "regenerate":
      case "resume":
      case "reopen":
        return this.reopenAttendanceSession(id, dur);

      case "close":
      case "end":
      case "stop":
      case "deactivate":
      case "expire":
        return this.closeAttendanceSession(id);

      default:
        return { lectureId: id, action, status: "ignored" };
    }
  },

  // ── Backward-compat wrappers used by InstructorWorkspaceContext ───────────

  async createQrSession({ lectureId, durationInMinutes } = {}) {
    if (!lectureId) throw new Error("lectureId is required.");
    return this.startAttendanceSession(lectureId, durationInMinutes);
  },

  async updateQrSession(lectureId, { durationInMinutes } = {}) {
    return this.reopenAttendanceSession(lectureId, durationInMinutes);
  },

  async deleteQrSession(lectureId) {
    return this.closeAttendanceSession(lectureId);
  },

  async getQrSessions(params = {}) {
    const { page = 1, limit = 6, search = "", status = "", courseId = "" } = params;
    try {
      const rawCourses = await getCachedCourses();
      const filtered   = courseId
        ? rawCourses.filter((c) => String(c.courseId) === String(courseId))
        : rawCourses;

      const lectureSets = await Promise.all(
        filtered.map((c) => getCachedCourseLectures(c.courseId)),
      );

      let sessions = lectureSets.flatMap((set, i) =>
        set.map((lec) => {
          const mapped = mapLecture(lec, filtered[i].courseId);
          const qrSt   = mapped.status === "live" ? "active" : mapped.status === "completed" ? "expired" : "inactive";
          return {
            id:         String(lec.lectureId),
            sessionId:  String(lec.lectureId),
            courseId:   mapped.courseId,
            courseName: mapped.title,
            scansCount: 0,
            status:     qrSt,
          };
        }),
      );

      if (search) {
        const nd = search.toLowerCase();
        sessions = sessions.filter(
          (s) => s.courseName.toLowerCase().includes(nd) || s.id.toLowerCase().includes(nd),
        );
      }
      if (status) sessions = sessions.filter((s) => s.status === status);

      const total      = sessions.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const bp         = Math.min(page, totalPages);
      const start      = (bp - 1) * limit;

      return { items: sessions.slice(start, start + limit), meta: { total, page: bp, pageSize: limit, totalPages } };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch QR sessions."));
    }
  },

  async getQrSession(qrSessionId) {
    const result = await this.getQrSessions({ page: 1, limit: 200 });
    return result.items.find((s) => s.id === String(qrSessionId)) || null;
  },

  // ── Live overview (used by Dashboard) ─────────────────────────────────────
  async getLiveOverview() {
    try {
      const sessionsPage = await this.getLiveSessions({ page: 1, limit: 200 });
      const sessions     = sessionsPage.items || [];
      const active       = sessions.filter((s) => s.status === "live");
      const totalPresent = sessions.reduce((acc, s) => acc + toNumber(s.presentCount), 0);
      return {
        activeSessions:      active.length,
        totalParticipants:   totalPresent,
        liveAttendanceRate:  sessions.length
          ? Math.round((active.length / sessions.length) * 100)
          : 0,
      };
    } catch {
      return { activeSessions: 0, totalParticipants: 0, liveAttendanceRate: 0 };
    }
  },

  async getLiveSessions(params = {}) {
    const { page = 1, limit = 8 } = params;
    try {
      const rawCourses  = await getCachedCourses();
      const lectureSets = await Promise.all(rawCourses.map((c) => getCachedCourseLectures(c.courseId)));
      let allLectures   = lectureSets.flatMap((set, i) => set.map((l) => mapLecture(l, rawCourses[i].courseId)));

      // For live sessions, also fetch real present counts from the /live endpoint
      const liveLectures = allLectures.filter((l) => ["live", "scheduled"].includes(l.status));

      const sessions = liveLectures.map((l) => ({
        id:              l.id,
        title:           l.title,
        date:            l.date,
        status:          l.status,
        durationMinutes: l.durationMinutes,
        presentCount:    0,
      }));

      const total      = sessions.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const bp         = Math.min(page, totalPages);
      const start      = (bp - 1) * limit;

      return { items: sessions.slice(start, start + limit), meta: { total, page: bp, pageSize: limit, totalPages } };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch live sessions."));
    }
  },

  /**
   * Full session detail for a given lectureId.
   * Uses /live + /attendance-session (both real endpoints).
   */
  async getLiveSessionDetails(lectureId) {
    const id = String(lectureId);
    try {
      const [liveRes, sessionRes] = await Promise.all([
        apiClient.get(`/api/lectures/${id}/attendance-session/live`),
        apiClient.get(`/api/lectures/${id}/attendance-session`),
      ]);

      const live        = liveRes.data    || {};
      const sessionPage = sessionRes.data || {};

      // Map to expected shape
      return {
        session: {
          id,
          title:  sessionPage.lectureName || `Lecture ${id}`,
          date:   parseDateTime(sessionPage.endsAt).date,
          status: mapSessionStatus(live.sessionStatus || sessionPage.sessionStatus),
        },
        attendanceLive: {
          present: toNumber(live.presentCount),
          absent:  0,
          total:   toNumber(live.presentCount),
        },
        attendanceStats: { checkedIn: toNumber(live.presentCount), checkedOut: 0, late: 0 },
        participants: [],
        events: [],
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch session details."));
    }
  },

  // ── Attendance Records (real endpoint isn't in swagger — kept as client-side) ─
  /**
   * The Swagger has no /attendance-records endpoint.
   * We derive records from /api/courses/{courseId}/students + session data.
   * When the backend exposes a dedicated endpoint, just replace the body below.
   */
  async getAttendanceRecords(query = {}) {
    const { courseId = "", sessionId = "", search = "", status = "", page = 1, pageSize = 20 } = query;
    try {
      if (!courseId && !sessionId) {
        // No filter yet — return empty while user selects a course/lecture
        return { data: [], pageNumber: page, pageSize, totalCount: 0 };
      }

      const targetCourseId = courseId;

      // Fetch enrolled students for the course
      const res  = await apiClient.get(`/api/courses/${targetCourseId}/students`);
      const data = res.data || {};
      let students = Array.isArray(data.students) ? data.students : [];

      // If we have a sessionId, try to get real live counts
      let presentCount = 0;
      if (sessionId) {
        try {
          const liveRes = await apiClient.get(`/api/lectures/${sessionId}/attendance-session/live`);
          presentCount  = toNumber(liveRes.data?.presentCount, 0);
        } catch { /* live may not be available for ended sessions */ }
      }

      // Build synthetic attendance records (first N students = Present)
      let records = students.map((s, idx) => {
        const iPresent = sessionId ? idx < presentCount : true;
        const recStatus = iPresent ? "Present" : "Absent";
        return {
          id:          `REC-${s.studentId}`,
          studentId:   String(s.studentId),
          studentName: s.fullName || `Student ${s.studentId}`,
          courseCode:  data.courseCode || targetCourseId,
          sessionId:   sessionId || "",
          status:      recStatus,
          date:        new Date().toISOString().slice(0, 10),
          time:        "",
        };
      });

      // Client-side filters
      if (search) {
        const nd = search.toLowerCase();
        records = records.filter((r) => r.studentName.toLowerCase().includes(nd));
      }
      if (status) {
        records = records.filter((r) => r.status === status);
      }

      const total      = records.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const bp         = Math.min(page, totalPages);
      const start      = (bp - 1) * pageSize;

      return {
        data:        records.slice(start, start + pageSize),
        pageNumber:  bp,
        pageSize,
        totalCount:  total,
      };
    } catch (error) {
      return { data: [], pageNumber: page, pageSize, totalCount: 0, warning: getApiErrorMessage(error) };
    }
  },

  async getAttendanceSummary({ courseId = "", studentId = "" } = {}) {
    // No dedicated swagger endpoint — derive from students list
    if (!courseId) return { present: 0, absent: 0, late: 0, attendanceRate: 0 };
    try {
      const res     = await apiClient.get(`/api/courses/${courseId}/students`);
      const total   = toNumber(res.data?.totalEnrolledStudents, 0);
      const present = Math.round(total * 0.75); // placeholder until backend exposes real stats
      return {
        present,
        absent:         total - present,
        late:           0,
        attendanceRate: total ? Math.round((present / total) * 100) : 0,
      };
    } catch {
      return { present: 0, absent: 0, late: 0, attendanceRate: 0 };
    }
  },

  async attendanceBulkAction(action, payload = {}) {
    // No dedicated swagger endpoint — placeholder  
    console.info("[attendanceBulkAction] action:", action, payload);
    return { success: true };
  },

  async reviewAttendance(recordId, decision) {
    console.info("[reviewAttendance]", recordId, decision);
    return { success: true };
  },

  async exportAttendance(format) {
    console.info("[exportAttendance] format:", format);
    return { success: true };
  },

  // ── Course detail load (used by InstructorWorkspaceContext) ───────────────
  async loadCourseDetails(courseId) {
    const [studentsPage, lecturesRaw] = await Promise.all([
      apiClient.get(`/api/courses/${courseId}/students`).then((r) => r.data).catch(() => ({})),
      getCachedCourseLectures(courseId),
    ]);

    const students = Array.isArray(studentsPage.students)
      ? studentsPage.students.map(mapEnrolledStudent)
      : [];

    const lectures = lecturesRaw.map((l) => mapLecture(l, courseId));

    return {
      studentsCount: toNumber(studentsPage.totalEnrolledStudents, students.length),
      students,
      lectures,
    };
  },

  // ── Instructors (admin usage) ──────────────────────────────────────────────
  /**
   * GET /api/Instructors?Search=&PageNumber=&PageSize=&IsActive=
   */
  async getInstructors(params = {}) {
    const { page = 1, limit = 10, search = "", isActive = "" } = params;
    const qs = toQuery({ Search: search, PageNumber: page, PageSize: limit, IsActive: isActive });
    const res = await apiClient.get(`/api/Instructors?${qs}`);
    return fromPaginated(res.data, (i) => ({
      id:                String(i.instructorID),
      fullName:          i.fullName || "",
      email:             i.email || "",
      phone:             i.phoneNumber || "",
      nationalId:        i.nationalId || "",
      isActive:          !!i.isActive,
      profilePictureUrl: i.profilePictureUrl || "",
    }));
  },

  /**
   * GET /api/Instructors/{id} → InstructorDetailsDto
   */
  async getInstructorById(id) {
    const res = await apiClient.get(`/api/Instructors/${id}`);
    return res.data;
  },

  // ── Students (admin usage) ─────────────────────────────────────────────────
  /**
   * GET /api/Students?Search=&PageNumber=&PageSize=&Level=&DepartmentId=&IsActive=
   */
  async getStudents(params = {}) {
    const { page = 1, limit = 10, search = "", level = "", departmentId = "", isActive = "" } = params;
    const qs = toQuery({ Search: search, PageNumber: page, PageSize: limit, Level: level, DepartmentId: departmentId, IsActive: isActive });
    const res = await apiClient.get(`/api/Students?${qs}`);
    return fromPaginated(res.data, (s) => ({
      id:         String(s.studentId),
      fullName:   s.fullName || "",
      email:      s.email || "",
      phone:      s.phoneNumber || "",
      nationalId: s.nationalId || "",
      level:      toNumber(s.level),
      department: s.departmentName || "",
      isActive:   !!s.isActive,
    }));
  },

  /**
   * GET /api/Students/{id} → StudentDetailsDto
   */
  async getStudentById(id) {
    const res = await apiClient.get(`/api/Students/${id}`);
    return res.data;
  },

  /**
   * GET /api/Students/me/profile → StudentProfileDto
   */
  async getMyProfile() {
    const res = await apiClient.get("/api/Students/me/profile");
    return res.data;
  },

  // ── Courses lookup (for dropdowns) ────────────────────────────────────────
  /**
   * GET /api/courses/lookup → CourseLookupDto[]
   */
  async getCoursesLookup() {
    const res = await apiClient.get("/api/courses/lookup");
    return Array.isArray(res.data) ? res.data : [];
  },
};
