const express = require( 'express' );
const {
     getAllEvents,
     getEventById,
     createEvent,
     updateEvent,
     deleteEvent,
     getFeaturedEvents,
     getEventsByCity,
     searchEvents,
     getNearbyEvents
} = require( '../controllers/event' );
const { authMiddleware } = require( '../../middlewares/authMiddleware' );

const router = express.Router();

// Rutas públicas
router.get( '/', getAllEvents );
router.get( '/featured', getFeaturedEvents );
router.get( '/city/:city', getEventsByCity );
router.get( '/search', searchEvents );
router.get('/nearby', getNearbyEvents);
router.get( '/:id', getEventById );

// Rutas protegidas (requieren autenticación)
router.post( '/', authMiddleware, createEvent );
router.put( '/:id', authMiddleware, updateEvent );
router.delete( '/:id', authMiddleware, deleteEvent );

module.exports = router;