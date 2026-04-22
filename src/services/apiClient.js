import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://fcai-attendance-api.runasp.net";

const BACKEND_IMAGE_BASE_URL = "https://fcai-attendance-api.runasp.net/";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and other auth data
      localStorage.removeItem("token");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminName");
      
      // Redirect to login (using window.location because we are outside React component)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  // Handle ASP.NET Core Validation Errors (errors object)
  if (data?.errors && typeof data.errors === "object") {
    const errorMessages = Object.values(data.errors)
      .flat()
      .filter((msg) => typeof msg === "string");
    
    if (errorMessages.length > 0) {
      return errorMessages.join(" • ");
    }
  }

  return (
    data?.message ||
    data?.title ||
    error?.message ||
    fallbackMessage ||
    "An unexpected error occurred."
  );
};

export const toAbsoluteBackendImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return url;
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  return `${BACKEND_IMAGE_BASE_URL}${url.replace(/^\/+/, "")}`;
};

export default apiClient;
