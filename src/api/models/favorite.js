const mongoose = require( 'mongoose' );

const favoriteSchema = new mongoose.Schema( {
     user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
     },
     event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Event',
          required: true
     },
     createdAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true } );

// Índice para evitar duplicados (no se puede marcar el mismo evento como favorito dos veces)
favoriteSchema.index( { user: 1, event: 1 }, { unique: true } );

module.exports = mongoose.model( 'Favorite', favoriteSchema );