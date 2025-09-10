const Event = require( '../models/event' );
const Review = require( '../models/review' );

// Obtener todos los eventos
const getAllEvents = async ( req, res ) => {
     try {
          let query = {};

          // Mostrar solo eventos futuros
          const today = new Date();
          today.setHours( 0, 0, 0, 0 ); 
          query.startDate = { $gte: today };

          if ( req.query.category ) {
               query.category = req.query.category;
          }

          if ( req.query.genre ) {
               query.genre = req.query.genre;
          }

          if ( req.query.city ) {
               query[ 'venue.city' ] = req.query.city;
          }

          if ( req.query.startDate ) {
               query.startDate = { $gte: new Date( req.query.startDate ) };
          }

          if ( req.query.endDate ) {
               const endDate = new Date( req.query.endDate );
               endDate.setHours( 23, 59, 59, 999 ); 

               if ( query.startDate ) {
                    query.startDate = {
                         $gte: query.startDate.$gte,
                         $lte: endDate
                    };
               } else {
                    query.startDate = { $lte: endDate };
               }
          }

          // Paginación
          const page = parseInt( req.query.page ) || 1;
          const limit = parseInt( req.query.limit ) || 1000;
          const skip = ( page - 1 ) * limit;

          // Consulta
          const events = await Event.find( query )
               .sort( { startDate: 1 } )
               .skip( skip )
               .limit( limit );

          // Contar total para paginación
          const total = await Event.countDocuments( query );

          const response = {
               success: true,
               count: events.length,
               totalPages: Math.ceil( total / limit ),
               currentPage: page,
               data: events
          };

          return res.status( 200 ).json( response );
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

          // Respuesta con el evento y sus reseñas
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

          // Si no hay ticketmasterId, elimino el campo para que no de error
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

// Buscar por texto
const searchEvents = async (req, res) => {
	try {
		const { q } = req.query;

		if (!q) {
			return res.status(400).json({
				success: false,
				message: 'Se requiere un término de búsqueda'
			});
		}

		// Regex 
		const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const searchRegex = new RegExp(escapedQuery, 'i');

		// Buscar SOLO por nombre
		const nameFilter = { name: { $regex: searchRegex } };

		// Fechas por defecto eventos futuros
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		let startDateFilter = { $gte: today };
		if (req.query.startDate && req.query.endDate) {
			const endDate = new Date(req.query.endDate);
			endDate.setHours(23, 59, 59, 999);
			startDateFilter = {
				$gte: new Date(req.query.startDate),
				$lte: endDate
			};
		} else if (req.query.startDate) {
			startDateFilter = { $gte: new Date(req.query.startDate) };
		} else if (req.query.endDate) {
			const endDate = new Date(req.query.endDate);
			endDate.setHours(23, 59, 59, 999);
			startDateFilter = { $lte: endDate };
		}

		// Filtros que se pueden combinar
		const filters = {};
		if (req.query.category) filters.category = req.query.category;
		if (req.query.genre) filters.genre = req.query.genre;
		if (req.query.city) filters['venue.city'] = req.query.city;
		if (req.query.minPrice) filters['price.min'] = { $gte: parseFloat(req.query.minPrice) };
		if (req.query.maxPrice) filters['price.max'] = { $lte: parseFloat(req.query.maxPrice) };

		const query = {
			...nameFilter,
			...filters,
			startDate: startDateFilter
		};

		const events = await Event.find(query)
			.sort({ startDate: 1, name: 1 })
			.limit(1000);

		return res.status(200).json({
			success: true,
			count: events.length,
			data: events,
			searchTerm: q
		});
	} catch (error) {
		console.error('Error en búsqueda de eventos:', error);
		return res.status(500).json({
			success: false,
			message: 'Error al buscar eventos',
			error: error.message
		});
	}
};
// Obtener eventos pasados (agregaciones de Mongo)
const getPastEvents = async ( req, res ) => {
     try {
          let query = {};

          query.startDate = { $lt: new Date() };

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


          const events = await Event.aggregate( [
               { $match: query },
               {
                    $lookup: {
                         from: 'reviews',
                         localField: '_id',
                         foreignField: 'event',
                         as: 'reviews'
                    }
               },
               {
                    $addFields: {
                         reviewCount: { $size: '$reviews' },
                         averageRating: {
                              $cond: {
                                   if: { $gt: [ { $size: '$reviews' }, 0 ] },
                                   then: { $avg: '$reviews.rating' },
                                   else: 0
                              }
                         }
                    }
               },
               { $sort: { startDate: -1 } },
               { $skip: skip },
               { $limit: limit }
          ] );

          // Total para paginación
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