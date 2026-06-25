import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';
import '../../models/index.js';
import { errorHandler } from '../../middlewares/errorHandler.js';
import { notFoundHandler } from '../../middlewares/notFound.js';
import { hoursSocialsRouter } from '../../modules/hours-socials/index.js';
import { swaggerSpec } from './swagger.js';

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Horas Sociales API',
    docs: '/api-docs',
    health: '/api/health',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'horas-sociales-backend', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', hoursSocialsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
