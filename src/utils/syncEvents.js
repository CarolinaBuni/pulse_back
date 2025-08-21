const axios = require( 'axios' );
const Event = require( '../api/models/event' );
require( 'dotenv' ).config();

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Función para obtener eventos de Ticketmaster
const fetchFromTicketmaster = async ( page = 0 ) => {
    try {
        console.log( `📡 Obteniendo eventos de Ticketmaster (página ${ page })...` );

        const response = await axios.get( BASE_URL, {
            params: {
                apikey: TICKETMASTER_API_KEY,
                // countryCode: 'ES',
                size: 50,
                page: page,
                sort: 'date,asc',
                startDateTime: new Date().toISOString().split( '.' )[ 0 ] + 'Z',
            }
        } );

        console.log( `✅ Respuesta recibida: ${ response.data._embedded?.events?.length || 0 } eventos` );
        return response.data;
    } catch ( error ) {
        console.error( '❌ Error obteniendo eventos de Ticketmaster:', error.response?.status, error.response?.statusText );
        console.error( '❌ Detalles:', error.response?.data );
        return null;
    }
};

// Función para procesar y guardar eventos
const processAndSaveEvents = async ( ticketmasterEvents ) => {
    let newEvents = 0;
    let updatedEvents = 0;
    let errors = 0;

    for ( const tmEvent of ticketmasterEvents ) {
        try {
            // Verificar si el evento ya existe
            const existingEvent = await Event.findOne( {
                ticketmasterId: tmEvent.id
            } );

            // Procesar datos del evento 
            const eventData = {
                ticketmasterId: tmEvent.id,
                name: tmEvent.name,
                description: tmEvent.info || tmEvent.pleaseNote || 'Sin descripción disponible',
                startDate: new Date( tmEvent.dates?.start?.dateTime || tmEvent.dates?.start?.localDate ),
                endDate: new Date( tmEvent.dates?.end?.dateTime || tmEvent.dates?.end?.localDate || tmEvent.dates?.start?.dateTime || tmEvent.dates?.start?.localDate ),
                venue: (() => {
                    // Intentar obtener venue de _embedded.venues primero
                    let venue = tmEvent._embedded?.venues?.[ 0 ];
                    
                    // Si no hay venue en _embedded.venues, intentar con place
                    if (!venue && tmEvent.place) {
                        venue = {
                            name: tmEvent.place.name || 'Venue no disponible',
                            address: tmEvent.place.address?.line1 || 'Dirección no disponible',
                            city: tmEvent.place.city?.name || 'Ciudad no disponible',
                            capacity: 0
                        };
                    }
                    
                    return {
                        name: venue?.name || 'Venue no disponible',
                        address: venue?.address?.line1 || venue?.address || 'Dirección no disponible',
                        city: venue?.city?.name || venue?.city || 'Ciudad no disponible',
                        capacity: venue?.capacity || 0
                    };
                })(),
                category: tmEvent.classifications?.[ 0 ]?.segment?.name || 'Entretenimiento',
                genre: tmEvent.classifications?.[ 0 ]?.genre?.name || 'General',
                subgenre: tmEvent.classifications?.[ 0 ]?.subGenre?.name || '',
                price: {
                    min: tmEvent.priceRanges?.[ 0 ]?.min || 0,
                    max: tmEvent.priceRanges?.[ 0 ]?.max || 0
                },
                image: tmEvent.images?.[ 0 ]?.url || 'https://picsum.photos/300/200?random=' + Math.floor( Math.random() * 1000 ),
                secondaryImage: tmEvent.images?.[ 1 ]?.url || '',
                coordinates: {
                    lat: parseFloat( tmEvent._embedded?.venues?.[ 0 ]?.location?.latitude || tmEvent.place?.location?.latitude ) || 40.4168,
                    lng: parseFloat( tmEvent._embedded?.venues?.[ 0 ]?.location?.longitude || tmEvent.place?.location?.longitude ) || -3.7038
                },
                status: tmEvent.dates?.status?.code || 'onsale',
                
                ageRestriction: tmEvent.ageRestrictions?.legalAgeEnforced ? 'Solo mayores de edad' : 'Todos los públicos',
                promoter: tmEvent.promoter?.name || tmEvent._embedded?.attractions?.[ 0 ]?.name || '',
                url: tmEvent.url || '',
                tags: [
                    tmEvent.classifications?.[ 0 ]?.segment?.name,
                    tmEvent.classifications?.[ 0 ]?.genre?.name,
                    tmEvent.classifications?.[ 0 ]?.subGenre?.name
                ].filter( Boolean ) // Filtra valores vacíos
            };

            if ( existingEvent ) {
                // Actualizar evento existente si hay cambios importantes
                let hasChanges = false;

                // NUEVA CONDICIÓN: Actualizar si tiene "Venue no disponible"
                if ( existingEvent.venue?.name === 'Venue no disponible' && eventData.venue?.name !== 'Venue no disponible' ) {
                    console.log( `🏢 Venue actualizado para: ${ eventData.name } (${ existingEvent.venue.name } → ${ eventData.venue.name })` );
                    hasChanges = true;
                }

                if ( existingEvent.startDate.getTime() !== eventData.startDate.getTime() ) {
                    console.log( `📅 Fecha actualizada para: ${ eventData.name }` );
                    hasChanges = true;
                }

                if ( existingEvent.status !== eventData.status ) {
                    console.log( `🔄 Estado actualizado para: ${ eventData.name } (${ existingEvent.status } → ${ eventData.status })` );
                    hasChanges = true;
                }

                if ( existingEvent.name !== eventData.name ) {
                    console.log( `📝 Nombre actualizado para: ${ existingEvent.name } → ${ eventData.name }` );
                    hasChanges = true;
                }

                if ( hasChanges ) {
                    // Mantener algunos campos del evento original
                    
                    eventData.createdAt = existingEvent.createdAt; // Mantener fecha original

                    await Event.findByIdAndUpdate( existingEvent._id, eventData );
                    updatedEvents++;
                }
            } else {
                // Crear nuevo evento
                await Event.create( eventData );
                console.log( `✅ Nuevo evento añadido: ${ eventData.name } - ${ eventData.venue.city }` );
                newEvents++;
            }

        } catch ( error ) {
            console.error( `❌ Error procesando evento ${ tmEvent.name }:`, error.message );
            errors++;
        }
    }

    return { newEvents, updatedEvents, errors };
};

