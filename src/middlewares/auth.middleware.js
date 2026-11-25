import jwt from 'jsonwebtoken';
import * as UsuarioModel from '../models/usuario.model.js';

const autenticar = async (req, res, next) => {
    const authorization = req.headers.authorization;

    const coincidencia = authorization?.match(
        /^Bearer\s+(\S+)$/i
    );

    if (!coincidencia) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
        });
    }

    const token = coincidencia[1];

    if (!process.env.JWT_SECRET) {
        return next(
            new Error('JWT_SECRET no está configurado')
        );
    }

    try {
        // Verificar firma y expiración del token
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );

        const idUsuario = Number(payload.sub);

        if (
            !Number.isSafeInteger(idUsuario) ||
            idUsuario <= 0
        ) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Consultar el estado actual del usuario
        const usuario = await UsuarioModel.buscarPorId(
            idUsuario
        );

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuario.estado !== 'activo') {
            return res.status(403).json({
                success: false,
                message: 'La cuenta no está habilitada'
            });
        }

        // Obtener los roles vigentes en MySQL
        const roles =
            await UsuarioModel.obtenerRolesPorUsuario(
                idUsuario
            );

        if (roles.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene roles asignados'
            });
        }

        // Incorporar el usuario autenticado a la petición
        req.usuario = {
            ...usuario,
            roles
        };

        next();

    } catch (error) {

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'La sesión ha expirado'
            });
        }

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'NotBeforeError'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        next(error);
    }
};

export { autenticar };