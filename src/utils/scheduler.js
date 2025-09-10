const { syncEvents } = require( './syncEvents' );
const Event = require( '../api/models/event' );
const Review = require( '../api/models/review' );

// Función para limpiar eventos antiguos sin reseñas
const cleanOldEvents = async () => {
    console.log( '🗑️ Iniciando limpieza de eventos antiguos...' );

    try {
        // Evento antiguo (más de 2 años)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth( sixMonthsAgo.getMonth() - 6 );

        // Obtener eventos que tienen reseñas, se guardan
        const eventsWithReviews = await Review.distinct( 'event' );
        console.log( `🔒 Eventos protegidos (con reseñas): ${ eventsWithReviews.length }` );

        // Borrar eventos antiguos SIN reseñas
        const result = await Event.deleteMany( {
            startDate: { $lt: sixMonthsAgo },
            _id: { $nin: eventsWithReviews }
        } );

        console.log( `✅ Eventos antiguos eliminados: ${ result.deletedCount }` );
        console.log( `💾 Eventos con reseñas conservados` );

        return {
            success: true,
            deletedCount: result.deletedCount,
            protectedCount: eventsWithReviews.length
        };

    } catch ( error ) {
        console.error( '❌ Error en limpieza de eventos:', error.message );
        return {
            success: false,
            error: error.message
        };
    }
};

// Función para ejecutar sincronización automática
const startAutoSync = () => {
    console.log( '🤖 Iniciando sincronización automática...' );
    console.log( '📅 Se ejecutará cada 24 horas' );

    // Esta se ejecuta inmediatamente al iniciar
    setTimeout( async () => {
        console.log( '🚀 Primera sincronización automática...' );
        await syncEvents();
    }, 30000 ); // Se hace a los 30 segundos después del inicio del servidor

    // Primera limpieza
    setTimeout( async () => {
        console.log( '🧹 Primera limpieza automática...' );
        try {
            const result = await cleanOldEvents();
            if ( result.success ) {
                console.log( `✅ Primera limpieza completada: ${ result.deletedCount } eventos eliminados, ${ result.protectedCount } conservados` );
            } else {
                console.error( '❌ Error en primera limpieza:', result.error );
            }
        } catch ( error ) {
            console.error( '💥 Error fatal en primera limpieza:', error.message );
        }
    }, 60000 ); 

    // Ejecutar cada 24 horas 
    setInterval( async () => {
        console.log( '🕐 Ejecutando sincronización programada...' );
        try {
            const result = await syncEvents();
            if ( result.success ) {
                console.log( `✅ Sincronización automática completada: ${ result.newEvents } nuevos, ${ result.updatedEvents } actualizados` );
            } else {
                console.error( '❌ Error en sincronización automática:', result.error );
            }
        } catch ( error ) {
            console.error( '💥 Error fatal en sincronización automática:', error.message );
        }
    }, 24 * 60 * 60 * 1000 );

    // Ejecutar limpieza cada 24 horas
    setInterval( async () => {
        console.log( '🧹 Ejecutando limpieza programada...' );
        try {
            const result = await cleanOldEvents();
            if ( result.success ) {
                console.log( `✅ Limpieza completada: ${ result.deletedCount } eventos eliminados, ${ result.protectedCount } conservados` );
            } else {
                console.error( '❌ Error en limpieza automática:', result.error );
            }
        } catch ( error ) {
            console.error( '💥 Error fatal en limpieza automática:', error.message );
        }
    }, 24 * 60 * 60 * 1000 );
};

// Función para ejecutar sincronización manual 
const runManualSync = async () => {
    console.log( '🔧 Ejecutando sincronización manual...' );
    return await syncEvents();
};

// Función para ejecutar limpieza manual 
const runManualClean = async () => {
    console.log( '🧹 Ejecutando limpieza manual...' );
    return await cleanOldEvents();
};

module.exports = {
    startAutoSync,
    runManualSync,
    runManualClean
}; 