// Función principal de sincronización
const syncEvents = async () => {
    console.log( '🚀 Iniciando sincronización de eventos...' );
    console.log( '⏰ Fecha:', new Date().toLocaleString() );

    try {
        let totalNew = 0;
        let totalUpdated = 0;
        let totalErrors = 0;
        let page = 0;
        let hasMorePages = true;

        // Obtener eventos de múltiples páginas
        while ( hasMorePages && page < 10 ) {
            const data = await fetchFromTicketmaster( page );

            if ( !data || !data._embedded?.events ) {
                console.log( '📭 No hay más eventos disponibles' );
                break;
            }

            const events = data._embedded.events;
            console.log( `📊 Procesando ${ events.length } eventos de la página ${ page }...` );

            const results = await processAndSaveEvents( events );
            totalNew += results.newEvents;
            totalUpdated += results.updatedEvents;
            totalErrors += results.errors;

            // Verificar si hay más páginas
            hasMorePages = data.page.number < data.page.totalPages - 1;
            page++;

            // Pequeña pausa entre páginas para no saturar la API
            if ( hasMorePages ) {
                await new Promise( resolve => setTimeout( resolve, 2000 ) );
            }
        }

        console.log( '\n📈 RESUMEN DE SINCRONIZACIÓN:' );
        console.log( `✅ Eventos nuevos: ${ totalNew }` );
        console.log( `🔄 Eventos actualizados: ${ totalUpdated }` );
        console.log( `❌ Errores: ${ totalErrors }` );
        console.log( `📄 Páginas procesadas: ${ page }` );
        console.log( '🎉 Sincronización completada!\n' );

        return {
            success: true,
            newEvents: totalNew,
            updatedEvents: totalUpdated,
            errors: totalErrors
        };

    } catch ( error ) {
        console.error( '💥 Error en la sincronización:', error.message );
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = { syncEvents }; 