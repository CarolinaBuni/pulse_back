const Review = require( '../models/review' );
const Event = require( '../models/event' );

// Crear una reseña
const createReview = async ( req, res ) => {
     try {
          const { eventId, rating, comment } = req.body;
          const userId = req.user.id;

          // Verificar que el evento existe
          const event = await Event.findById( eventId );
          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          // Verificar si el usuario ya ha hecho una reseña para este evento
          const existingReview = await Review.findOne( { user: userId, event: eventId } );
          if ( existingReview ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Ya has publicado una reseña para este evento'
               } );
          }

          // Verificar que el evento ya ha ocurrido
          const now = new Date();
          if ( new Date( event.startDate ) > now ) {
               return res.status( 400 ).json( {
                    success: false,
                    message: 'Solo se pueden publicar reseñas para eventos que ya han ocurrido'
               } );
          }

          // Crear la reseña
          const review = new Review( {
               user: userId,
               event: eventId,
               rating,
               comment,
               date: new Date()
          } );

          await review.save();

          res.status( 201 ).json( {
               success: true,
               message: 'Reseña publicada correctamente',
               data: review
          } );
     } catch ( error ) {
          console.error( 'Error al crear reseña:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al publicar la reseña',
               error: error.message
          } );
     }
};

// Obtener reseñas de un evento
const getEventReviews = async ( req, res ) => {
     try {
          const { eventId } = req.params;

          // Verificar que el evento existe
          const event = await Event.findById( eventId );
          if ( !event ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Evento no encontrado'
               } );
          }

          // Buscar reseñas del evento y poblar con datos del usuario
          const reviews = await Review.find( { event: eventId } )
               .populate( 'user', 'username avatar' )
               .sort( { date: -1 } );

          // Calcular rating promedio
          let averageRating = 0;
          if ( reviews.length > 0 ) {
               const sum = reviews.reduce( ( acc, review ) => acc + review.rating, 0 );
               averageRating = sum / reviews.length;
          }

          res.status( 200 ).json( {
               success: true,
               count: reviews.length,
               averageRating,
               data: reviews
          } );
     } catch ( error ) {
          console.error( 'Error al obtener reseñas:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener reseñas',
               error: error.message
          } );
     }
};

// Obtener reseñas hechas por un usuario
const getUserReviews = async ( req, res ) => {
     try {
          const userId = req.user.id;

          // Buscar reseñas del usuario 
          const reviews = await Review.find( { user: userId } )
               .populate( 'event' )
               .sort( { date: -1 } );

          res.status( 200 ).json( {
               success: true,
               count: reviews.length,
               data: reviews
          } );
     } catch ( error ) {
          console.error( 'Error al obtener reseñas del usuario:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al obtener reseñas del usuario',
               error: error.message
          } );
     }
};

// Actualizar una reseña
const updateReview = async ( req, res ) => {
     try {
          const { id } = req.params;
          const { rating, comment } = req.body;
          const userId = req.user.id;

          // Buscar la reseña que pertenece al usuario
          const review = await Review.findOne( { _id: id, user: userId } );

          if ( !review ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Reseña no encontrada'
               } );
          }

          // Actualizar la reseña
          review.rating = rating || review.rating;
          review.comment = comment || review.comment;
          review.updated = new Date();

          await review.save();

          res.status( 200 ).json( {
               success: true,
               message: 'Reseña actualizada correctamente',
               data: review
          } );
     } catch ( error ) {
          console.error( 'Error al actualizar reseña:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al actualizar la reseña',
               error: error.message
          } );
     }
};

// Eliminar una reseña
const deleteReview = async ( req, res ) => {
     try {
          const { id } = req.params;
          const userId = req.user.id;

          // Buscar la reseña que es del usuario
          const review = await Review.findOne( { _id: id, user: userId } );

          if ( !review ) {
               return res.status( 404 ).json( {
                    success: false,
                    message: 'Reseña no encontrada'
               } );
          }

          await Review.deleteOne( { _id: id } );

          res.status( 200 ).json( {
               success: true,
               message: 'Reseña eliminada correctamente'
          } );
     } catch ( error ) {
          console.error( 'Error al eliminar reseña:', error );
          res.status( 500 ).json( {
               success: false,
               message: 'Error al eliminar la reseña',
               error: error.message
          } );
     }
};
module.exports = {
     createReview,
     getEventReviews,
     getUserReviews,
     updateReview,
     deleteReview
};