// services/adminService.js
import apiClient, { getApiErrorMessage } from "./apiClient";

export const adminService = {
  getDashboardStats: async () => {
    try {
      console.log("Fetching dashboard stats from:", `/api/admin/dashboard`);
      const response = await apiClient.get(`/api/admin/dashboard`);
      console.log("Dashboard stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to load dashboard statistics"
      );
      throw new Error(errorMessage);
    }
  },
};