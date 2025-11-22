const pool = require('../config/database');

class RecommendationService {
    
    // Obtener todas las películas
    async getAllMovies() {
        const result = await pool.query('SELECT * FROM movies ORDER BY id');
        return result.rows;
    }

    // Obtener todos los usuarios
    async getAllUsers() {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        return result.rows;
    }

    // Obtener calificaciones de un usuario específico
    async getUserRatings(userId) {
        const query = `
            SELECT m.id, m.title, r.rating 
            FROM ratings r 
            JOIN movies m ON r.movie_id = m.id 
            WHERE r.user_id = $1 
            ORDER BY m.id
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // Obtener todas las calificaciones (para construir la matriz)
    async getAllRatings() {
        const query = `
            SELECT u.id as user_id, u.username, m.id as movie_id, m.title, COALESCE(r.rating, 0) as rating
            FROM users u
            CROSS JOIN movies m
            LEFT JOIN ratings r ON u.id = r.user_id AND m.id = r.movie_id
            ORDER BY u.id, m.id
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

    // Calcular similitud del coseno
    cosineSimilarity(vectorA, vectorB) {
        const dotProd = this.dotProduct(vectorA, vectorB);
        const magA = this.magnitude(vectorA);
        const magB = this.magnitude(vectorB);
        
        if (magA === 0 || magB === 0) return 0;
        return dotProd / (magA * magB);
    }

    // Generar vector de calificaciones para un usuario
    async getUserRatingVector(userId) {
        const allMovies = await this.getAllMovies();
        const userRatings = await this.getUserRatings(userId);
        
        // Crear un mapa de ratings del usuario por movie_id
        const ratingMap = {};
        userRatings.forEach(rating => {
            ratingMap[rating.id] = rating.rating;
        });
        
        // Construir vector para todas las películas
        return allMovies.map(movie => ratingMap[movie.id] || 0);
    }

    // Generar recomendaciones basadas en similitud de coseno
    async generateRecommendations(userId, limit = 5) {
        try {
            console.log(`🎯 Generando recomendaciones para usuario ${userId}`);
            
            // Obtener todos los datos necesarios
            const allUsers = await this.getAllUsers();
            const allMovies = await this.getAllMovies();
            const allRatings = await this.getAllRatings();
            
            // Construir matriz de usuarios vs películas
            const userVectors = {};
            allUsers.forEach(user => {
                userVectors[user.id] = allMovies.map(movie => {
                    const rating = allRatings.find(r => 
                        r.user_id === user.id && r.movie_id === movie.id
                    );
                    return rating ? parseFloat(rating.rating) : 0;
                });
            });
            
            // Vector del usuario objetivo
            const targetUserVector = userVectors[userId];
            if (!targetUserVector) {
                throw new Error(`Usuario ${userId} no encontrado`);
            }
            
            // Calcular similitudes con otros usuarios
            const similarities = [];
            for (const user of allUsers) {
                if (user.id === userId) continue;
                
                const similarity = this.cosineSimilarity(targetUserVector, userVectors[user.id]);
                
                if (similarity > 0.1) { // Solo considerar similitudes significativas
                    similarities.push({
                        user_id: user.id,
                        username: user.username,
                        similarity: similarity
                    });
                }
            }
            
            // Ordenar por similitud descendente
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            // Obtener películas no vistas por el usuario
            const userRatedMovies = await this.getUserRatings(userId);
            const userRatedMovieIds = userRatedMovies.map(m => m.id);
            const unwatchedMovies = allMovies.filter(movie => 
                !userRatedMovieIds.includes(movie.id)
            );
            
            console.log(`📊 ${unwatchedMovies.length} películas no vistas encontradas`);
            
            // Calcular puntuaciones predichas
            const recommendations = [];
            
            for (const movie of unwatchedMovies) {
                let weightedSum = 0;
                let similaritySum = 0;
                let predictionSources = 0;
                
                for (const similarUser of similarities.slice(0, 5)) { // Top 5 usuarios similares
                    const userRating = allRatings.find(r => 
                        r.user_id === similarUser.user_id && r.movie_id === movie.id
                    );
                    
                    if (userRating && parseFloat(userRating.rating) > 0) {
                        weightedSum += parseFloat(userRating.rating) * similarUser.similarity;
                        similaritySum += similarUser.similarity;
                        predictionSources++;
                    }
                }
                
                if (similaritySum > 0 && predictionSources >= 1) {
                    const predictedRating = weightedSum / similaritySum;
                    recommendations.push({
                        movie: movie,
                        predicted_rating: parseFloat(predictedRating.toFixed(2)),
                        confidence: parseFloat(similaritySum.toFixed(3)),
                        sources: predictionSources
                    });
                }
            }
            
            // Ordenar y limitar recomendaciones
            recommendations.sort((a, b) => b.predicted_rating - a.predicted_rating);
            const finalRecommendations = recommendations.slice(0, limit);
            
            console.log(`✅ ${finalRecommendations.length} recomendaciones generadas`);
            
            return finalRecommendations;
            
        } catch (error) {
            console.error('❌ Error generando recomendaciones:', error);
            throw error;
        }
    }

    // Obtener similitudes entre usuarios
    async getUserSimilarities(userId) {
        try {
            const allUsers = await this.getAllUsers();
            const allMovies = await this.getAllMovies();
            const allRatings = await this.getAllRatings();
            
            // Construir matriz de usuarios vs películas
            const userVectors = {};
            allUsers.forEach(user => {
                userVectors[user.id] = allMovies.map(movie => {
                    const rating = allRatings.find(r => 
                        r.user_id === user.id && r.movie_id === movie.id
                    );
                    return rating ? parseFloat(rating.rating) : 0;
                });
            });
            
            const targetUserVector = userVectors[userId];
            const similarities = [];
            
            for (const user of allUsers) {
                if (user.id === userId) continue;
                
                const similarity = this.cosineSimilarity(targetUserVector, userVectors[user.id]);
                
                similarities.push({
                    user_id: user.id,
                    username: user.username,
                    similarity: parseFloat(similarity.toFixed(4)),
                    similarity_percentage: (similarity * 100).toFixed(2) + '%'
                });
            }
            
            similarities.sort((a, b) => b.similarity - a.similarity);
            return similarities;
            
        } catch (error) {
            console.error('Error calculando similitudes:', error);
            throw error;
        }
    }
}

module.exports = new RecommendationService();