import axios, { AxiosError, AxiosInstance } from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_URL}${path.startsWith("/") ? "" : "/"}${path}`, init);

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  badgeLogin: (badge_number: string, pin: string) =>
    api.post("/auth/badge-login", { badge_number, pin }),

  sendOtp: (phone_number: string) =>
    api.post("/auth/otp/send", { phone_number }),

  verifyOtp: (phone_number: string, otp: string) =>
    api.post("/auth/otp/verify", { phone_number, otp }),

  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),

  logout: () => api.post("/auth/logout"),
};

// Reports APIs
export const reportsApi = {
  list: (params?: {
    report_type?: string;
    status?: string;
    site_id?: string;
    page?: number;
    page_size?: number;
  }) => api.get("/reports", { params }),

  get: (id: string) => api.get(`/reports/${id}`),

  acknowledge: (id: string, notes?: string) =>
    api.post(`/reports/${id}/acknowledge`, { notes }),

  close: (id: string, notes?: string) =>
    api.post(`/reports/${id}/close`, { notes }),

  getTimeline: (id: string) => api.get(`/reports/${id}/timeline`),
};

// Near-Miss APIs
export const nearMissApi = {
  list: (params?: {
    category?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) => api.get("/near-miss", { params }),

  get: (id: string) => api.get(`/near-miss/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    location_description: string;
    potential_severity?: string;
    immediate_actions_taken?: string;
    area_id?: string;
    equipment_involved?: string[];
    weather_conditions?: string;
    contributing_factors?: string[];
    recommendations?: string;
  }) => api.post("/near-miss", data),
};

// Incident APIs
export const incidentApi = {
  list: (params?: {
    incident_type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) => api.get("/reports", { params: { ...params, report_type: "incident" } }),

  get: (id: string) => api.get(`/reports/${id}`),
};

// Dashboard APIs
export const dashboardApi = {
  supervisorStats: () => api.get("/dashboard/supervisor/stats"),

  hseStats: () => api.get("/dashboard/hse/stats"),

  hseTrends: (params?: { days?: number }) =>
    api.get("/dashboard/hse/trends", { params }),
};

// Sites APIs
export const sitesApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get("/sites", { params }),

  get: (id: string) => api.get(`/sites/${id}`),

  getAreas: (siteId: string) => api.get(`/sites/${siteId}/areas`),
};

// Users APIs
export const usersApi = {
  me: () => api.get("/users/me"),

  updateProfile: (data: { full_name?: string; email?: string }) =>
    api.put("/users/me", data),
};

export default api;
