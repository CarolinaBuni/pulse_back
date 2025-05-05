require( "dotenv" ).config();
const { connectDB } = require( "./src/config/db" );
const cloudinary = require( "cloudinary" ).v2;
const express = require( "express" );
const cors = require('cors');
const passport = require('./src/config/passport');
const swagger = require('./src/config/swagger');
const userRouter = require( "./src/api/routes/user" );
const eventRouter = require( "./src/api/routes/event" );
const favoriteRouter = require( "./src/api/routes/favorite" );
const reviewRouter = require('./src/api/routes/review');
const authRouter = require('./src/api/routes/auth');
const recommendationRouter = require('./src/api/routes/recommendation');
const app = express();

connectDB();

// Configuración de Cloudinary
cloudinary.config( {
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
} );

// Habilitar CORS
app.use(cors());

app.use( express.json() );

// Inicializar Passport
app.use(passport.initialize());

// Configurar Swagger
swagger.setup(app);

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de Pulse',
        documentation: '/api-docs',
        endpoints: {
            users: '/api/users',
            events: '/api/events',
            favorites: '/api/favorites',
            reviews: '/api/reviews',
            auth: '/api/auth',
            recommendations: '/api/recommendations'
        }
    });
});

// Rutas API
app.use( "/api/users", userRouter );
app.use( "/api/events", eventRouter );
app.use("/api/favorites", favoriteRouter);
app.use("/api/reviews", reviewRouter);
app.use('/api/auth', authRouter);
app.use('/api/recommendations', recommendationRouter);

// Middleware para rutas no encontradas
app.use( ( req, res ) => {
     return res.status( 404 ).json( "Route not found" );
} );

const PORT = process.env.PORT || 3000;
app.listen( PORT, () => {
     console.log( `Server is running on port: ${PORT}` );
     console.log( `API Documentation: /api-docs` );
} );

