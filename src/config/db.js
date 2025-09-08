const mongoose = require( "mongoose" );

// const connectDB = async () => {
//      try {
//           await mongoose.connect( process.env.DB_URL );
//           console.log( "Conectado a la BBDD" );
//      } catch ( error ) {
//           console.log( "Error al conectar a la BBDD", error );
//      }
// };
const connectDB = async () => {
     try {
         await mongoose.connect(process.env.DB_URL, {
             serverSelectionTimeoutMS: 30000,
             socketTimeoutMS: 45000,
             connectTimeoutMS: 30000,
             maxPoolSize: 10
         });
         console.log("Conectado a la BBDD");
     } catch (error) {
         console.log("Error al conectar a la BBDD", error);
     }
 };

module.exports = { connectDB };
