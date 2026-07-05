import axios, { AxiosError } from "axios";

export class HotKeyAPIError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "HotKeyAPIError";
    this.status = status;
    this.code = code;
  }
}

const apiClient = axios.create({
  baseURL: "",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; code?: string }>) => {
    const message = error.response?.data?.error ?? error.message;
    const code = error.response?.data?.code;
    return Promise.reject(
      new HotKeyAPIError(message, error.response?.status ?? 0, code)
    );
  },
);

export default apiClient;
