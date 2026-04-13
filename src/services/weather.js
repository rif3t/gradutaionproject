import apiClient, { getApiErrorMessage } from "./apiClient";

export const getWeatherForecast = async () => {
  try {
    const response = await apiClient.get("/WeatherForecast");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch weather forecast."),
    );
  }
};
