import api from './axios';

export const getMyRides = async () => {
    // Rider lists their own rides
    const response = await api.get('/rides/');
    return response.data;
};

export const createSubscription = async (driverId, weekdays) => {
    const response = await api.post('/subscriptions/', { driver_id: driverId, weekdays });
    return response.data;
};

export const getMySubscriptions = async () => {
    const response = await api.get('/subscriptions/');
    return response.data;
};

export const listDrivers = async (destinationId) => {
    const params = destinationId ? { destination: destinationId } : {};
    const response = await api.get('/drivers/', { params });
    return response.data;
};
