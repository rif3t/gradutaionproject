// src/services/studentservcies.js
import apiClient, { getApiErrorMessage } from "./apiClient";

// جلب قائمة الطلاب (GET)
export const getStudents = async ({ Search = "", PageNumber = 1, PageSize = 100, Level, IsActive } = {}) => {
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

// جلب طالب واحد بالـ ID (GET)
export const getStudentById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Students/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch student details."));
  }
};

// إضافة طالب جديد (POST)
export const createStudent = async (payload) => {
  try {
    const response = await apiClient.post("/api/Students", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create student."));
  }
};

// تعديل طالب (PUT)
export const updateStudent = async (id, payload) => {
  try {
    const response = await apiClient.put(`/api/Students/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update student."));
  }
};

// حذف طالب (DELETE)
export const deleteStudent = async (id) => {
  try {
    await apiClient.delete(`/api/Students/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete student."));
  }
};