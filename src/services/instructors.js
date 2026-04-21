import apiClient, {
  getApiErrorMessage,
  toAbsoluteBackendImageUrl,
} from "./apiClient";

const normalizeInstructorImageUrl = (instructor) => {
  if (!instructor) {
    return instructor;
  }

  return {
    ...instructor,
    profilePictureUrl: toAbsoluteBackendImageUrl(instructor.profilePictureUrl),
  };
};

const toFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, String(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const getInstructors = async ({
  Search = "",
  PageNumber = 1,
  PageSize = 50,
  IsActive,
} = {}) => {
  try {
    const response = await apiClient.get("/api/Instructors", {
      params: {
        Search,
        PageNumber,
        PageSize,
        ...(IsActive === undefined ? {} : { IsActive }),
      },
    });

    return {
      ...response.data,
      data: Array.isArray(response.data?.data)
        ? response.data.data.map(normalizeInstructorImageUrl)
        : response.data?.data,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch instructors list."),
    );
  }
};

export const getInstructorById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Instructors/${id}`);
    return normalizeInstructorImageUrl(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch instructor details."),
    );
  }
};

export const createInstructor = async (payload) => {
  try {
    const formData = toFormData(payload);

    // Sending FormData makes the browser use multipart/form-data with boundary.
    const response = await apiClient.post("/api/Instructors", formData);

    return normalizeInstructorImageUrl(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create instructor."));
  }
};

export const updateInstructor = async (id, payload) => {
  try {
    const formData = toFormData(payload);

    // Sending FormData makes the browser use multipart/form-data with boundary.
    const response = await apiClient.put(`/api/Instructors/${id}`, formData);

    return normalizeInstructorImageUrl(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update instructor."));
  }
};

export const deleteInstructor = async (id) => {
  try {
    await apiClient.delete(`/api/Instructors/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete instructor."));
  }
};

export const getMyInstructorCourses = async () => {
  try {
    const response = await apiClient.get("/api/Instructors/my-courses");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch instructor courses."),
    );
  }
};
