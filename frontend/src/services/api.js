import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Agregar al archivo api.js existente
export const recommendationAPI = {
    getRecommendations: (userId, limit = 5) => 
        api.get(`/recommendations/${userId}?limit=${limit}`),
    
    getUserSimilarity: (userId) => 
        api.get(`/similarity/${userId}`),
    
    getUserVectors: (userId) => 
        api.get(`/api/vector-data/${userId}`),
    
    getVectorCalculation: (userId) => 
        api.get(`/api/vector-calculation/${userId}`),
};

export default api;