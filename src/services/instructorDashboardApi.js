import apiClient, { getApiErrorMessage } from "./apiClient";

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

const withQuery = (url, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const statusMap = {
  active: "Active",
  completed: "Completed",
  draft: "Draft",
  archived: "Archived",
};

const mockCourses = [
  {
    id: "cs401",
    name: "Advanced Databases",
    code: "CS401",
    semester: "Spring 2026",
    department: "Computer Science",
    status: "Active",
    studentsCount: 78,
    sessionsCount: 11,
    attendanceRate: 89,
  },
  {
    id: "cs311",
    name: "Operating Systems",
    code: "CS311",
    semester: "Spring 2026",
    department: "Computer Science",
    status: "Active",
    studentsCount: 64,
    sessionsCount: 13,
    attendanceRate: 84,
  },
  {
    id: "is210",
    name: "Information Systems",
    code: "IS210",
    semester: "Spring 2026",
    department: "Information Systems",
    status: "Completed",
    studentsCount: 52,
    sessionsCount: 15,
    attendanceRate: 91,
  },
  {
    id: "ai320",
    name: "Machine Learning Basics",
    code: "AI320",
    semester: "Spring 2026",
    department: "Artificial Intelligence",
    status: "Draft",
    studentsCount: 39,
    sessionsCount: 5,
    attendanceRate: 0,
  },
];

const mockStudents = [
  { id: "S1001", fullName: "Sara Adel", group: "G1", status: "Present" },
  { id: "S1002", fullName: "Omar Hisham", group: "G1", status: "Absent" },
  { id: "S1003", fullName: "Mariam Tarek", group: "G2", status: "Present" },
  { id: "S1004", fullName: "Youssef Nader", group: "G2", status: "Late" },
  { id: "S1005", fullName: "Habiba Emad", group: "G3", status: "Present" },
  { id: "S1006", fullName: "Karim Osama", group: "G3", status: "Present" },
];

const mockSessions = [
  {
    id: "SES-901",
    courseId: "cs401",
    title: "Transaction Recovery",
    status: "live",
    date: "2026-04-19",
    startTime: "10:00",
    durationMinutes: 90,
    attendanceLocked: false,
  },
  {
    id: "SES-902",
    courseId: "cs311",
    title: "Virtual Memory",
    status: "scheduled",
    date: "2026-04-21",
    startTime: "12:00",
    durationMinutes: 90,
    attendanceLocked: true,
  },
  {
    id: "SES-903",
    courseId: "is210",
    title: "ER Modeling Workshop",
    status: "completed",
    date: "2026-04-16",
    startTime: "09:30",
    durationMinutes: 120,
    attendanceLocked: true,
  },
];

const mockQrSessions = [
  {
    id: "QR-1201",
    sessionId: "SES-901",
    courseId: "cs401",
    courseName: "Advanced Databases",
    status: "active",
    scansCount: 35,
    generatedAt: "2026-04-19T10:01:00Z",
    expiresAt: "2026-04-19T11:15:00Z",
  },
  {
    id: "QR-1202",
    sessionId: "SES-902",
    courseId: "cs311",
    courseName: "Operating Systems",
    status: "inactive",
    scansCount: 0,
    generatedAt: "2026-04-18T16:10:00Z",
    expiresAt: "2026-04-21T13:15:00Z",
  },
  {
    id: "QR-1203",
    sessionId: "SES-903",
    courseId: "is210",
    courseName: "Information Systems",
    status: "expired",
    scansCount: 47,
    generatedAt: "2026-04-16T08:45:00Z",
    expiresAt: "2026-04-16T12:00:00Z",
  },
];

const mockAttendanceRecords = Array.from({ length: 42 }).map((_, index) => {
  const day = String(10 + (index % 9)).padStart(2, "0");
  const statuses = ["Present", "Absent", "Late", "Excused"];

  return {
    id: `AR-${index + 1}`,
    studentId: `S${1000 + (index % 10)}`,
    studentName: mockStudents[index % mockStudents.length].fullName,
    courseId: mockCourses[index % mockCourses.length].id,
    courseCode: mockCourses[index % mockCourses.length].code,
    sessionId: mockSessions[index % mockSessions.length].id,
    date: `2026-04-${day}`,
    time: `0${8 + (index % 4)}:${index % 2 === 0 ? "10" : "40"}`,
    status: statuses[index % statuses.length],
  };
});

const mockEvents = [
  {
    id: "EV-1",
    type: "check-in",
    message: "Sara Adel checked in",
    time: "10:04:12",
  },
  {
    id: "EV-2",
    type: "check-in",
    message: "Mariam Tarek checked in",
    time: "10:06:01",
  },
  {
    id: "EV-3",
    type: "lock",
    message: "Attendance was locked",
    time: "10:35:54",
  },
  {
    id: "EV-4",
    type: "unlock",
    message: "Attendance was unlocked",
    time: "10:40:22",
  },
];

const sortItems = (items, sortBy, order) => {
  if (!sortBy) {
    return items;
  }

  const direction = order === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];

    if (av === bv) {
      return 0;
    }

    if (av === undefined || av === null) {
      return 1;
    }

    if (bv === undefined || bv === null) {
      return -1;
    }

    return av > bv ? direction : -direction;
  });
};

