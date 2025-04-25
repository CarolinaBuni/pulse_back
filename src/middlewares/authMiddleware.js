const jwt = require( 'jsonwebtoken' );
const User = require('../api/models/user')

const authMiddleware = async ( req, res, next ) => {
     try {
          // Verificar si hay token
          const token = req.header( 'Authorization' )?.replace( 'Bearer ', '' );

          if ( !token ) {
               return res.status( 401 ).json( {
                    success: false,
                    message: 'Acceso denegado: token no proporcionado'
               } );
          }

          // Verificar token
          const decoded = jwt.verify( token, process.env.JWT_SECRET || 'secreto_temporal' );

          // Buscar usuario
          const user = await User.findById( decoded.id );

          if ( !user ) {
               return res.status( 401 ).json( {
                    success: false,
                    message: 'Token inválido: usuario no encontrado'
               } );
          }

          // Adjuntar usuario a la petición
          req.user = {
               id: user._id,
               role: user.role
          };

          next();
     } catch ( error ) {
          console.error( 'Error de autenticación:', error );
          return res.status( 401 ).json( {
               success: false,
               message: 'Token inválido o expirado',
               error: error.message
          } );
     }
};

module.exports = { authMiddleware };

