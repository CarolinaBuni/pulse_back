const Event = require('../models/event');
const User = require('../models/user');
const Favorite = require('../models/favorite');
const Review = require('../models/review');

/**
 * Obtiene recomendaciones de eventos para el usuario autenticado
 * basado en sus preferencias, eventos que ha marcado como favoritos
 * y eventos que ha valorado positivamente
 */
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtener el usuario con sus preferencias
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Obtener los favoritos del usuario
        const userFavorites = await Favorite.find({ user: userId }).select('event');
        const favoriteEventIds = userFavorites.map(fav => fav.event);
        
        // Obtener las reseñas positivas del usuario (4-5 estrellas)
        const positiveReviews = await Review.find({ 
            user: userId,
            rating: { $gte: 4 }
        }).select('event');
        const likedEventIds = positiveReviews.map(review => review.event);
        
        // Combinar categorías y géneros preferidos por el usuario
        const userPreferences = user.preferences || [];
        
        // Construir la consulta de recomendación
        let recommendationQuery = {
            // Excluir eventos que el usuario ya tiene como favoritos
            _id: { $nin: favoriteEventIds },
            // Solo incluir eventos futuros
            startDate: { $gte: new Date() }
        };
        
        // Si el usuario tiene preferencias, usarlas para filtrar
        if (userPreferences.length > 0) {
            recommendationQuery.$or = [
                { category: { $in: userPreferences } },
                { genre: { $in: userPreferences } }
            ];
        }
        
        // Obtener eventos similares a los favoritos o bien valorados
        let similarEvents = [];
        if (favoriteEventIds.length > 0 || likedEventIds.length > 0) {
            // Obtener eventos que han gustado al usuario para analizar categorías/géneros
            const allLikedEvents = await Event.find({
                _id: { $in: [...favoriteEventIds, ...likedEventIds] }
            }).select('category genre');
            
            // Extraer categorías y géneros de interés
            const likedCategories = [...new Set(allLikedEvents.map(e => e.category).filter(Boolean))];
            const likedGenres = [...new Set(allLikedEvents.map(e => e.genre).filter(Boolean))];
            
            if (likedCategories.length > 0 || likedGenres.length > 0) {
                const similarQuery = {
                    _id: { $nin: favoriteEventIds },
                    startDate: { $gte: new Date() },
                    $or: []
                };
                
                if (likedCategories.length > 0) {
                    similarQuery.$or.push({ category: { $in: likedCategories } });
                }
                
                if (likedGenres.length > 0) {
                    similarQuery.$or.push({ genre: { $in: likedGenres } });
                }
                
                if (similarQuery.$or.length > 0) {
                    similarEvents = await Event.find(similarQuery)
                        .sort({ startDate: 1 })
                        .limit(5);
                }
            }
        }
        
        // Obtener eventos populares (con mejor valoración media)
        const popularEvents = await Event.aggregate([
            {
                $match: {
                    _id: { $nin: favoriteEventIds },
                    startDate: { $gte: new Date() }
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'event',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    averageRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            },
            {
                $match: {
                    reviewCount: { $gt: 0 }
                }
            },
            {
                $sort: { averageRating: -1, reviewCount: -1 }
            },
            {
                $limit: 5
            }
        ]);
        
        // Obtener recomendaciones basadas en preferencias directas
        const preferenceBasedEvents = await Event.find(recommendationQuery)
            .sort({ startDate: 1 })
            .limit(5);
        
        // Combinar las recomendaciones en un solo resultado
        // Evitando duplicados y priorizando eventos
        const allRecommendations = {
            basedOnPreferences: preferenceBasedEvents,
            basedOnHistory: similarEvents,
            popular: popularEvents
        };
        
        return res.status(200).json({
            success: true,
            data: allRecommendations
        });
        
    } catch (error) {
        console.error('Error al obtener recomendaciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener recomendaciones',
            error: error.message
        });
    }
};

/**
 * Obtiene eventos similares a uno específico
 */
const getSimilarEvents = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Obtener el evento base
        const baseEvent = await Event.findById(eventId);
        if (!baseEvent) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Construir consulta para eventos similares
        const query = {
            _id: { $ne: eventId }, // Excluir el evento actual
            startDate: { $gte: new Date() }, // Solo eventos futuros
            $or: []
        };
        
        if (baseEvent.category) {
            query.$or.push({ category: baseEvent.category });
        }
        
        if (baseEvent.genre) {
            query.$or.push({ genre: baseEvent.genre });
        }
        
        // Si hay artistas, buscar eventos con los mismos artistas
        if (baseEvent.artists && baseEvent.artists.length > 0) {
            query.$or.push({ artists: { $in: baseEvent.artists } });
        }
        
        // Si el evento tiene ubicación, dar preferencia a eventos cercanos
        let similarEvents = [];
        if (query.$or.length > 0) {
            similarEvents = await Event.find(query)
                .sort({ startDate: 1 })
                .limit(5);
        } else {
            // Si no hay categoría ni género, mostrar eventos populares
            similarEvents = await Event.find({ 
                _id: { $ne: eventId },
                startDate: { $gte: new Date() }
            })
            .sort({ startDate: 1 })
            .limit(5);
        }
        
        return res.status(200).json({
            success: true,
            data: similarEvents
        });
        
    } catch (error) {
        console.error('Error al obtener eventos similares:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener eventos similares',
            error: error.message
        });
    }
};

/**
 * Actualiza las preferencias del usuario para mejorar las recomendaciones
 */
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;
        
        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                success: false,
                message: 'Las preferencias deben ser un array'
            });
        }
        
        // Actualizar el usuario con las nuevas preferencias
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { preferences },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Preferencias actualizadas correctamente',
            data: {
                preferences: updatedUser.preferences
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar preferencias:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar preferencias',
            error: error.message
        });
    }
};

module.exports = {
    getRecommendations,
    getSimilarEvents,
    updatePreferences
}; 