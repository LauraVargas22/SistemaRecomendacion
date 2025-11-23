import React from 'react';

const VectorSpaceChart = ({ userVectors, selectedUser }) => {
    if (!userVectors || userVectors.length < 2) {
        return (
            <div className="vector-space-chart">
                <p>Se necesitan al menos 2 usuarios para mostrar el espacio vectorial</p>
            </div>
        );
    }

    // Función simple para mostrar datos en tabla en lugar de gráfica
    const renderVectorTable = () => {
        return (
            <div className="vector-table">
                <h4>Vectores de Usuarios</h4>
                <table className="vector-matrix">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            {userVectors[0]?.ratings?.slice(0, 6).map((_, index) => (
                                <th key={index}>Dim {index + 1}</th>
                            ))}
                            <th>Magnitud</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userVectors.map(userVector => (
                            <tr key={userVector.userId} 
                                className={userVector.userId === selectedUser ? 'selected-user' : ''}>
                                <td>
                                    <strong>Usuario {userVector.username}</strong>
                                    {userVector.userId === selectedUser && ' (TÚ)'}
                                </td>
                                {userVector.ratings.slice(0, 6).map((rating, idx) => (
                                    <td key={idx} className="rating-cell">
                                        {rating > 0 ? `${rating}⭐` : '0'}
                                    </td>
                                ))}
                                <td className="magnitude">
                                    {userVector.vectorMagnitude}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="vector-space-chart">
            {renderVectorTable()}
        </div>
    );
};

export default VectorSpaceChart;