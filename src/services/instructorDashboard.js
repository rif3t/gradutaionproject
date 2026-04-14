import apiClient, { getApiErrorMessage } from "./apiClient";

const mockOverview = {
  coursesCount: 4,
  studentsCount: 286,
  lecturesCount: 34,
  attendanceRate: 87,
};

const mockCourses = [
  { id: "cs401", name: "Advanced Databases", code: "CS401", students: 78 },
  { id: "cs311", name: "Operating Systems", code: "CS311", students: 64 },
  { id: "cs275", name: "Web Engineering", code: "CS275", students: 92 },
  { id: "cs222", name: "Data Structures II", code: "CS222", students: 52 },
];

const buildMockRecords = () => {
  const names = [
    "Sara Adel",
    "Omar Hisham",
    "Mariam Tarek",
    "Youssef Nader",
    "Habiba Emad",
    "Mostafa Ali",
    "Hana Khaled",
    "Karim Osama",
  ];

  return names.map((name, index) => {
    const day = 10 + (index % 5);
    const hour = 9 + (index % 4);
    const minute = index % 2 === 0 ? "05" : "35";
    return {
      id: `record-${index + 1}`,
      studentName: name,
      status: index % 3 === 0 ? "Absent" : "Present",
      time: `2026-04-${day} ${hour}:${minute}`,
      date: `2026-04-${day}`,
    };
  });
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getInstructorDashboardData = async () => {
  try {
    const [overviewRes, coursesRes, recordsRes] = await Promise.all([
      apiClient.get("/api/instructor/dashboard/overview"),
      apiClient.get("/api/instructor/courses"),
      apiClient.get("/api/instructor/attendance/records"),
    ]);

    return {
      overview: overviewRes.data,
      courses: coursesRes.data,
      records: recordsRes.data,
    };
  } catch {
    return {
      overview: mockOverview,
      courses: mockCourses,
      records: buildMockRecords(),
    };
  }
};

export const createLectureSession = async (courseId) => {
  try {
    const response = await apiClient.post("/api/instructor/lecture-sessions", {
      courseId,
    });
    return response.data;
  } catch (error) {
    await sleep(250);
    return {
      id: `session-${Date.now()}`,
      courseId,
      startedAt: new Date().toISOString(),
      expiresIn: 1800,
      qrSeed: `QR-${Date.now()}`,
      attendance: {
        present: 0,
        absent: 0,
        total: 0,
      },
      warning: getApiErrorMessage(error, "Using offline demo session."),
    };
  }
};

export const refreshLectureQr = async (sessionId) => {
  try {
    const response = await apiClient.post(
      `/api/instructor/lecture-sessions/${sessionId}/refresh-qr`,
    );
    return response.data;
  } catch {
    await sleep(180);
    return {
      qrSeed: `QR-${sessionId}-${Date.now()}`,
      refreshedAt: new Date().toISOString(),
    };
  }
};

export const endLectureSession = async (sessionId) => {
  try {
    const response = await apiClient.post(
      `/api/instructor/lecture-sessions/${sessionId}/end`,
    );
    return response.data;
  } catch {
    await sleep(180);
    return { ended: true, endedAt: new Date().toISOString() };
  }
};

export const reopenLectureSession = async (sessionId) => {
  try {
    const response = await apiClient.post(
      `/api/instructor/lecture-sessions/${sessionId}/reopen`,
    );
    return response.data;
  } catch {
    await sleep(180);
    return {
      reopened: true,
      reopenedAt: new Date().toISOString(),
      qrSeed: `QR-${sessionId}-${Date.now()}`,
    };
  }
};
