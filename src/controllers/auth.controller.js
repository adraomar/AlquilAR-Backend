import * as AuthService from '../services/auth.service.js';

export const registrar = async (req, res, next) => {
    try {
        const usuario = await AuthService.registrarUsuario(
            req.body || {}
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: usuario
        });

    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const resultado = await AuthService.iniciarSesion(
            req.body || {}
        );

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

export const obtenerSesion = (req, res) => {

    res.status(200).json({
        success: true,
        data: req.usuario
    });

};


export const actualizarPerfil = async (req, res, next) => {

    try {

        const usuario = await AuthService.actualizarPerfil(
            req.usuario.id_usuario,
            req.body || {}
        );

        return res.status(200).json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: usuario
        });

    } catch (error) {

        next(error);

    }
};

export const cambiarPassword = async (req, res, next) => {

    try {

        await AuthService.cambiarPassword(
            req.usuario.id_usuario,
            req.body || {}
        );

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {

        next(error);

    }
};
