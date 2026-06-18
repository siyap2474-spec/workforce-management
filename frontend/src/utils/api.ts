import axios from "axios";
import { store } from "../store";
import { startRequest, endRequest, addToast } from "../store/slices/uiSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    store.dispatch(startRequest());
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    store.dispatch(endRequest());
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    store.dispatch(endRequest());
    return response;
  },
  async (error) => {
    store.dispatch(endRequest());
    const originalRequest = error.config;

    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh-token");
    const willRetry = error.response?.status === 401 && 
                      originalRequest && 
                      !originalRequest._retry && 
                      localStorage.getItem("refreshToken") && 
                      !isRefreshRequest;

    if (!willRetry) {
      const message = error.response?.data?.message || error.message || "An unexpected error occurred";
      store.dispatch(addToast({ message, type: "error" }));
    }

    // If API returned 401 and we haven't already retried this request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          // Retry original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token has expired or is invalid, force logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          
          // Redirect to login only if not already on an auth page
          const pathname = window.location.pathname;
          if (pathname !== "/login" && pathname !== "/register" && !pathname.startsWith("/reset-password")) {
            window.location.href = "/login?expired=true";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
