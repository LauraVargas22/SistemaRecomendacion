import React from 'react';

const SimilarityMatrix = ({ similarities, isLoading }) => {
    if (isLoading) {
        return <div className="loading">Calculando similitudes...</div>;
    }

    if (!similarities || similarities.length === 0) {
        return <div>No hay datos de similitud disponibles</div>;
    }

    return (
        <div className="similarity-matrix">
            <h3>Matriz de Similitud entre Usuarios</h3>
            <div className="similarity-list">
                {similarities.map(user => (
                    <div key={user.user_id} className="similarity-item">
                        <div className="user-info">
                            <strong>{user.username}</strong> (ID: {user.user_id})
                        </div>
                        <div className="similarity-details">
                            <span className="similarity-value">
                                Similitud: {user.similarity.toFixed(4)}
                            </span>
                            <span className="similarity-percentage">
                                {user.similarity_percentage}
                            </span>
                        </div>
                        <div className="similarity-visual">
                            <div 
                                className="similarity-bar"
                                style={{ width: `${user.similarity * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarityMatrix;