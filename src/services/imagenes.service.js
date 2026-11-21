
import fs from 'node:fs/promises';
import path from 'node:path';

import * as imagenesModel from '../models/imagenes.model.js';
import * as propiedadesModel from '../models/propiedades.model.js';
import { uploadsDir } from '../config/multer.js';

const errorHttp = (mensaje, status = 400) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

const validarId = (valor) => {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw errorHttp('Identificador inválido');
    }

    return id;
};

const verificarPropiedad = async (idPropiedad) => {
    const propiedad = await propiedadesModel.obtenerPorId(idPropiedad);

    if (!propiedad || propiedad.estado !== 'activa') {
        throw errorHttp('Propiedad no encontrada o inactiva', 404);
    }

    return propiedad;
};

export const listar = async (id) => {
    const idPropiedad = validarId(id);
    await verificarPropiedad(idPropiedad);

    return imagenesModel.obtenerPorPropiedad(idPropiedad);
};

export const subir = async (id, archivos) => {
    const idPropiedad = validarId(id);

    if (!archivos?.length) {
        throw errorHttp('Debe seleccionar al menos una imagen');
    }

    await verificarPropiedad(idPropiedad);

    const existentes = await imagenesModel.contarPorPropiedad(idPropiedad);

    if (existentes + archivos.length > 10) {
        throw errorHttp('Máximo 10 imágenes por propiedad');
    }

    const creadas = [];

    try {
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];

            const idImagen = await imagenesModel.crear({
                id_propiedad: idPropiedad,
                ruta_archivo: `/uploads/propiedades/${archivo.filename}`,
                nombre_original: archivo.originalname,
                es_portada: false,
                orden: existentes + i
            });

            creadas.push(idImagen);
        }

        if (existentes === 0 && creadas.length > 0) {
            await imagenesModel.establecerPortada(
                idPropiedad,
                creadas[0]
            );
        }

        return imagenesModel.obtenerPorPropiedad(idPropiedad);
    } catch (error) {
        for (const idImagen of creadas) {
            await imagenesModel.eliminar(idImagen).catch(() => {});
        }

        throw error;
    }
};

export const cambiarPortada = async (idPropiedad, idImagen) => {
    const propiedadId = validarId(idPropiedad);
    const imagenId = validarId(idImagen);

    await verificarPropiedad(propiedadId);

    const imagen = await imagenesModel.obtenerPorId(imagenId);

    if (!imagen || imagen.id_propiedad !== propiedadId) {
        throw errorHttp('Imagen no encontrada', 404);
    }

    await imagenesModel.establecerPortada(propiedadId, imagenId);

    return imagenesModel.obtenerPorPropiedad(propiedadId);
};

export const eliminar = async (idPropiedad, idImagen) => {
    const propiedadId = validarId(idPropiedad);
    const imagenId = validarId(idImagen);

    await verificarPropiedad(propiedadId);

    const imagen = await imagenesModel.obtenerPorId(imagenId);

    if (!imagen || imagen.id_propiedad !== propiedadId) {
        throw errorHttp('Imagen no encontrada', 404);
    }

    await imagenesModel.eliminar(imagenId);

    const nombreArchivo = path.basename(imagen.ruta_archivo);
    const rutaFisica = path.join(uploadsDir, nombreArchivo);

    await fs.unlink(rutaFisica).catch((error) => {
        if (error.code !== 'ENOENT') {
            console.error('Error eliminando archivo:', error.message);
        }
    });

    if (imagen.es_portada) {
        const restantes = await imagenesModel.obtenerPorPropiedad(
            propiedadId
        );

        if (restantes.length > 0) {
            await imagenesModel.establecerPortada(
                propiedadId,
                restantes[0].id_imagen
            );
        }
    }

    return true;
};
