const express = require('express');
const { addFavorite, removeFavorite, getUserFavorites, checkFavorite } = require('../controllers/favorite');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const favoriteRouter = express.Router();

// Todas las rutas requieren autenticación
favoriteRouter.use(authMiddleware);

// Rutas de favoritos
favoriteRouter.post('/', addFavorite);
favoriteRouter.delete('/:eventId', removeFavorite);
favoriteRouter.get('/', getUserFavorites);
favoriteRouter.get('/check/:eventId', checkFavorite);


module.exports = favoriteRouter;