
import { Router } from 'express';
import * as controller from '../controllers/publicaciones.controller.js';

const router = Router();

router.get('/', controller.catalogo);
router.get('/:id', controller.detalleCatalogo);

export default router;
