import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { setAuthCookies, clearAuthCookies } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // We no longer manually add the Authorization header because we use HttpOnly cookies
  // browser sends them automatically with 'withCredentials: true'
  return config;
});

let is_refreshing = false;
let failed_requests: { resolve: (token: string | null) => void; reject: (error: any) => void }[] = [];

const process_queue = (error: any, token: string | null = null) => {
  failed_requests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failed_requests = [];
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;

    // Prevent redirection loop if already on login page
    if (pathname.includes('/login')) {
      return;
    }

    const segments = pathname.split('/');
    const current_locale = segments[1];
    
    // Check if the first segment is a valid locale (e.g., 'uk', 'en')
    const is_valid_locale = (current_locale && current_locale.length === 2) || ["zh-CN", "zh-TW"].includes(current_locale);
    
    if (is_valid_locale) {
      window.location.href = `/${current_locale}/login`;
    } else {
      window.location.href = '/login';
    }
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original_request = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip if it's already a retry or not a 401 error
    if (error.response?.status !== 401 || original_request?._retry) {
      return Promise.reject(error);
    }

    // Skip if the error is on the refresh endpoint itself
    if (original_request.url?.includes('/auth/refresh')) {
      clearAuthCookies();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (is_refreshing) {
      return new Promise((resolve, reject) => {
        failed_requests.push({ resolve, reject });
      })
        .then(() => {
          // No need to set new token in header, browser handles it
          return api(original_request);
        })
        .catch((err) => Promise.reject(err));
    }

    original_request._retry = true;
    is_refreshing = true;

    try {
      // Check for the non-HttpOnly flag before attempting a refresh
      const hasToken = Cookies.get('has_token');

      if (!hasToken) {
        is_refreshing = false;
        clearAuthCookies();
        redirectToLogin();
        return Promise.reject(error);
      }

      // We don't read refresh_token from JS cookies anymore as it's HttpOnly
      // We just call the refresh endpoint and let the browser send the cookie
      await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
        withCredentials: true
      });

      // After successful refresh, backend has set new cookies via Set-Cookie header
      process_queue(null, "success");
      is_refreshing = false;

      return api(original_request);
    } catch (refresh_error) {
      is_refreshing = false;
      process_queue(refresh_error, null);
      clearAuthCookies();
      redirectToLogin();
      return Promise.reject(refresh_error);
    }
  }
);
