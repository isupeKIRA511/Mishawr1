import api from './axios';

export const login = async (username, password) => {
    const response = await api.post('login/', { username, password });

    // Explicitly check for token in standard (data.data) or flat (data) location
    const body = response.data;
    const dataWithToken = (body.data && body.data.access) ? body.data : body;

    console.log("Login Response Body:", body);
    console.log("Extracted Token Data:", dataWithToken);

    if (dataWithToken && dataWithToken.access) {
        localStorage.setItem('access', dataWithToken.access);
        if (dataWithToken.refresh) localStorage.setItem('refresh', dataWithToken.refresh);
    } else {
        console.error("Critical Error: No access token found in login response!");
    }

    return dataWithToken;
};

export const registerUser = async (userData) => {
    // userData: { username, password, role, phone_number, ... }
    const response = await api.post('users/', userData);
    return response.data; // Register might return just message or data, keep as is or check standard
};

export const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
};

export const linkPassenger = async (uniqueId) => {
    // According to Swagger: POST /api/users/link_passenger/
    // It requires authenticating as a user first.
    const response = await api.post('users/link_passenger/', { unique_id: uniqueId });
    return response.data.data;
};

export const getMe = async () => {
    const response = await api.get('users/me/');
    return response.data.data;
};
