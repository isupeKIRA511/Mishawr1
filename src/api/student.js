import api from './axios';

export const getMyRides = async () => {
    const response = await api.get('rides/');
    return response.data.data;
};

export const createSubscription = async (data) => {
    // data: { driver_id, weekdays: [], pickup_latitude, pickup_longitude }
    const response = await api.post('subscriptions/', data);
    return response.data.data;
};

export const getMySubscriptions = async () => {
    const response = await api.get('subscriptions/');
    console.log(response.data);
    return response.data.data;
};

export const listDrivers = async (destination) => {
    const params = destination ? { destination: destination, pickup_latitude: 33.3152, pickup_longitude: 44.3661 } : {};
    const response = await api.get('drivers/', { params });
    console.log(response.data);
    return response.data.data;
};
