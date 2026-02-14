import api from './axios';

export const getMyRides = async () => {
    const response = await api.get('rides/');
    return response.data.data;
};

export const updateRideStatus = async (rideId, status) => {
    const response = await api.patch(`rides/${rideId}/`, { status });
    return response.data.data;
};

export const getDriverProfile = async (id) => {
    const response = await api.get(`drivers/${id}/`);
    return response.data.data;
};

export const getMyDriverProfile = async () => {
    const response = await api.get('drivers/');
    // API returns list of drivers, filter or take first
    const data = response.data.data;
    return Array.isArray(data) ? data[0] : data;
}

export const registerDriverProfile = async (formData) => {
    const response = await api.post('drivers/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};
