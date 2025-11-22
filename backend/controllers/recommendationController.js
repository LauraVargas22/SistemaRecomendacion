const recommendationService = require('../services/recommendationService');

class RecommendationController {
    
    async getRecommendations(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const limit = parseInt(req.query.limit) || 5;
            
            if (!userId) {
                return res.status(400).json({ error: 'Se requiere user ID' });
            }
            
            const recommendations = await recommendationService.generateRecommendations(userId, limit);
            
            res.json({
                user_id: userId,
                recommendations: recommendations,
                algorithm: 'Producto Punto + Similitud Coseno'
            });
            
        } catch (error) {
            console.error('Error en getRecommendations:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async getUserSimilarity(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const allUsers = await recommendationService.getAllUsersRatingVectors();
            const targetUserVector = await recommendationService.getUserRatingVector(userId);
            
            const similarities = [];
            
            for (const user of allUsers) {
                if (user.user_id === userId) continue;
                
                const userRatings = Object.values(user.ratings);
                const similarity = recommendationService.cosineSimilarity(targetUserVector, userRatings);
                
                similarities.push({
                    user_id: user.user_id,
                    username: user.username,
                    similarity: similarity,
                    similarity_percentage: (similarity * 100).toFixed(2) + '%'
                });
            }
            
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            res.json({
                target_user: userId,
                similarities: similarities
            });
            
        } catch (error) {
            console.error('Error en getUserSimilarity:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = new RecommendationController();