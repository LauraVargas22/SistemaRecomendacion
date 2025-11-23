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

    async getVectorData(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            
            const allUsers = await recommendationService.getAllUsers();
            const allMovies = await recommendationService.getAllMovies();
            const allRatings = await recommendationService.getAllRatings();
            
            // Construir vectores para todos los usuarios
            const userVectors = [];
            const movieTitles = allMovies.map(m => m.title);
            
            for (const user of allUsers) {
                const ratings = allMovies.map(movie => {
                    const rating = allRatings.find(r => 
                        r.user_id === user.id && r.movie_id === movie.id
                    );
                    return rating ? parseFloat(rating.rating) : 0;
                });
                
                userVectors.push({
                    userId: user.id,
                    username: user.username,
                    movies: movieTitles,
                    ratings: ratings,
                    vectorMagnitude: parseFloat(
                        Math.sqrt(ratings.reduce((sum, r) => sum + r * r, 0)).toFixed(3)
                    )
                });
            }
            
            res.json({
                target_user: userId,
                user_vectors: userVectors,
                total_movies: allMovies.length,
                total_users: allUsers.length
            });
            
        } catch (error) {
            console.error('Error en getVectorData:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getVectorCalculation(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            
            const allUsers = await recommendationService.getAllUsers();
            const allMovies = await recommendationService.getAllMovies();
            const allRatings = await recommendationService.getAllRatings();
            
            // Obtener vector del usuario objetivo
            const targetUserRatings = allMovies.map(movie => {
                const rating = allRatings.find(r => 
                    r.user_id === userId && r.movie_id === movie.id
                );
                return rating ? parseFloat(rating.rating) : 0;
            });
            
            // Calcular producto punto con otros usuarios
            const calculations = [];
            
            for (const user of allUsers) {
                if (user.id === userId) continue;
                
                const userRatings = allMovies.map(movie => {
                    const rating = allRatings.find(r => 
                        r.user_id === user.id && r.movie_id === movie.id
                    );
                    return rating ? parseFloat(rating.rating) : 0;
                });
                
                // Calcular producto punto
                const dotProduct = targetUserRatings.reduce((sum, rating, idx) => 
                    sum + (rating * userRatings[idx]), 0
                );
                
                // Calcular magnitudes
                const targetMagnitude = Math.sqrt(
                    targetUserRatings.reduce((sum, r) => sum + r * r, 0)
                );
                const userMagnitude = Math.sqrt(
                    userRatings.reduce((sum, r) => sum + r * r, 0)
                );
                
                // Calcular similitud coseno
                const cosineSimilarity = targetMagnitude > 0 && userMagnitude > 0 
                    ? dotProduct / (targetMagnitude * userMagnitude)
                    : 0;
                
                calculations.push({
                    user_id: user.id,
                    username: user.username,
                    dot_product: parseFloat(dotProduct.toFixed(3)),
                    target_magnitude: parseFloat(targetMagnitude.toFixed(3)),
                    user_magnitude: parseFloat(userMagnitude.toFixed(3)),
                    cosine_similarity: parseFloat(cosineSimilarity.toFixed(4)),
                    calculation: `(${dotProduct.toFixed(2)}) / (${targetMagnitude.toFixed(2)} × ${userMagnitude.toFixed(2)})`
                });
            }
            
            calculations.sort((a, b) => b.cosine_similarity - a.cosine_similarity);
            
            res.json({
                target_user: userId,
                target_vector: {
                    ratings: targetUserRatings,
                    magnitude: Math.sqrt(targetUserRatings.reduce((sum, r) => sum + r * r, 0))
                },
                calculations: calculations,
                formula: {
                    dot_product: "A·B = Σ(Aᵢ × Bᵢ)",
                    cosine_similarity: "cos(θ) = (A·B) / (||A|| × ||B||)"
                }
            });
            
        } catch (error) {
            console.error('Error en getVectorCalculation:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RecommendationController();