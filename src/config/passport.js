
const passport = require( 'passport' );
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const JwtStrategy = require( 'passport-jwt' ).Strategy;
const ExtractJwt = require( 'passport-jwt' ).ExtractJwt;
const User = require( '../api/models/user' );

// Configuración de la estrategia JWT
const jwtOptions = {
     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
     secretOrKey: process.env.JWT_SECRET || 'secreto_temporal'
};

passport.use( new JwtStrategy( jwtOptions, async ( payload, done ) => {
     try {
          const user = await User.findById( payload.id );
          if ( user ) {
               return done( null, user );
          }
          return done( null, false );
     } catch ( error ) {
          return done( error, false );
     }
} ) );

// Configuración de la estrategia Google OAuth
passport.use( new GoogleStrategy( {
     clientID: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     callbackURL: '/api/auth/google/callback'
}, async ( accessToken, refreshToken, profile, done ) => {
     try {
          // Verificar si el usuario ya existe en la base de datos
          let user = await User.findOne( { email: profile.emails[ 0 ].value } );

          if ( user ) {
               // Si el usuario ya existe pero no tiene googleId, actualizarlo
               if ( !user.googleId ) {
                    user.googleId = profile.id;
                    user.avatar = profile.photos[ 0 ].value || user.avatar;
                    await user.save();
               }
               return done( null, user );
          }

          // Si el usuario no existe, crearlo
          const newUser = new User( {
               username: profile.displayName,
               email: profile.emails[ 0 ].value,
               password: Math.random().toString( 36 ).slice( -8 ), // Contraseña aleatoria (no se usará)
               googleId: profile.id,
               avatar: profile.photos[ 0 ].value || 'https://via.placeholder.com/150',
               role: 'user'
          } );

          await newUser.save();
          return done( null, newUser );
     } catch ( error ) {
          return done( error, false );
     }
} ) );


module.exports = passport;