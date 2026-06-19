import { Router } from 'express';
import dashboardRouter from './dashboard/routes/index.js';
import institutionsRouter from './institutions/routes/index.js';
import projectsRouter from './projects/routes/index.js';
import studentsRouter from './students/routes/index.js';

export const hoursSocialsRouter = Router();

hoursSocialsRouter.use('/dashboard', dashboardRouter);
hoursSocialsRouter.use('/institutions', institutionsRouter);
hoursSocialsRouter.use('/projects', projectsRouter);
hoursSocialsRouter.use('/students', studentsRouter);
