
import { Router } from 'express';
import * as controller from '../controllers/imagenes.controller.js';
import { uploadImagenes } from '../config/multer.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/roles.middleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(
    autenticar,
    autorizarRoles(
        ROLES.ADMIN_SISTEMA,
        ROLES.ADMIN_INMOBILIARIA
    )
);

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
