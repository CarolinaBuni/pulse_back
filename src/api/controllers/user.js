const User = require( '../models/user' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const { generateAccessToken, generateRefreshToken } = require( './auth' );
const crypto = require('crypto');

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

          // Crear nuevo usuario
          const newUser = new User( {
               username,
               email,
               password, // Se encriptará por el middleware en User.js
               avatar    // URL del avatar seleccionado
          } );

          await newUser.save();

          // Generar tokens
          const accessToken = generateAccessToken(newUser);
          const refreshToken = await generateRefreshToken(newUser._id);

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
                    accessToken,
                    refreshToken
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

          // Generar tokens
          const accessToken = generateAccessToken(user);
          const refreshToken = await generateRefreshToken(user._id);

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
                    accessToken,
                    refreshToken
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

// Cambiar contraseña
const changePassword = async ( req, res ) => {
     try {
          const { currentPassword, newPassword } = req.body;

          // Verificar que se proporcionaron ambas contraseñas
          if ( !currentPassword || !newPassword ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Se requiere contraseña actual y nueva'
               } );
          }

          // Obtener usuario con contraseña
          const user = await User.findById( req.user.id );

          if ( !user ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Usuario no encontrado'
               } );
          }

          // Verificar contraseña actual
          const isMatch = await bcrypt.compare( currentPassword, user.password );
          if ( !isMatch ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Contraseña actual incorrecta'
               } );
          }

          // Asignar nueva contraseña (se encriptará por el middleware pre save)
          user.password = newPassword;

          // Guardar cambios
          await user.save();

          return res.status( 200 ).json( {
               success: true,
               message: 'Contraseña actualizada correctamente'
          } );
     } catch ( error ) {
          console.error( 'Error al cambiar contraseña:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al cambiar contraseña',
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

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            return res.status(200).json({
                success: true,
                message: 'Si el email existe, se ha enviado un enlace de restablecimiento'
            });
        }
        
        // Generar token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Calcular fecha de expiración (1 hora)
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);
        
        // Guardar token en el usuario
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        // Aquí se enviaría un email con el enlace que contiene el token
        // Por ahora, solo devolvemos el token para fines de prueba
        // En producción, usarías un servicio como Nodemailer, SendGrid, etc.
        
        console.log(`Token de restablecimiento para ${email}: ${resetToken}`);
        
        return res.status(200).json({
            success: true,
            message: 'Si el email existe, se ha enviado un enlace de restablecimiento',
            // En producción, NO enviar el token en la respuesta
            resetToken: resetToken // Solo para pruebas
        });
    } catch (error) {
        console.error('Error al solicitar restablecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
};

// Confirmar restablecimiento y actualizar contraseña
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Buscar usuario con el token válido y no expirado
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
        
        // Actualizar contraseña
        user.password = newPassword; // Se encriptará automáticamente por el middleware pre-save
        
        // Limpiar campos de restablecimiento
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al restablecer contraseña',
            error: error.message
        });
    }
};

module.exports = {
     register,
     login,
     getProfile,
     getAllUsers,
     updateUser,
     changePassword,
     deleteAccount,
     requestPasswordReset,
     resetPassword
};