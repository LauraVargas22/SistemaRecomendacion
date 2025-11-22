const pool = require('../config/database');

class RecommendationService {
    
    // Obtener vector de calificaciones de un usuario
    async getUserRatingVector(userId) {
        const query = `
            SELECT m.id as movie_id, COALESCE(r.rating, 0) as rating
            FROM movies m
            LEFT JOIN ratings r ON m.id = r.movie_id AND r.user_id = $1
            ORDER BY m.id
        `;
        const result = await pool.query(query, [userId]);
        return result.rows.map(row => row.rating);
    }

    // Obtener matriz de calificaciones de todos los usuarios
    async getAllUsersRatingVectors() {
        const query = `
            SELECT u.id as user_id, u.username,
                   json_object_agg(
                       COALESCE(r.movie_id, 0), 
                       COALESCE(r.rating, 0)
                   ) as ratings
            FROM users u
            LEFT JOIN ratings r ON u.id = r.user_id
            GROUP BY u.id, u.username
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Calcular producto punto entre dos vectores
    dotProduct(vectorA, vectorB) {
        return vectorA.reduce((sum, a, index) => {
            const b = vectorB[index] || 0;
            return sum + (a * b);
        }, 0);
    }

    // Calcular magnitud de un vector
    magnitude(vector) {
        return Math.sqrt(
            vector.reduce((sum, value) => sum + (value * value), 0)
        );
    }

    // Calcular similitud del coseno (producto punto normalizado)
    cosineSimilarity(vectorA, vectorB) {
        const dotProd = this.dotProduct(vectorA, vectorB);
        const magA = this.magnitude(vectorA);
        const magB = this.magnitude(vectorB);
        
        if (magA === 0 || magB === 0) return 0;
        return dotProd / (magA * magB);
    }

    // Generar recomendaciones para un usuario
    async generateRecommendations(userId, limit = 5) {
        try {
            // Obtener vector del usuario objetivo
            const targetUserVector = await this.getUserRatingVector(userId);
            
            // Obtener vectores de todos los usuarios
            const allUsers = await this.getAllUsersRatingVectors();
            
            // Calcular similitudes
            const similarities = [];
            
            for (const user of allUsers) {
                if (user.user_id === userId) continue;
                
                // Convertir ratings a vector
                const userRatings = Object.values(user.ratings);
                const similarity = this.cosineSimilarity(targetUserVector, userRatings);
                
                if (similarity > 0) {
                    similarities.push({
                        user_id: user.user_id,
                        username: user.username,
                        similarity: similarity
                    });
                }
            }
            
            // Ordenar por similitud descendente
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            // Obtener películas no vistas por el usuario objetivo
            const unwatchedMoviesQuery = `
                SELECT m.* 
                FROM movies m
                WHERE m.id NOT IN (
                    SELECT movie_id FROM ratings WHERE user_id = $1
                )
            `;
            const unwatchedMovies = await pool.query(unwatchedMoviesQuery, [userId]);
            
            // Calcular puntuación para cada película no vista
            const recommendations = [];
            
            for (const movie of unwatchedMovies.rows) {
                let weightedSum = 0;
                let similaritySum = 0;
                
                for (const similarUser of similarities.slice(0, 10)) { // Top 10 usuarios similares
                    const userRatingQuery = `
                        SELECT rating FROM ratings 
                        WHERE user_id = $1 AND movie_id = $2
                    `;
                    const ratingResult = await pool.query(userRatingQuery, [similarUser.user_id, movie.id]);
                    
                    if (ratingResult.rows.length > 0) {
                        const rating = ratingResult.rows[0].rating;
                        weightedSum += rating * similarUser.similarity;
                        similaritySum += similarUser.similarity;
                    }
                }
                
                if (similaritySum > 0) {
                    const predictedRating = weightedSum / similaritySum;
                    recommendations.push({
                        movie: movie,
                        predicted_rating: predictedRating,
                        confidence: similaritySum
                    });
                }
            }
            
            // Ordenar recomendaciones por rating predicho
            recommendations.sort((a, b) => b.predicted_rating - a.predicted_rating);
            
            return recommendations.slice(0, limit);
            
        } catch (error) {
            console.error('Error generando recomendaciones:', error);
            throw error;
        }
    }
}

module.exports = new RecommendationService();