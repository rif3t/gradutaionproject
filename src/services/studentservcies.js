// src/services/studentservcies.js
import apiClient, { getApiErrorMessage } from "./apiClient";

export const getStudents = async ({
  Search = "",
  PageNumber = 1,
  PageSize = 100,
  Level,
  IsActive,
} = {}) => {
  try {
    const response = await apiClient.get("/api/Students", {
      params: {
        Search,
        PageNumber,
        PageSize,
        ...(Level ? { Level } : {}),
        ...(IsActive !== undefined ? { IsActive } : {}),
      },
    });
    return {
      students: response.data.data || [],
      totalCount: response.data.totalCount || 0,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch students."));
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Students/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch student details."),
    );
  }
};
export const createStudent = async (payload) => {
  try {
    const response = await apiClient.post("/api/Students", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create student."));
  }
};

export const updateStudent = async (id, payload) => {
  try {
    const response = await apiClient.put(`/api/Students/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update student."));
  }
};
export const deleteStudent = async (id) => {
  try {
    await apiClient.delete(`/api/Students/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete student."));
  }
};

export const getMyStudentProfile = async () => {
  try {
    const response = await apiClient.get("/api/Students/me/profile");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch student profile."),
    );
  }
};
