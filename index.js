require( "dotenv" ).config();
const { connectDB } = require( "./src/config/db" );
const cloudinary = require( "cloudinary" ).v2;
const express = require( "express" );
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

app.use( express.json() );

// Inicializar Passport
app.use(passport.initialize());

// Configurar Swagger
swagger.setup(app);

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


app.listen( 3000, () => {
     console.log( `Server is running on: http://localhost:3000` );
     console.log( `API Documentation: http://localhost:3000/api-docs` );
} );

