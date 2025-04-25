const express = require( "express" );
const {
     register,
     login,
     getProfile,
     getAllUsers,
     changePassword,
     deleteAccount,
     updateUser,
     requestPasswordReset,
     resetPassword
} = require( "../controllers/user" );
const { authMiddleware } = require( "../../middlewares/authMiddleware" );

const userRouter = express.Router();

// Rutas públicas
userRouter.post( "/register", register );
userRouter.post( "/login", login );
userRouter.post( "/request-password-reset", requestPasswordReset );
userRouter.post( "/reset-password", resetPassword );

// Rutas protegidas
userRouter.get( "/profile", authMiddleware, getProfile );
userRouter.put( '/update', authMiddleware, updateUser );
userRouter.put( '/change-password', authMiddleware, changePassword );
userRouter.delete( '/delete', authMiddleware, deleteAccount );

// Rutas de administrador
userRouter.get( "/", getAllUsers );

module.exports = userRouter;
