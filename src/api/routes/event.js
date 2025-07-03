const express = require( 'express' );
const {
     getAllEvents,
     getEventById,
     createEvent,
     updateEvent,
     deleteEvent,
     getEventsByCity,
     searchEvents,
     getPastEvents
} = require( '../controllers/event' );
const { authMiddleware } = require( '../../middlewares/authMiddleware' );

const router = express.Router();

// Rutas públicas
router.get( '/', getAllEvents );
router.get( '/city/:city', getEventsByCity );
router.get( '/search', searchEvents );
router.get('/past', getPastEvents);
router.get( '/:id', getEventById );

// Rutas protegidas (requieren autenticación)
router.post( '/', authMiddleware, createEvent );
router.put( '/:id', authMiddleware, updateEvent );
router.delete( '/:id', authMiddleware, deleteEvent );

module.exports = router;