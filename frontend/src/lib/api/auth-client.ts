import axios, { type AxiosError } from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const REFRESH_ENDPOINT = "/api/auth/refresh";

type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

const getTokensFromResponse = (payload: TokenResponse) => {
  const accessToken = payload?.accessToken || payload?.data?.accessToken;
  const refreshToken = payload?.refreshToken || payload?.data?.refreshToken;
  return { accessToken, refreshToken };
};

export const api = axios.create({
  baseURL: baseUrl.replace(/\/$/, ""),
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((originalRequest as { _retry?: boolean })._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes(REFRESH_ENDPOINT)) {
      return Promise.reject(error);
    }

    (originalRequest as { _retry?: boolean })._retry = true;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await api.post<TokenResponse>(
        REFRESH_ENDPOINT,
        { refreshToken },
      );

      const { accessToken, refreshToken: nextRefreshToken } =
        getTokensFromResponse(refreshResponse.data || {});

      if (!accessToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return Promise.reject(error);
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (nextRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject(refreshError);
    }
  },
);
