import React from 'react';

const RecommendationList = ({ recommendations, isLoading }) => {
    if (isLoading) {
        return <div className="loading">Calculando recomendaciones...</div>;
    }

    if (!recommendations || recommendations.length === 0) {
        return <div className="no-recommendations">No hay recomendaciones disponibles</div>;
    }

    return (
        <div className="recommendation-list">
            <h3>Películas Recomendadas</h3>
            <div className="recommendations-grid">
                {recommendations.map((rec, index) => (
                    <div key={rec.movie.id} className="recommendation-card">
                        <div className="card-header">
                            <h4>#{index + 1} {rec.movie.title}</h4>
                            <span className="genre-badge">{rec.movie.genre}</span>
                        </div>
                        <div className="card-body">
                            <p className="movie-description">{rec.movie.description}</p>
                            <div className="rating-info">
                                <div className="predicted-rating">
                                    <strong>Rating Predicho:</strong> 
                                    {rec.predicted_rating.toFixed(2)}
                                </div>
                                <div className="confidence">
                                    <strong>Confianza:</strong> 
                                    {rec.confidence.toFixed(2)}
                                </div>
                            </div>
                            <div className="similarity-bar">
                                <div 
                                    className="similarity-fill"
                                    style={{ width: `${(rec.predicted_rating / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationList;