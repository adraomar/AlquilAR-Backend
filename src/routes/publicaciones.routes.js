
import { Router } from 'express';
import * as controller from '../controllers/publicaciones.controller.js';

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

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
