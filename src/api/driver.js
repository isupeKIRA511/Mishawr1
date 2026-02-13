import api from './axios';

export const getMyRides = async () => {
    const response = await api.get('/rides/');
    return response.data;
};

export const updateRideStatus = async (rideId, status) => {
    const response = await api.patch(`/rides/${rideId}/`, { status });
    return response.data;
};

export const getDriverProfile = async (id) => {
    // If id is not provided, maybe get logged in driver profile?
    // The API doc says GET /api/drivers/ lists drivers.
    // For a specific driver details, typically it's expanded in rides or subscriptions.
    // Or GET /api/drivers/?user={id} if supported, but let's stick to what we know.
    const response = await api.get(`/drivers/${id}/`);
    return response.data;
};

export const getMyDriverProfile = async () => {
    // Based on doc, GET /api/drivers/ for "Driver" role lists only self.
    const response = await api.get('/drivers/');
    return response.data?.[0]; // Assuming list returns array
}
