import axios from "axios";
import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      `Request failed: ${error.response?.status}`;
    return Promise.reject(new Error(message));
  },
);

export const api = {
  get: <T>(path: string): Promise<T> =>
    axiosInstance.get<T>(path).then((r) => r.data),
  post: <T>(path: string, data?: unknown): Promise<T> =>
    axiosInstance.post<T>(path, data).then((r) => r.data),
  patch: <T>(path: string, data: unknown): Promise<T> =>
    axiosInstance.patch<T>(path, data).then((r) => r.data),
  delete: <T>(path: string): Promise<T> =>
    axiosInstance.delete<T>(path).then((r) => r.data),
};
