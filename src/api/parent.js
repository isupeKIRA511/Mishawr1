import api from './axios';

// Get detailed user info
export const getUser = async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
};

// Get rides for a specific rider (child)
export const getRides = async (riderId) => {
    // Assuming backend supports filtering by rider
    const response = await api.get(`/rides/`, { params: { rider: riderId } });
    return response.data;
};

// Get subscriptions for a specific rider (child)
export const getSubscriptions = async (riderId) => {
    // Assuming backend supports filtering by rider
    const response = await api.get(`/subscriptions/`, { params: { rider: riderId } });
    return response.data;
};

// Report attendance status (e.g., won't attend)
// This might be updating a ride status or creating a new record.
// If it's "Won't attend today", that likely means updating today's ScheduledRide status to CANCELLED or similar.
export const updateRideStatus = async (rideId, status) => {
    const response = await api.patch(`/rides/${rideId}/`, { status });
    return response.data;
};

// Pay for subscription
export const paySubscription = async (subscriptionId) => {
    const response = await api.post(`/subscriptions/${subscriptionId}/pay/`);
    return response.data;
};
