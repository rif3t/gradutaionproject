import apiClient, { getApiErrorMessage } from "./apiClient";

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post("/api/Authentication/Login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Login failed. Please try again."),
    );
  }
};
