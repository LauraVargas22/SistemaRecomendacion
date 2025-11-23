import React from 'react';

const VectorVisualization = ({ userVectors, similarities, selectedUser }) => {
    if (!userVectors || userVectors.length === 0) {
        return (
            <div className="vector-visualization">
                <p>No hay datos de vectores para visualizar</p>
            </div>
        );
    }

    // Gráfica simple de similitudes usando divs
    const renderSimilarityBars = () => {
        return (
            <div className="similarity-bars">
                <h4>Similitud entre Usuarios</h4>
                {similarities.map(sim => (
                    <div key={sim.user_id} className="similarity-item">
                        <div className="user-info">
                            <strong>Usuario {sim.user_id}</strong>
                            <span className="similarity-value">
                                {sim.similarity.toFixed(4)} 
                                <span className="percentage">({sim.similarity_percentage})</span>
                            </span>
                        </div>
                        <div className="similarity-bar-container">
                            <div 
                                className="similarity-bar"
                                style={{ 
                                    width: `${sim.similarity * 100}%`,
                                    backgroundColor: `hsl(${sim.similarity * 120}, 70%, 50%)`
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Mostrar vectores como texto
    const renderVectorsText = () => {
        const targetUser = userVectors.find(u => u.userId === selectedUser);
        if (!targetUser) return null;

        return (
            <div className="vector-details">
                <h4>Vector del Usuario {selectedUser}</h4>
                <div className="vector-values">
                    {targetUser.ratings.slice(0, 10).map((rating, index) => (
                        <span key={index} className="vector-value">
                            {rating > 0 ? `${rating}⭐` : '·'}
                        </span>
                    ))}
                    {targetUser.ratings.length > 10 && (
                        <span className="vector-ellipsis">... (+{targetUser.ratings.length - 10} más)</span>
                    )}
                </div>
                <p className="vector-magnitude">
                    <strong>Magnitud del vector:</strong> {targetUser.vectorMagnitude}
                </p>
            </div>
        );
    };

    return (
        <div className="vector-visualization">
            <h3>📊 Visualización de Vectores y Producto Punto</h3>
            
            <div className="vector-content">
                {renderVectorsText()}
                {renderSimilarityBars()}
            </div>

            <div className="vector-explanation">
                <h4>🧮 Explicación del Producto Punto</h4>
                <div className="explanation-content">
                    <p>
                        <strong>Producto Punto:</strong> A·B = Σ(Aᵢ × Bᵢ)
                    </p>
                    <p>
                        <strong>Similitud Coseno:</strong> (A·B) / (||A|| × ||B||)
                    </p>
                    <p>
                        <strong>Interpretación:</strong> 
                        Valores cercanos a 1 indican gustos similares, 
                        valores cercanos a 0 indican gustos diferentes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VectorVisualization;