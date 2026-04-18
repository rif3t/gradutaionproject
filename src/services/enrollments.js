import apiClient, { getApiErrorMessage } from "./apiClient";

export const getCoursesLookup = async () => {
  try {
    const response = await apiClient.get("/api/courses/lookup");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch courses list.")
    );
  }
};

export const getCourseStudents = async (courseId) => {
  try {
    const numericId = Number(courseId);
    console.log(`🔍 Fetching students for course ${numericId}...`);
    
    let response;
    try {
      response = await apiClient.get(`/api/courses/${numericId}/students`);
    } catch (err) {
  
      response = await apiClient.get(`/api/courses/${numericId}/students`, {
        params: { PageSize: 1000, PageNumber: 1 }
      });
    }
    
    console.log(`✅ Raw response for course ${numericId}:`, response.data);

    let studentsArray = [];
    const data = response.data;
    
    if (!data) {
      studentsArray = [];
    } else if (Array.isArray(data)) {
      studentsArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      studentsArray = data.data;
    } else if (data.items && Array.isArray(data.items)) {
      studentsArray = data.items;
    } else if (data.$values && Array.isArray(data.$values)) {
      studentsArray = data.$values;
    } else if (data.result && Array.isArray(data.result)) {
      studentsArray = data.result;
    } else if (data.students && Array.isArray(data.students)) {
      studentsArray = data.students;
    } else {
    
      console.warn("Unexpected response structure:", data);
      studentsArray = [];
    }
    
    console.log(`✅ Extracted ${studentsArray.length} students for course ${numericId}`);
    return { data: studentsArray };
  } catch (error) {
    console.error(`❌ Error fetching students for course ${courseId}:`, error);
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch enrolled students.")
    );
  }
};

export const getEligibleStudents = async (courseId) => {
  try {
    const numericId = Number(courseId);
    console.log(`🔍 Fetching eligible students for course ${numericId}...`);
    const response = await apiClient.get(`/api/courses/${numericId}/eligible-students`, {
      params: { PageSize: 1000, PageNumber: 1 }
    });
    console.log(`✅ Eligible students response for course ${numericId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching eligible students for course ${courseId}:`, error);
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch eligible students.")
    );
  }
};


export const bulkEnrollStudents = async (courseId, studentIds) => {
  try {
    const numericId = Number(courseId);
    const numericStudentIds = studentIds.map(id => Number(id));
    
    console.log(`📝 Enrolling students in course ${numericId}:`, numericStudentIds);
  
    const payloads = [
      numericStudentIds,                                   
      { studentIds: numericStudentIds },                   
      { students: numericStudentIds },                     
      { studentIdList: numericStudentIds },               
      { ids: numericStudentIds },                     
      { studentIds: numericStudentIds, courseId: numericId } 
    ];
    
    for (let i = 0; i < payloads.length; i++) {
      try {
        console.log(`Trying payload format ${i + 1}:`, payloads[i]);
        const response = await apiClient.post(`/api/courses/${numericId}/students/bulk`, payloads[i]);
        console.log(`✅ Success with format ${i + 1}!`, response.data);
        return response.data;
      } catch (err) {
        console.log(`Format ${i + 1} failed:`, err.response?.data);
        if (i === payloads.length - 1) throw err;
      }
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error status:", error.response.status);
      console.error("❌ Error data:", error.response.data);
      const errorData = error.response.data;
      if (errorData.errors) {
        const messages = Object.values(errorData.errors).flat();
        throw new Error(messages.join(", "));
      }
      throw new Error(errorData.title || errorData.message || "Validation error");
    }
    throw new Error(getApiErrorMessage(error, "Failed to enroll students."));
  }
};

export const removeStudentFromCourse = async (courseId, studentId) => {
  try {
    const numericId = Number(courseId);
    const numericStudentId = Number(studentId);
    console.log(`🗑️ Removing student ${numericStudentId} from course ${numericId}...`);
    await apiClient.delete(`/api/courses/${numericId}/students/${numericStudentId}`);
    console.log(`✅ Student ${numericStudentId} removed successfully`);
  } catch (error) {
    console.error(`❌ Error removing student ${studentId}:`, error);
    throw new Error(
      getApiErrorMessage(error, "Failed to remove student from course.")
    );
  }
};
