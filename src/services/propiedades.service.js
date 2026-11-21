
import * as model from '../models/propiedades.model.js';

const tiposPermitidos = [
    'casa', 'departamento', 'terreno', 'local', 'otro'
];

const crearError = (mensaje, status = 400) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

const validarId = (id) => {
    const numero = Number(id);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw crearError('ID de propiedad inválido');
    }

    return numero;
};

const validarPropiedad = (datos) => {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw crearError('Debe enviar los datos de la propiedad');
    }

    const requeridos = ['titulo', 'tipo', 'direccion', 'ciudad', 'provincia'];

    for (const campo of requeridos) {
        if (typeof datos[campo] !== 'string' || !datos[campo].trim()) {
            throw crearError(`El campo ${campo} es obligatorio`);
        }
    }

    if (!tiposPermitidos.includes(datos.tipo)) {
        throw crearError('Tipo de propiedad no permitido');
    }

    const textoOpcional = (valor, campo, maximo) => {
        if (valor == null) return null;
        if (typeof valor !== 'string' || valor.length > maximo) {
            throw crearError(`El campo ${campo} no es válido`);
        }
        return valor.trim();
    };

    const numeroOpcional = (valor, campo, entero = false) => {
        if (valor === null || valor === undefined || valor === '') {
            return null;
        }

        if (typeof valor !== 'number' || !Number.isFinite(valor)) {
            throw crearError(`El campo ${campo} debe ser numérico`);
        }

        if (valor < 0 || (entero && !Number.isSafeInteger(valor))) {
            throw crearError(`El campo ${campo} no es válido`);
        }

        return valor;
    };

    const booleano = (valor, campo) => {
        if (valor === undefined || valor === null) return false;
        if (typeof valor !== 'boolean') {
            throw crearError(`El campo ${campo} debe ser booleano`);
        }
        return valor;
    };

    const propiedad = {
        titulo: datos.titulo.trim(),
        descripcion: textoOpcional(datos.descripcion, 'descripcion', 10000),
        tipo: datos.tipo,
        direccion: datos.direccion.trim(),
        ciudad: datos.ciudad.trim(),
        provincia: datos.provincia.trim(),
        habitaciones: numeroOpcional(datos.habitaciones ?? 0, 'habitaciones', true),
        banios: numeroOpcional(datos.banios ?? 0, 'banios', true),
        superficie_total: numeroOpcional(datos.superficie_total, 'superficie_total'),
        superficie_cubierta: numeroOpcional(datos.superficie_cubierta, 'superficie_cubierta'),
        cochera: booleano(datos.cochera, 'cochera'),
        balcon: booleano(datos.balcon, 'balcon'),
        patio: booleano(datos.patio, 'patio'),
        piscina: booleano(datos.piscina, 'piscina')
    };

    if (propiedad.titulo.length > 150 ||
        propiedad.direccion.length > 255 ||
        propiedad.ciudad.length > 100 ||
        propiedad.provincia.length > 100) {
        throw crearError('Uno o más campos de texto superan el límite permitido');
    }

    if (propiedad.superficie_total !== null &&
        propiedad.superficie_total <= 0) {
        throw crearError('La superficie total debe ser mayor a cero');
    }

    if (propiedad.superficie_cubierta !== null &&
        propiedad.superficie_cubierta <= 0) {
        throw crearError('La superficie cubierta debe ser mayor a cero');
    }

    if (propiedad.superficie_total !== null &&
        propiedad.superficie_cubierta !== null &&
        propiedad.superficie_cubierta > propiedad.superficie_total) {
        throw crearError('La superficie cubierta no puede superar la total');
    }

    return propiedad;
};

export const listarPropiedades = async () => {
    return await model.obtenerTodas();
};

export const buscarPropiedad = async (id) => {
    const propiedad = await model.obtenerPorId(validarId(id));

    if (!propiedad) {
        throw crearError('Propiedad no encontrada', 404);
    }

    return propiedad;
};

export const crearPropiedad = async (datos) => {
    const propiedad = validarPropiedad(datos);
    const id = await model.crear(propiedad);
    return await model.obtenerPorId(id);
};

export const actualizarPropiedad = async (id, datos) => {
    const propiedadId = validarId(id);
    const existente = await model.obtenerPorId(propiedadId);

    if (!existente || existente.estado !== 'activa') {
        throw crearError('Propiedad no encontrada', 404);
    }

    const propiedad = validarPropiedad(datos);
    await model.actualizar(propiedadId, propiedad);

    return await model.obtenerPorId(propiedadId);
};

export const eliminarPropiedad = async (id) => {
    const propiedadId = validarId(id);
    const filas = await model.eliminar(propiedadId);

    if (!filas) {
        throw crearError('Propiedad no encontrada', 404);
    }

    return true;
};