const fallback = (error, data, fallbackMessage) => ({
  ...data,
  warning: getApiErrorMessage(error, fallbackMessage),
});

export const instructorDashboardApi = {
  async getDashboardData() {
    try {
      const [
        dashboardRes,
        statsRes,
        summaryRes,
        attendanceRes,
        sessionsRes,
        activityRes,
        alertsRes,
      ] = await Promise.all([
        apiClient.get("/instructor/dashboard"),
        apiClient.get("/instructor/dashboard/stats"),
        apiClient.get("/instructor/dashboard/summary"),
        apiClient.get("/instructor/dashboard/attendance-overview"),
        apiClient.get("/instructor/dashboard/upcoming-sessions"),
        apiClient.get("/instructor/dashboard/recent-activity"),
        apiClient.get("/instructor/dashboard/alerts"),
      ]);

      return {
        overview: dashboardRes.data.overview || statsRes.data,
        stats: statsRes.data,
        summary: summaryRes.data,
        attendanceOverview: attendanceRes.data,
        upcomingSessions: sessionsRes.data.items || sessionsRes.data,
        recentActivity: activityRes.data.items || activityRes.data,
        alerts: alertsRes.data.items || alertsRes.data,
      };
    } catch (error) {
      await wait(220);
      return fallback(
        error,
        {
          overview: {
            coursesCount: mockCourses.length,
            studentsCount: mockCourses.reduce(
              (acc, item) => acc + item.studentsCount,
              0,
            ),
            lecturesCount: mockSessions.length * 4,
            attendanceRate: 87,
          },
          stats: {
            averageAttendanceRate: 87,
            activeSessions: 1,
            coursesAtRisk: 1,
            attendanceTrend: "+2.3%",
          },
          summary: {
            topCourse: "Advanced Databases",
            latestSessionStatus: "Live",
          },
          attendanceOverview: {
            present: 186,
            absent: 34,
            late: 12,
          },
          upcomingSessions: mockSessions.filter(
            (item) => item.status !== "completed",
          ),
          recentActivity: [
            {
              id: "ACT-1",
              title: "Session started",
              subtitle: "CS401 - Transaction Recovery",
              time: "2 min ago",
            },
            {
              id: "ACT-2",
              title: "QR regenerated",
              subtitle: "QR-1201",
              time: "11 min ago",
            },
            {
              id: "ACT-3",
              title: "Attendance locked",
              subtitle: "SES-901",
              time: "23 min ago",
            },
          ],
          alerts: [
            {
              id: "AL-1",
              severity: "warning",
              message: "Course CS311 attendance dropped below 85%.",
            },
          ],
        },
        "Dashboard data loaded from offline fallback.",
      );
    }
  },

  async getDashboardTrends(range = "weekly") {
    const endpoint =
      range === "daily"
        ? "/instructor/dashboard/metrics/trends/daily"
        : range === "monthly"
        ? "/instructor/dashboard/metrics/trends/monthly"
        : "/instructor/dashboard/metrics/trends/weekly";

    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch {
      await wait(150);
      const labels =
        range === "daily"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : range === "monthly"
          ? ["W1", "W2", "W3", "W4"]
          : ["Week 1", "Week 2", "Week 3", "Week 4"];

      return labels.map((label, index) => ({
        label,
        attendanceRate: 78 + index * 3,
      }));
    }
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
      const response = await apiClient.get(
        withQuery("/instructor/courses", {
          page,
          limit,
          search,
          status,
          semester,
          department,
          sortBy,
          order,
        }),
      );
      return response.data;
    } catch {
      await wait(150);
      let filtered = [...mockCourses];

      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.code.toLowerCase().includes(needle),
        );
      }

      if (status) {
        filtered = filtered.filter(
          (item) => item.status.toLowerCase() === status.toLowerCase(),
        );
      }

      if (semester) {
        filtered = filtered.filter((item) => item.semester === semester);
      }

      if (department) {
        filtered = filtered.filter((item) => item.department === department);
      }

      filtered = sortItems(filtered, sortBy, order);
      return buildPaged(filtered, page, limit);
    }
  },

  async createCourse(payload) {
    const response = await apiClient.post("/instructor/courses", payload);
    return response.data;
  },

  async updateCourse(courseId, payload, partial = false) {
    const method = partial ? "patch" : "put";
    const response = await apiClient[method](
      `/instructor/courses/${courseId}`,
      payload,
    );
    return response.data;
  },

  async deleteCourse(courseId) {
    const response = await apiClient.delete(`/instructor/courses/${courseId}`);
    return response.data;
  },

  async getCourseStudents(courseId, params = {}) {
    try {
      const response = await apiClient.get(
        withQuery(`/instructor/courses/${courseId}/students`, params),
      );
      return response.data;
    } catch {
      await wait(120);
      const { page = 1, limit = 5, search = "" } = params;
      let filtered = [...mockStudents];
      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter((item) =>
          item.fullName.toLowerCase().includes(needle),
        );
      }

      return buildPaged(filtered, page, limit);
    }
  },

  async getCourseSessions(courseId, params = {}) {
    try {
      const response = await apiClient.get(
        withQuery(`/instructor/courses/${courseId}/sessions`, params),
      );
      return response.data;
    } catch {
      await wait(120);
      const { page = 1, limit = 5, status = "" } = params;
      let filtered = mockSessions.filter((item) => item.courseId === courseId);
      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }

      return buildPaged(filtered, page, limit);
    }
  },

  async getQrSessions(params = {}) {
    try {
      const response = await apiClient.get(
        withQuery("/instructor/qr-sessions", params),
      );
      return response.data;
    } catch {
      await wait(160);
      const {
        page = 1,
        limit = 6,
        search = "",
        status = "",
        courseId = "",
      } = params;
      let filtered = [...mockQrSessions];

      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.courseName.toLowerCase().includes(needle) ||
            item.id.toLowerCase().includes(needle),
        );
      }

      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }

      if (courseId) {
        filtered = filtered.filter((item) => item.courseId === courseId);
      }

      return buildPaged(filtered, page, limit);
    }
  },

  async getQrSession(qrSessionId) {
    const response = await apiClient.get(
      `/instructor/qr-sessions/${qrSessionId}`,
    );
    return response.data;
  },

  async createQrSession(payload) {
    const response = await apiClient.post("/instructor/qr-sessions", payload);
    return response.data;
  },

  async updateQrSession(qrSessionId, payload) {
    const response = await apiClient.put(
      `/instructor/qr-sessions/${qrSessionId}`,
      payload,
    );
    return response.data;
  },

  async deleteQrSession(qrSessionId) {
    const response = await apiClient.delete(
      `/instructor/qr-sessions/${qrSessionId}`,
    );
    return response.data;
  },

  async qrAction(qrSessionId, action) {
    try {
      const response = await apiClient.post(
        `/instructor/qr-sessions/${qrSessionId}/${action}`,
      );
      return response.data;
    } catch {
      await wait(100);
      return {
        qrSessionId,
        action,
        status: statusMap[action] || "Processed",
        performedAt: new Date().toISOString(),
      };
    }
  },

  async getQrCodeData(qrSessionId) {
    try {
      const [codeRes, imageRes, scansRes, liveRes] = await Promise.all([
        apiClient.get(`/instructor/qr-sessions/${qrSessionId}/code`),
        apiClient.get(`/instructor/qr-sessions/${qrSessionId}/image`),
        apiClient.get(`/instructor/qr-sessions/${qrSessionId}/scans`),
        apiClient.get(`/instructor/qr-sessions/${qrSessionId}/scans/live`),
      ]);

      return {
        code: codeRes.data,
        image: imageRes.data,
        scans: scansRes.data.items || scansRes.data,
        liveScans: liveRes.data.items || liveRes.data,
      };
    } catch {
      await wait(130);
      const qrEntry =
        mockQrSessions.find((item) => item.id === qrSessionId) ||
        mockQrSessions[0];

      return {
        code: { value: `${qrEntry.id}-${Date.now()}` },
        image: {
          url: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
            `${qrEntry.id}-${Date.now()}`,
          )}`,
        },
        scans: [
          { id: "SCAN-1", studentName: "Sara Adel", at: "10:03:11" },
          { id: "SCAN-2", studentName: "Mariam Tarek", at: "10:04:48" },
          { id: "SCAN-3", studentName: "Karim Osama", at: "10:05:29" },
        ],
        liveScans: [
          {
            id: `LIVE-${Date.now()}`,
            studentName: "Auto Student",
            at: new Date().toLocaleTimeString(),
          },
        ],
      };
    }
  },

  async getLiveOverview() {
    try {
      const response = await apiClient.get("/instructor/live-monitor");
      return response.data;
    } catch {
      await wait(120);
      return {
        activeSessions: 1,
        totalParticipants: 62,
        liveAttendanceRate: 86,
      };
    }
  },

  async getLiveSessions(params = {}) {
    try {
      const response = await apiClient.get(
        withQuery("/instructor/live-monitor/sessions", params),
      );
      return response.data;
    } catch {
      await wait(120);
      const pageData = buildPaged(
        mockSessions.filter(
          (item) => item.status === "live" || item.status === "scheduled",
        ),
        params.page,
        params.limit || 8,
      );
      return pageData;
    }
  },

  async getLiveSessionDetails(sessionId) {
    try {
      const [
        sessionRes,
        attendanceLiveRes,
        attendanceStatsRes,
        participantsRes,
        eventsRes,
      ] = await Promise.all([
        apiClient.get(`/instructor/live-monitor/sessions/${sessionId}`),
        apiClient.get(
          `/instructor/live-monitor/sessions/${sessionId}/attendance/live`,
        ),
        apiClient.get(
          `/instructor/live-monitor/sessions/${sessionId}/attendance/stats`,
        ),
        apiClient.get(
          `/instructor/live-monitor/sessions/${sessionId}/participants`,
        ),
        apiClient.get(`/instructor/live-monitor/events`),
      ]);

      return {
        session: sessionRes.data,
        attendanceLive: attendanceLiveRes.data,
        attendanceStats: attendanceStatsRes.data,
        participants: participantsRes.data.items || participantsRes.data,
        events: eventsRes.data.items || eventsRes.data,
      };
    } catch {
      await wait(120);
      const session =
        mockSessions.find((item) => item.id === sessionId) || mockSessions[0];
      const presentCount = mockStudents.filter(
        (item) => item.status === "Present",
      ).length;

      return {
        session,
        attendanceLive: {
          present: presentCount,
          absent: mockStudents.length - presentCount,
          total: mockStudents.length,
        },
        attendanceStats: {
          checkedIn: presentCount,
          checkedOut: 2,
          late: 1,
        },
        participants: mockStudents,
        events: mockEvents,
      };
    }
  },

  async liveAction(sessionId, action, payload = {}) {
    try {
      const response = await apiClient.post(
        `/instructor/live-monitor/sessions/${sessionId}/${action}`,
        payload,
      );
      return response.data;
    } catch {
      await wait(100);
      return {
        sessionId,
        action,
        payload,
        performedAt: new Date().toISOString(),
      };
    }
  },

  async updateLiveAttendance(sessionId, attendanceId, payload) {
    const response = await apiClient.patch(
      `/instructor/live-monitor/sessions/${sessionId}/attendance/${attendanceId}`,
      payload,
    );
    return response.data;
  },

  async deleteLiveAttendance(sessionId, attendanceId) {
    const response = await apiClient.delete(
      `/instructor/live-monitor/sessions/${sessionId}/attendance/${attendanceId}`,
    );
    return response.data;
  },

  async getAttendanceRecords(params = {}) {
    try {
      const response = await apiClient.get(
        withQuery("/instructor/attendance-records", params),
      );
      return response.data;
    } catch {
      await wait(140);
      const {
        page = 1,
        limit = 10,
        search = "",
        courseId = "",
        sessionId = "",
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

      if (courseId) {
        filtered = filtered.filter((item) => item.courseId === courseId);
      }

      if (sessionId) {
        filtered = filtered.filter((item) => item.sessionId === sessionId);
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
    }
  },

  async getAttendanceSummary(params = {}) {
    try {
      const response = await apiClient.get(
        withQuery("/instructor/attendance-records/summary", params),
      );
      return response.data;
    } catch {
      await wait(100);
      const present = mockAttendanceRecords.filter(
        (item) => item.status === "Present",
      ).length;
      const absent = mockAttendanceRecords.filter(
        (item) => item.status === "Absent",
      ).length;
      const late = mockAttendanceRecords.filter(
        (item) => item.status === "Late",
      ).length;

      return {
        total: mockAttendanceRecords.length,
        present,
        absent,
        late,
        attendanceRate: Math.round(
          (present / mockAttendanceRecords.length) * 100,
        ),
      };
    }
  },

  async attendanceBulkAction(action, payload) {
    const method =
      action === "delete" ? "delete" : action === "patch" ? "patch" : "post";

    if (method === "delete") {
      const response = await apiClient.delete(
        "/instructor/attendance-records/bulk",
        { data: payload },
      );
      return response.data;
    }

    const response = await apiClient[method](
      "/instructor/attendance-records/bulk",
      payload,
    );
    return response.data;
  },

  async exportAttendance(format = "csv") {
    const response = await apiClient.get(
      `/instructor/attendance-records/export?format=${format}`,
    );
    return response.data;
  },

  async reviewAttendance(recordId, action) {
    const response = await apiClient.post(
      `/instructor/attendance-records/${recordId}/${action}`,
    );
    return response.data;
  },

  async getSessionControl(params = {}) {
    try {
      const response = await apiClient.get(
        withQuery("/instructor/sessions", params),
      );
      return response.data;
    } catch {
      await wait(120);
      const {
        page = 1,
        limit = 8,
        status = "",
        search = "",
        sortBy = "date",
        order = "desc",
      } = params;
      let filtered = [...mockSessions];

      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }

      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(needle) ||
            item.id.toLowerCase().includes(needle),
        );
      }

      filtered = sortItems(filtered, sortBy, order);
      return buildPaged(filtered, page, limit);
    }
  },

  async sessionAction(sessionId, action, payload = {}) {
    try {
      const response = await apiClient.post(
        `/instructor/sessions/${sessionId}/${action}`,
        payload,
      );
      return response.data;
    } catch {
      await wait(100);
      return {
        sessionId,
        action,
        status: "processed",
        payload,
      };
    }
  },

  async getSessionTimeline(sessionId) {
    try {
      const response = await apiClient.get(
        `/instructor/sessions/${sessionId}/timeline`,
      );
      return response.data.items || response.data;
    } catch {
      await wait(100);
      return [
        { id: "TL-1", title: "Session Created", time: "09:45" },
        { id: "TL-2", title: "Session Started", time: "10:00" },
        { id: "TL-3", title: "Attendance Opened", time: "10:01" },
      ];
    }
  },

  async getSessionLogs(sessionId) {
    try {
      const response = await apiClient.get(
        `/instructor/sessions/${sessionId}/logs`,
      );
      return response.data.items || response.data;
    } catch {
      await wait(100);
      return [
        { id: "LOG-1", level: "info", message: "QR generated", at: "10:00:55" },
        {
          id: "LOG-2",
          level: "info",
          message: "32 students checked in",
          at: "10:18:10",
        },
      ];
    }
  },
};
