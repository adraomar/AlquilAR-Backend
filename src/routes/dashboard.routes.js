
import { Router } from 'express';
import * as controller from '../controllers/dashboard.controller.js';

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

router.get('/resumen', controller.obtenerResumen);

export default router;
