const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );
const { getRandomAvatar } = require( '../../utils/avatars' );

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
          default: getRandomAvatar
     },
     role: {
          type: String,
          enum: [ 'user', 'admin' ],
          default: 'user'
     },
     preferences: {
          type: [ String ],
          default: []
     }
}, { timestamps: true } );

userSchema.pre( 'save', async function ( next ) {
     if ( this.password && this.isModified( 'password' ) ) {
          this.password = await bcrypt.hash( this.password, 10 );
     }
     next();
} );

module.exports = mongoose.model( 'User', userSchema );



