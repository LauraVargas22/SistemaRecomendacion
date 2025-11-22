const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', require('./routes/api'));

// Ruta de salud mejorada
app.get('/health', async (req, res) => {
    try {
        const pool = require('./config/database');
        // Probar conexión a la base de datos
        await pool.query('SELECT 1');
        res.json({ 
            status: 'OK', 
            message: 'Backend y Base de Datos conectados correctamente',
            database: 'PostgreSQL - recommendation_db',
            algorithm: 'Producto Punto + Similitud Coseno',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Backend funcionando pero error en base de datos',
            error: error.message 
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 API de Sistema de Recomendación con Base de Datos',
        endpoints: {
            health: '/health',
            recommendations: '/api/recommendations/{userId}',
            similarity: '/api/similarity/{userId}',
            database_info: '/api/database-info'
        }
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 Servidor de Recomendaciones CON BASE DE DATOS');
    console.log('=================================');
    console.log(`✅ Backend corriendo en: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎬 Recomendaciones: http://localhost:${PORT}/api/recommendations/1`);
    console.log(`📊 Similitudes: http://localhost:${PORT}/api/similarity/1`);
    console.log(`🗃️  Base de datos: http://localhost:${PORT}/api/database-info`);
    console.log('=================================');
});