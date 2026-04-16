import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { clearAuthCookies } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // We no longer manually add the Authorization header because we use HttpOnly cookies.
  // The browser sends them automatically with 'withCredentials: true'.
  return config;
});

let is_refreshing = false;
let failed_requests: { resolve: (token: string | null) => void; reject: (error: unknown) => void }[] = [];

/**
 * Resolves or rejects all queued requests that were waiting for a token refresh.
 * @param error Error to reject with, or null on success.
 * @param token Token string on success, or null on failure.
 */
const process_queue = (error: unknown, token: string | null = null): void => {
  failed_requests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failed_requests = [];
};

/**
 * Redirects the user to the login page, preserving the current locale prefix.
 */
const redirectToLogin = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const pathname = window.location.pathname;

  // Prevent redirection loop if already on login page
  if (pathname.includes('/login')) {
    return;
  }

  const segments = pathname.split('/');
  const current_locale = segments[1];

  // Check if the first segment is a valid locale (e.g., 'uk', 'en', 'zh-CN')
  const is_valid_locale =
    (current_locale && current_locale.length === 2) ||
    ['zh-CN', 'zh-TW'].includes(current_locale);

  window.location.href = is_valid_locale ? `/${current_locale}/login` : '/login';
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original_request = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the failing request IS the refresh endpoint — abort immediately and redirect.
    // This must be checked BEFORE the status code check to handle any error status
    // (401, 404, network error, etc.) coming from the refresh call itself.
    if (original_request?.url?.includes('/auth/refresh')) {
      is_refreshing = false;
      process_queue(error, null);
      clearAuthCookies();
      redirectToLogin();
      return Promise.reject(error);
    }

    // For non-401 errors or already-retried requests — pass through without refresh attempt
    if (error.response?.status !== 401 || original_request?._retry) {
      return Promise.reject(error);
    }

    // Queue this request if a refresh is already in progress
    if (is_refreshing) {
      return new Promise((resolve, reject) => {
        failed_requests.push({ resolve, reject });
      })
        .then(() => {
          // Browser automatically sends the new HttpOnly cookie on retry
          return api(original_request);
        })
        .catch((err) => Promise.reject(err));
    }

    original_request._retry = true;
    is_refreshing = true;

    try {
      // Check for the non-HttpOnly flag cookie before attempting a refresh.
      // If it's missing, the session has fully expired — no point calling refresh.
      const has_token = Cookies.get('has_token');

      if (!has_token) {
        is_refreshing = false;
        process_queue(null, null);
        clearAuthCookies();
        redirectToLogin();
        return Promise.reject(error);
      }

      // The refresh_token is HttpOnly — we don't read it directly.
      // The browser sends it automatically with withCredentials: true.
      await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      // Backend has set fresh cookies via Set-Cookie headers
      process_queue(null, 'success');
      is_refreshing = false;

      return api(original_request);
    } catch (refresh_error) {
      is_refreshing = false;
      process_queue(refresh_error, null);
      clearAuthCookies();
      redirectToLogin();
      return Promise.reject(refresh_error);
    }
  },
);
