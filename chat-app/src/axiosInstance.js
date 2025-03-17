// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5173", // Replace with your API base URL
});

// Set up the interceptor to automatically add the token to the header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // Get token from sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optionally handle errors globally (e.g., unauthorized token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Log out user if unauthorized (token expired or invalid)
      sessionStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
