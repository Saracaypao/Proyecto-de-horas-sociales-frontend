import { Router } from 'express';
import StudentsController from '../controllers/students.controller.js';
import { validateRequiredFields } from '../../../../middlewares/validateBody.js';

const router: Router = Router();
const controller = new StudentsController();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Students catalog and creation endpoints
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Lista de proyectos con preview de estudiantes (cards)
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda
 *       - in: query
 *         name: faculty
 *         schema:
 *           type: string
 *         description: Filtrar por facultad exacta
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *     responses:
 *       200:
 *         description: Lista de proyectos con preview de estudiantes (primeros 3)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectId:
 *                     type: integer
 *                   nombreProyecto:
 *                     type: string
 *                   ubicacionProyecto:
 *                     type: string
 *                   facultad:
 *                     type: string
 *                   miembrosEquipo:
 *                     type: integer
 *                   equipoPreview:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                         carnet:
 *                           type: string
 *                         carrera:
 *                           type: string
 *                         cargo:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           nullable: true
 *             example:
 *               - projectId: 12
 *                 nombreProyecto: "Alfabetización digital para comunidades rurales"
 *                 ubicacionProyecto: "Chalatenango"
 *                 facultad: "Educación"
 *                 miembrosEquipo: 5
 *                 equipoPreview:
 *                   - nombre: "Valeria Cruz"
 *                     carnet: "2020-1001"
 *                     carrera: "Sociología"
 *                     cargo: "Estudiante"
 *                     avatar: null
 *                     email: "valeria@example.com"
 *                   - nombre: "Diego Flores"
 *                     carnet: "2020-1002"
 *                     carrera: "Informática"
 *                     cargo: "Estudiante"
 *                     avatar: null
 *                     email: "diego@example.com"
 *                   - nombre: "Ana López"
 *                     carnet: "2020-1003"
 *                     carrera: "Educación"
 *                     cargo: "Estudiante"
 *                     avatar: null
 *                     email: "ana@example.com"
 *
 */
router.get('/', controller.listStudents);

/**
 * @swagger
 * /api/students/genero-municipio:
 *   get:
 *     summary: Distribución de hombres y mujeres en servicio social por municipio
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Lista de municipios con conteo de hombres y mujeres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   municipio:
 *                     type: string
 *                   hombres:
 *                     type: integer
 *                   mujeres:
 *                     type: integer
 *             example:
 *               - municipio: "San Salvador"
 *                 hombres: 12
 *                 mujeres: 15
 *               - municipio: "Santa Ana"
 *                 hombres: 5
 *                 mujeres: 8
 */
router.get('/genero-municipio', controller.getGenderByMunicipio);

export default router;