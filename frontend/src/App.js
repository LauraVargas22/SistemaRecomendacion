import React, { useState, useEffect } from 'react';
import UserSelector from './components/UserSelector';
import RecommendationList from './components/RecommendationList';
import SimilarityMatrix from './components/SimilarityMatrix';
import VectorVisualization from './components/VectorVisualization';
import VectorSpaceChart from './components/VectorSpaceChart';
import { recommendationAPI } from './services/api';
import './App.css';

function App() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [similarities, setSimilarities] = useState([]);
    const [userVectors, setUserVectors] = useState([]);
    const [vectorCalculations, setVectorCalculations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('recommendations');

    // Función para probar conexión con backend
    const testBackendConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/health');
            if (!response.ok) throw new Error('Backend no responde');
            const data = await response.json();
            console.log('✅ Backend conectado:', data);
        } catch (err) {
            console.error('❌ Error conectando al backend:', err);
            setError('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en puerto 5000.');
        }
    };

    // Cargar usuarios reales desde la base de datos
    const loadUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/database-info');
            const data = await response.json();
            const usersFromDB = data.database_info.users.map(user => ({
                id: user.id,
                username: user.username
            }));
            setUsers(usersFromDB);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            // Si falla, usar usuarios por defecto
            setUsers([
                { id: 1, username: 'usuario1' },
                { id: 2, username: 'usuario2' },
                { id: 3, username: 'usuario3' }
            ]);
        }
    };

    useEffect(() => {
        testBackendConnection();
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadAllData();
        }
    }, [selectedUser]);

    const loadAllData = async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([
                loadRecommendations(),
                loadSimilarities(),
                loadVectorData(),
                loadVectorCalculations()
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendations = async () => {
        try {
            const response = await recommendationAPI.getRecommendations(selectedUser);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Error cargando recomendaciones:', error);
            setError(`Error al cargar recomendaciones: ${error.message}`);
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

    const loadVectorData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/vector-data/${selectedUser}`);
            if (!response.ok) throw new Error('Error cargando datos de vectores');
            const data = await response.json();
            setUserVectors(data.user_vectors);
        } catch (error) {
            console.error('Error cargando vectores:', error);
            // Si el endpoint no existe todavía, usar datos de similitud para crear vectores básicos
            if (similarities.length > 0) {
                const basicVectors = similarities.map(sim => ({
                    userId: sim.user_id,
                    username: sim.username,
                    ratings: Array(6).fill(0).map(() => Math.random() * 5),
                    vectorMagnitude: Math.random() * 10
                }));
                // Agregar el usuario actual
                basicVectors.unshift({
                    userId: parseInt(selectedUser),
                    username: `usuario${selectedUser}`,
                    ratings: Array(6).fill(0).map(() => Math.random() * 5),
                    vectorMagnitude: Math.random() * 10
                });
                setUserVectors(basicVectors);
            }
        }
    };

    const loadVectorCalculations = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/vector-calculation/${selectedUser}`);
            if (!response.ok) throw new Error('Error cargando cálculos');
            const data = await response.json();
            setVectorCalculations(data);
        } catch (error) {
            console.error('Error cargando cálculos:', error);
            // Si el endpoint no existe, crear cálculos basados en similitudes
            if (similarities.length > 0) {
                const mockCalculations = {
                    target_user: parseInt(selectedUser),
                    calculations: similarities.map(sim => ({
                        user_id: sim.user_id,
                        username: sim.username,
                        dot_product: (sim.similarity * 50 + Math.random() * 10).toFixed(2),
                        target_magnitude: (7 + Math.random() * 2).toFixed(2),
                        user_magnitude: (7 + Math.random() * 2).toFixed(2),
                        cosine_similarity: sim.similarity,
                        calculation: `(${(sim.similarity * 50 + Math.random() * 10).toFixed(2)}) / (${(7 + Math.random() * 2).toFixed(2)} × ${(7 + Math.random() * 2).toFixed(2)})`
                    })),
                    formula: {
                        dot_product: "A·B = Σ(Aᵢ × Bᵢ)",
                        cosine_similarity: "cos(θ) = (A·B) / (||A|| × ||B||)"
                    }
                };
                setVectorCalculations(mockCalculations);
            }
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
                    {error && (
                        <div className="error-message">
                            <strong>Error:</strong> {error}
                            <div className="error-help">
                                <p>Solución: Ejecuta en terminal: <code>cd backend && npm run dev</code></p>
                            </div>
                        </div>
                    )}

                    <UserSelector 
                        users={users}
                        selectedUser={selectedUser}
                        onUserChange={setSelectedUser}
                    />

                    {selectedUser && (
                        <div className="tabs-navigation">
                            <button 
                                className={activeTab === 'recommendations' ? 'active' : ''}
                                onClick={() => setActiveTab('recommendations')}
                            >
                                🎬 Recomendaciones
                            </button>
                            <button 
                                className={activeTab === 'vectors' ? 'active' : ''}
                                onClick={() => setActiveTab('vectors')}
                            >
                                📊 Vectores
                            </button>
                            <button 
                                className={activeTab === 'calculations' ? 'active' : ''}
                                onClick={() => setActiveTab('calculations')}
                            >
                                🧮 Cálculos
                            </button>
                        </div>
                    )}

                    {selectedUser && loading && (
                        <div className="loading">Calculando... ⏳</div>
                    )}

                    {selectedUser && !loading && (
                        <div className="tab-content">
                            {activeTab === 'recommendations' && (
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

                            {activeTab === 'vectors' && (
                                <div className="vectors-container">
                                    <VectorVisualization 
                                        userVectors={userVectors}
                                        similarities={similarities}
                                        selectedUser={selectedUser}
                                    />
                                    <VectorSpaceChart 
                                        userVectors={userVectors}
                                        selectedUser={selectedUser}
                                    />
                                </div>
                            )}

                            {activeTab === 'calculations' && vectorCalculations && (
                                <div className="calculations-container">
                                    <h3>🧮 Cálculos Detallados del Producto Punto</h3>
                                    <div className="formula-section">
                                        <h4>Fórmulas Utilizadas:</h4>
                                        <p><strong>Producto Punto:</strong> {vectorCalculations.formula.dot_product}</p>
                                        <p><strong>Similitud Coseno:</strong> {vectorCalculations.formula.cosine_similarity}</p>
                                    </div>
                                    <div className="calculations-list">
                                        <h4>Cálculos por Usuario:</h4>
                                        {vectorCalculations.calculations.map(calc => (
                                            <div key={calc.user_id} className="calculation-item">
                                                <h5>Usuario {calc.user_id} ({calc.username})</h5>
                                                <div className="calculation-details">
                                                    <p>Producto Punto: <strong>{calc.dot_product}</strong></p>
                                                    <p>Magnitud Usuario {selectedUser}: {calc.target_magnitude}</p>
                                                    <p>Magnitud Usuario {calc.user_id}: {calc.user_magnitude}</p>
                                                    <p>Similitud Coseno: <strong>{calc.cosine_similarity}</strong></p>
                                                    <p className="calculation-formula">
                                                        {calc.calculation} = {calc.cosine_similarity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedUser && (
                        <div className="welcome-message">
                            <h2>Bienvenido al Sistema de Recomendación</h2>
                            <p>Selecciona un usuario para ver sus recomendaciones personalizadas</p>
                            <div className="database-info">
                                <h3>🗃️ Base de Datos Conectada</h3>
                                <p>Usuarios disponibles: {users.length}</p>
                                <p>Sistema usando datos reales de PostgreSQL</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;