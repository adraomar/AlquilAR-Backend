
import { Router } from 'express';

import * as AuthController from '../controllers/auth.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/registro', AuthController.registrar);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/me', autenticar, AuthController.obtenerSesion);
router.patch('/me', autenticar, AuthController.actualizarPerfil);
router.patch('/me/password', autenticar, AuthController.cambiarPassword);

export default router;
