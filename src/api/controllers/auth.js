const jwt = require( 'jsonwebtoken' );
const passport = require( 'passport' );
const crypto = require( 'crypto' );
const User = require( '../models/user' );
const RefreshToken = require( '../models/refreshToken' );

// Generar token JWT de acceso
const generateAccessToken = ( user ) => {
     return jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET || 'secreto_temporal',
          { expiresIn: '1h' } // Token de acceso de corta duración (1 hora)
     );
};

// Generar token de refresco
const generateRefreshToken = async ( userId ) => {
     // Crear token aleatorio
     const refreshToken = crypto.randomBytes(40).toString( 'hex' );
     
     // Fecha de expiración (30 días)
     const expiresAt = new Date();
     expiresAt.setDate( expiresAt.getDate() + 30 );
     
     // Guardar en base de datos
     await RefreshToken.create( {
          token: refreshToken,
          user: userId,
          expiresAt
     } );
     
     return refreshToken;
};

// Redirigir a autenticación de Google
const googleAuth = passport.authenticate( 'google', {
     scope: [ 'profile', 'email' ]
} );

// Callback después de autenticación con Google
const googleCallback = ( req, res, next ) => {
     passport.authenticate( 'google', { session: false }, async ( err, user ) => {
          if ( err || !user ) {
               return res.redirect( '/api/auth/error' );
          }

          const accessToken = generateAccessToken( user );
          const refreshToken = await generateRefreshToken( user._id );

          // Redirigir al frontend con los tokens
          return res.redirect( `/api/auth/success?accessToken=${ accessToken }&refreshToken=${ refreshToken }` );
     } )( req, res, next );
};

// Página de éxito (solo para demostración)
const authSuccess = ( req, res ) => {
     const { accessToken, refreshToken } = req.query;

     // En un caso real, el frontend manejaría esta página y almacenaría los tokens
     res.send( `
          <h1>Autenticación Exitosa</h1>
          <p>Access Token: ${ accessToken }</p>
          <p>Refresh Token: ${ refreshToken }</p>
          <script>
               // Almacenar tokens en localStorage (simulando frontend)
               localStorage.setItem( 'accessToken', '${ accessToken }' );
               localStorage.setItem( 'refreshToken', '${ refreshToken }' );
               console.log( 'Tokens almacenados' );
          </script>
     ` );
};

// Página de error (solo para demostración)
const authError = ( req, res ) => {
     res.status( 401 ).send( `
          <h1>Error de Autenticación</h1>
          <p>No se pudo autenticar con el proveedor.</p>
     ` );
};

// Refrescar token de acceso
const refreshAccessToken = async ( req, res ) => {
     try {
          const { refreshToken } = req.body;
          
          if ( !refreshToken ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Refresh token no proporcionado'
               } );
          }
          
          // Buscar el refresh token en la base de datos
          const storedToken = await RefreshToken.findOne( { 
               token: refreshToken,
               isRevoked: false,
               expiresAt: { $gt: new Date() }
          } );
          
          if ( !storedToken ) {
               return res.status( 401 ).json( {
                    success: false,
                    message: 'Refresh token inválido o expirado'
               } );
          }
          
          // Encontrar el usuario
          const user = await User.findById( storedToken.user );
          
          if ( !user ) {
               return res.status( 401 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }
          
          // Generar nuevo token de acceso
          const accessToken = generateAccessToken( user );
          
          return res.status( 200 ).json( {
               success: true,
               data: {
                    accessToken
               }
          } );
     } catch ( error ) {
          console.error( 'Error al refrescar token:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al refrescar token',
               error: error.message
          } );
     }
};

// Revocar refresh token (logout)
const logout = async ( req, res ) => {
     try {
          const { refreshToken } = req.body;
          
          if ( !refreshToken ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Refresh token no proporcionado'
               } );
          }
          
          // Marcar el token como revocado
          const result = await RefreshToken.findOneAndUpdate(
               { token: refreshToken },
               { isRevoked: true },
               { new: true }
          );
          
          if ( !result ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Token no encontrado'
               } );
          }
          
          return res.status( 200 ).json( {
               success: true,
               message: 'Sesión cerrada correctamente'
          } );
     } catch ( error ) {
          console.error( 'Error al cerrar sesión:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al cerrar sesión',
               error: error.message
          } );
     }
};

module.exports = {
     googleAuth,
     googleCallback,
     authSuccess,
     authError,
     refreshAccessToken,
     logout,
     generateAccessToken,
     generateRefreshToken
};