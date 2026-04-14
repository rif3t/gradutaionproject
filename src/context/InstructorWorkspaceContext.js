import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createLectureSession,
  endLectureSession,
  getInstructorDashboardData,
  refreshLectureQr,
  reopenLectureSession,
} from "../services/instructorDashboard";

const QR_REFRESH_SECONDS = 20;
const SESSION_DURATION_SECONDS = 30 * 60;

const InstructorWorkspaceContext = createContext(null);

const buildStudentStats = (records) => {
  const aggregateMap = records.reduce((acc, item) => {
    const previous = acc[item.studentName] || {
      studentName: item.studentName,
      totalLectures: 0,
      present: 0,
      absent: 0,
      percentage: 0,
    };

    previous.totalLectures += 1;
    if (item.status === "Present") {
      previous.present += 1;
    } else {
      previous.absent += 1;
    }

    previous.percentage = Math.round(
      (previous.present / previous.totalLectures) * 100,
    );

    acc[item.studentName] = previous;
    return acc;
  }, {});

  return Object.values(aggregateMap);
};

export function InstructorWorkspaceProvider({ children }) {
  const [overview, setOverview] = useState({
    coursesCount: 0,
    studentsCount: 0,
    lecturesCount: 0,
    attendanceRate: 0,
  });
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [timerLeft, setTimerLeft] = useState(SESSION_DURATION_SECONDS);
  const [attendance, setAttendance] = useState({
    present: 0,
    absent: 0,
    total: 0,
  });
  const [qrPayload, setQrPayload] = useState("");
  const [isQrAnimating, setIsQrAnimating] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const data = await getInstructorDashboardData();
      setOverview(data.overview);
      setCourses(data.courses);
      setRecords(data.records);
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (!session?.isActive) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          setSession((current) =>
            current ? { ...current, isActive: false } : current,
          );
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [session?.isActive]);

  useEffect(() => {
    if (!session?.isActive) {
      return undefined;
    }

    const qrId = setInterval(async () => {
      const qrData = await refreshLectureQr(session.id);
      setQrPayload(qrData.qrSeed || `QR-${session.id}-${Date.now()}`);
      setIsQrAnimating(true);
      setTimeout(() => setIsQrAnimating(false), 420);
    }, QR_REFRESH_SECONDS * 1000);

    return () => clearInterval(qrId);
  }, [session]);

  useEffect(() => {
    if (!session?.isActive) {
      return undefined;
    }

    const attendanceId = setInterval(() => {
      setAttendance((current) => {
        const nextPresent = current.present + (Math.random() > 0.45 ? 1 : 0);
        const totalPool = activeCourse?.students || current.total || 0;
        const boundedPresent = Math.min(nextPresent, totalPool);
        const nextAbsent = Math.max(totalPool - boundedPresent, 0);

        return {
          present: boundedPresent,
          absent: nextAbsent,
          total: totalPool,
        };
      });
    }, 6000);

    return () => clearInterval(attendanceId);
  }, [session, activeCourse]);

  const studentStats = useMemo(() => buildStudentStats(records), [records]);

  const startLecture = async (course) => {
    setWarning("");
    const sessionData = await createLectureSession(course.id);
    setActiveCourse(course);
    setSession({
      id: sessionData.id,
      courseId: course.id,
      isActive: true,
    });
    setTimerLeft(SESSION_DURATION_SECONDS);
    setQrPayload(sessionData.qrSeed || `QR-${course.id}-${Date.now()}`);
    setAttendance({
      present: 0,
      absent: course.students,
      total: course.students,
    });

    if (sessionData.warning) {
      setWarning(sessionData.warning);
    }
  };

  const closeSession = async () => {
    if (!session) {
      return;
    }

    await endLectureSession(session.id);
    setSession((current) =>
      current ? { ...current, isActive: false } : current,
    );
  };

  const reopenSession = async () => {
    if (!session) {
      return;
    }

    const reopened = await reopenLectureSession(session.id);
    setSession((current) =>
      current ? { ...current, isActive: true } : current,
    );
    setQrPayload(reopened.qrSeed || `QR-${session.id}-${Date.now()}`);
    setTimerLeft((prev) =>
      prev > 0 ? prev : Math.floor(SESSION_DURATION_SECONDS / 2),
    );
    setWarning(
      "Warning: session reopened. Ensure students rescan with latest QR.",
    );
  };

  const clearWarning = () => setWarning("");

  const value = {
    overview,
    courses,
    records,
    activeCourse,
    session,
    timerLeft,
    attendance,
    qrPayload,
    isQrAnimating,
    warning,
    qrRefreshSeconds: QR_REFRESH_SECONDS,
    studentStats,
    startLecture,
    closeSession,
    reopenSession,
    clearWarning,
  };

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
