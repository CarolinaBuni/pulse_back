const express = require( 'express' );
const {
     createReview,
     getEventReviews,
     getUserReviews,
     updateReview,
     deleteReview
} = require( '../controllers/review' );
const { authMiddleware } = require( '../../middlewares/authMiddleware' );

const router = express.Router();

// Rutas públicas
router.get( '/event/:eventId', getEventReviews );

// Rutas protegidas
router.post( '/', authMiddleware, createReview );
router.get( '/user', authMiddleware, getUserReviews );
router.put( '/:id', authMiddleware, updateReview );
router.delete( '/:id', authMiddleware, deleteReview );

module.exports = router;