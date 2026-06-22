import { Router } from 'express';
import { loginController, registerController } from '../controllers/auth.controller.js';

const authRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registro e inicio de sesión de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, correo, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan@uni.edu.sv
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secreto123
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 apellido:
 *                   type: string
 *                 correo:
 *                   type: string
 *       400:
 *         description: Datos inválidos o correo ya registrado
 */
authRouter.post('/register', registerController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, password]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan@uni.edu.sv
 *               password:
 *                 type: string
 *                 example: secreto123
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 apellido:
 *                   type: string
 *                 correo:
 *                   type: string
 *       400:
 *         description: Correo o contraseña incorrectos
 */
authRouter.post('/login', loginController);

export default authRouter;