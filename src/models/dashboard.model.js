
import pool from '../config/db.js';

export const obtenerResumenPropiedades = async () => {

    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total,

            COUNT(CASE
                WHEN estado = 'activa' THEN 1
            END) AS activas,

            COUNT(CASE
                WHEN estado = 'inactiva' THEN 1
            END) AS inactivas

        FROM propiedades
    `);

    return rows[0];
};

export const obtenerResumenPublicaciones = async () => {

    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total,

            COUNT(CASE
                WHEN pub.estado = 'publicada' THEN 1
            END) AS publicadas,

            COUNT(CASE
                WHEN pub.estado = 'borrador' THEN 1
            END) AS borradores,

            COUNT(CASE
                WHEN pub.estado = 'pausada' THEN 1
            END) AS pausadas,

            COUNT(CASE
                WHEN pub.estado = 'finalizada' THEN 1
            END) AS finalizadas,

            COUNT(CASE
                WHEN pub.estado = 'publicada'
                AND p.estado = 'activa'
                THEN 1
            END) AS visibles,

            COUNT(CASE
                WHEN pub.estado = 'publicada'
                AND p.estado = 'inactiva'
                THEN 1
            END) AS publicadas_no_visibles,

            COUNT(CASE
                WHEN pub.estado = 'publicada'
                AND p.estado = 'activa'
                AND pub.tipo_operacion = 'venta'
                THEN 1
            END) AS en_venta,

            COUNT(CASE
                WHEN pub.estado = 'publicada'
                AND p.estado = 'activa'
                AND pub.tipo_operacion = 'alquiler'
                THEN 1
            END) AS en_alquiler

        FROM publicaciones pub

        INNER JOIN propiedades p
            ON p.id_propiedad = pub.id_propiedad
    `);

    return rows[0];
};

export const obtenerTiposPropiedades = async () => {

    const [rows] = await pool.query(`
        SELECT
            tipo,
            COUNT(*) AS cantidad

        FROM propiedades

        WHERE estado = 'activa'

        GROUP BY tipo

        ORDER BY cantidad DESC
    `);

    return rows;
};

export const obtenerPropiedadesRecientes = async () => {

    const [rows] = await pool.query(`
        SELECT
            p.id_propiedad,
            p.titulo,
            p.tipo,
            p.direccion,
            p.ciudad,
            p.provincia,
            p.estado,
            p.created_at,

            (
                SELECT pi.ruta_archivo
                FROM propiedad_imagenes pi
                WHERE pi.id_propiedad = p.id_propiedad
                ORDER BY pi.es_portada DESC,
                         pi.orden ASC,
                         pi.id_imagen ASC
                LIMIT 1
            ) AS imagen_portada

        FROM propiedades p

        ORDER BY p.created_at DESC,
                 p.id_propiedad DESC

        LIMIT 5
    `);

    return rows;
};
