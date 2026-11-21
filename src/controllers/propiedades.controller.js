
import * as service from '../services/propiedades.service.js';

export const listar = async (req, res, next) => {
    try {
        const propiedades = await service.listarPropiedades();

        res.status(200).json({
            success: true,
            total: propiedades.length,
            data: propiedades
        });
    } catch (error) {
        next(error);
    }
};

export const obtener = async (req, res, next) => {
    try {
        const propiedad = await service.buscarPropiedad(req.params.id);

        res.status(200).json({
            success: true,
            data: propiedad
        });
    } catch (error) {
        next(error);
    }
};

export const crear = async (req, res, next) => {
    try {
        const propiedad = await service.crearPropiedad(req.body);

        res.status(201).json({
            success: true,
            message: 'Propiedad creada correctamente',
            data: propiedad
        });
    } catch (error) {
        next(error);
    }
};

export const actualizar = async (req, res, next) => {
    try {
        const propiedad = await service.actualizarPropiedad(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: 'Propiedad actualizada correctamente',
            data: propiedad
        });
    } catch (error) {
        next(error);
    }
};

export const eliminar = async (req, res, next) => {
    try {
        await service.eliminarPropiedad(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Propiedad desactivada correctamente'
        });
    } catch (error) {
        next(error);
    }
};
