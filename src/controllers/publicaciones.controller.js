
import * as service from '../services/publicaciones.service.js';

export const listar = async (req, res, next) => {
    try {
        const data = await service.listar();

        res.json({
            success: true,
            total: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const obtener = async (req, res, next) => {
    try {
        const data = await service.obtener(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const crear = async (req, res, next) => {
    try {
        const data = await service.crear(req.body);

        res.status(201).json({
            success: true,
            message: 'Publicación creada correctamente',
            data
        });
    } catch (error) {
        next(error);
    }
};

export const actualizar = async (req, res, next) => {
    try {
        const data = await service.actualizar(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Publicación actualizada correctamente',
            data
        });
    } catch (error) {
        next(error);
    }
};

export const eliminar = async (req, res, next) => {
    try {
        await service.eliminar(req.params.id);

        res.json({
            success: true,
            message: 'Publicación finalizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

export const catalogo = async (req, res, next) => {
    try {
        const data = await service.catalogo();

        res.json({
            success: true,
            total: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};


export const detalleCatalogo = async (req, res, next) => {
    try {
        const data = await service.detalleCatalogo(
            req.params.id
        );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

