# 🎵 API Pulse

> API REST para gestión de eventos musicales y culturales con sincronización automática desde Ticketmaster

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción

**Pulse** es una API robusta para la gestión de eventos musicales y culturales que permite a los usuarios descubrir, marcar como favoritos y reseñar eventos. La aplicación incluye sincronización automática con la API de Ticketmaster para mantener actualizada la base de datos de eventos.

### ✨ Características Principales

- 🎪 **Gestión completa de eventos** con filtros avanzados
- 👤 **Sistema de usuarios** con autenticación JWT
- ⭐ **Sistema de favoritos** personalizado
- 📝 **Reseñas y ratings** para eventos
- 🔍 **Búsqueda inteligente** con scoring por relevancia
- 🔄 **Sincronización automática** con Ticketmaster API
- 📚 **Documentación interactiva** con Swagger UI
- 🎨 **Avatares personalizados** desde Cloudinary

## 🛠️ Tecnologías

### Backend Core
- **Node.js 18+** - Runtime de JavaScript
- **Express.js 5.x** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Autenticación y Seguridad
- **JWT (jsonwebtoken)** - Tokens de acceso
- **bcrypt** - Hashing de contraseñas
- **CORS** - Control de acceso entre dominios

### Servicios Externos
- **Ticketmaster API** - Fuente de eventos
- **Cloudinary** - Gestión de imágenes y avatares

### Documentación
- **Swagger UI** - Documentación interactiva
- **OpenAPI 3.0** - Especificación de la API

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- MongoDB corriendo localmente o en la nube
- Cuenta en Cloudinary
- API Key de Ticketmaster

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/CarolinaBuni/pulse_back/
cd pulse-back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos
DB_URL=mongodb://localhost:27017/pulse

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Cloudinary
CLOUD_NAME=tu_cloudinary_name
API_KEY=tu_cloudinary_api_key
API_SECRET=tu_cloudinary_api_secret

# Ticketmaster
TICKETMASTER_API_KEY=tu_ticketmaster_api_key
```

4. **Los eventos se cargan automáticamente**
```bash
# La sincronización con Ticketmaster se ejecuta automáticamente
# No necesitas scripts de seeding
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📖 Documentación de la API

### 🌐 Acceso a la documentación

- **Desarrollo**: `http://localhost:3000/api-docs`
- **Producción**: `http://localhost:3000/docs`

### 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para la autenticación. 

#### Obtener token de acceso:
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

#### Usar el token:
```http
Authorization: Bearer tu_jwt_token
```

### 📍 Endpoints Principales

#### **Usuarios**
```http
POST   /api/users/register     # Registrar usuario
POST   /api/users/login        # Iniciar sesión
GET    /api/users/profile      # Obtener perfil (autenticado)
PUT    /api/users/update       # Actualizar perfil (autenticado)
GET    /api/users              # Listar usuarios
```

#### **Eventos**
```http
GET    /api/events             # Listar eventos con filtros
GET    /api/events/:id         # Obtener evento por ID
GET    /api/events/search      # Búsqueda de eventos
GET    /api/events/city/:city  # Eventos por ciudad
POST   /api/events             # Crear evento (autenticado)
PUT    /api/events/:id         # Actualizar evento (autenticado)
DELETE /api/events/:id         # Eliminar evento (autenticado)
```

#### **Favoritos**
```http
GET    /api/favorites          # Mis favoritos (autenticado)
POST   /api/favorites          # Añadir favorito (autenticado)
DELETE /api/favorites/:eventId # Quitar favorito (autenticado)
GET    /api/favorites/check/:eventId # Verificar favorito (autenticado)
```

#### **Reseñas**
```http
GET    /api/reviews/event/:eventId # Reseñas de un evento 
GET    /api/reviews/user           # Mis reseñas (autenticado)
POST   /api/reviews                # Crear reseña (autenticado)
PUT    /api/reviews/:id            # Actualia reseña (autenticado)
DELETE /api/reviews/:id            # Eliminar reseña (autenticado)
```

#### **Sincronización**
```http
POST   /api/sync               # Sincronización manual de eventos
```

### 🔍 Filtros y Búsqueda

#### Filtros disponibles en `/api/events`:
- `category`    - Filtrar por categoría
- `genre`       - Filtrar por género
- `city`        - Filtrar por ciudad
- `startDate`   - Eventos desde fecha
- `endDate`     - Eventos hasta fecha
- `page`        - Número de página
- `limit`       - Eventos por página

#### Ejemplo de búsqueda:
```http
GET /api/events/search?q=concierto&city=Madrid&genre=Rock
```

## 🏗️ Estructura del Proyecto

```
pulse-backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/         # Modelos de Mongoose
│   │   └── routes/         # Definición de rutas
│   ├── config/
│   │   ├── db.js          # Configuración MongoDB
│   │   └── swagger.js     # Configuración Swagger
│   ├── middlewares/
│   │   └── authMiddleware.js # Middleware de autenticación
│   ├── utils/             # Utilidades y scripts
│   └── swagger.json       # Documentación OpenAPI
├── public/
│   └── swagger-ui.html    # UI estática de Swagger
├── data/                  # Archivos CSV para seeding
├── index.js              # Punto de entrada
├── package.json
└── vercel.json           # Configuración para deploy
```

## 🗄️ Modelos de Datos

### **User (Usuario)**
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  avatar: String (URL de Cloudinary),
  role: String (user/admin),
  preferences: [String] (géneros preferidos)
}
```

### **Event (Evento)**
```javascript
{
  ticketmasterId: String (opcional, único),
  name: String (required),
  description: String,
  startDate: Date (required),
  endDate: Date (required),
  venue: {
    name: String,
    address: String,
    city: String,
    capacity: Number
  },
  category: String,
  genre: String,
  price: { min: Number, max: Number },
  coordinates: { lat: Number, lng: Number },
  featured: Boolean,
  image: String (URL),
  status: String (onsale/offsale/cancelled)
}
```

### **Review (Reseña)**
```javascript
{
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  rating: Number (1-5),
  comment: String,
  date: Date
}
```

### **Favorite (Favorito)**
```javascript
{
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  createdAt: Date
}
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con nodemon

# Producción
npm start            # Servidor en producción
```

## 🔄 Sincronización de Eventos

La API incluye un sistema automático de sincronización con Ticketmaster:

### **Automática**
- Se ejecuta cada **6 horas**
- Actualiza eventos existentes si hay cambios
- Añade nuevos eventos automáticamente

### **Manual**
```http
POST /api/sync
```

### **Configuración**
La sincronización se configura en `src/utils/scheduler.js` y puede ajustarse según necesidades.

## 🌐 Deploy en Vercel

El proyecto está configurado para deploy automático en Vercel:

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** en el dashboard
3. **Deploy automático** en cada push a main

La configuración está en `vercel.json`.

## 🧪 Testing

La sincronización funciona automáticamente. Si necesitas forzar una sincronización manual:

```bash
curl -X POST http://localhost:3000/api/sync
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Carolina Buni** - [carolinabuni@gmail.com](mailto:carolinabuni@gmail.com)


⭐ **¡Dale una estrella al proyecto si te ha sido útil!**




