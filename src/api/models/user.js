const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );

const userSchema = new mongoose.Schema( {
     username: {
          type: String,
          required: true,
          unique: true
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     password: {
          type: String,
          required: true
     },
     avatar: {
          type: String,
          default: 'https://via.placeholder.com/150'
     },
     role: {
          type: String,
          enum: [ 'user', 'admin' ],
          default: 'user'
     },
     preferences: {
          type: [ String ],
          default: []
     },
     // Campos para autenticación OAuth
     googleId: {
          type: String,
          sparse: true // Permite que sea único pero opcional
     },
     // Campos para recuperación de contraseña
     resetPasswordToken: String,
     resetPasswordExpires: Date
}, { timestamps: true } );

userSchema.pre( 'save', async function ( next ) {
     // Solo encriptar si la contraseña ha sido modificada y existe
     if ( this.password && this.isModified( 'password' ) ) {
          this.password = await bcrypt.hash( this.password, 10 );
     }
     next();
} );

module.exports = mongoose.model( 'User', userSchema );



