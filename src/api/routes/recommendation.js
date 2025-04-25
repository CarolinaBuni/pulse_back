const express = require('express');
const { 
    getRecommendations, 
    getSimilarEvents, 
    updatePreferences 
} = require('../controllers/recommendation');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const recommendationRouter = express.Router();

// Todas las rutas requieren autenticación
recommendationRouter.use(authMiddleware);

// Obtener recomendaciones personalizadas para el usuario actual
recommendationRouter.get('/', getRecommendations);

// Obtener eventos similares a un evento específico
recommendationRouter.get('/similar/:eventId', getSimilarEvents);

// Actualizar preferencias de usuario para mejorar recomendaciones
recommendationRouter.put('/preferences', updatePreferences);

module.exports = recommendationRouter; 