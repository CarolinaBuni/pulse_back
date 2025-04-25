const Event = require( '../models/event' );

// Obtener todos los eventos
const getAllEvents = async ( req, res ) => {
     try {
          let query = {};

          // Filtros opcionales
          if ( req.query.category ) {
               query.category = req.query.category;
          }

          if ( req.query.genre ) {
               query.genre = req.query.genre;
          }

          if ( req.query.city ) {
               query[ 'venue.city' ] = { $regex: req.query.city, $options: 'i' };
          }

          // Filtro por fecha
          if ( req.query.startDate ) {
               query.startDate = { $gte: new Date( req.query.startDate ) };
          }

          if ( req.query.featured === 'true' ) {
               query.featured = true;
          }

          // Paginación
          const page = parseInt( req.query.page ) || 1;
          const limit = parseInt( req.query.limit ) || 10;
          const skip = ( page - 1 ) * limit;

          // Ejecutar consulta
          const events = await Event.find( query )
               .sort( { startDate: 1 } )
               .skip( skip )
               .limit( limit );

          // Contar total para paginación
          const total = await Event.countDocuments( query );

          return res.status( 200 ).json( {
               success: true,
               count: events.length,
               totalPages: Math.ceil( total / limit ),
               currentPage: page,
               data: events
          } );
     } catch ( error ) {
          console.error( 'Error al obtener eventos:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener eventos',
               error: error.message
          } );
     }
};

// Obtener un evento por ID
// Modificación del método getEventById en src/api/controllers/event.js

const getEventById = async ( req, res ) => {
     try {
          const { id } = req.params;

          // Buscar el evento por _id o ticketmasterId
          const event = await Event.findOne( {
               $or: [
                    { _id: id },
                    { ticketmasterId: id },
               ]
          } );

          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          // Buscar las reseñas relacionadas
          const Review = require( '../models/review' ); // Importar el modelo de Review
          const reviews = await Review.find( { event: event._id } )
               .populate( 'user', 'username avatar' )
               .sort( { date: -1 } );

          // Calcular la puntuación media
          let averageRating = 0;
          if ( reviews.length > 0 ) {
               const sum = reviews.reduce( ( acc, review ) => acc + review.rating, 0 );
               averageRating = sum / reviews.length;
          }

          // Construir la respuesta con el evento y sus reseñas
          const eventData = event.toObject();
          eventData.reviews = {
               items: reviews,
               count: reviews.length,
               averageRating: averageRating
          };

          res.json( {
               success: true,
               data: eventData
          } );
     } catch ( error ) {
          res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener el evento',
               error: error.message
          } );
     }
};

// Crear un nuevo evento
const createEvent = async ( req, res ) => {
     try {
          const eventData = req.body;

          // Si no hay ticketmasterId, eliminar el campo para que no se guarde como null
          if ( !eventData.ticketmasterId ) {
               delete eventData.ticketmasterId;
          }

          const newEvent = new Event( eventData );
          await newEvent.save();

          res.status( 201 ).json( {
               success: true,
               message: 'Evento creado con éxito',
               data: newEvent
          } );
     } catch ( error ) {
          console.warn( 'Error al crear evento:', error );
          res.status( 400 ).json( {
               success: false,
               message: 'Error al crear el evento',
               error: error.message
          } );
     }
};

// Actualizar un evento
const updateEvent = async ( req, res ) => {
     try {
          const event = await Event.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true, runValidators: true }
          );

          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          return res.status( 200 ).json( {
               success: true,
               data: event
          } );
     } catch ( error ) {
          console.error( 'Error al actualizar evento:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al actualizar el evento',
               error: error.message
          } );
     }
};

// Eliminar un evento
const deleteEvent = async ( req, res ) => {
     try {
          const event = await Event.findByIdAndDelete( req.params.id );

          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          return res.status( 200 ).json( {
               success: true,
               message: 'Evento eliminado correctamente'
          } );
     } catch ( error ) {
          console.error( 'Error al eliminar evento:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al eliminar el evento',
               error: error.message
          } );
     }
};

// Obtener eventos destacados
const getFeaturedEvents = async ( req, res ) => {
     try {
          const featuredEvents = await Event.find( { featured: true } )
               .sort( { startDate: 1 } )
               .limit( 6 );

          return res.status( 200 ).json( {
               success: true,
               count: featuredEvents.length,
               data: featuredEvents
          } );
     } catch ( error ) {
          console.error( 'Error al obtener eventos destacados:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener eventos destacados',
               error: error.message
          } );
     }
};

