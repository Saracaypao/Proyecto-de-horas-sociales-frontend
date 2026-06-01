import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller.js';

const router: Router = Router();
const controller = new DashboardController();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard summary and map markers
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Obtiene el resumen general del panel
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Resumen del dashboard
 */
router.get('/summary', controller.getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/map-markers:
 *   get:
 *     summary: Lista los marcadores del mapa
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Lista de marcadores del mapa
 */
router.get('/map-markers', controller.listMapMarkers);

export default router;