import React from 'react';
import { Scatter } from 'react-chartjs-2';

const VectorSpaceChart = ({ userVectors, selectedUser }) => {
    if (!userVectors || userVectors.length < 2) return null;

    // Reducir dimensionalidad (proyección 2D simplificada)
    const projectTo2D = (ratings) => {
        // Proyección simple: promedio de primeras vs últimas calificaciones
        const half = Math.floor(ratings.length / 2);
        const x = ratings.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const y = ratings.slice(half).reduce((a, b) => a + b, 0) / ratings.slice(half).length;
        return { x, y };
    };

    const scatterData = {
        datasets: [
            {
                label: 'Usuarios en Espacio Vectorial',
                data: userVectors.map(userVector => {
                    const point = projectTo2D(userVector.ratings);
                    return {
                        x: point.x,
                        y: point.y,
                        userId: userVector.userId
                    };
                }),
                backgroundColor: userVectors.map(userVector => 
                    userVector.userId === selectedUser ? '#ff4444' : '#4488ff'
                ),
                pointRadius: userVectors.map(userVector => 
                    userVector.userId === selectedUser ? 8 : 6
                ),
            }
        ]
    };

    const scatterOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Espacio Vectorial de Usuarios (Proyección 2D)'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const point = context.raw;
                        return `Usuario ${point.userId}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Dimensión 1 (Promedio primeras películas)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Dimensión 2 (Promedio últimas películas)'
                }
            }
        }
    };

    return (
        <div className="vector-space-chart">
            <Scatter data={scatterData} options={scatterOptions} />
        </div>
    );
};

export default VectorSpaceChart;