import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/biologi-proflic/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for token attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bioproflic_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Terjadi kesalahan pada sistem.";
    return Promise.reject(new Error(message));
  }
);
