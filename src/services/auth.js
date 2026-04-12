import axios from "axios";

export const loginUser = async ({ email, password }) => {
  const response = await axios.post(
    "http://fcai-attendance-api.runasp.net/api/Authentication/Login",
    { email, password },
  );
  console.log("API Response:", response.data);
  return response.data;
};
