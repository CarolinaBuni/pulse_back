const mongoose = require( 'mongoose' );

const reviewSchema = new mongoose.Schema( {
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
     rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
     },
     comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500
     },
     date: {
          type: Date,
          default: Date.now
     },
     updated: {
          type: Date
     }
}, { timestamps: true } );

// Índice para evitar duplicados 
reviewSchema.index( { user: 1, event: 1 }, { unique: true } );

module.exports = mongoose.model( 'Review', reviewSchema );