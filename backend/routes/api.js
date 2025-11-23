const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Rutas de recomendaciones
router.get('/recommendations/:userId', recommendationController.getRecommendations);
router.get('/similarity/:userId', recommendationController.getUserSimilarity);
router.get('/database-info', recommendationController.getDatabaseInfo);
router.get('/vector-data/:userId', recommendationController.getVectorData);
router.get('/vector-calculation/:userId', recommendationController.getVectorCalculation);

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ 
        message: 'API routes working with database!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;