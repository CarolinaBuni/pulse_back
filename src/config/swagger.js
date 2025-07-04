const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Opciones de personalización de Swagger UI 
const options = {
  explorer: true,
  customCss: `
    /* TEMA OSCURO iNSPIRADO EN CODEPEN Y GITHUB */
    
    /* Estilos Generales */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a12;
      color: #ffffff;
      margin: 0;
    }
    
    /* Ocultar logo y texto de Swagger */
    .swagger-ui .topbar {
      background: linear-gradient(90deg, #0b0b13, #1a1a2e);
      border-bottom: 2px solid #ff006e;
      height: 60px;
      box-shadow: 0 4px 20px rgba(255, 0, 110, 0.3);
    }
    
    /* Ocultar "swagger" en la barra superior */
    .swagger-ui .topbar .wrapper, 
    .swagger-ui .topbar a, 
    .swagger-ui .topbar img {
      display: none !important;
    }

    /* Reemplazar con el nombre de la API */
    .swagger-ui .topbar::before {
      content: "API PULSE";
      position: absolute;
      left: 40px;
      top: 17px;
      color: #ff006e;
      font-weight: 800;
      font-size: 24px;
      text-shadow: 0 0 10px rgba(255, 0, 110, 0.7);
    }
    
    /* Fondo Principal y contenido */
    .swagger-ui {
      background-color: #0a0a12;
    }
    
    /* Título de la API */
    .swagger-ui .info {
      margin: 30px 0;
    }
    
    .swagger-ui .info .title {
      color: #ffffff;
      font-size: 36px;
      font-weight: 700;
      text-align: center;
      text-shadow: 0 0 10px rgba(255, 0, 110, 0.7);
      border-bottom: none;
    }
    
    .swagger-ui .info .title small.version-stamp {
      background-color: #ff006e;
      text-shadow: none;
      border-radius: 20px;
      padding: 5px 15px;
    }
    
    .swagger-ui .info .description {
      color: #ffffff;
      text-align: center;
    }
    
    /* Hacer la sección servers oscura */
    .swagger-ui .servers {
      background-color: #0d0d17;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #222;
    }
    
    .swagger-ui .servers-title {
      color: #ff006e;
      font-weight: 600;
    }
    
    .swagger-ui .servers > label {
      color: #ffffff;
    }
    
    .swagger-ui .servers > label select {
      background-color: #1a1a2e;
      color: #ffffff;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    
    /* Secciones y Tags */
    .swagger-ui .opblock-tag {
      font-size: 24px;
      color: #ffffff;
      margin: 25px 0 15px 0;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }
    
    .swagger-ui .opblock-tag:hover {
      transform: translateX(5px);
      color: #ff006e;
      border-bottom: 1px solid #ff006e;
      background-color: transparent;
    }
    
    .swagger-ui .opblock-tag::before {
      content: "✦";
      margin-right: 10px;
      color: #ff006e;
    }
    
    /* Endpoints - Estilos Generales */
    .swagger-ui .opblock {
      margin: 0 0 15px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      background-color: #12121f;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .swagger-ui .opblock:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }
    
    .swagger-ui .opblock .opblock-summary {
      padding: 10px;
      border: none;
    }
    
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 30px;
      min-width: 80px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    
    .swagger-ui .opblock-summary-description {
      font-weight: 500;
      color: #ffffff;
      font-size: 16px;
    }
    
    /* Endpoints GET - Azul Neón */
    .swagger-ui .opblock.opblock-get {
      background-color: rgba(3, 37, 82, 0.5);
      border-left: 5px solid #3498db;
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
    }
    
    .swagger-ui .opblock.opblock-get:hover .opblock-summary-method {
      box-shadow: 0 0 15px #3498db;
    }
    
    /* Endpoints POST - Verde Neón */
    .swagger-ui .opblock.opblock-post {
      background-color: rgba(24, 82, 66, 0.5);
      border-left: 5px solid #2ecc71;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
    }
    
    .swagger-ui .opblock.opblock-post:hover .opblock-summary-method {
      box-shadow: 0 0 15px #2ecc71;
    }
    
    /* Endpoints PUT - Naranja Neón */
    .swagger-ui .opblock.opblock-put {
      background-color: rgba(82, 51, 3, 0.5);
      border-left: 5px solid #f39c12;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: linear-gradient(135deg, #f39c12, #e67e22);
      color: white;
    }
    
    .swagger-ui .opblock.opblock-put:hover .opblock-summary-method {
      box-shadow: 0 0 15px #f39c12;
    }
    
    /* Endpoints DELETE - Rojo Neón */
    .swagger-ui .opblock.opblock-delete {
      background-color: rgba(82, 3, 25, 0.5);
      border-left: 5px solid #e74c3c;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
    }
    
    .swagger-ui .opblock.opblock-delete:hover .opblock-summary-method {
      box-shadow: 0 0 15px #e74c3c;
    }
    
    /* Mejorar contraste en el contenido de los Endpoints */
    .swagger-ui .opblock-body {
      background-color: #12121f;
      margin: 0;
      padding: 15px;
    }
    
    .swagger-ui .opblock-body pre {
      background-color: #0d0d17;
      color: #f0f0f0;
      border-radius: 6px;
    }
    
    .swagger-ui .parameters-container {
      background-color: #12121f;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .swagger-ui .parameters-container .parameters-col_description {
      color: #ffffff;
    }

    .swagger-ui .parameters-container .parameter__name {
      color: #ff006e;
      font-weight: 600;
    }
    
    /* Elementos de los formularios */
    .swagger-ui .parameter__in, 
    .swagger-ui .parameter__type, 
    .swagger-ui .parameter__deprecated,
    .swagger-ui table thead tr th,
    .swagger-ui table thead tr td,
    .swagger-ui .response-col_status {
      color: #ffffff !important;
    }
    
    /* Botones */
    .swagger-ui .btn {
      border-radius: 30px;
      padding: 10px 20px;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      border: none;
    }
    
    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #f72585, #b5179e);
      color: white;
    }
    
    .swagger-ui .btn.execute:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(247, 37, 133, 0.6);
    }
    
    .swagger-ui .btn.authorize {
      background: linear-gradient(135deg, #4895ef, #4361ee);
      color: white;
    }
    
    .swagger-ui .btn.authorize:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(72, 149, 239, 0.6);
    }
    
    /* Esquemas y Modelos */
    .swagger-ui .model-title,
    .swagger-ui .models-control,
    .swagger-ui .models h4 {
      color: #ffffff;
    }
    
    .swagger-ui .model-container {
      background-color: #12121f;
      border-radius: 6px;
      padding: 10px;
    }
    
    .swagger-ui .model {
      color: #ffffff;
    }
    
    .swagger-ui .model-toggle:after {
      background-color: #ff006e;
    }
    
    /* Campos de entrada */
    .swagger-ui input[type=text],
    .swagger-ui input[type=password],
    .swagger-ui textarea {
      background-color: #1a1a2e;
      color: white;
      border: 1px solid #444;
      border-radius: 4px;
    }
    
    /* Modal */
    .swagger-ui .dialog-ux .modal-ux {
      background-color: #12121f;
      border: 1px solid #333;
      border-radius: 8px;
    }
    
    .swagger-ui .dialog-ux .modal-ux-header h3 {
      color: #fff;
    }
    
    .swagger-ui .dialog-ux .modal-ux-content {
      color: #ffffff;
    }
    
    /* Respuestas */
    .swagger-ui .responses-inner {
      background-color: #12121f;
    }
    
    .swagger-ui .response-col_status {
      color: #ff006e;
      font-weight: 700;
    }
    
    .swagger-ui table {
      border-radius: 6px;
      overflow: hidden;
    }
    
    .swagger-ui table thead tr {
      background-color: #12121f;
    }
    
    .swagger-ui table thead tr td,
    .swagger-ui table thead tr th {
      border-bottom: 2px solid #333;
    }
    
    .swagger-ui table tbody tr td {
      color: #ffffff;
      border-bottom: 1px solid #333;
    }
    
    /* Códigos de respuesta */
    .swagger-ui .response-col_status .response-undocumented {
      color: #ffffff;
    }
    
    .swagger-ui .opblock-body .opblock-section .table-container {
      background-color: #12121f;
    }
    
    /* Personalización del Scrollbar */
    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    
    ::-webkit-scrollbar-track {
      background: #0d0d17;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #ff006e;
      border-radius: 6px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #f72585;
    }
    
    /* Mejorando el authorize button */
    .swagger-ui .auth-wrapper {
      display: flex;
      justify-content: center;
      margin: 15px 0;
    }
    
    .swagger-ui .auth-container {
      background-color: #12121f;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 15px;
    }
    
    .swagger-ui .auth-container h3 {
      color: #ffffff;
    }
    
    /* Arreglar el botón de Authorize que se ve mal en el header */
    .swagger-ui .auth-btn-wrapper {
      position: absolute;
      right: 20px;
      top: 15px;
    }
    
    /* Arreglar los bordes para que sean coherentes con el tema oscuro */
    .swagger-ui section.models {
      border: 1px solid #333;
      background: #0d0d17;
    }
    
    .swagger-ui section.models .model-container {
      background: #12121f;
    }
    
    .swagger-ui .opblock-tag:focus,
    .swagger-ui .opblock:focus,
    .swagger-ui .opblock-summary:focus {
      outline: none;
    }

    .swagger-ui .scheme-container {
      background-color: #12121f;
    }

    .swagger-ui .opblock .opblock-section-header {
      background-color: #0a0a12;
    }
  `,
  swaggerOptions: {
    tagsSorter: function(a, b) {
      // Orden personalizado de recursos
      const tagsOrder = ['Eventos', 'Usuarios', 'Reseñas', 'Favoritos'];
      return tagsOrder.indexOf(a) - tagsOrder.indexOf(b);
    },
    operationsSorter: function(a, b) {
      const methodOrder = ['get', 'post', 'put', 'delete'];
      const aIndex = methodOrder.indexOf(a.get('method').toLowerCase());
      const bIndex = methodOrder.indexOf(b.get('method').toLowerCase());
      return aIndex - bIndex;
    },
    docExpansion: 'list', // Secciones cerradas inicialmente
    defaultModelsExpandDepth: 0 // Oculta los modelos por defecto
  }
};

module.exports = {
  setup: (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  }
};