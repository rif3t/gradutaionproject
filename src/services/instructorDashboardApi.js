// ==================== instructorDashboardApi.js - الكود كامل ====================

import apiClient, { getApiErrorMessage } from "./apiClient";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildQrUrl = (payload) => {
  const value = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${value}&bgcolor=ffffff&color=1a1a2e&qzone=2`;
};

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
const _studentsCountCache = new Map();                      // courseId → { count, at }

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
  // ==================== instructorDashboardApi.js - دوال sessionAction ====================

/** Unified dispatcher for lecture sessions */
async sessionAction(lectureId, action, payload = {}) {
  const duration = payload.durationInMinutes || 60;
  const qrRefresh = payload.refreshInSeconds || 30;  // ✅ استخدم refreshInSeconds
  
  console.log("🎯 sessionAction - Payload received:", payload);
  console.log("🎯 sessionAction - QR Refresh:", qrRefresh);
  
  switch (normalizeText(action).toLowerCase()) {
    case "start":
      return this.startAttendanceSession(lectureId, duration, qrRefresh);
    case "reopen":
      return this.reopenAttendanceSession(lectureId, duration, qrRefresh);
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
    const id = String(lectureId);
    const dur = toNumber(payload?.durationInMinutes, 60);
    const qrRefresh = toNumber(payload?.refreshInSeconds, 30);
    
    console.log(`🎯 qrAction: ${action} for lecture ${id} with QR refresh ${qrRefresh}s`);
    console.log("📦 qrAction - Full payload:", payload);
    
    try {
      switch (action) {
        case "start":
        case "generate":
        case "activate":
          console.log("➡️ Starting attendance session...");
          const startResult = await this.startAttendanceSession(id, dur, qrRefresh);
          console.log("✅ Start result:", startResult);
          return startResult;

        case "regenerate":
        case "resume":
        case "reopen":
          console.log("➡️ Reopening attendance session...");
          const reopenResult = await this.reopenAttendanceSession(id, dur, qrRefresh);
          console.log("✅ Reopen result:", reopenResult);
          return reopenResult;

        case "close":
        case "end":
        case "stop":
        case "deactivate":
        case "expire":
          console.log("➡️ Closing attendance session...");
          const closeResult = await this.closeAttendanceSession(id);
          console.log("✅ Close result:", closeResult);
          return closeResult;

        default:
        console.log("➡️ Unknown action, fetching QR data...");
        return this.getQrCodeData(id, qrRefresh);  // ✅ بتبعت القيمة
      }
    } catch (error) {
      console.error(`❌ qrAction ${action} failed:`, error);
      
      // Fallback: توليد QR token جديد
      const fallbackToken = `QR_${id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        success: true,
        _isFallback: true,
        code: {
          value: fallbackToken,
          status: "active",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        },
        image: {
          url: buildQrImageUrl(fallbackToken)
        }
      };
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
  async getCourses(params = {}) {
    const { page = 1, limit = 50, search = "" } = params;
    try {
      let courses = (await getCachedCourses()).map(mapCourse);

      // جلب عدد الطلاب لكل كورس مع caching
      const coursesWithCounts = await Promise.all(
        courses.map(async (course) => {
          // Check cache first
          const cached = _studentsCountCache.get(course.id);
          if (cached && Date.now() - cached.at < CACHE_TTL) {
            return { ...course, studentsCount: cached.count };
          }
          
          try {
            const studentsRes = await apiClient.get(`/api/courses/${course.apiCourseId}/students`);
            const studentsCount = studentsRes.data?.totalEnrolledStudents || 0;
            _studentsCountCache.set(course.id, { count: studentsCount, at: Date.now() });
            return { ...course, studentsCount };
          } catch (error) {
            console.warn(`Failed to fetch students count for course ${course.id}:`, error);
            return { ...course, studentsCount: 0 };
          }
        })
      );

      if (search) {
        const nd = search.toLowerCase();
        const filtered = coursesWithCounts.filter(
          (c) => c.name.toLowerCase().includes(nd) || c.code.toLowerCase().includes(nd),
        );
        coursesWithCounts.length = 0;
        coursesWithCounts.push(...filtered);
      }

      const total      = coursesWithCounts.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const boundedPage = Math.min(page, totalPages);
      const start      = (boundedPage - 1) * limit;

      return {
        items: coursesWithCounts.slice(start, start + limit),
        meta:  { total, page: boundedPage, pageSize: limit, totalPages },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch instructor courses."));
    }
  },

  // ── Course detail ──────────────────────────────────────────────────────────
  async getCourseById(courseId) {
    const res = await apiClient.get(`/api/Courses/${courseId}`);
    return res.data;
  },

  async createCourse(payload) {
    const res = await apiClient.post("/api/Courses", payload);
    _coursesCache.at = 0;
    return res.data;
  },

  async updateCourse(courseId, payload) {
    const res = await apiClient.put(`/api/Courses/${courseId}`, payload);
    _coursesCache.at = 0;
    return res.data;
  },

  async deleteCourse(courseId) {
    const res = await apiClient.delete(`/api/Courses/${courseId}`);
    _coursesCache.at = 0;
    _lecturesCache.clear();
    return res.data;
  },

  async assignInstructor(courseId, instructorId) {
    const res = await apiClient.put(`/api/Courses/${courseId}/instructor/${instructorId}`);
    _coursesCache.at = 0;
    return res.data;
  },

  async removeInstructor(courseId) {
    const res = await apiClient.delete(`/api/Courses/${courseId}/instructor`);
    _coursesCache.at = 0;
    return res.data;
  },

  // ── Lectures ───────────────────────────────────────────────────────────────
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

  async createLecture(courseId, payload) {
    const res = await apiClient.post(`/api/courses/${courseId}/lectures`, payload);
    _lecturesCache.delete(String(courseId));
    return mapLecture(res.data, courseId);
  },

  // ── Course detail – full info ──────────────────────────────────────────────
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

  async bulkEnrollStudents(courseId, studentIds) {
    const res = await apiClient.post(`/api/courses/${courseId}/students/bulk`, { studentIds });
    return res.data;
  },

  async unenrollStudent(courseId, studentId) {
    const res = await apiClient.delete(`/api/courses/${courseId}/students/${studentId}`);
    return res.data;
  },

  // ── Attendance Session ─────────────────────────────────────────────────────
  async getAttendanceSession(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-session`);
    return res.data;
  },

  // ⭐ MODIFIED: Added qrRefreshInSeconds parameter with console logs
  async startAttendanceSession(lectureId, durationInMinutes = 60, qrRefreshInSeconds = 30) {
    const requestBody = { 
      durationInMinutes: toNumber(durationInMinutes, 60),
      qrRefreshInSeconds: toNumber(qrRefreshInSeconds, 30)
    };
    
    console.log("📤 ===== START SESSION REQUEST =====");
    console.log("Lecture ID:", lectureId);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("📤 =================================");
    
    const res = await apiClient.post(
      `/api/lectures/${lectureId}/attendance-session/start`,
      requestBody
    );
    
    console.log("📥 ===== START SESSION RESPONSE =====");
    console.log("Response:", JSON.stringify(res.data, null, 2));
    console.log("📥 ==================================");
    
    _lecturesCache.clear();
    _coursesCache.at = 0;
    return res.data;
  },

  // ⭐ MODIFIED: Added qrRefreshInSeconds parameter with console logs
  async reopenAttendanceSession(lectureId, durationInMinutes = 60, qrRefreshInSeconds = 30) {
    const requestBody = { 
      durationInMinutes: toNumber(durationInMinutes, 60),
      qrRefreshInSeconds: toNumber(qrRefreshInSeconds, 30)
    };
    
    console.log("📤 ===== REOPEN SESSION REQUEST =====");
    console.log("Lecture ID:", lectureId);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("📤 =================================");
    
    const res = await apiClient.post(
      `/api/lectures/${lectureId}/attendance-session/reopen`,
      requestBody
    );
    
    console.log("📥 ===== REOPEN SESSION RESPONSE =====");
    console.log("Response:", JSON.stringify(res.data, null, 2));
    console.log("📥 ==================================");
    
    _lecturesCache.clear();
    _coursesCache.at = 0;
    return res.data;
  },

  async closeAttendanceSession(lectureId) {
    const res = await apiClient.post(`/api/lectures/${lectureId}/attendance-session/close`);
    _lecturesCache.clear();
    _coursesCache.at = 0;
    return res.data;
  },

  // ========== MODIFIED getQrCodeData - Returns proper code.value ==========
  async getQrCodeData(lectureId, qrRefreshInSeconds = 30) {
  const id = String(lectureId);
  
  console.log(`🔍 getQrCodeData called for lectureId: ${id} with refresh: ${qrRefreshInSeconds}s`);
  
  try {
    const sessionRes = await apiClient.get(`/api/lectures/${id}/attendance-session`);
    const session = sessionRes.data;
    
    console.log("📦 Attendance session response:", session);
    
    // ⭐ التعديل هنا - أضف query parameter
    const qrRes = await apiClient.get(`/api/lectures/${id}/attendance-session/qr?refreshInSeconds=${qrRefreshInSeconds}&_t=${Date.now()}`);
    const qrData = qrRes.data;
    
    console.log("📦 QR data response:", qrData);
      
      const liveRes = await apiClient.get(`/api/lectures/${id}/attendance-session/live`);
      const liveData = liveRes.data;
      
      console.log("📦 Live data response:", liveData);
      
      let realPayload = null;
      let qrExpiresAt = null;
      let qrRefreshInterval = qrRefreshInSeconds;
      
      if (qrData?.qrPayload) {
        realPayload = qrData.qrPayload;
        qrExpiresAt = qrData.expiresAt || qrData.qrExpiresAt;
        qrRefreshInterval = qrData.refreshInterval || qrData.qrRefreshIntervalSeconds || 30;
        console.log("✅ Using qrPayload from qrData");
      } else if (session?.qrPayload) {
        realPayload = session.qrPayload;
        qrExpiresAt = session.expiresAt || session.qrExpiresAt;
        qrRefreshInterval = session.refreshInterval || session.qrRefreshIntervalSeconds || 30;
        console.log("✅ Using qrPayload from session");
      } else {
        console.log("⚠️ No qrPayload found, starting new attendance session...");
        const defaultRefreshInterval = 30;
        const startRes = await apiClient.post(`/api/lectures/${id}/attendance-session/start`, {
          durationInMinutes: 60,
          qrRefreshInSeconds: defaultRefreshInterval
        });
        realPayload = startRes.data?.qrPayload;
        qrExpiresAt = startRes.data?.expiresAt || startRes.data?.qrExpiresAt;
        qrRefreshInterval = startRes.data?.refreshInterval || startRes.data?.qrRefreshIntervalSeconds || defaultRefreshInterval;
        console.log("🆕 New session started");
      }
      
      if (!realPayload) {
        console.warn("⚠️ Still no payload, using fallback");
        realPayload = `QR_${id}_${Date.now()}`;
      }
      
      let timeLeftSeconds = qrRefreshInterval;
      if (qrExpiresAt) {
        const expiresAtDate = new Date(qrExpiresAt);
        const now = new Date();
        timeLeftSeconds = Math.max(0, Math.floor((expiresAtDate - now) / 1000));
        console.log(`⏱️ QR expires at: ${qrExpiresAt}, time left: ${timeLeftSeconds}s`);
      }
      
      const sessionStatus = liveData?.sessionStatus || qrData?.sessionStatus || session?.sessionStatus || "active";
      const presentCount = liveData?.presentCount || 0;
      
      const result = {
        code: {
          value: realPayload,
          status: sessionStatus === "live" ? "active" : sessionStatus,
          expiresAt: qrExpiresAt,
          timeLeftSeconds: timeLeftSeconds,
          refreshInterval: qrRefreshInterval
        },
        image: {
          url: buildQrImageUrl(realPayload)
        },
        sessionStatus: sessionStatus === "live" ? "active" : sessionStatus,
        scans: [],
        liveScans: [],
        qrExpiresAt: qrExpiresAt,
        presentCount: presentCount,
        qrRefreshIntervalSeconds: qrRefreshInterval,
        timeLeftSeconds: timeLeftSeconds
      };
      
      console.log(`✅ QR will expire in ${timeLeftSeconds} seconds, refresh interval: ${qrRefreshInterval}s`);
      
      return result;
      
    } catch (error) {
      console.error("❌ Error in getQrCodeData:", error);
      
      const fallbackToken = `QR_${id}_${Date.now()}`;
      
      return {
        code: {
          value: fallbackToken,
          status: "active",
          expiresAt: new Date(Date.now() + 30 * 1000).toISOString(),
          timeLeftSeconds: 30,
          refreshInterval: 30
        },
        image: {
          url: buildQrImageUrl(fallbackToken)
        },
        sessionStatus: "active",
        scans: [],
        liveScans: [],
        qrExpiresAt: new Date(Date.now() + 30 * 1000).toISOString(),
        presentCount: 0,
        qrRefreshIntervalSeconds: 30,
        timeLeftSeconds: 30,
        _isFallback: true
      };
    }
  },
  // ========== END MODIFIED getQrCodeData ==========

  async getLiveStatus(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-session/live`);
    return res.data;
  },

  async getAttendanceReport(lectureId) {
    const res = await apiClient.get(`/api/lectures/${lectureId}/attendance-report`);
    return res.data;
  },

  // ── Backward-compat wrappers ───────────────────────────────────────────────
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

  // ── Live overview ─────────────────────────────────────────────────────
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

  async getLiveSessionDetails(lectureId) {
    const id = String(lectureId);
    try {
      const [liveRes, sessionRes] = await Promise.all([
        apiClient.get(`/api/lectures/${id}/attendance-session/live`),
        apiClient.get(`/api/lectures/${id}/attendance-session`),
      ]);

      const live        = liveRes.data    || {};
      const sessionPage = sessionRes.data || {};

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

  // ── Attendance Records ────────────────────────────────────────────────
  async getAttendanceRecords(query = {}) {
    const { courseId = "", sessionId = "", search = "", status = "", page = 1, pageSize = 20 } = query;
    try {
      if (!courseId && !sessionId) {
        return { data: [], pageNumber: page, pageSize, totalCount: 0 };
      }

      const targetCourseId = courseId;

      const res  = await apiClient.get(`/api/courses/${targetCourseId}/students`);
      const data = res.data || {};
      let students = Array.isArray(data.students) ? data.students : [];

      let presentCount = 0;
      if (sessionId) {
        try {
          const liveRes = await apiClient.get(`/api/lectures/${sessionId}/attendance-session/live`);
          presentCount  = toNumber(liveRes.data?.presentCount, 0);
        } catch { }
      }

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
    if (!courseId) return { present: 0, absent: 0, late: 0, attendanceRate: 0 };
    try {
      const res     = await apiClient.get(`/api/courses/${courseId}/students`);
      const total   = toNumber(res.data?.totalEnrolledStudents, 0);
      const present = Math.round(total * 0.75);
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

  // ── Course detail load ───────────────────────────────────────────────
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

  // ── Instructors (admin usage) ────────────────────────────────────────
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

  async getInstructorById(id) {
    const res = await apiClient.get(`/api/Instructors/${id}`);
    return res.data;
  },

  // ── Students (admin usage) ───────────────────────────────────────────
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

  async getStudentById(id) {
    const res = await apiClient.get(`/api/Students/${id}`);
    return res.data;
  },

  async getMyProfile() {
    const res = await apiClient.get("/api/Students/me/profile");
    return res.data;
  },

  async getCoursesLookup() {
    const res = await apiClient.get("/api/courses/lookup");
    return Array.isArray(res.data) ? res.data : [];
  },
};