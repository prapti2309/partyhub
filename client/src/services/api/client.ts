import axios from "axios";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const savedAuth = localStorage.getItem("watchparty_auth");
        if (savedAuth) {
          const { token } = JSON.parse(savedAuth);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.error("Error reading auth token from storage", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration/unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.warn("🌐 [Axios] Network error. Falling back to mock data handling.", error.message);
    }
    return Promise.reject(error);
  }
);
