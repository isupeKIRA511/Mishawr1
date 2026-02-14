import axios from 'axios';

const api = axios.create({
    baseURL: 'https://7bt3gzgt-8000.uks1.devtunnels.ms/api/',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            console.log("Attaching auth token to request:", config.url);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("No auth token found for request:", config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Skip 401 handling for login request itself
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login/')) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh');
                if (refreshToken) {
                    const response = await axios.post('https://bz82h7r8-8000.inc1.devtunnels.ms/api/token/refresh/', {
                        refresh: refreshToken
                    });
                    if (response.data.data && response.data.data.access) {
                        localStorage.setItem('access', response.data.data.access);
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.access}`;
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (err) {
                // Refresh token failed, redirect to login
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
