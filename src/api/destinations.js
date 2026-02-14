import api from './axios';

export const getDestinations = async () => {
    const response = await api.get('destinations/');
    console.log(response.data);
    return response.data.data;
};
