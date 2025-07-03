require( 'dotenv' ).config();
const fs = require( 'fs' );
const path = require( 'path' );
const csv = require( 'csv-parser' );
const mongoose = require( 'mongoose' );
const User = require( '../api/models/user' );
const { connectDB } = require( '../config/db' );
const { getRandomAvatar } = require('./avatars');

async function seedUsers() {
     try {
          // Conectar a la base de datos
          await connectDB();
          console.log( 'Conectado a MongoDB' );

          // Array para almacenar los usuarios del CSV
          const users = [];

          // Leer el archivo CSV
          console.log( 'Leyendo el archivo CSV de usuarios...' );

          // Leer CSV de forma asíncrona
          await new Promise( ( resolve, reject ) => {
               fs.createReadStream( path.join( __dirname, '../../data/users.csv' ) )
                    .pipe( csv() )
                    .on( 'data', ( data ) => {
                         // Transformar los datos del CSV al formato del modelo
                         const user = {
                              username: data.username,
                              email: data.email,
                              password: data.password, // Se encriptará automáticamente por el middleware
                              role: data.role || 'user',
                              avatar: data.avatar || getRandomAvatar(),
                              preferences: data.preferences ? data.preferences.split(',').map(p => p.trim()) : []
                         };

                         users.push( user );
                    } )
                    .on( 'end', () => {
                         console.log( `Se leyeron ${ users.length } usuarios del CSV` );
                         resolve();
                    } )
                    .on( 'error', ( error ) => {
                         reject( error );
                    } );
          } );

          // Limpiar colección
          await User.deleteMany({});
          console.log('Usuarios existentes eliminados');

          // Crear usuarios del CSV
          for (const userData of users) {
               const user = new User(userData);
               await user.save();
               console.log(`Usuario ${userData.username} creado`);
          }
          
          console.log(`Seeding completado: ${users.length} usuarios creados`);

          await mongoose.disconnect();

     } catch ( error ) {
          console.error( 'Error en seeding de usuarios:', error );
          process.exit( 1 );
     }
}

seedUsers();

module.exports = { seedUsers };