// Obtener eventos por ciudad
const getEventsByCity = async ( req, res ) => {
     try {
          const { city } = req.params;

          const events = await Event.find( {
               'venue.city': { $regex: city, $options: 'i' }
          } ).sort( { startDate: 1 } );

          return res.status( 200 ).json( {
               success: true,
               count: events.length,
               data: events
          } );
     } catch ( error ) {
          console.error( 'Error al obtener eventos por ciudad:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener eventos por ciudad',
               error: error.message
          } );
     }
};

// Buscar eventos por texto
const searchEvents = async ( req, res ) => {
     try {
          const { q } = req.query; // q es el término de búsqueda

          if ( !q ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Se requiere un término de búsqueda'
               } );
          }

          // Buscar usando el índice de texto
          const events = await Event.find(
               { $text: { $search: q } },
               // Agregar puntuación de relevancia
               { score: { $meta: 'textScore' } }
          )
               // Ordenar por relevancia
               .sort( { score: { $meta: 'textScore' } } )
               .limit( 20 );

          return res.status( 200 ).json( {
               success: true,
               count: events.length,
               data: events
          } );
     } catch ( error ) {
          console.error( 'Error en búsqueda de eventos:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al buscar eventos',
               error: error.message
          } );
     }
};

// Buscar eventos cercanos por coordenadas
const getNearbyEvents = async ( req, res ) => {
     try {
          const { lat, lng, radius = 5 } = req.query; // radio en kilómetros, por defecto 5km

          if ( !lat || !lng ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Se requieren latitud y longitud'
               } );
          }

          // Convertir a números
          const latitude = parseFloat( lat );
          const longitude = parseFloat( lng );
          const radiusInKm = parseFloat( radius );

          if ( isNaN( latitude ) || isNaN( longitude ) || isNaN( radiusInKm ) ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Coordenadas o radio inválidos'
               } );
          }

          // Calcular los límites de latitud y longitud para un cuadrado alrededor del punto
          // Aproximación: 1 grado de latitud ≈ 111 km
          const latDelta = radiusInKm / 111;
          const lngDelta = radiusInKm / ( 111 * Math.cos( latitude * ( Math.PI / 180 ) ) );

          // Buscar eventos dentro del cuadrado
          const events = await Event.find( {
               'coordinates.lat': { $gte: latitude - latDelta, $lte: latitude + latDelta },
               'coordinates.lng': { $gte: longitude - lngDelta, $lte: longitude + lngDelta }
          } ).limit( 20 );

          // Refinar los resultados calculando la distancia exacta
          const eventsWithDistance = events.map( event => {
               // Calcular distancia usando la fórmula de Haversine
               const R = 6371; // Radio de la Tierra en km
               const dLat = ( event.coordinates.lat - latitude ) * ( Math.PI / 180 );
               const dLng = ( event.coordinates.lng - longitude ) * ( Math.PI / 180 );
               const a =
                    Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
                    Math.cos( latitude * ( Math.PI / 180 ) ) * Math.cos( event.coordinates.lat * ( Math.PI / 180 ) ) *
                    Math.sin( dLng / 2 ) * Math.sin( dLng / 2 );
               const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
               const distance = R * c; // Distancia en km

               // Solo incluir eventos dentro del radio especificado
               if ( distance <= radiusInKm ) {
                    const eventObj = event.toObject();
                    eventObj.distance = distance; // Añadir distancia al objeto
                    return eventObj;
               }
               return null;
          } ).filter( Boolean ); // Eliminar eventos fuera del radio

          // Ordenar por distancia
          eventsWithDistance.sort( ( a, b ) => a.distance - b.distance );

          return res.status( 200 ).json( {
               success: true,
               count: eventsWithDistance.length,
               data: eventsWithDistance
          } );
     } catch ( error ) {
          console.error( 'Error al buscar eventos cercanos:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al buscar eventos cercanos',
               error: error.message
          } );
     }
};

module.exports = {
     getAllEvents,
     getEventById,
     createEvent,
     updateEvent,
     deleteEvent,
     getFeaturedEvents,
     getEventsByCity,
     searchEvents,
     getNearbyEvents
};