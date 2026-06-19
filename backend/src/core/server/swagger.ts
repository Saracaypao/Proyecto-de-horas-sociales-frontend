import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Horas Sociales API',
      version: '2.0.0',
      description: 'API para instituciones, proyectos, estudiantes y mapas de horas sociales.',
    },
    servers: [{ url: 'https://proyecto-de-horas-sociales-frontend.onrender.com', description: 'Desarrollo local' }],
  },
  apis: ['./src/modules/**/routes/index.ts'],
});
