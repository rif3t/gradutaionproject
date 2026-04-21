import apiClient, { getApiErrorMessage } from "./apiClient";

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const semesterLabels = {
  1: "First",
  2: "Second",
  3: "Summer",
};

const coursesCache = {
  at: 0,
  data: [],
};

const lecturesCache = new Map();
const lectureIndex = new Map();

const CACHE_TTL_MS = 30000;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildPaged = (items, page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const boundedPage = Math.min(safePage, totalPages);
  const start = (boundedPage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    meta: {
      total,
      page: boundedPage,
      pageSize: safePageSize,
      totalPages,
    },
  };
};

const normalizeText = (value) => (value || "").toString().trim();

const parseDateTime = (value) => {
  if (!value) {
    return { date: "", time: "" };
  }

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return { date: "", time: "" };
  }

  const date = dateObj.toISOString().slice(0, 10);
  const time = dateObj.toTimeString().slice(0, 5);
  return { date, time };
};

const mapSessionStatus = (status) => {
  const value = normalizeText(status).toLowerCase();

  if (
    value.includes("active") ||
    value.includes("open") ||
    value.includes("live")
  ) {
    return "live";
  }

  if (
    value.includes("close") ||
    value.includes("end") ||
    value.includes("complete") ||
    value.includes("finished")
  ) {
    return "completed";
  }

  return "scheduled";
};

const mapQrStatus = (sessionStatus) => {
  if (sessionStatus === "live") {
    return "active";
  }

  if (sessionStatus === "completed") {
    return "expired";
  }

  return "inactive";
};

const sortItems = (items, sortBy, order) => {
  if (!sortBy) {
    return items;
  }

  const direction = order === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = a?.[sortBy];
    const bv = b?.[sortBy];

    if (av === bv) {
      return 0;
    }

    if (av === undefined || av === null || av === "") {
      return 1;
    }

    if (bv === undefined || bv === null || bv === "") {
      return -1;
    }

    return av > bv ? direction : -direction;
  });
};

