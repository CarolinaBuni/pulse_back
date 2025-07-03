
const Event = require( '../models/event' );
const Favorite = require( '../models/favorite' );

// Añadir un evento a favoritos
const addFavorite = async ( req, res ) => {
     try {
          const { eventId } = req.body;
          const userId = req.user.id;

          // Verificar que el evento existe
          const event = await Event.findById( eventId );
          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          // Verificar si ya es favorito
          const existingFavorite = await Favorite.findOne( { user: userId, event: eventId } );
          if ( existingFavorite ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Este evento ya está en tus favoritos'
               } );
          }

          // Crear nuevo favorito
          const favorite = new Favorite( {
               user: userId,
               event: eventId
          } );

          await favorite.save();

          res.status( 201 ).json( {
               success: true,
               message: 'Evento añadido a favoritos',
               data: favorite
          } );
     } catch ( error ) {
          console.error( 'Error al añadir favorito:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al añadir favorito',
               error: error.message
          } );
     }
};

// Eliminar un evento de favoritos
const removeFavorite = async ( req, res ) => {
     try {
          const { eventId } = req.params;
          const userId = req.user.id;

          const favorite = await Favorite.findOneAndDelete( { user: userId, event: eventId } );

          if ( !favorite ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Favorito no encontrado'
               } );
          }

          res.status( 200 ).json( {
               success: true,
               message: 'Evento eliminado de favoritos'
          } );
     } catch ( error ) {
          console.error( 'Error al eliminar favorito:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al eliminar favorito',
               error: error.message
          } );
     }
};

// Obtener todos los favoritos de un usuario
const getUserFavorites = async ( req, res ) => {
     try {
          const userId = req.user.id;
          // Buscar favoritos y poblar con TODOS los datos del evento
          const favorites = await Favorite.find( { user: userId } )
               .populate('event') // Poblar con todos los campos del evento
               .sort( { createdAt: -1 } );

          // Filtrar favoritos con eventos válidos y limpiar datos
          const validFavorites = favorites.filter((fav) => {
               if (fav.event && fav.event.name) {
                    // Limpiar el campo genre si es "Undefined" o similar
                    if (fav.event.genre === 'Undefined' || fav.event.genre === 'undefined' || fav.event.genre === 'null') {
                         fav.event.genre = null;
                    }
                    return true;
               }
               return false;
          });

          res.status( 200 ).json( {
               success: true,
               count: validFavorites.length,
               data: validFavorites
          } );
     } catch ( error ) {
          console.error( 'Error al obtener favoritos:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener favoritos',
               error: error.message
          } );
     }
};

// Verificar si un evento es favorito del usuario
const checkFavorite = async ( req, res ) => {
     try {
          const { eventId } = req.params;
          const userId = req.user.id;

          const favorite = await Favorite.findOne( { user: userId, event: eventId } );

          res.status( 200 ).json( {
               success: true,
               isFavorite: !!favorite
          } );
     } catch ( error ) {
          console.error( 'Error al verificar favorito:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al verificar favorito',
               error: error.message
          } );
     }
};


module.exports = {
     addFavorite,
     removeFavorite,
     getUserFavorites,
     checkFavorite,
};