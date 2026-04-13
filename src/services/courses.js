import apiClient, { getApiErrorMessage } from "./apiClient";

export const getCourses = async ({
  Search = "",
  PageNumber = 1,
  PageSize = 100,
  Level,
  Semester,
} = {}) => {
  try {
    const response = await apiClient.get("/api/Courses", {
      params: {
        Search,
        PageNumber,
        PageSize,
        ...(Level ? { Level } : {}),
        ...(Semester ? { Semester } : {}),
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch courses list."));
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch course details."),
    );
  }
};

export const createCourse = async (payload) => {
  try {
    const response = await apiClient.post("/api/Courses", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create course."));
  }
};

export const updateCourse = async (id, payload) => {
  try {
    const response = await apiClient.put(`/api/Courses/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update course."));
  }
};

export const deleteCourse = async (id) => {
  try {
    await apiClient.delete(`/api/Courses/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete course."));
  }
};
