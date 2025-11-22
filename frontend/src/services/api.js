import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const recommendationAPI = {
    getRecommendations: (userId, limit = 5) => 
        api.get(`/recommendations/${userId}?limit=${limit}`),
    
    getUserSimilarity: (userId) => 
        api.get(`/similarity/${userId}`),
};

export default api;