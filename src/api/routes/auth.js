const express = require( 'express' );
const {
     googleAuth,
     googleCallback,
     authSuccess,
     authError,
     refreshAccessToken,
     logout
} = require( '../controllers/auth' );
const { authMiddleware } = require( '../../middlewares/authMiddleware' );

const router = express.Router();

// Rutas para autenticación con Google
router.get( '/google', googleAuth );
router.get( '/google/callback', googleCallback );

// Ruta para refrescar token
router.post( '/refresh-token', refreshAccessToken );

// Ruta para cerrar sesión (requiere autenticación)
router.post( '/logout', authMiddleware, logout );

// Rutas para simulación de frontend (solo para demostración)
router.get( '/success', authSuccess );
router.get( '/error', authError );

module.exports = router;