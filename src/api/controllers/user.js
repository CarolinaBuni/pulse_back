const User = require( '../models/user' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );

// Generar token JWT simple
const generateAccessToken = ( user ) => {
     return jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET || 'secreto_temporal',
          { expiresIn: '24h' } 
     );
};

// Registro de usuario
const register = async ( req, res ) => {
     try {
          const { username, email, password, avatar } = req.body;

          // Verificar si el usuario ya existe
          const existingUser = await User.findOne( {
               $or: [ { email }, { username } ]
          } );

          if ( existingUser ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'El usuario o email ya está registrado'
               } );
          }

          // Crear nuevo usuario (pide avatar pero que pasa si no sube ninguno)
          const newUser = new User( {
               username,
               email,
               password, 
               avatar    
          } );

          await newUser.save();

          // Generar token
          const accessToken = generateAccessToken( newUser );

          return res.status( 201 ).json( {
               success: true,
               data: {
                    user: {
                         id: newUser._id,
                         username: newUser.username,
                         email: newUser.email,
                         avatar: newUser.avatar,
                         role: newUser.role
                    },
                    accessToken
               }
          } );
     } catch ( error ) {
          console.error( 'Error en registro:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al registrar usuario',
               error: error.message
          } );
     }
};

// Login de usuario
const login = async ( req, res ) => {
     try {
          const { email, password } = req.body;

          // Buscar usuario por email
          const user = await User.findOne( { email } );

          if ( !user ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }

          // Verificar contraseña
          const isMatch = await bcrypt.compare( password, user.password );

          if ( !isMatch ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Credenciales inválidas'
               } );
          }

          // Generar token
          const accessToken = generateAccessToken( user );

          return res.status( 200 ).json( {
               success: true,
               data: {
                    user: {
                         id: user._id,
                         username: user.username,
                         email: user.email,
                         avatar: user.avatar,
                         role: user.role
                    },
                    accessToken
               }
          } );
     } catch ( error ) {
          console.error( 'Error en login:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al iniciar sesión',
               error: error.message
          } );
     }
};

// Obtener perfil de usuario (requiere autenticación)
const getProfile = async ( req, res ) => {
     try {
          // El middleware de autenticación habrá añadido req.user
          const user = await User.findById( req.user.id ).select( '-password' );

          if ( !user ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }

          console.log( 'Enviando perfil de usuario con avatar:', user.avatar );

          return res.status( 200 ).json( {
               success: true,
               data: user
          } );
     } catch ( error ) {
          console.error( 'Error al obtener perfil:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener perfil de usuario',
               error: error.message
          } );
     }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async ( req, res ) => {
     try {
          // Verificar si es admin
          // if ( req.user.role !== 'admin' ) {
          //      return res.status( 403 ).json( {
          //           success: false,
          //           message: 'Acceso denegado: requiere rol de administrador'
          //      } );
          // }

          const users = await User.find().select( '-password' );

          return res.status( 200 ).json( {
               success: true,
               count: users.length,
               data: users
          } );
     } catch ( error ) {
          console.error( 'Error al obtener usuarios:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener la lista de usuarios',
               error: error.message
          } );
     }
};

// Actualizar perfil de usuario
const updateUser = async ( req, res ) => {
     try {
          const { username, email, avatar, preferences } = req.body;

          // Comprobar si el nuevo email o username ya existen
          if ( email || username ) {
               const existingUser = await User.findOne( {
                    $and: [
                         { _id: { $ne: req.user.id } }, // Excluir al usuario actual
                         {
                              $or: [
                                   { email: email || null },
                                   { username: username || null }
                              ]
                         }
                    ]
               } );

               if ( existingUser ) {
                    return res.status( 400 ).json( {
                         success: false,
                         message: 'El nombre de usuario o email ya está en uso'
                    } );
               }
          }

          // Campos a actualizar
          const updateFields = {};
          if ( username ) updateFields.username = username;
          if ( email ) updateFields.email = email;
          if ( avatar ) updateFields.avatar = avatar;
          if ( preferences ) updateFields.preferences = preferences;

          // Actualizar usuario
          const updatedUser = await User.findByIdAndUpdate(
               req.user.id,
               { $set: updateFields },
               { new: true, runValidators: true }
          ).select( '-password' );

          if ( !updatedUser ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }

          return res.status( 200 ).json( {
               success: true,
               message: 'Perfil actualizado correctamente',
               data: updatedUser
          } );
     } catch ( error ) {
          console.error( 'Error al actualizar usuario:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al actualizar perfil',
               error: error.message
          } );
     }
};

// Eliminar cuenta de usuario
const deleteAccount = async ( req, res ) => {
     try {
          const deletedUser = await User.findByIdAndDelete( req.user.id );

          if ( !deletedUser ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }

          return res.status( 200 ).json( {
               success: true,
               message: 'Cuenta eliminada correctamente'
          } );
     } catch ( error ) {
          console.error( 'Error al eliminar cuenta:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al eliminar cuenta',
               error: error.message
          } );
     }
};



module.exports = {
     register,
     login,
     getProfile,
     getAllUsers,
     updateUser,
     deleteAccount
};