import axios, { AxiosInstance } from 'axios';
import { BASE_URL, API_BASE_URL } from './api/apiUrl';

// -----------------------
// Token Management
// -----------------------
let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

export const setAccessToken = (token: string | null) => { accessToken = token; if (typeof window !== 'undefined') { if (token) localStorage.setItem('accessToken', token); else localStorage.removeItem('accessToken'); } };

export const getAccessToken = () => { if (!accessToken) { if (typeof window !== 'undefined') { accessToken = localStorage.getItem('accessToken'); } } return accessToken; };
// -----------------------
// Axios Instance
// -----------------------
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// -----------------------
// Request Interceptor
// -----------------------
api.interceptors.request.use(
    (config) => {
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// -----------------------
// Response Interceptor
// -----------------------
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            originalRequest &&
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes(BASE_URL.AUTH_API.REFRESH)
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { data } = await api.post(BASE_URL.AUTH_API.REFRESH, undefined, {
                        withCredentials: true,
                    });
                    if (!data.success) throw new Error(data.message || 'Failed to refresh token');

                    accessToken = data.data.token;
                    if (accessToken) {
                        onRefreshed(accessToken);
                    }

                } catch (err) {
                    accessToken = null;
                    window.localStorage.removeItem('authUser');
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            // Queue all requests while refreshing
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((token) => {
                    if (!originalRequest.headers) return reject('No headers in original request');
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
