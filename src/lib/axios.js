import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

console.log("API Base URL:", API_BASE_URL); // Debugging: Check if URL is correct

// ✅ Fetch token from localStorage
const token = localStorage.getItem("token");

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allows cookies & authentication headers
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // ✅ Include token if available
  },
});

// ✅ Automatically add token to every request (if token changes)
axiosInstance.interceptors.request.use(
  (config) => {
    const updatedToken = localStorage.getItem("token"); // Fetch latest token
    if (updatedToken) {
      config.headers.Authorization = `Bearer ${updatedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