const buildQrImageUrl = (payload) => {
  const encoded = encodeURIComponent(payload || "FCAI-ATTENDANCE");
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}`;
};

const fallback = (error, data, fallbackMessage) => ({
  ...data,
  warning: getApiErrorMessage(error, fallbackMessage),
});

const mapCourse = (course) => {
  const courseId = String(course.courseId);
  return {
    id: courseId,
    apiCourseId: toNumber(course.courseId),
    name: course.courseName || `Course ${courseId}`,
    code: course.courseCode || `C-${courseId}`,
    semester: semesterLabels[course.semester] || "N/A",
    department: course.departmentName || "N/A",
    status: "Active",
    studentsCount: 0,
    sessionsCount: 0,
    attendanceRate: 0,
  };
};

const mapLecture = (lecture, course) => {
  const lectureId = String(lecture.lectureId);
  const parsed = parseDateTime(lecture.lectureDate);
  const mappedStatus = mapSessionStatus(lecture.sessionStatus);

  return {
    id: lectureId,
    lectureId: toNumber(lecture.lectureId),
    courseId: String(course.courseId),
    title: lecture.lectureName || `Lecture ${lectureId}`,
    date: parsed.date,
    startTime: parsed.time,
    durationMinutes: 90,
    status: mappedStatus,
    location: lecture.location || "",
    rawStatus: lecture.sessionStatus || "",
  };
};

const indexLecture = (lecture, course) => {
  lectureIndex.set(String(lecture.lectureId), {
    lecture,
    course,
  });
};

const getCachedCourses = async (force = false) => {
  if (
    !force &&
    Date.now() - coursesCache.at < CACHE_TTL_MS &&
    coursesCache.data.length
  ) {
    return coursesCache.data;
  }

  const response = await apiClient.get("/api/Instructors/my-courses");
  const list = Array.isArray(response.data) ? response.data : [];
  coursesCache.at = Date.now();
  coursesCache.data = list;
  return list;
};

const getCachedCourseLectures = async (course, force = false) => {
  const key = String(course.courseId);
  const cached = lecturesCache.get(key);
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await apiClient.get(
    `/api/courses/${course.courseId}/lectures`,
  );
  const lectures = Array.isArray(response.data) ? response.data : [];
  lectures.forEach((lecture) => indexLecture(lecture, course));
  lecturesCache.set(key, {
    at: Date.now(),
    data: lectures,
  });
  return lectures;
};

const getAllLectures = async (force = false) => {
  const courses = await getCachedCourses(force);
  const lectureSets = await Promise.all(
    courses.map((course) => getCachedCourseLectures(course, force)),
  );

  return lectureSets.flatMap((lectures, index) =>
    lectures.map((lecture) => mapLecture(lecture, courses[index])),
  );
};

const findCourseAndLecture = async (lectureId) => {
  const key = String(lectureId);
  const indexed = lectureIndex.get(key);
  if (indexed) {
    return indexed;
  }

  await getAllLectures(true);
  return lectureIndex.get(key) || null;
};

const getCourseStudentsPage = async (courseId) => {
  const response = await apiClient.get(`/api/courses/${courseId}/students`);
  return response.data || {};
};

const mockParticipants = [
  { id: "1", fullName: "Student 1", group: "A", status: "Present" },
  { id: "2", fullName: "Student 2", group: "A", status: "Absent" },
  { id: "3", fullName: "Student 3", group: "B", status: "Late" },
];

const mockAttendanceRecords = Array.from({ length: 30 }).map((_, index) => {
  const day = String(1 + (index % 28)).padStart(2, "0");
  const statuses = ["Present", "Absent", "Late", "Excused"];

  return {
    id: `AR-${index + 1}`,
    studentName: `Student ${index + 1}`,
    courseCode: `COURSE-${(index % 5) + 1}`,
    sessionId: `${(index % 12) + 1}`,
    status: statuses[index % statuses.length],
    date: `2026-04-${day}`,
    time: `10:${String((index * 3) % 60).padStart(2, "0")}`,
  };
});

export const instructorDashboardApi = {
  async getDashboardData() {
    try {
      const courses = await getCachedCourses();
      const mappedCourses = courses.map(mapCourse);

      const lectureSets = await Promise.all(
        courses.map((course) => getCachedCourseLectures(course)),
      );
      const lectures = lectureSets.flatMap((set, index) =>
        set.map((lecture) => mapLecture(lecture, courses[index])),
      );

      const studentTotals = await Promise.allSettled(
        courses.map((course) => getCourseStudentsPage(course.courseId)),
      );

      const studentsCount = studentTotals.reduce((acc, current) => {
        if (current.status !== "fulfilled") {
          return acc;
        }
        return acc + toNumber(current.value.totalEnrolledStudents);
      }, 0);

      const liveSessions = lectures.filter((item) => item.status === "live");
      const completedSessions = lectures.filter(
        (item) => item.status === "completed",
      );
      const attendanceRate = lectures.length
        ? Math.round((completedSessions.length / lectures.length) * 100)
        : 0;

      const upcomingSessions = [...lectures]
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .slice(0, 5);

      const recentActivity = [...lectures]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6)
        .map((lecture) => ({
          id: `ACT-${lecture.id}`,
          title: `Lecture ${lecture.title}`,
          subtitle: `${lecture.date} ${lecture.startTime}`,
          time: lecture.rawStatus || lecture.status,
        }));

      const alerts = [];
      if (mappedCourses.length === 0) {
        alerts.push({
          id: "AL-1",
          severity: "warning",
          message: "No courses assigned to this instructor.",
        });
      }

      return {
        overview: {
          coursesCount: mappedCourses.length,
          studentsCount,
          lecturesCount: lectures.length,
          attendanceRate,
        },
        stats: {
          averageAttendanceRate: attendanceRate,
          activeSessions: liveSessions.length,
          coursesAtRisk: 0,
          attendanceTrend: "-",
        },
        summary: {
          topCourse: mappedCourses[0]?.name || "N/A",
          latestSessionStatus: liveSessions.length ? "Live" : "Idle",
        },
        attendanceOverview: {
          present: 0,
          absent: 0,
          late: 0,
        },
        upcomingSessions,
        recentActivity,
        alerts,
      };
    } catch (error) {
      await wait(150);
      return fallback(
        error,
        {
          overview: {
            coursesCount: 0,
            studentsCount: 0,
            lecturesCount: 0,
            attendanceRate: 0,
          },
          stats: {
            averageAttendanceRate: 0,
            activeSessions: 0,
            coursesAtRisk: 0,
            attendanceTrend: "-",
          },
          summary: {
            topCourse: "N/A",
            latestSessionStatus: "Idle",
          },
          attendanceOverview: {
            present: 0,
            absent: 0,
            late: 0,
          },
          upcomingSessions: [],
          recentActivity: [],
          alerts: [],
        },
        "Dashboard data loaded with partial fallback.",
      );
    }
  },

  async getDashboardTrends(range = "weekly") {
    const labelsByRange = {
      daily: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      weekly: ["Week 1", "Week 2", "Week 3", "Week 4"],
      monthly: ["W1", "W2", "W3", "W4"],
    };

    const labels = labelsByRange[range] || labelsByRange.weekly;
    return labels.map((label, index) => ({
      label,
      attendanceRate: 70 + index * 5,
    }));
  },

  async getCourses(params = {}) {
    const {
      page = 1,
      limit = 8,
      search = "",
      status = "",
      semester = "",
      department = "",
      sortBy = "name",
      order = "asc",
    } = params;

    try {
      const courses = (await getCachedCourses()).map(mapCourse);
      let filtered = [...courses];

      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter(
          (course) =>
            course.name.toLowerCase().includes(needle) ||
            course.code.toLowerCase().includes(needle),
        );
      }

      if (status) {
        filtered = filtered.filter(
          (course) => course.status.toLowerCase() === status.toLowerCase(),
        );
      }

      if (semester) {
        filtered = filtered.filter((course) => course.semester === semester);
      }

      if (department) {
        filtered = filtered.filter(
          (course) => course.department === department,
        );
      }

      filtered = sortItems(filtered, sortBy, order);
      return buildPaged(filtered, page, limit);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch instructor courses."),
      );
    }
  },

  async createCourse(payload) {
    const response = await apiClient.post("/api/Courses", payload);
    coursesCache.at = 0;
    return response.data;
  },

  async updateCourse(courseId, payload) {
    const response = await apiClient.put(`/api/Courses/${courseId}`, payload);
    coursesCache.at = 0;
    return response.data;
  },

  async deleteCourse(courseId) {
    const response = await apiClient.delete(`/api/Courses/${courseId}`);
    coursesCache.at = 0;
    lecturesCache.clear();
    return response.data;
  },

  async getCourseStudents(courseId, params = {}) {
    try {
      const { page = 1, limit = 5, search = "" } = params;
      const pageData = await getCourseStudentsPage(courseId);
      const source = Array.isArray(pageData.students) ? pageData.students : [];

      let students = source.map((student) => ({
        id: String(student.studentId),
        fullName: student.fullName || `Student ${student.studentId}`,
        group: student.departmentName || "N/A",
        status: student.canUnenroll ? "Present" : "Absent",
      }));

      if (search) {
        const needle = search.toLowerCase();
        students = students.filter((student) =>
          student.fullName.toLowerCase().includes(needle),
        );
      }

      return buildPaged(students, page, limit);
    } catch (error) {
      return fallback(
        error,
        buildPaged(mockParticipants, params.page || 1, params.limit || 5),
        "Students loaded from fallback data.",
      );
    }
  },

  async getCourseSessions(courseId, params = {}) {
    try {
      const { page = 1, limit = 5, status = "" } = params;
      const courses = await getCachedCourses();
      const course = courses.find(
        (item) => String(item.courseId) === String(courseId),
      );

      if (!course) {
        return buildPaged([], page, limit);
      }

      const lectures = await getCachedCourseLectures(course);
      let mapped = lectures.map((lecture) => mapLecture(lecture, course));

      if (status) {
        mapped = mapped.filter((lecture) => lecture.status === status);
      }

      return buildPaged(mapped, page, limit);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch lectures."));
    }
  },

  async getQrSessions(params = {}) {
    try {
      const {
        page = 1,
        limit = 6,
        search = "",
        status = "",
        courseId = "",
      } = params;

      const lectures = await getAllLectures();

      let sessions = lectures.map((lecture) => ({
        id: String(lecture.lectureId),
        sessionId: String(lecture.lectureId),
        courseId: lecture.courseId,
        courseName: lecture.title,
        scansCount: 0,
        status: mapQrStatus(lecture.status),
      }));

      if (search) {
        const needle = search.toLowerCase();
        sessions = sessions.filter(
          (session) =>
            session.courseName.toLowerCase().includes(needle) ||
            session.id.toLowerCase().includes(needle),
        );
      }

      if (status) {
        sessions = sessions.filter((session) => session.status === status);
      }

      if (courseId) {
        sessions = sessions.filter(
          (session) => session.courseId === String(courseId),
        );
      }

      return buildPaged(sessions, page, limit);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch QR session list."),
      );
    }
  },

  async getQrSession(qrSessionId) {
    const result = await this.getQrSessions({ page: 1, limit: 200 });
    return result.items.find((item) => item.id === String(qrSessionId)) || null;
  },

  async createQrSession(payload) {
    const lectureId = payload?.lectureId;
    if (!lectureId) {
      throw new Error("lectureId is required to create a QR session.");
    }

    const response = await apiClient.post(
      `/api/lectures/${lectureId}/attendance-session/start`,
      {
        durationInMinutes: toNumber(payload.durationInMinutes, 60),
      },
    );
    return response.data;
  },

  async updateQrSession(qrSessionId, payload) {
    const response = await apiClient.post(
      `/api/lectures/${qrSessionId}/attendance-session/reopen`,
      {
        durationInMinutes: toNumber(payload?.durationInMinutes, 60),
      },
    );
    return response.data;
  },

  async deleteQrSession(qrSessionId) {
    const response = await apiClient.post(
      `/api/lectures/${qrSessionId}/attendance-session/close`,
    );
    return response.data;
  },

  async qrAction(qrSessionId, action, payload = {}) {
    const lectureId = String(qrSessionId);
    const openActions = [
      "generate",
      "activate",
      "regenerate",
      "start",
      "resume",
    ];
    const closeActions = [
      "deactivate",
      "expire",
      "close",
      "stop",
      "end",
      "pause",
    ];

    try {
      if (openActions.includes(action)) {
        const endpoint = action === "regenerate" ? "reopen" : "start";
        const response = await apiClient.post(
          `/api/lectures/${lectureId}/attendance-session/${endpoint}`,
          {
            durationInMinutes: toNumber(payload?.durationInMinutes, 60),
          },
        );
        return response.data;
      }

      if (closeActions.includes(action)) {
        const response = await apiClient.post(
          `/api/lectures/${lectureId}/attendance-session/close`,
        );
        return response.data;
      }

      return {
        lectureId,
        action,
        status: "ignored",
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, `Failed to execute QR action: ${action}.`),
      );
    }
  },

  async getQrCodeData(qrSessionId) {
    const lectureId = String(qrSessionId);

    const [sessionRes, qrRes, liveRes] = await Promise.allSettled([
      apiClient.get(`/api/lectures/${lectureId}/attendance-session`),
      apiClient.get(`/api/lectures/${lectureId}/attendance-session/qr`),
      apiClient.get(`/api/lectures/${lectureId}/attendance-session/live`),
    ]);

    const session =
      sessionRes.status === "fulfilled" ? sessionRes.value.data : null;
    const qrData = qrRes.status === "fulfilled" ? qrRes.value.data : null;
    const liveData = liveRes.status === "fulfilled" ? liveRes.value.data : null;

    const payload =
      qrData?.qrPayload ||
      qrData?.qr ||
      session?.qrPayload ||
      session?.qr ||
      `${lectureId}-${Date.now()}`;
    const qrExpiresAt =
      qrData?.qrExpiresAt ||
      session?.qrExpiresAt ||
      new Date(Date.now() + 30000).toISOString();
    const sessionStatus =
      qrData?.sessionStatus ||
      liveData?.sessionStatus ||
      session?.sessionStatus ||
      "unknown";
    const presentCount = toNumber(
      liveData?.presentCount,
      toNumber(session?.presentCount, 0),
    );

    const liveScans = Array.from({ length: Math.min(presentCount, 8) }).map(
      (_, index) => ({
        id: `LIVE-${lectureId}-${index + 1}`,
        studentName: `Present Student ${index + 1}`,
        at: new Date(Date.now() - index * 45000).toLocaleTimeString(),
      }),
    );

    return {
      code: {
        value: payload,
        expiresAt: qrExpiresAt,
        status: sessionStatus,
      },
      image: { url: buildQrImageUrl(payload) },
      scans: liveScans,
      liveScans,
      qrExpiresAt,
      sessionStatus,
    };
  },

  async getLiveOverview() {
    const sessionsPage = await this.getLiveSessions({ page: 1, limit: 200 });
    const sessions = sessionsPage.items || [];
    const activeSessions = sessions.filter(
      (session) => session.status === "live",
    );
    const totalParticipants = sessions.reduce(
      (acc, session) => acc + toNumber(session.presentCount, 0),
      0,
    );

    return {
      activeSessions: activeSessions.length,
      totalParticipants,
      liveAttendanceRate:
        sessions.length === 0
          ? 0
          : Math.round((activeSessions.length / sessions.length) * 100),
    };
  },

  async getLiveSessions(params = {}) {
    const { page = 1, limit = 8 } = params;
    const allLectures = await getAllLectures();

    const sessions = allLectures
      .filter((lecture) => ["live", "scheduled"].includes(lecture.status))
      .map((lecture) => ({
        id: String(lecture.lectureId),
        title: lecture.title,
        date: lecture.date,
        status: lecture.status,
        durationMinutes: lecture.durationMinutes,
        presentCount: 0,
      }));

    return buildPaged(sessions, page, limit);
  },

  async getLiveSessionDetails(sessionId) {
    try {
      const lectureId = String(sessionId);
      const info = await findCourseAndLecture(lectureId);

      const [liveRes, pageRes] = await Promise.all([
        apiClient.get(`/api/lectures/${lectureId}/attendance-session/live`),
        apiClient.get(`/api/lectures/${lectureId}/attendance-session`),
      ]);

      const live = liveRes.data || {};
      const sessionPage = pageRes.data || {};

      let participants = [];
      if (info?.course?.courseId) {
        const studentsPage = await getCourseStudentsPage(info.course.courseId);
        const students = Array.isArray(studentsPage.students)
          ? studentsPage.students
          : [];

        const presentCount = toNumber(live.presentCount, 0);
        participants = students.map((student, index) => ({
          id: String(student.studentId),
          fullName: student.fullName || `Student ${student.studentId}`,
          group: student.departmentName || "N/A",
          status: index < presentCount ? "Present" : "Absent",
        }));
      }

      const present = toNumber(live.presentCount, 0);
      const total = participants.length;

      return {
        session: {
          id: lectureId,
          title:
            info?.lecture?.lectureName ||
            sessionPage.lectureName ||
            `Lecture ${lectureId}`,
          date: parseDateTime(info?.lecture?.lectureDate).date,
          status: mapSessionStatus(
            live.sessionStatus || sessionPage.sessionStatus,
          ),
        },
        attendanceLive: {
          present,
          absent: Math.max(total - present, 0),
          total,
        },
        attendanceStats: {
          checkedIn: present,
          checkedOut: 0,
          late: 0,
        },
        participants,
        events: [
          {
            id: `EV-${lectureId}-1`,
            message: `Session status: ${live.sessionStatus || "unknown"}`,
            time: new Date().toLocaleTimeString(),
          },
          {
            id: `EV-${lectureId}-2`,
            message: `Present count: ${present}`,
            time: new Date().toLocaleTimeString(),
          },
        ],
      };
    } catch (error) {
      return fallback(
        error,
        {
          session: {
            id: String(sessionId),
            title: `Lecture ${sessionId}`,
            date: "",
            status: "scheduled",
          },
          attendanceLive: {
            present: 0,
            absent: mockParticipants.length,
            total: mockParticipants.length,
          },
          attendanceStats: {
            checkedIn: 0,
            checkedOut: 0,
            late: 0,
          },
          participants: mockParticipants,
          events: [],
        },
        "Live details loaded from fallback data.",
      );
    }
  },

  async liveAction(sessionId, action, payload = {}) {
    const openActions = [
      "check-in",
      "open-attendance",
      "unlock-attendance",
      "start",
    ];
    const closeActions = [
      "check-out",
      "lock-attendance",
      "close-attendance",
      "stop",
      "end",
      "pause",
    ];

    if (openActions.includes(action)) {
      return this.sessionAction(sessionId, "start", payload);
    }

    if (closeActions.includes(action)) {
      return this.sessionAction(sessionId, "close", payload);
    }

    return {
      sessionId,
      action,
      payload,
      performedAt: new Date().toISOString(),
    };
  },

  async updateLiveAttendance(sessionId, attendanceId, payload) {
    return {
      sessionId,
      attendanceId,
      payload,
      updatedAt: new Date().toISOString(),
    };
  },

  async deleteLiveAttendance(sessionId, attendanceId) {
    return {
      sessionId,
      attendanceId,
      deletedAt: new Date().toISOString(),
    };
  },

  async getAttendanceRecords(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      from = "",
      to = "",
      sortBy = "date",
      order = "desc",
    } = params;

    let filtered = [...mockAttendanceRecords];

    if (search) {
      const needle = search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.studentName.toLowerCase().includes(needle),
      );
    }

    if (status) {
      filtered = filtered.filter(
        (item) => item.status.toLowerCase() === status.toLowerCase(),
      );
    }

    if (from) {
      filtered = filtered.filter((item) => item.date >= from);
    }

    if (to) {
      filtered = filtered.filter((item) => item.date <= to);
    }

    filtered = sortItems(filtered, sortBy, order);
    return buildPaged(filtered, page, limit);
  },

  async getAttendanceSummary() {
    const present = mockAttendanceRecords.filter(
      (item) => item.status === "Present",
    ).length;
    const absent = mockAttendanceRecords.filter(
      (item) => item.status === "Absent",
    ).length;
    const late = mockAttendanceRecords.filter((item) => item.status === "Late")
      .length;

    return {
      total: mockAttendanceRecords.length,
      present,
      absent,
      late,
      attendanceRate: Math.round(
        (present / Math.max(mockAttendanceRecords.length, 1)) * 100,
      ),
    };
  },

  async attendanceBulkAction(action, payload) {
    return {
      action,
      payload,
      processedAt: new Date().toISOString(),
    };
  },

  async exportAttendance(format = "csv") {
    return {
      format,
      exportedAt: new Date().toISOString(),
    };
  },

  async reviewAttendance(recordId, action) {
    return {
      recordId,
      action,
      reviewedAt: new Date().toISOString(),
    };
  },

  async getSessionControl(params = {}) {
    const {
      page = 1,
      limit = 8,
      status = "",
      search = "",
      sortBy = "date",
      order = "desc",
    } = params;

    const sessions = await getAllLectures();
    let filtered = sessions;

    if (status) {
      filtered = filtered.filter((session) => session.status === status);
    }

    if (search) {
      const needle = search.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(needle) ||
          session.id.toLowerCase().includes(needle),
      );
    }

    filtered = sortItems(filtered, sortBy, order);
    return buildPaged(filtered, page, limit);
  },

  async sessionAction(sessionId, action, payload = {}) {
    const lectureId = String(sessionId);
    const normalizedAction = normalizeText(action).toLowerCase();
    const openActions = [
      "start",
      "resume",
      "open-attendance",
      "unlock-attendance",
    ];
    const closeActions = [
      "stop",
      "pause",
      "close-attendance",
      "lock-attendance",
      "cancel",
      "end",
      "close",
    ];

    if (lectureId === "new") {
      return {
        sessionId,
        action,
        status: "queued",
      };
    }

    if (openActions.includes(normalizedAction)) {
      const response = await apiClient.post(
        `/api/lectures/${lectureId}/attendance-session/start`,
        { durationInMinutes: toNumber(payload?.durationInMinutes, 60) },
      );
      return response.data;
    }

    if (closeActions.includes(normalizedAction)) {
      const response = await apiClient.post(
        `/api/lectures/${lectureId}/attendance-session/close`,
      );
      return response.data;
    }

    return {
      sessionId,
      action,
      status: "ignored",
    };
  },

  async getSessionTimeline(sessionId) {
    const lectureId = String(sessionId);
    const response = await apiClient.get(
      `/api/lectures/${lectureId}/attendance-session`,
    );
    const session = response.data || {};

    return [
      {
        id: `TL-${lectureId}-1`,
        title: "Session loaded",
        time: new Date().toLocaleTimeString(),
      },
      {
        id: `TL-${lectureId}-2`,
        title: `Status: ${session.sessionStatus || "unknown"}`,
        time: new Date().toLocaleTimeString(),
      },
      {
        id: `TL-${lectureId}-3`,
        title: `Present count: ${toNumber(session.presentCount, 0)}`,
        time: new Date().toLocaleTimeString(),
      },
    ];
  },

  async getSessionLogs(sessionId) {
    const lectureId = String(sessionId);
    const response = await apiClient.get(
      `/api/lectures/${lectureId}/attendance-session/live`,
    );
    const live = response.data || {};

    return [
      {
        id: `LOG-${lectureId}-1`,
        level: "info",
        message: `Live session status: ${live.sessionStatus || "unknown"}`,
        at: new Date().toLocaleTimeString(),
      },
      {
        id: `LOG-${lectureId}-2`,
        level: "info",
        message: `Present students: ${toNumber(live.presentCount, 0)}`,
        at: new Date().toLocaleTimeString(),
      },
    ];
  },
};
