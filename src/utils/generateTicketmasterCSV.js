const axios = require( 'axios' );
const fs = require( 'fs' );
const path = require( 'path' );
require( 'dotenv' ).config();

const API_KEY = process.env.TICKETMASTER_API_KEY;

// Configuración de búsqueda para España (múltiples ciudades)
const cities = [ 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza', 'Malaga' ];
const countryCode = 'ES';
const size = 200;

async function fetchEvents() {
     let allEvents = [];

     for ( const city of cities ) {
          try {
               console.log( `Buscando eventos en ${ city }...` );

               const response = await axios.get( 'https://app.ticketmaster.com/discovery/v2/events.json', {
                    params: {
                         apikey: API_KEY,
                         city: city,
                         countryCode: countryCode,
                         size: size,
                         // Incluir eventos con y sin fechas definidas
                         includeTBA: 'yes',
                         includeTBD: 'yes',
                         // Ordenar por fecha para obtener eventos variados
                         sort: 'date,asc'
                    }
               } );

               if ( response.data && response.data._embedded && response.data._embedded.events ) {
                    console.log( `Encontrados ${ response.data._embedded.events.length } eventos en ${ city }` );
                    allEvents = [ ...allEvents, ...response.data._embedded.events ];
               } else {
                    console.log( `No se encontraron eventos en ${ city }` );
               }
          } catch ( error ) {
               console.error( `Error al buscar eventos en ${ city }:`, error.message );
          }
     }

     return allEvents;
}

function processEventsForCSV( events ) {
     // Mapeamos los eventos a la estructura de CSV que necesitamos
     return events.map( ( event, index ) => {
          const venues = event._embedded?.venues || [];
          const venue = venues[ 0 ] || {};
          const classifications = event.classifications || [];
          const classification = classifications[ 0 ] || {};
          const images = event.images || [];
          const dates = event.dates || {};
          const priceRanges = event.priceRanges || [];
          const price = priceRanges[ 0 ] || {};

          // Generamos datos para campos vacíos
          const venueName = venue.name || 'Venue sin nombre';
          const venueAddress = venue.address?.line1 || 'Dirección desconocida';
          const venueCity = venue.city?.name || 'Ciudad desconocida';
          const venueCapacity = venue.capacity || Math.floor( Math.random() * 5000 ) + 500;

          // Coordenadas
          const lat = venue.location?.latitude || null;
          const lng = venue.location?.longitude || null;

          // Generamos coordenadas aleatorias para España si no hay
          const coordinates = {
               lat: lat || ( 40.0 + Math.random() * 3 ),
               lng: lng || ( -3.7 + Math.random() * 3 )
          };

          // Fechas: inicio y fin (si no hay fin, usamos inicio + 3 horas)
          const startDate = dates.start?.dateTime || new Date().toISOString();
          const endDateObj = new Date( startDate );
          endDateObj.setHours( endDateObj.getHours() + 3 );
          const endDate = dates.end?.dateTime || endDateObj.toISOString();

          // Categoría, género y subgénero
          const category = classification.segment?.name || 'Otros';
          const genre = classification.genre?.name || 'Sin género';
          const subgenre = classification.subGenre?.name || '';

          // Estado del evento
          const status = dates.status?.code || 'onsale';

          // Construimos tags combinando información relevante
          const tags = [
               category,
               genre,
               subgenre,
               venue.city?.name
          ].filter( Boolean ).join( ',' );

          // Retornamos objeto formateado para CSV
          return {
               id: event.id || `gen-${ index }`,
               name: event.name || 'Evento sin nombre',
               description: event.info || event.pleaseNote || 'Sin descripción disponible',
               startDate: startDate,
               endDate: endDate,
               'venue.name': venueName,
               'venue.address': venueAddress,
               'venue.city': venueCity,
               'venue.capacity': venueCapacity,
               category: category,
               genre: genre,
               subgenre: subgenre,
               'price.min': price.min || Math.floor( Math.random() * 20 ) + 10,
               'price.max': price.max || Math.floor( Math.random() * 100 ) + 50,
               image: ( images[ 0 ]?.url ) || 'https://via.placeholder.com/300',
               secondaryImage: ( images[ 1 ]?.url ) || 'https://via.placeholder.com/300',
               'coordinates.lat': coordinates.lat,
               'coordinates.lng': coordinates.lng,
               status: status,
               featured: Math.random() > 0.7 ? 'true' : 'false',
               ageRestriction: event.ageRestrictions?.legalAgeEnforced ? '+18' : 'Todos los públicos',
               promoter: event.promoter?.name || '',
               url: event.url || '',
               tags: tags
          };
     } );
}

async function generateCSV() {
     try {
          console.log( 'Iniciando obtención de eventos de Ticketmaster...' );

          // 1. Obtener eventos
          const events = await fetchEvents();
          console.log( `Total de eventos obtenidos: ${ events.length }` );

          if ( events.length === 0 ) {
               console.error( 'No se encontraron eventos. Verifica la API key o los parámetros de búsqueda.' );
               return;
          }

          // 2. Procesar eventos para CSV
          const processedEvents = processEventsForCSV( events );

          // 3. Asegurar que tengamos al menos 100 eventos
          if ( processedEvents.length < 100 ) {
               console.log( `Solo se encontraron ${ processedEvents.length } eventos, duplicando algunos para llegar a 100...` );

               // Duplicar eventos con pequeñas modificaciones hasta tener 100
               const original = [ ...processedEvents ];
               while ( processedEvents.length < 100 ) {
                    const randomEvent = { ...original[ Math.floor( Math.random() * original.length ) ] };

                    // Modificar ligeramente el evento duplicado
                    randomEvent.id = `dup-${ processedEvents.length }`;
                    randomEvent.name += ' (Edición Especial)';

                    // Cambiar fecha a futuro
                    const newDate = new Date( randomEvent.startDate );
                    newDate.setDate( newDate.getDate() + 30 + Math.floor( Math.random() * 60 ) );
                    randomEvent.startDate = newDate.toISOString();

                    // Añadir a la lista
                    processedEvents.push( randomEvent );
               }
          }

          // 4. Crear directorio data si no existe
          const dataDir = path.join( __dirname, '../../data' );
          if ( !fs.existsSync( dataDir ) ) {
               fs.mkdirSync( dataDir, { recursive: true } );
          }

          // 5. Generar CSV
          const csvPath = path.join( dataDir, 'events.csv' );

          // Crear encabezados CSV
          const headers = Object.keys( processedEvents[ 0 ] ).join( ',' ) + '\n';

          // Convertir datos a filas CSV
          const rows = processedEvents.map( event => {
               return Object.values( event ).map( value => {
                    // Escapar comillas y encerrar en comillas si contiene comas
                    if ( typeof value === 'string' ) {
                         const escaped = value.replace( /"/g, '""' );
                         return escaped.includes( ',' ) ? `"${ escaped }"` : escaped;
                    }
                    return value;
               } ).join( ',' );
          } ).join( '\n' );

          // Escribir archivo CSV
          fs.writeFileSync( csvPath, headers + rows );

          console.log( `CSV generado exitosamente en ${ csvPath }` );
          console.log( `Total de eventos en el CSV: ${ processedEvents.length }` );

     } catch ( error ) {
          console.error( 'Error al generar CSV:', error );
     }
}

generateCSV();