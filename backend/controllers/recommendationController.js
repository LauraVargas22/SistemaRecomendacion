const recommendationService = require('../services/recommendationService');

class RecommendationController {
    
    async getRecommendations(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const limit = parseInt(req.query.limit) || 5;
            
            if (!userId || isNaN(userId)) {
                return res.status(400).json({ 
                    error: 'Se requiere un user ID válido' 
                });
            }
            
            console.log(`📨 Solicitud de recomendaciones para usuario: ${userId}`);
            
            const recommendations = await recommendationService.generateRecommendations(userId, limit);
            
            res.json({
                user_id: userId,
                recommendations: recommendations,
                algorithm: 'Producto Punto + Similitud Coseno',
                total_recommendations: recommendations.length,
                generated_at: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error en getRecommendations:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    async getUserSimilarity(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            
            if (!userId || isNaN(userId)) {
                return res.status(400).json({ 
                    error: 'Se requiere un user ID válido' 
                });
            }
            
            console.log(`📨 Solicitud de similitudes para usuario: ${userId}`);
            
            const similarities = await recommendationService.getUserSimilarities(userId);
            
            res.json({
                target_user: userId,
                similarities: similarities,
                total_similar_users: similarities.length,
                generated_at: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error en getUserSimilarity:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Nuevo endpoint para obtener datos de la base de datos
    async getDatabaseInfo(req, res) {
        try {
            const users = await recommendationService.getAllUsers();
            const movies = await recommendationService.getAllMovies();
            const ratings = await recommendationService.getAllRatings();
            
            res.json({
                database_info: {
                    total_users: users.length,
                    total_movies: movies.length,
                    total_ratings: ratings.filter(r => r.rating > 0).length,
                    users: users.map(u => ({ id: u.id, username: u.username })),
                    movies: movies.map(m => ({ id: m.id, title: m.title, genre: m.genre }))
                }
            });
            
        } catch (error) {
            console.error('Error en getDatabaseInfo:', error);
            res.status(500).json({ 
                error: 'Error obteniendo información de la base de datos',
                message: error.message 
            });
        }
    }
}

module.exports = new RecommendationController();