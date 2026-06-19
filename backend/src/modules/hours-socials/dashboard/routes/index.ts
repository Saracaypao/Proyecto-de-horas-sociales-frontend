import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller.js';

const router: Router = Router();
const controller = new DashboardController();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Resumen general, marcadores del mapa y métricas analíticas
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Resumen general del dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Totales, tendencia y género
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInstitutions:
 *                   type: integer
 *                 totalProjects:
 *                   type: integer
 *                 totalActiveEnrollments:
 *                   type: integer
 *                 totalMarkers:
 *                   type: integer
 *                 totalStudentsExternal:
 *                   type: integer
 *                 genderSummary:
 *                   type: object
 *                   properties:
 *                     hombres:
 *                       type: integer
 *                     mujeres:
 *                       type: integer
 *                 trendByYear:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       anio:
 *                         type: string
 *                       estudiantes:
 *                         type: integer
 *                       proyectos:
 *                         type: integer
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
 *         description: Lista de marcadores
 */
router.get('/map-markers', controller.listMapMarkers);

/**
 * @swagger
 * /api/dashboard/carrera-anio:
 *   get:
 *     summary: Alumnos en horas sociales por carrera y año
 *     tags: [Dashboard]
 *     description: >
 *       Devuelve un array donde cada objeto tiene la carrera y un campo
 *       numérico por cada año (ej. '2024': 22). Solo incluye inscripciones activas.
 *     responses:
 *       200:
 *         description: Array de objetos con carrera y conteo por año
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   carrera:
 *                     type: string
 *                     example: Ingeniería en Sistemas
 *             example:
 *               - carrera: Ingeniería en Sistemas
 *                 '2024': 22
 *                 '2023': 16
 */
router.get('/carrera-anio', controller.getStudentsByCarreraAndYear);

/**
 * @swagger
 * /api/dashboard/genero:
 *   get:
 *     summary: Distribución por género de estudiantes en servicio social externo
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Conteo de hombres y mujeres (basado en campo genero de students)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hombres:
 *                   type: integer
 *                 mujeres:
 *                   type: integer
 */
router.get('/genero', controller.getGenderSummary);

/**
 * @swagger
 * /api/dashboard/tendencia-anual:
 *   get:
 *     summary: Tendencia anual de estudiantes externos y proyectos
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Evolución histórica por año de inscripciones activas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   anio:
 *                     type: string
 *                     example: '2024'
 *                   estudiantes:
 *                     type: integer
 *                   proyectos:
 *                     type: integer
 */
router.get('/tendencia-anual', controller.getTrendByYear);

/**
 * @swagger
 * /api/dashboard/estudiantes-municipio:
 *   get:
 *     summary: Número de estudiantes en servicio social por municipio
 *     tags: [Dashboard]
 *     description: Distribución de estudiantes activos según el municipio (ubicacion) del proyecto
 *     responses:
 *       200:
 *         description: Lista de municipios con su conteo de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   municipio:
 *                     type: string
 *                   estudiantes:
 *                     type: integer
 */
router.get('/estudiantes-municipio', controller.getStudentsByMunicipio);

/**
 * @swagger
 * /api/dashboard/proyectos-municipio:
 *   get:
 *     summary: Total de proyectos versus activos por municipio
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Lista de municipios con total de proyectos y cuántos están activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   municipio:
 *                     type: string
 *                   proyectos:
 *                     type: integer
 *                   activos:
 *                     type: integer
 */
router.get('/proyectos-municipio', controller.getProjectsByMunicipio);

/**
 * @swagger
 * /api/dashboard/metricas-institucion:
 *   get:
 *     summary: Métricas de proyectos activos, en progreso y cerrados por institución
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Comparativa de estados de proyectos por institución aliada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     nullable: true
 *                   ubicacion:
 *                     type: string
 *                   total:
 *                     type: integer
 *                   activos:
 *                     type: integer
 *                   progreso:
 *                     type: integer
 *                   cerrados:
 *                     type: integer
 *                   estudiantes:
 *                     type: integer
 *                   facultades:
 *                     type: integer
 */
router.get('/metricas-institucion', controller.getProjectMetricsByInstitution);

/**
 * @swagger
 * /api/dashboard/tabla-institucion:
 *   get:
 *     summary: Tabla detallada por institución con estudiantes externos y facultades
 *     tags: [Dashboard]
 *     description: >
 *       Igual que metricas-institucion pero con nombreFull (nombre completo)
 *       y nombre (abreviado) separados, y tipo normalizado a Pública/Privada.
 *     responses:
 *       200:
 *         description: Datos listos para renderizar la tabla del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombreFull:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     enum: [Pública, Privada]
 *                   ubicacion:
 *                     type: string
 *                   total:
 *                     type: integer
 *                   activos:
 *                     type: integer
 *                   progreso:
 *                     type: integer
 *                   cerrados:
 *                     type: integer
 *                   estudiantes:
 *                     type: integer
 *                   facultades:
 *                     type: integer
 */
router.get('/tabla-institucion', controller.getInstitutionDetailTable);

export default router;