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

export const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage
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
