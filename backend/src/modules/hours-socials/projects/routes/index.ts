import { Router } from 'express';
import ProjectsController from '../controllers/projects.controller.js';
import { validateRequiredFields } from '../../../../middlewares/validateBody.js';
const router: Router = Router();
const controller = new ProjectsController();

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Projects catalog, detail and enrollments
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Lista los proyectos
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre del proyecto
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Activo, En progreso, Cerrado]
 *         description: Estado del proyecto a filtrar
 *       - in: query
 *         name: location
 *         required: false
 *         schema:
 *           type: string
 *         description: Ubicación a filtrar por texto o por punto seleccionado en el mapa
 *       - in: query
 *         name: faculty
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Todas las facultades, Arquitectura e Ingeniería, Ciencias sociales y humanidades, Comunicación y mercadeo, Derecho, Diseño, Educación, Administración]
 *         description: Facultad para filtrar proyectos
 *       - in: query
 *         name: institutionId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de institución para filtrar
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   status:
 *                     type: string
 *                     example: Activo
 *                   institution:
 *                     type: string
 *                     description: Nombre de la institución
 *                   ubicacion:
 *                     type: string
 *                   carreras:
 *                     type: array
 *                     items:
 *                       type: string
 *                   facultad:
 *                     type: string
 *                   estudiantes:
 *                     type: array
 *                     items:
 *                       type: object
 *                   personas:
 *                     type: integer
 *                     description: Cantidad total de estudiantes asignados al proyecto
 *                   cuposOcupados:
 *                     type: integer
 *                   cuposTotales:
 *                     type: integer
 *                     nullable: true
 *                   cuposTexto:
 *                     type: string
 *                     example: 3 de 5
 *                   fechaInicio:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   fechaCierre:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *   post:
 *     summary: Crea un proyecto
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: El campo id del proyecto se autogenera si no se envía.
 *             required: [institutionName, institutionType, institutionLocation, institutionDescription, institutionImage, facultad, carreras, titulo, ubicacion, fechaInicio, fechaCierre, cupos, descripcion, image]
 *             properties:
 *               institutionName:
 *                 type: string
 *               institutionType:
 *                 type: string
 *               institutionLocation:
 *                 type: string
 *               institutionDescription:
 *                 type: string
 *               institutionImage:
 *                 type: string
 *               facultad:
 *                 type: string
 *               carreras:
 *                 type: array
 *                 items:
 *                   type: string
 *               titulo:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaCierre:
 *                 type: string
 *                 format: date
 *               cupos:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               image:
 *                 type: string
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [nombre, carnet, email]
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     carnet:
 *                       type: string
 *                     carrera:
 *                       type: string
 *                     genero:
 *                       type: string
 *                       enum: [Masculino, Femenino]
 *                     email:
 *                       type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
router.get('/', controller.listProjects);

/**
 * @swagger
 * /api/projects/map:
 *   get:
 *     summary: Obtiene los proyectos para la vista del mapa
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Proyectos para el mapa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   institution:
 *                     type: string
 *                   status:
 *                     type: string
 *                     example: Activo
 *                   nombre:
 *                     type: string
 *                   ubicacion:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   hombres:
 *                     type: integer
 *                   mujeres:
 *                     type: integer
 */
router.get('/map', controller.listProjectsForMap);
router.post(
	'/',
	validateRequiredFields([
		'institutionName',
		'institutionType',
		'institutionLocation',
		'institutionDescription',
		'institutionImage',
		'facultad',
		'carreras',
		'titulo',
		'ubicacion',
		'fechaInicio',
		'fechaCierre',
		'cupos',
		'descripcion',
		'image',
	]),
	controller.createProject
);
/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtiene un proyecto por ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                   description: Nombre del proyecto
 *                 imagen:
 *                   type: string
 *                   nullable: true
 *                 status:
 *                   type: string
 *                   example: En progreso
 *                 institution:
 *                   type: string
 *                   description: Nombre de la institución
 *                 ubicacion:
 *                   type: string
 *                 fechaInicio:
 *                   type: string
 *                   format: date
 *                   nullable: true
 *                 fechaCierre:
 *                   type: string
 *                   format: date
 *                   nullable: true
 *                 descripcion:
 *                   type: string
 *                 equipo:
 *                   type: array
 *                   description: Nombres de estudiantes asignados al proyecto
 *                   items:
 *                     type: string
 *                 estudiantesAsignados:
 *                   type: integer
 *                   description: Cantidad total de estudiantes asignados al proyecto
 *                 estudiantes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                       carnet:
 *                         type: string
 *                       carrera:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                       genero:
 *                         type: string
 *                         enum: [Masculino, Femenino]
 *                         nullable: true
 *                       email:
 *                         type: string
 *                         nullable: true
 *                 cuposOcupados:
 *                   type: integer
 *                 cuposTotales:
 *                   type: integer
 *                   nullable: true
 *                 cuposTexto:
 *                   type: string
 *                   example: 3 de 5
 *                 carreras:
 *                   type: array
 *                   items:
 *                     type: string
 *                 facultad:
 *                   type: string
 *                 hombres:
 *                   type: integer
 *                   description: Total de hombres del proyecto, calculado desde la vista del mapa
 *                 mujeres:
 *                   type: integer
 *                   description: Total de mujeres del proyecto, calculado desde la vista del mapa
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', controller.getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualiza un proyecto existente
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               resumen:
 *                 type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaCierre:
 *                 type: string
 *                 format: date
 *               cupos:
 *                 type: integer
 *               facultad:
 *                 type: string
 *               carreras:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               projectImage:
 *                 type: string
 *               institutionName:
 *                 type: string
 *               institutionType:
 *                 type: string
 *               institutionLocation:
 *                 type: string
 *               institutionDescription:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Activo, En progreso, Cerrado, En planificación, En convocatoria]
 *               status:
 *                 type: string
 *                 enum: [Activo, En progreso, Cerrado]
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', controller.updateProject);

/**
 * @swagger
 * /api/projects/{id}/enrollments:
 *   get:
 *     summary: Lista las inscripciones de un proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inscripciones del proyecto
 */
router.get('/:id/enrollments', controller.listProjectEnrollments);

/**
 * @swagger
 * /api/projects/{id}/enrollments:
 *   post:
 *     summary: Inscribe un estudiante en un proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, carnet, carrera]
 *             properties:
 *               nombre:
 *                 type: string
 *               carnet:
 *                 type: string
 *               carrera:
 *                 type: string
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Femenino]
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inscripción creada. Devuelve el proyecto actualizado y el nuevo estudiante inscrito.
 */
router.post('/:id/enrollments', validateRequiredFields(['nombre', 'carnet', 'carrera']), controller.enrollStudentInProject);

export default router;