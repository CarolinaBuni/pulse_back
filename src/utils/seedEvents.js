require( 'dotenv' ).config();
const fs = require( 'fs' );
const path = require( 'path' );
const csv = require( 'csv-parser' );
const mongoose = require( 'mongoose' );
const Event = require( '../api/models/event' );
const { connectDB } = require( '../config/db' );

async function seedEvents() {
     try {
          // Conectar a la base de datos
          await connectDB();
          console.log( 'Conectado a MongoDB' );

          // Array para almacenar los eventos del CSV
          const events = [];

          // Leer el archivo CSV
          console.log( 'Leyendo el archivo CSV...' );

          // Esta promesa envuelve la lectura del CSV que es asíncrona
          await new Promise( ( resolve, reject ) => {
               fs.createReadStream( path.join( __dirname, '../../data/events.csv' ) )
                    .pipe( csv() )
                    .on( 'data', ( data ) => {
                         // Transformar los datos del CSV al formato del modelo
                         const event = {
                              ticketmasterId: data.id,
                              name: data.name,
                              description: data.description,
                              startDate: new Date( data.startDate ),
                              endDate: new Date( data.endDate ),
                              venue: {
                                   name: data[ 'venue.name' ],
                                   address: data[ 'venue.address' ],
                                   city: data[ 'venue.city' ],
                                   capacity: parseInt( data[ 'venue.capacity' ] ) || 0
                              },
                              category: data.category,
                              genre: data.genre,
                              subgenre: data.subgenre,
                              price: {
                                   min: parseFloat( data[ 'price.min' ] ) || 0,
                                   max: parseFloat( data[ 'price.max' ] ) || 0
                              },
                              image: data.image,
                              secondaryImage: data.secondaryImage,
                              coordinates: {
                                   lat: parseFloat( data[ 'coordinates.lat' ] ) || 0,
                                   lng: parseFloat( data[ 'coordinates.lng' ] ) || 0
                              },
                              status: data.status,
                              featured: data.featured === 'true',
                              ageRestriction: data.ageRestriction,
                              promoter: data.promoter,
                              url: data.url,
                              tags: data.tags ? data.tags.split( ',' ) : []
                         };

                         events.push( event );
                    } )
                    .on( 'end', () => {
                         console.log( `Se leyeron ${ events.length } eventos del CSV` );
                         resolve();
                    } )
                    .on( 'error', ( error ) => {
                         reject( error );
                    } );
          } );

          // Limpiar la colección de eventos existente 
          console.log( 'Limpiando la colección de eventos...' );
          await Event.deleteMany( {} );

          // Insertar los eventos en la base de datos
          console.log( 'Insertando eventos en la base de datos...' );
          if ( events.length > 0 ) {
               const result = await Event.insertMany( events );
               console.log( `Se insertaron ${ result.length } eventos en la base de datos` );
          } else {
               console.log( 'No se encontraron eventos para insertar' );
          }

          console.log( 'El proceso de seeding ha finalizado exitosamente' );

          // Desconectar de la base de datos
          await mongoose.disconnect();
          console.log( 'Desconectado de MongoDB' );

     } catch ( error ) {
          console.error( 'Error durante el proceso de seeding:', error );
          process.exit( 1 );
     }
}

seedEvents();