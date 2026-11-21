
import { Router } from 'express';
import * as controller from '../controllers/imagenes.controller.js';
import { uploadImagenes } from '../config/multer.js';

const router = Router();

router.get('/:id/imagenes', controller.listar);

router.post(
    '/:id/imagenes',
    uploadImagenes.array('imagenes', 10),
    controller.subir
);

router.put(
    '/:id/imagenes/:idImagen/portada',
    controller.cambiarPortada
);

router.delete(
    '/:id/imagenes/:idImagen',
    controller.eliminar
);

export default router;
