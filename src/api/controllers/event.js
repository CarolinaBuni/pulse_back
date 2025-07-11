const Event = require( '../models/event' );
const Review = require( '../models/review' );

// Obtener todos los eventos
const getAllEvents = async ( req, res ) => {
     try {
          // 🔥 LOGS PARA DEBUGGING MÓVILES
          console.log('📱 [MOBILE DEBUG] ===== NUEVA REQUEST A getAllEvents =====');
          console.log('📱 User-Agent:', req.headers['user-agent']);
          console.log('📱 Origin:', req.headers.origin);
          console.log('📱 Referer:', req.headers.referer);
          console.log('📱 Query params:', req.query);
          console.log('📱 Method:', req.method);
          console.log('📱 URL:', req.url);
          
          let query = {};

          // Por defecto, mostrar solo eventos futuros
          // query.startDate = { $gte: new Date() };
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 00:00:00.000 de hoy
          query.startDate = { $gte: today };

          console.log('📱 [MOBILE DEBUG] Today date:', today);
          console.log('📱 [MOBILE DEBUG] Query inicial:', query);

          // Filtros opcionales
          if ( req.query.category ) {
               query.category = req.query.category;
          }

          if ( req.query.genre ) {
               query.genre = req.query.genre;
          }

          // Si se especifica una ciudad diferente
          if ( req.query.city ) {
               query[ 'venue.city' ] = req.query.city;
          }

          // Si se especifica una fecha de inicio diferente
          if ( req.query.startDate ) {
               query.startDate = { $gte: new Date( req.query.startDate ) };
          }

          // Si se especifica una fecha de fin
          if ( req.query.endDate ) {
               const endDate = new Date( req.query.endDate );
               endDate.setHours( 23, 59, 59, 999 ); // Incluir todo el día

               if ( query.startDate ) {
                    // Si ya hay filtro de startDate, crear rango
                    query.startDate = {
                         $gte: query.startDate.$gte,
                         $lte: endDate
                    };
               } else {
                    // Solo filtro de endDate
                    query.startDate = { $lte: endDate };
               }
          }

          if ( req.query.featured === 'true' ) {
               query.featured = true;
          }

          console.log('📱 [MOBILE DEBUG] Query final:', JSON.stringify(query, null, 2));

          // Paginación
          const page = parseInt( req.query.page ) || 1;
          const limit = parseInt( req.query.limit ) || 1000; 
          const skip = ( page - 1 ) * limit;

          console.log('📱 [MOBILE DEBUG] Paginación - Page:', page, 'Limit:', limit, 'Skip:', skip);

          // Ejecutar consulta
          const events = await Event.find( query )
               .sort( { startDate: 1 } )
               .skip( skip )
               .limit( limit );

          console.log('📱 [MOBILE DEBUG] Eventos encontrados:', events.length);
          console.log('📱 [MOBILE DEBUG] Primer evento:', events[0]?.name || 'No hay eventos');
          console.log('📱 [MOBILE DEBUG] Primer evento fecha:', events[0]?.startDate || 'No hay eventos');

          // Contar total para paginación
          const total = await Event.countDocuments( query );

          console.log('📱 [MOBILE DEBUG] Total en BD:', total);

          const response = {
               success: true,
               count: events.length,
               totalPages: Math.ceil( total / limit ),
               currentPage: page,
               data: events
          };

          console.log('📱 [MOBILE DEBUG] Response count:', response.count);
          console.log('📱 [MOBILE DEBUG] ===== FIN REQUEST =====');

          return res.status( 200 ).json( response );
     } catch ( error ) {
          console.error( '📱 [MOBILE DEBUG] ERROR:', error );
          console.error( '📱 [MOBILE DEBUG] ERROR Stack:', error.stack );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener eventos',
               error: error.message
          } );
     }
};

