
import * as model from '../models/publicaciones.model.js';
import * as propiedadesModel from '../models/propiedades.model.js';

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

const validarDatos = async (datos, excluirId = 0) => {
    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        throw errorHttp('Datos de publicación inválidos');
    }

    const idPropiedad = validarId(datos.id_propiedad);

    const propiedad = await propiedadesModel.obtenerPorId(idPropiedad);

    if (!propiedad || propiedad.estado !== 'activa') {
        throw errorHttp('La propiedad no existe o está inactiva', 404);
    }

    if (!['venta', 'alquiler'].includes(datos.tipo_operacion)) {
        throw errorHttp('Tipo de operación inválido');
    }

    if (typeof datos.precio !== 'number' ||
        !Number.isFinite(datos.precio) ||
        datos.precio <= 0) {
        throw errorHttp('El precio debe ser mayor a cero');
    }

    const moneda = datos.moneda ?? 'ARS';
    const estado = datos.estado ?? 'borrador';

    if (!['ARS', 'USD'].includes(moneda)) {
        throw errorHttp('Moneda inválida');
    }

    if (![
        'borrador', 'publicada', 'pausada', 'finalizada'
    ].includes(estado)) {
        throw errorHttp('Estado inválido');
    }

    if (estado !== 'finalizada') {
        const existente = await model.obtenerActivaPorPropiedad(
            idPropiedad, excluirId
        );

        if (existente) {
            throw errorHttp(
                'La propiedad ya tiene una publicación vigente',
                409
            );
        }
    }

    return {
        id_propiedad: idPropiedad,
        tipo_operacion: datos.tipo_operacion,
        precio: datos.precio,
        moneda,
        estado,
        fecha_publicacion: estado === 'publicada'
            ? new Date()
            : null
    };
};

export const listar = () => model.obtenerTodas();

export const obtener = async (id) => {
    const publicacion = await model.obtenerPorId(validarId(id));

    if (!publicacion) {
        throw errorHttp('Publicación no encontrada', 404);
    }

    return publicacion;
};

export const crear = async (datos) => {
    const validado = await validarDatos(datos);
    const id = await model.crear(validado);

    return model.obtenerPorId(id);
};

export const actualizar = async (id, datos) => {
    const publicacionId = validarId(id);
    const actual = await obtener(publicacionId);

    if (actual.estado === 'finalizada') {
        throw errorHttp(
            'No se puede modificar una publicación finalizada',
            409
        );
    }

    const validado = await validarDatos(datos, publicacionId);

    if (validado.estado === 'publicada' &&
        actual.estado === 'publicada') {
        validado.fecha_publicacion = actual.fecha_publicacion
            ?? new Date();
    }

    await model.actualizar(publicacionId, validado);

    return model.obtenerPorId(publicacionId);
};

export const eliminar = async (id) => {
    const filas = await model.finalizar(validarId(id));

    if (!filas) {
        throw errorHttp('Publicación no encontrada o ya finalizada', 404);
    }

    return true;
};

export const catalogo = () => model.obtenerCatalogo();

export const detalleCatalogo = async (id) => {
    const publicacionId = validarId(id);

    const detalle = await model.obtenerDetalleCatalogo(
        publicacionId
    );

    if (!detalle) {
        throw errorHttp(
            'La propiedad solicitada no está disponible',
            404
        );
    }

    return detalle;
};

