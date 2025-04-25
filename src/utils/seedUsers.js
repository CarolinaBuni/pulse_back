require( 'dotenv' ).config();
const fs = require( 'fs' );
const path = require( 'path' );
const csv = require( 'csv-parser' );
const mongoose = require( 'mongoose' );
const User = require( '../api/models/user' );
const { connectDB } = require( '../config/db' );
const bcrypt = require( 'bcrypt' );

async function seedUsers() {
     try {
          // Conectar a la base de datos
          await connectDB();
          console.log( 'Conectado a MongoDB' );

          // Array para almacenar usuarios
          const users = [];

          // Leer el archivo CSV
          console.log( 'Leyendo el archivo CSV de usuarios...' );

          await new Promise( ( resolve, reject ) => {
               fs.createReadStream( path.join( __dirname, '../../data/users.csv' ) )
                    .pipe( csv() )
                    .on( 'data', ( data ) => {
                         // Transformar datos del CSV
                         const user = {
                              username: data.username,
                              email: data.email,
                              password: data.password,
                              avatar: data.avatar || 'https://via.placeholder.com/150',
                              role: data.role || 'user',
                              preferences: data.preferences ? data.preferences.split( ',' ).map( p => p.trim() ) : []
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

          console.log( 'Insertando usuarios en la base de datos...' );
          let insertedCount = 0;

          for ( const userData of users ) {
               const user = new User( userData );
               await user.save();
               insertedCount++;
          }

          console.log( `Se insertaron ${ insertedCount } usuarios en la base de datos` );
          console.log( 'Seeding de usuarios completado' );

          await mongoose.disconnect();

     } catch ( error ) {
          console.error( 'Error durante el seeding de usuarios:', error );
          process.exit( 1 );
     }
}

seedUsers();