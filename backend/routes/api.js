const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Rutas de recomendaciones
router.get('/recommendations/:userId', recommendationController.getRecommendations);
router.get('/similarity/:userId', recommendationController.getUserSimilarity);

module.exports = router;