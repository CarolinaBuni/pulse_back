# 🎵 Pulse - API de Eventos

Proyecto final del master - API REST para gestión de eventos musicales y culturales con sincronización automática desde Ticketmaster.

## Descripción

Una API completa que permite a los usuarios descubrir eventos, marcarlos como favoritos y escribir reseñas. Incluye sincronización automática con la API de Ticketmaster para mantener actualizada la base de datos.

### Funcionalidades principales
- Sistema de usuarios con autenticación JWT
- CRUD completo de eventos
- Sistema de favoritos personalizado  
- Reseñas y ratings
- Búsqueda con filtros
- Sincronización automática con Ticketmaster
- Documentación con Swagger

## Tecnologías utilizadas
- **Backend**: Node.js, Express.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT + bcrypt
- **APIs externas**: Ticketmaster, Cloudinary
- **Deploy**: Vercel

## Instalación

1. **Clonar el repo**
```bash
git clone https://github.com/CarolinaBuni/pulse_back
cd pulse_back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env`:
```env
DB_URL=mongodb://localhost:27017/pulse
JWT_SECRET=tu_secreto_jwt
CLOUD_NAME=tu_cloudinary
API_KEY=tu_cloudinary_key  
API_SECRET=tu_cloudinary_secret
TICKETMASTER_API_KEY=tu_ticketmaster_key
```

4. **Arrancar**
```bash
npm run dev  # desarrollo
npm start    # producción
```

## Documentación API

La documentación completa está disponible en:
- **Local**: `http://localhost:3000/api-docs`
- **Producción**: `http://localhost:3000/docs`

### Endpoints principales

#### Usuarios
```
POST /api/users/register  # Registro
POST /api/users/login     # Login
GET  /api/users/profile   # Perfil (auth)
PUT  /api/users/update    # Actualizar (auth)
```

#### Eventos  
```
GET    /api/events          # Listar eventos
GET    /api/events/:id      # Evento por ID
GET    /api/events/search   # Buscar eventos
POST   /api/events          # Crear (auth)
PUT    /api/events/:id      # Actualizar (auth)
DELETE /api/events/:id      # Eliminar (auth)
```

#### Favoritos
```
GET    /api/favorites              # Mis favoritos (auth)
POST   /api/favorites              # Añadir (auth)  
DELETE /api/favorites/:eventId     # Quitar (auth)
```

#### Reseñas
```
GET  /api/reviews/event/:eventId   # Reseñas de evento
POST /api/reviews                  # Crear reseña (auth)
PUT  /api/reviews/:id              # Actualizar (auth)
DELETE /api/reviews/:id            # Eliminar (auth)
```

## Estructura del proyecto

```
pulse-backend/
├── src/
│   ├── api/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/        # Modelos de MongoDB
│   │   └── routes/        # Rutas de la API
│   ├── config/            # Configuración DB y Swagger
│   ├── middlewares/       # Middleware de auth
│   └── utils/             # Scripts y utilidades
├── public/                # Swagger UI estático
├── index.js              # Punto de entrada
└── vercel.json           # Config para deploy
```

## Sincronización automática

Los eventos se sincronizan automáticamente cada 24 horas desde Ticketmaster. También se puede hacer manualmente:

```bash
curl -X POST http://localhost:3000/api/sync
```

## Deploy

El proyecto está desplegado en Vercel. La sincronización funciona en producción y se ejecuta automáticamente.

---

**Autor**: Carolina Buni  
**Email**: carolinabuni@gmail.com
