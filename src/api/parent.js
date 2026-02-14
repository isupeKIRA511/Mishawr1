import api from './axios';

// Get detailed user info
export const getUser = async (id) => {
    const response = await api.get(`users/${id}/`);
    return response.data.data;
};

// Get rides for a specific rider (child)
export const getRides = async (riderId) => {
    const response = await api.get(`rides/`, { params: { rider: riderId } });
    return response.data.data;
};

// Get subscriptions for a specific rider (child)
export const getSubscriptions = async (riderId) => {
    const response = await api.get(`subscriptions/`, { params: { rider: riderId } });
    return response.data.data;
};

// Cancel a ride (used for "Won't attend")
export const cancelRide = async (rideId) => {
    const response = await api.post(`rides/${rideId}/cancel/`);
    return response.data.data;
};

export const updateRideStatus = async (rideId, status) => {
    // Deprecated for Parent based on doc, but keeping if needed for other status updates if allowed
    // For cancellation, use cancelRide
    if (status === 'CANCELLED') {
        return cancelRide(rideId);
    }
    const response = await api.patch(`rides/${rideId}/`, { status });
    return response.data.data;
};

// Pay for subscription
export const paySubscription = async (subscriptionId) => {
    const response = await api.post(`subscriptions/${subscriptionId}/pay/`);
    return response.data.data;
};
