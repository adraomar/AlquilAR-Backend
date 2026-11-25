const autorizarRoles = (...rolesPermitidos) => {

    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const tienePermiso = req.usuario.roles.some(
            rol => rolesPermitidos.includes(rol)
        );

        if (!tienePermiso) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para realizar esta operación'
            });
        }

        next();
    };
};

export { autorizarRoles };