
import { Router } from 'express';
import * as controller from '../controllers/publicaciones.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);
router.get('/catalogo', controller.catalogo);
router.get('/catalogo/:id', controller.detalleCatalogo);

export default router;
