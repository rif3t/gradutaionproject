import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { instructorDashboardApi } from "../services/instructorDashboardApi";

const InstructorWorkspaceContext = createContext(null);

const defaultPaging = {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const defaultAsyncState = {
  loading: false,
  error: "",
  warning: "",
};

const normalizePaged = (result) => {
  if (!result) {
    return { items: [], meta: defaultPaging, warning: "" };
  }

  if (Array.isArray(result)) {
    return {
      items: result,
      meta: { ...defaultPaging, total: result.length },
      warning: "",
    };
  }

  return {
    items: result.items || [],
    meta: result.meta || defaultPaging,
    warning: result.warning || "",
  };
};

export function InstructorWorkspaceProvider({ children }) {
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    stats: {},
    summary: {},
    attendanceOverview: {},
    upcomingSessions: [],
    recentActivity: [],
    alerts: [],
    trends: [],
    trendRange: "weekly",
  });
  const [dashboardState, setDashboardState] = useState(defaultAsyncState);

  const [coursesQuery, setCoursesQuery] = useState({
    page: 1,
    limit: 8,
    search: "",
    status: "",
    semester: "",
    department: "",
    sortBy: "name",
    order: "asc",
  });
  const [coursesData, setCoursesData] = useState({
    items: [],
    meta: defaultPaging,
  });
  const [coursesState, setCoursesState] = useState(defaultAsyncState);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseStudents, setCourseStudents] = useState({
    items: [],
    meta: defaultPaging,
  });
  const [courseSessions, setCourseSessions] = useState({
    items: [],
    meta: defaultPaging,
  });
  const [courseDetailsState, setCourseDetailsState] = useState(
    defaultAsyncState,
  );

  const [qrQuery, setQrQuery] = useState({
    page: 1,
    limit: 6,
    search: "",
    status: "",
    courseId: "",
  });
  const [qrData, setQrData] = useState({ items: [], meta: defaultPaging });
  const [qrState, setQrState] = useState(defaultAsyncState);
  const [selectedQrSessionId, setSelectedQrSessionId] = useState("");
  const [qrDetails, setQrDetails] = useState({
    code: {},
    image: {},
    scans: [],
    liveScans: [],
  });

  const [liveData, setLiveData] = useState({
    overview: {},
    sessions: { items: [], meta: defaultPaging },
    activeSessionId: "",
    sessionDetails: null,
  });
  const [liveState, setLiveState] = useState(defaultAsyncState);

  const [attendanceQuery, setAttendanceQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    courseId: "",
    sessionId: "",
    status: "",
    from: "",
    to: "",
    sortBy: "date",
    order: "desc",
  });
  const [attendanceData, setAttendanceData] = useState({
    items: [],
    meta: defaultPaging,
  });
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [attendanceState, setAttendanceState] = useState(defaultAsyncState);

  const [sessionControlQuery, setSessionControlQuery] = useState({
    page: 1,
    limit: 8,
    search: "",
    status: "",
    sortBy: "date",
    order: "desc",
  });
  const [sessionControlData, setSessionControlData] = useState({
    items: [],
    meta: defaultPaging,
    selectedSessionId: "",
    timeline: [],
    logs: [],
  });
  const [sessionControlState, setSessionControlState] = useState(
    defaultAsyncState,
  );

  const [actionState, setActionState] = useState({
    busy: "",
    error: "",
    success: "",
  });

  const runTask = useCallback(async (setter, task) => {
    setter({ loading: true, error: "", warning: "" });

    try {
      const result = await task();
      setter({
        loading: false,
        error: "",
        warning: result?.warning || "",
      });
      return result;
    } catch (error) {
      setter({
        loading: false,
        error: error?.message || "Request failed.",
        warning: "",
      });
      return null;
    }
  }, []);

  const runAction = useCallback(async (key, task, successMessage) => {
    setActionState({ busy: key, error: "", success: "" });

    try {
      const result = await task();
      setActionState({
        busy: "",
        error: "",
        success: successMessage || "Action completed.",
      });
      return result;
    } catch (error) {
      setActionState({
        busy: "",
        error: error?.message || "Action failed.",
        success: "",
      });
      return null;
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    const result = await runTask(setDashboardState, () =>
      instructorDashboardApi.getDashboardData(),
    );
    if (!result) {
      return;
    }

    const trends = await instructorDashboardApi.getDashboardTrends(
      dashboardData.trendRange,
    );
    setDashboardData((prev) => ({ ...prev, ...result, trends }));
  }, [dashboardData.trendRange, runTask]);

  const setTrendRange = useCallback(async (range) => {
    setDashboardData((prev) => ({ ...prev, trendRange: range }));
    const trends = await instructorDashboardApi.getDashboardTrends(range);
    setDashboardData((prev) => ({ ...prev, trends }));
  }, []);

  const loadCourses = useCallback(
    async (override = {}) => {
      const nextQuery = { ...coursesQuery, ...override };
      setCoursesQuery(nextQuery);

      const result = await runTask(setCoursesState, () =>
        instructorDashboardApi.getCourses(nextQuery),
      );
      if (!result) {
        return;
      }

      const normalized = normalizePaged(result);
      setCoursesData({ items: normalized.items, meta: normalized.meta });

      if (!selectedCourseId && normalized.items[0]) {
        setSelectedCourseId(normalized.items[0].id);
      }
    },
    [coursesQuery, runTask, selectedCourseId],
  );

  const loadCourseDetails = useCallback(
    async (courseId, options = {}) => {
      const nextCourseId = courseId || selectedCourseId;
      if (!nextCourseId) {
        return;
      }

      setSelectedCourseId(nextCourseId);

      const result = await runTask(setCourseDetailsState, async () => {
        const [students, sessions] = await Promise.all([
          instructorDashboardApi.getCourseStudents(nextCourseId, {
            page: options.studentsPage || 1,
            limit: 5,
            search: options.studentsSearch || "",
          }),
          instructorDashboardApi.getCourseSessions(nextCourseId, {
            page: options.sessionsPage || 1,
            limit: 5,
            status: options.sessionStatus || "",
          }),
        ]);

        return { students, sessions };
      });

      if (!result) {
        return;
      }

      const normalizedStudents = normalizePaged(result.students);
      const normalizedSessions = normalizePaged(result.sessions);

      setCourseStudents({
        items: normalizedStudents.items,
        meta: normalizedStudents.meta,
      });
      setCourseSessions({
        items: normalizedSessions.items,
        meta: normalizedSessions.meta,
      });
    },
    [runTask, selectedCourseId],
  );

  const runCourseAction = useCallback(
    async (action, courseId) => {
      const targetCourseId = courseId || selectedCourseId;
      if (!targetCourseId) {
        return;
      }

      const actionKey = `course-${targetCourseId}-${action}`;

      if (action === "delete") {
        await runAction(
          actionKey,
          () => instructorDashboardApi.deleteCourse(targetCourseId),
          "Course deleted successfully.",
        );
      } else if (action === "edit") {
        await runAction(
          actionKey,
          () =>
            instructorDashboardApi.updateCourse(
              targetCourseId,
              {
                status: "Active",
              },
              true,
            ),
          "Course updated successfully.",
        );
      } else if (action === "add-student") {
        await runAction(
          actionKey,
          () =>
            instructorDashboardApi.liveAction("course-students", "check-in", {
              courseId: targetCourseId,
            }),
          "Student action submitted.",
        );
      } else if (action === "create-session") {
        await runAction(
          actionKey,
          () =>
            instructorDashboardApi.sessionAction("new", "start", {
              courseId: targetCourseId,
            }),
          "Session creation started.",
        );
      } else {
        await runAction(
          actionKey,
          () =>
            instructorDashboardApi.sessionAction("new", "start", {
              courseId: targetCourseId,
            }),
          "Course action completed.",
        );
      }

      await loadCourses();
      await loadCourseDetails(targetCourseId);
    },
    [loadCourseDetails, loadCourses, runAction, selectedCourseId],
  );

  const loadQrSessions = useCallback(
    async (override = {}) => {
      const nextQuery = { ...qrQuery, ...override };
      setQrQuery(nextQuery);

      const result = await runTask(setQrState, () =>
        instructorDashboardApi.getQrSessions(nextQuery),
      );
      if (!result) {
        return;
      }

      const normalized = normalizePaged(result);
      setQrData({ items: normalized.items, meta: normalized.meta });

      if (!selectedQrSessionId && normalized.items[0]) {
        setSelectedQrSessionId(normalized.items[0].id);
      }
    },
    [qrQuery, runTask, selectedQrSessionId],
  );

  const loadQrDetails = useCallback(
    async (qrSessionId) => {
      const targetId = qrSessionId || selectedQrSessionId;
      if (!targetId) {
        return;
      }

      setSelectedQrSessionId(targetId);
      const result = await runTask(setQrState, () =>
        instructorDashboardApi.getQrCodeData(targetId),
      );
      if (result) {
        setQrDetails(result);
      }
    },
    [runTask, selectedQrSessionId],
  );

  const executeQrAction = useCallback(
    async (qrSessionId, action) => {
      const targetId = qrSessionId || selectedQrSessionId;
      if (!targetId) {
        return;
      }

      await runAction(
        `qr-${targetId}-${action}`,
        () => instructorDashboardApi.qrAction(targetId, action),
        `QR action ${action} applied.`,
      );
      await loadQrSessions();
      await loadQrDetails(targetId);
    },
    [loadQrDetails, loadQrSessions, runAction, selectedQrSessionId],
  );

  const loadLiveMonitor = useCallback(
    async (selectedSessionId = "") => {
      const result = await runTask(setLiveState, async () => {
        const [overview, sessions] = await Promise.all([
          instructorDashboardApi.getLiveOverview(),
          instructorDashboardApi.getLiveSessions({ page: 1, limit: 8 }),
        ]);

        return { overview, sessions };
      });

      if (!result) {
        return;
      }

      const normalizedSessions = normalizePaged(result.sessions);
      const activeSessionId =
        selectedSessionId ||
        liveData.activeSessionId ||
        normalizedSessions.items[0]?.id ||
        "";

      setLiveData((prev) => ({
        ...prev,
        overview: result.overview,
        sessions: {
          items: normalizedSessions.items,
          meta: normalizedSessions.meta,
        },
        activeSessionId,
      }));

      if (activeSessionId) {
        const details = await instructorDashboardApi.getLiveSessionDetails(
          activeSessionId,
        );
        setLiveData((prev) => ({
          ...prev,
          sessionDetails: details,
          activeSessionId,
        }));
      }
    },
    [liveData.activeSessionId, runTask],
  );

  const setLiveSession = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        return;
      }

      const details = await runTask(setLiveState, () =>
        instructorDashboardApi.getLiveSessionDetails(sessionId),
      );
      if (details) {
        setLiveData((prev) => ({
          ...prev,
          activeSessionId: sessionId,
          sessionDetails: details,
        }));
      }
    },
    [runTask],
  );

  const runLiveAction = useCallback(
    async (action, payload = {}) => {
      const sessionId = liveData.activeSessionId;
      if (!sessionId) {
        return;
      }

      await runAction(
        `live-${sessionId}-${action}`,
        () => instructorDashboardApi.liveAction(sessionId, action, payload),
        `${action.replace("-", " ")} completed.`,
      );
      await setLiveSession(sessionId);
    },
    [liveData.activeSessionId, runAction, setLiveSession],
  );

  const loadAttendanceRecords = useCallback(
    async (override = {}) => {
      const nextQuery = { ...attendanceQuery, ...override };
      setAttendanceQuery(nextQuery);

      const result = await runTask(setAttendanceState, async () => {
        const [records, summary] = await Promise.all([
          instructorDashboardApi.getAttendanceRecords(nextQuery),
          instructorDashboardApi.getAttendanceSummary({
            courseId: nextQuery.courseId,
            studentId: nextQuery.studentId,
          }),
        ]);
        return { records, summary };
      });

      if (!result) {
        return;
      }

      const normalized = normalizePaged(result.records);
      setAttendanceData({ items: normalized.items, meta: normalized.meta });
      setAttendanceSummary(result.summary);
    },
    [attendanceQuery, runTask],
  );

  const attendanceBulkAction = useCallback(
    async (action, payload = {}) => {
      await runAction(
        `attendance-bulk-${action}`,
        () => instructorDashboardApi.attendanceBulkAction(action, payload),
        `Bulk ${action} completed.`,
      );
      await loadAttendanceRecords();
    },
    [loadAttendanceRecords, runAction],
  );

  const reviewAttendance = useCallback(
    async (recordId, action) => {
      await runAction(
        `review-${recordId}-${action}`,
        () => instructorDashboardApi.reviewAttendance(recordId, action),
        `Record ${action} successfully.`,
      );
      await loadAttendanceRecords();
    },
    [loadAttendanceRecords, runAction],
  );

  const exportAttendance = useCallback(
    async (format = "csv") => {
      await runAction(
        `attendance-export-${format}`,
        () => instructorDashboardApi.exportAttendance(format),
        `Attendance exported as ${format.toUpperCase()}.`,
      );
    },
    [runAction],
  );

  const loadSessionControl = useCallback(
    async (override = {}) => {
      const nextQuery = { ...sessionControlQuery, ...override };
      setSessionControlQuery(nextQuery);

      const result = await runTask(setSessionControlState, () =>
        instructorDashboardApi.getSessionControl(nextQuery),
      );

      if (!result) {
        return;
      }

      const normalized = normalizePaged(result);
      const selectedSessionId =
        sessionControlData.selectedSessionId || normalized.items[0]?.id || "";

      setSessionControlData((prev) => ({
        ...prev,
        items: normalized.items,
        meta: normalized.meta,
        selectedSessionId,
      }));

      if (selectedSessionId) {
        const [timeline, logs] = await Promise.all([
          instructorDashboardApi.getSessionTimeline(selectedSessionId),
          instructorDashboardApi.getSessionLogs(selectedSessionId),
        ]);

        setSessionControlData((prev) => ({
          ...prev,
          selectedSessionId,
          timeline,
          logs,
        }));
      }
    },
    [runTask, sessionControlData.selectedSessionId, sessionControlQuery],
  );

  const setSessionControlSelection = useCallback(async (sessionId) => {
    if (!sessionId) {
      return;
    }

    const [timeline, logs] = await Promise.all([
      instructorDashboardApi.getSessionTimeline(sessionId),
      instructorDashboardApi.getSessionLogs(sessionId),
    ]);

    setSessionControlData((prev) => ({
      ...prev,
      selectedSessionId: sessionId,
      timeline,
      logs,
    }));
  }, []);

  const runSessionAction = useCallback(
    async (action, payload = {}) => {
      const sessionId = sessionControlData.selectedSessionId;
      if (!sessionId) {
        return;
      }

      await runAction(
        `session-${sessionId}-${action}`,
        () => instructorDashboardApi.sessionAction(sessionId, action, payload),
        `${action.replace("-", " ")} applied successfully.`,
      );
      await loadSessionControl();
    },
    [loadSessionControl, runAction, sessionControlData.selectedSessionId],
  );

  const clearActionFeedback = useCallback(() => {
    setActionState({ busy: "", error: "", success: "" });
  }, []);

  const value = useMemo(
    () => ({
      dashboardData,
      dashboardState,
      loadDashboard,
      setTrendRange,

      coursesQuery,
      coursesData,
      coursesState,
      selectedCourseId,
      courseStudents,
      courseSessions,
      courseDetailsState,
      setSelectedCourseId,
      loadCourses,
      loadCourseDetails,
      runCourseAction,

      qrQuery,
      qrData,
      qrState,
      selectedQrSessionId,
      qrDetails,
      setSelectedQrSessionId,
      loadQrSessions,
      loadQrDetails,
      executeQrAction,

      liveData,
      liveState,
      loadLiveMonitor,
      setLiveSession,
      runLiveAction,

      attendanceQuery,
      attendanceData,
      attendanceSummary,
      attendanceState,
      loadAttendanceRecords,
      attendanceBulkAction,
      reviewAttendance,
      exportAttendance,

      sessionControlQuery,
      sessionControlData,
      sessionControlState,
      loadSessionControl,
      setSessionControlSelection,
      runSessionAction,

      actionState,
      clearActionFeedback,
    }),
    [
      actionState,
      attendanceData,
      attendanceQuery,
      attendanceState,
      attendanceSummary,
      clearActionFeedback,
      courseDetailsState,
      courseSessions,
      courseStudents,
      coursesData,
      coursesQuery,
      coursesState,
      dashboardData,
      dashboardState,
      executeQrAction,
      loadAttendanceRecords,
      loadCourseDetails,
      loadCourses,
      loadDashboard,
      loadLiveMonitor,
      loadQrDetails,
      loadQrSessions,
      loadSessionControl,
      qrData,
      qrDetails,
      qrQuery,
      qrState,
      reviewAttendance,
      runLiveAction,
      runSessionAction,
      selectedCourseId,
      selectedQrSessionId,
      sessionControlData,
      sessionControlQuery,
      sessionControlState,
      setLiveSession,
      setSelectedCourseId,
      setSelectedQrSessionId,
      setSessionControlSelection,
      setTrendRange,
      liveData,
      liveState,
      attendanceBulkAction,
      exportAttendance,
      runCourseAction,
    ],
  );

  return (
    <InstructorWorkspaceContext.Provider value={value}>
      {children}
    </InstructorWorkspaceContext.Provider>
  );
}

export const useInstructorWorkspace = () => {
  const context = useContext(InstructorWorkspaceContext);

  if (!context) {
    throw new Error(
      "useInstructorWorkspace must be used within InstructorWorkspaceProvider",
    );
  }

  return context;
};