// Obtener un evento por ID

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

          // Escapar caracteres especiales de regex y crear patrón de búsqueda flexible
          const escapedQuery = q.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
          const searchRegex = new RegExp( escapedQuery, 'i' ); // 'i' para case-insensitive

          // Construir la consulta base con búsqueda flexible en múltiples campos
          let query = {
               $or: [
                    { name: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { genre: { $regex: searchRegex } },
                    { 'venue.name': { $regex: searchRegex } },
                    { 'venue.city': { $regex: searchRegex } },
                    { 'venue.address': { $regex: searchRegex } }
               ]
          };

          // Por defecto, mostrar solo eventos futuros
          // query.startDate = { $gte: new Date() };
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 00:00:00.000 de hoy
          query.startDate = { $gte: today };

          // Filtros opcionales adicionales
          const additionalFilters = {};

          if ( req.query.category ) {
               additionalFilters.category = req.query.category;
          }

          if ( req.query.genre ) {
               additionalFilters.genre = req.query.genre;
          }

          // Si se especifica una ciudad específica en filtros
          if ( req.query.city ) {
               additionalFilters[ 'venue.city' ] = req.query.city;
          }

          // Si se especifica una fecha de inicio diferente
          if ( req.query.startDate ) {
               additionalFilters.startDate = { $gte: new Date( req.query.startDate ) };
          }

          // Si se especifica una fecha de fin
          if ( req.query.endDate ) {
               const endDate = new Date( req.query.endDate );
               endDate.setHours( 23, 59, 59, 999 ); // Incluir todo el día

               if ( additionalFilters.startDate ) {
                    // Si ya hay filtro de startDate, crear rango
                    additionalFilters.startDate = {
                         $gte: additionalFilters.startDate.$gte,
                         $lte: endDate
                    };
               } else {
                    // Solo filtro de endDate
                    additionalFilters.startDate = { $lte: endDate };
               }
          }

          if ( req.query.featured === 'true' ) {
               additionalFilters.featured = true;
          }

          // Filtros de precio
          if ( req.query.minPrice ) {
               additionalFilters[ 'price.min' ] = { $gte: parseFloat( req.query.minPrice ) };
          }
          if ( req.query.maxPrice ) {
               additionalFilters[ 'price.max' ] = { $lte: parseFloat( req.query.maxPrice ) };
          }

          // Combinar la búsqueda de texto con filtros adicionales
          if ( Object.keys( additionalFilters ).length > 0 ) {
               query = { $and: [ query, additionalFilters ] };
          }

          // Buscar eventos
          const events = await Event.find( query )
               .sort( {
                    // Priorizar eventos que coincidan en el nombre
                    name: 1,
                    startDate: 1
               } )
               .limit( 1000 ); // Aumentamos el límite para búsquedas

          // Calcular relevancia simple basada en dónde se encuentra la coincidencia
          const eventsWithScore = events.map( event => {
               let score = 0;
               const queryLower = q.toLowerCase();
               const eventObj = event.toObject();

               // Mayor puntuación si coincide en el nombre
               if ( event.name && event.name.toLowerCase().includes( queryLower ) ) {
                    score += 10;
                    // Bonus si coincide al inicio del nombre
                    if ( event.name.toLowerCase().startsWith( queryLower ) ) {
                         score += 5;
                    }
               }

               // Puntuación media si coincide en género
               if ( event.genre && event.genre.toLowerCase().includes( queryLower ) ) {
                    score += 5;
               }

               // Puntuación baja si coincide en otros campos
               if ( event.description && event.description.toLowerCase().includes( queryLower ) ) {
                    score += 2;
               }

               if ( event.venue?.name && event.venue.name.toLowerCase().includes( queryLower ) ) {
                    score += 3;
               }

               if ( event.venue?.city && event.venue.city.toLowerCase().includes( queryLower ) ) {
                    score += 3;
               }

               eventObj.searchScore = score;
               return eventObj;
          } );

          // Ordenar por puntuación de relevancia
          eventsWithScore.sort( ( a, b ) => b.searchScore - a.searchScore );

          // Remover el campo de puntuación antes de enviar
          const finalEvents = eventsWithScore.map( event => {
               delete event.searchScore;
               return event;
          } );

          return res.status( 200 ).json( {
               success: true,
               count: finalEvents.length,
               data: finalEvents,
               searchTerm: q
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


// Obtener eventos pasados
const getPastEvents = async ( req, res ) => {
     try {
          let query = {};

          // Solo eventos pasados
          query.startDate = { $lt: new Date() };

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

          // Paginación
          const page = parseInt( req.query.page ) || 1;
          const limit = parseInt( req.query.limit ) || 20;
          const skip = ( page - 1 ) * limit;

          // Ejecutar consulta - ordenar por fecha descendente (más recientes primero)
          const events = await Event.find( query )
               .sort( { startDate: -1 } )
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
          console.error( 'Error al obtener eventos pasados:', error );
          return res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener eventos pasados',
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
     getEventsByCity,
     searchEvents,
     getPastEvents
};