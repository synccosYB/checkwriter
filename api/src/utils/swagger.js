import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Synccos Check-Writer API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:7777',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/controllers/*.js',
    './src/schemas/*.js',
    './src/controllers/*.ts',
    './src/schemas/*.ts',
  ],
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  // Serve Swagger UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve Swagger specification in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[info] Docs available at http://localhost:${port}/docs`);
  }
}
// testing
export default swaggerDocs;
