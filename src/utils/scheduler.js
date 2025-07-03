const { syncEvents } = require('./syncEvents');

// Función para ejecutar sincronización automática
const startAutoSync = () => {
    console.log('🤖 Iniciando sincronización automática...');
    console.log('📅 Se ejecutará cada 6 horas');
    
    // Ejecutar inmediatamente al iniciar
    setTimeout(async () => {
        console.log('🚀 Primera sincronización automática...');
        await syncEvents();
    }, 30000); // Esperar 30 segundos después del inicio del servidor
    
    // Ejecutar cada 6 horas (21600000 ms)
    setInterval(async () => {
        console.log('🕐 Ejecutando sincronización programada...');
        try {
            const result = await syncEvents();
            if (result.success) {
                console.log(`✅ Sincronización automática completada: ${result.newEvents} nuevos, ${result.updatedEvents} actualizados`);
            } else {
                console.error('❌ Error en sincronización automática:', result.error);
            }
        } catch (error) {
            console.error('💥 Error fatal en sincronización automática:', error.message);
        }
    }, 6 * 60 * 60 * 1000); // 6 horas
};

// Función para ejecutar sincronización manual (endpoint)
const runManualSync = async () => {
    console.log('🔧 Ejecutando sincronización manual...');
    return await syncEvents();
};

module.exports = { 
    startAutoSync,
    runManualSync
}; 