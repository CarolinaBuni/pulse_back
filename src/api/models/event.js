const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const eventSchema = new Schema( {
     ticketmasterId: {
          type: String,
          sparse: true 
     },
     name: {
          type: String,
          required: true
     },
     description: {
          type: String,
          default: 'Sin descripción disponible'
     },
     startDate: {
          type: Date,
          required: true
     },
     endDate: {
          type: Date,
          required: true
     },
     venue: {
          name: {
               type: String,
               required: true
          },
          address: {
               type: String,
               default: 'Dirección no disponible'
          },
          city: {
               type: String,
               required: true
          },
          capacity: {
               type: Number,
               default: 0
          }
     },
     category: {
          type: String,
          required: true
     },
     genre: {
          type: String,
          required: true
     },
     subgenre: {
          type: String
     },
     price: {
          min: {
               type: Number,
               default: 0
          },
          max: {
               type: Number,
               default: 0
          }
     },
     image: {
          type: String,
          default: 'https://picsum.photos/300/200?random=1'
     },
     secondaryImage: {
          type: String
     },
     coordinates: {
          lat: {
               type: Number,
               required: true
          },
          lng: {
               type: Number,
               required: true
          }
     },
     status: {
          type: String,
          enum: [ 'onsale', 'offsale', 'cancelled', 'postponed', 'rescheduled' ],
          default: 'onsale'
     },
     
     ageRestriction: {
          type: String,
          default: 'Todos los públicos'
     },
     promoter: {
          type: String
     },
     url: {
          type: String
     },
     tags: {
          type: [ String ],
          default: []
     },
     createdAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true } );

// Índices para mejorar búsquedas 
eventSchema.index( { name: 'text', description: 'text' } );
eventSchema.index( { description: 'text', 'venue.name': 'text', 'venue.city': 'text', genre: 'text', subgenre: 'text', tags: 'text' } );
eventSchema.index( { 'venue.city': 1 } );
eventSchema.index( { startDate: 1 } );
eventSchema.index( { featured: 1 } );
eventSchema.index( { 'coordinates.lat': 1, 'coordinates.lng': 1 } );

const Event = mongoose.model( 'Event', eventSchema );

module.exports = Event;
