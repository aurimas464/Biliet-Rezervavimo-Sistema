import axios from 'axios';

let isRefreshing = false; // Flag to indicate if token refresh is in progress
let refreshSubscribers = []; // Queue of failed requests awaiting the refreshed token

// Notify all subscribers (requests) with the new token
const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Add a subscriber to the queue
const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

// Centralized logout handler
const handleLogout = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.role === 0) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }

        await api.post('/logout');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    } catch (err) {
        console.error('Error during logout:', err);
        window.location.href = '/login';
    }
}

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL + "/api",
    withCredentials: true, // Ensure cookies are sent
});

const refreshToken = async () => {
    try {
        const response = await api.post('/refresh', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const newToken = response.data.access_token;
        localStorage.setItem('token', newToken);
        console.log("New token:", newToken);
        return newToken;
    } catch (err) {
        console.error("Token refresh failed:", err);
    }
};

// Axios Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent duplicate retries or handle refresh failure
        if (originalRequest._retry) {
            return Promise.reject(error); // Do not retry if refresh has already failed
        }

        // Check if the failed request is the refresh request itself
        if (originalRequest.url.includes('/refresh') && error.response && error.response.status === 401) {
            console.error('Refresh token is invalid or expired, logging out...');
            handleLogout(); // Perform logout if refresh fails with 401
            return Promise.reject(error); // Propagate error
        }

        if (error.response && error.response.status === 401) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshToken();
                    isRefreshing = false;
                    onRefreshed(newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (err) {
                    isRefreshing = false;
                    refreshSubscribers = [];
                    return Promise.reject(err); // Ensure rejection propagates
                }
            }

            // Queue the request to retry after the token refresh is complete
            return new Promise((resolve, reject) => {
                addRefreshSubscriber((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;