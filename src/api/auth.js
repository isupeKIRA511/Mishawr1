import api from './axios';

export const login = async (username, password) => {
    const response = await api.post('/login/', { username, password });
    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
};

export const registerUser = async (userData) => {
    // userData: { username, password, role, phone_number, ... }
    const response = await api.post('/users/', userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const linkPassenger = async (uniqueId) => {
    // According to Swagger: POST /api/users/link_passenger/
    // It requires authenticating as a user first.
    const response = await api.post('/users/link_passenger/', { unique_id: uniqueId });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/users/me/');
    return response.data;
};
