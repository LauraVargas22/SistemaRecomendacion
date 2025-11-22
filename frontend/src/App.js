import React, { useState, useEffect } from 'react';
import UserSelector from './components/UserSelector';
import RecommendationList from './components/RecommendationList';
import SimilarityMatrix from './components/SimilarityMatrix';
import { recommendationAPI } from './services/api';
import './App.css';

function App() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [similarities, setSimilarities] = useState([]);
    const [loading, setLoading] = useState(false);

    // Datos de ejemplo de usuarios
    const exampleUsers = [
        { id: 1, username: 'usuario1' },
        { id: 2, username: 'usuario2' },
        { id: 3, username: 'usuario3' }
    ];

    useEffect(() => {
        setUsers(exampleUsers);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadRecommendations();
            loadSimilarities();
        }
    }, [selectedUser]);

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const response = await recommendationAPI.getRecommendations(selectedUser);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Error cargando recomendaciones:', error);
            alert('Error al cargar recomendaciones');
        } finally {
            setLoading(false);
        }
    };

    const loadSimilarities = async () => {
        try {
            const response = await recommendationAPI.getUserSimilarity(selectedUser);
            setSimilarities(response.data.similarities);
        } catch (error) {
            console.error('Error cargando similitudes:', error);
        }
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>🎬 Sistema de Recomendación</h1>
                <p>Basado en Producto Punto y Álgebra Lineal</p>
            </header>

            <main className="app-main">
                <div className="container">
                    <UserSelector 
                        users={users}
                        selectedUser={selectedUser}
                        onUserChange={setSelectedUser}
                    />

                    {selectedUser && (
                        <div className="results-container">
                            <div className="recommendations-section">
                                <RecommendationList 
                                    recommendations={recommendations}
                                    isLoading={loading}
                                />
                            </div>

                            <div className="similarity-section">
                                <SimilarityMatrix 
                                    similarities={similarities}
                                    isLoading={loading}
                                />
                            </div>
                        </div>
                    )}

                    {!selectedUser && (
                        <div className="welcome-message">
                            <h2>Bienvenido al Sistema de Recomendación</h2>
                            <p>Selecciona un usuario para ver sus recomendaciones personalizadas</p>
                            <div className="algorithm-info">
                                <h3>📊 Algoritmo Utilizado</h3>
                                <ul>
                                    <li><strong>Producto Punto:</strong> Para calcular similitud entre vectores de usuarios</li>
                                    <li><strong>Similitud Coseno:</strong> Para normalizar y comparar patrones de calificación</li>
                                    <li><strong>Filtrado Colaborativo:</strong> Basado en usuarios con gustos similares</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;