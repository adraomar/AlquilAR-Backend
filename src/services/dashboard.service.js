
import * as model from '../models/dashboard.model.js';

const tiposPropiedades = [
    'casa',
    'departamento',
    'terreno',
    'local',
    'otro'
];

const normalizarContadores = (datos) => {

    return Object.fromEntries(
        Object.entries(datos).map(([clave, valor]) => [
            clave,
            Number(valor ?? 0)
        ])
    );
};

export const obtenerResumen = async () => {

    const [
        propiedades,
        publicaciones,
        tipos,
        recientes
    ] = await Promise.all([
        model.obtenerResumenPropiedades(),
        model.obtenerResumenPublicaciones(),
        model.obtenerTiposPropiedades(),
        model.obtenerPropiedadesRecientes()
    ]);

    const tiposNormalizados = tiposPropiedades.map(tipo => {

        const encontrado = tipos.find(
            item => item.tipo === tipo
        );

        return {
            tipo,
            cantidad: Number(encontrado?.cantidad ?? 0)
        };
    });

    return {
        propiedades: normalizarContadores(propiedades),

        publicaciones: normalizarContadores(publicaciones),

        tipos_propiedades: tiposNormalizados,

        propiedades_recientes: recientes
    };
};
