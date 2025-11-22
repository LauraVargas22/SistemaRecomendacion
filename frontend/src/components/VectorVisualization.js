import React from 'react';
import { Bar, Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    LineElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    LineElement
);

const VectorVisualization = ({ userVectors, similarities, selectedUser }) => {
    if (!userVectors || userVectors.length === 0) {
        return <div>No hay datos de vectores para visualizar</div>;
    }

    // Datos para gráfica de barras de vectores
    const vectorChartData = {
        labels: userVectors[0]?.movies || [],
        datasets: userVectors.map((userVector, index) => ({
            label: `Usuario ${userVector.userId}`,
            data: userVector.ratings,
            backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
            borderColor: `hsl(${index * 60}, 70%, 30%)`,
            borderWidth: 1,
        }))
    };

    const vectorChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Vectores de Calificaciones por Usuario'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}⭐`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                title: {
                    display: true,
                    text: 'Calificación'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Películas'
                }
            }
        }
    };

    // Datos para gráfica de similitudes
    const similarityChartData = {
        labels: similarities.map(sim => `Usuario ${sim.user_id}`),
        datasets: [
            {
                label: 'Similitud del Coseno',
                data: similarities.map(sim => sim.similarity),
                backgroundColor: similarities.map(sim => 
                    `hsl(${sim.similarity * 120}, 70%, 50%)`
                ),
                borderColor: similarities.map(sim => 
                    `hsl(${sim.similarity * 120}, 70%, 30%)`
                ),
                borderWidth: 1,
            }
        ]
    };

    const similarityChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Similitud entre Usuarios (Producto Punto Normalizado)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                title: {
                    display: true,
                    text: 'Similitud del Coseno'
                }
            }
        }
    };

    return (
        <div className="vector-visualization">
            <h3>📊 Visualización de Vectores y Producto Punto</h3>
            
            <div className="charts-grid">
                <div className="chart-container">
                    <h4>Vectores de Calificaciones</h4>
                    <Bar data={vectorChartData} options={vectorChartOptions} />
                </div>
                
                <div className="chart-container">
                    <h4>Similitud entre Usuarios</h4>
                    <Bar data={similarityChartData} options={similarityChartOptions} />
                </div>
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