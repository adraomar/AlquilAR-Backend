
import fs from 'node:fs/promises';
import * as service from '../services/imagenes.service.js';

const limpiarArchivos = async (archivos = []) => {
    await Promise.all(
        archivos.map((archivo) =>
            fs.unlink(archivo.path).catch(() => {})
        )
    );
};

export const listar = async (req, res, next) => {
    try {
        const data = await service.listar(req.params.id);

        res.json({
            success: true,
            total: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const subir = async (req, res, next) => {
    try {
        const data = await service.subir(
            req.params.id,
            req.files
        );

        res.status(201).json({
            success: true,
            message: 'Imágenes cargadas correctamente',
            data
        });
    } catch (error) {
        await limpiarArchivos(req.files);
        next(error);
    }
};

export const cambiarPortada = async (req, res, next) => {
    try {
        const data = await service.cambiarPortada(
            req.params.id,
            req.params.idImagen
        );

        res.json({
            success: true,
            message: 'Portada actualizada correctamente',
            data
        });
    } catch (error) {
        next(error);
    }
};

export const eliminar = async (req, res, next) => {
    try {
        await service.eliminar(
            req.params.id,
            req.params.idImagen
        );

        res.json({
            success: true,
            message: 'Imagen eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};
