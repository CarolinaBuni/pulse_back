require( "dotenv" ).config();
const { connectDB } = require( "./src/config/db" );
const { startAutoSync, runManualSync, runManualClean } = require( "./src/utils/scheduler" );
const cloudinary = require( "cloudinary" ).v2;
const express = require( "express" );
const cors = require( 'cors' );
const path = require( 'path' );
const swagger = require( './src/config/swagger' );
const userRouter = require( "./src/api/routes/user" );
const eventRouter = require( "./src/api/routes/event" );
const favoriteRouter = require( "./src/api/routes/favorite" );
const reviewRouter = require( './src/api/routes/review' );

const app = express();

connectDB();

// Configuración de Cloudinary
cloudinary.config( {
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
} );

// Habilitar CORS
app.use(cors({
     origin: [
          'https://react-final-hhrldkw3j-powermbas-projects.vercel.app',
          'http://localhost:5173',
          'https://react-final.vercel.app' // URL alternativa por si cambia el despliegue
     ],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Añadido OPTIONS para preflight
     credentials: true,
     allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
     exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware para debugging de CORS
app.use((req, res, next) => {
     res.header('Access-Control-Allow-Credentials', 'true');
     console.log('📱 [CORS DEBUG] Origin:', req.headers.origin);
     console.log('📱 [CORS DEBUG] Method:', req.method);
     next();
});

 // AÑADIR ESTE MIDDLEWARE DESPUÉS DEL CORS:
app.use((req, res, next) => {
     console.log('📱 [MOBILE DEBUG] Nueva request:', req.method, req.path);
     console.log('📱 [MOBILE DEBUG] Headers:', req.headers);
     next();
 });

app.use( express.json() );



// Configurar Swagger
swagger.setup( app );

// Servir archivos estáticos
app.use( express.static( path.join( __dirname, 'public' ) ) );

// Servir swagger.json directamente
app.get( '/swagger.json', ( req, res ) => {
     res.json( require( './src/swagger.json' ) );
} );

// Ruta para el Swagger UI HTML estático
app.get( '/docs', ( req, res ) => {
     res.sendFile( path.join( __dirname, 'public', 'swagger-ui.html' ) );
} );

// Ruta principal
app.get( '/', ( req, res ) => {
     res.json( {
          message: 'Bienvenido a la API de Pulse',
          documentation: {
               local: '/api-docs',
               production: '/docs',
               nota: 'En entorno de desarrollo local, usa /api-docs. En producción (Vercel), usa /docs.'
          },
          endpoints: {
               users: '/api/users',
               events: '/api/events',
               favorites: '/api/favorites',
               reviews: '/api/reviews',
               sync: '/api/sync (POST para sincronización manual)',
               clean: '/api/clean (POST para limpieza de eventos antiguos)'
          }
     } );
} );

// Ruta para sincronización manual
app.post('/api/sync', async (req, res) => {
     try {
          console.log('🔧 Solicitud de sincronización manual recibida');
          const result = await runManualSync();
          
          if (result.success) {
               res.json({
                    success: true,
                    message: 'Sincronización completada exitosamente',
                    data: {
                         newEvents: result.newEvents,
                         updatedEvents: result.updatedEvents,
                         errors: result.errors
                    }
               });
          } else {
               res.status(500).json({
                    success: false,
                    message: 'Error en la sincronización',
                    error: result.error
               });
          }
     } catch (error) {
          console.error('💥 Error en endpoint de sincronización:', error.message);
          res.status(500).json({
               success: false,
               message: 'Error interno del servidor',
               error: error.message
          });
     }
});

// Ruta para limpieza manual de eventos antiguos
app.post('/api/clean', async (req, res) => {
     try {
          console.log('🧹 Solicitud de limpieza manual recibida');
          const result = await runManualClean();
          
          if (result.success) {
               res.json({
                    success: true,
                    message: 'Limpieza completada exitosamente',
                    data: {
                         deletedCount: result.deletedCount,
                         protectedCount: result.protectedCount
                    }
               });
          } else {
               res.status(500).json({
                    success: false,
                    message: 'Error en la limpieza',
                    error: result.error
               });
          }
     } catch (error) {
          console.error('💥 Error en endpoint de limpieza:', error.message);
          res.status(500).json({
               success: false,
               message: 'Error interno del servidor',
               error: error.message
          });
     }
});

// Rutas de la  API
app.use( "/api/users", userRouter );
app.use( "/api/events", eventRouter );
app.use( "/api/favorites", favoriteRouter );
app.use( "/api/reviews", reviewRouter );


// Middleware para rutas no encontradas
app.use( ( req, res ) => {
     return res.status( 404 ).json( "Route not found" );
} );


app.listen( 3000, () => {
     console.log( `Server is running on: http://localhost:3000` );
     console.log( `API Documentation: http://localhost:3000/api-docs` );
     
     // Iniciar sincronización automática
     startAutoSync();
     console.log( `🤖 Sincronización automática activada (cada 6 horas)` );
} );

