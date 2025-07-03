const express = require( "express" );
const {
     register,
     login,
     getProfile,
     getAllUsers,
     deleteAccount,
     updateUser
} = require( "../controllers/user" );
const { authMiddleware } = require( "../../middlewares/authMiddleware" );

const userRouter = express.Router();

// Rutas públicas
userRouter.post( "/register", register );
userRouter.post( "/login", login );

// Rutas protegidas
userRouter.get( "/profile", authMiddleware, getProfile );
userRouter.put( '/update', authMiddleware, updateUser );
userRouter.delete( '/delete', authMiddleware, deleteAccount );

// Rutas de administrador
userRouter.get( "/", getAllUsers );

module.exports = userRouter;
