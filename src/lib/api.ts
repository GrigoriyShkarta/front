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
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
        .then((token) => {
          if (original_request.headers) {
            original_request.headers.Authorization = `Bearer ${token}`;
          }
          return api(original_request);
        })
        .catch((err) => Promise.reject(err));
    }

    original_request._retry = true;
    is_refreshing = true;

    try {
      const refresh_token = Cookies.get('refresh_token');

      // If no refresh token, logout and redirect
      if (!refresh_token) {
        is_refreshing = false;
        clearAuthCookies();
        redirectToLogin();
        return Promise.reject(error);
      }
      
      const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { 
        refresh_token 
      }, {
        withCredentials: true
      });

      const { access_token, refresh_token: new_refresh_token } = response.data;
      
      setAuthCookies(access_token, new_refresh_token);
      
      process_queue(null, access_token);
      is_refreshing = false;

      if (original_request.headers) {
        original_request.headers.Authorization = `Bearer ${access_token}`;
      }
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
