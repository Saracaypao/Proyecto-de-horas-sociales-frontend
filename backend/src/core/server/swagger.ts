import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Horas Sociales API',
      version: '2.0.0',
      description: 'API para instituciones, proyectos, estudiantes y mapas de horas sociales.',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Desarrollo local' }],
  },
  apis: ['./src/modules/**/routes/index.ts'],
});
