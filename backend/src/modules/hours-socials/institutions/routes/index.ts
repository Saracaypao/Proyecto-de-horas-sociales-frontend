import { Router } from 'express';
import InstitutionsController from '../controllers/institutions.controller.js';

const router: Router = Router();
const controller = new InstitutionsController();

/**
 * @swagger
 * tags:
 *   - name: Institutions
 *     description: Institutions catalog and detail endpoints
 */

/**
 * @swagger
 * /api/institutions:
 *   get:
 *     summary: Lista las instituciones
 *     tags: [Institutions]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Texto para buscar por nombre, sigla, ubicación, tipo o descripción
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Tipo de institución a filtrar
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [nombre-asc, nombre-desc]
 *         description: Orden alfabético del listado
 *     responses:
 *       200:
 *         description: Lista de instituciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   image:
 *                     type: string
 *                     nullable: true
 *                   nombre:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     nullable: true
 *                   ubicacion:
 *                     type: string
 *                   totalProyectosActivos:
 *                     type: integer
 *                   totalEstudiantesAsignados:
 *                     type: integer
 */
router.get('/', controller.listInstitutions);

/**
 * @swagger
 * /api/institutions/{id}:
 *   get:
 *     summary: Obtiene una institución por ID
 *     tags: [Institutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Institución encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 tipo:
 *                   type: string
 *                   nullable: true
 *                 nombre:
 *                   type: string
 *                 ubicacion:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 totalProyectosActivos:
 *                   type: integer
 *                 totalEstudiantesAsignados:
 *                   type: integer
 *                 totalCarrerasAplicables:
 *                   type: integer
 *                 proyectosGenerales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                     id:
 *                       type: integer
 *                     nombreInstitucion:
 *                       type: string
 *                       nombreProyecto:
 *                         type: string
 *                       estadoProyecto:
 *                         type: string
 *                       ubicacion:
 *                         type: string
 *                 proyectosActivos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                     id:
 *                       type: integer
 *                     nombreInstitucion:
 *                       type: string
 *                       nombreProyecto:
 *                         type: string
 *                       estadoProyecto:
 *                         type: string
 *                       ubicacion:
 *                         type: string
 *                 proyectosEnProgreso:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                     id:
 *                       type: integer
 *                     nombreInstitucion:
 *                       type: string
 *                       nombreProyecto:
 *                         type: string
 *                       estadoProyecto:
 *                         type: string
 *                         example: En progreso
 *                       ubicacion:
 *                         type: string
 *                 proyectosCerrados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                     id:
 *                       type: integer
 *                     nombreInstitucion:
 *                       type: string
 *                       nombreProyecto:
 *                         type: string
 *                       estadoProyecto:
 *                         type: string
 *                         example: Cerrado
 *                       ubicacion:
 *                         type: string
 *       404:
 *         description: Institución no encontrada
 */
router.get('/:id', controller.getInstitutionById);

export default router;