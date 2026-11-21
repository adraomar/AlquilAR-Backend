
import pool from '../config/db.js';

export const obtenerTodas = async () => {
    const [rows] = await pool.query(`
        SELECT pub.*, p.titulo, p.tipo, p.direccion,
               p.ciudad, p.provincia
        FROM publicaciones pub
        INNER JOIN propiedades p
            ON p.id_propiedad = pub.id_propiedad
        ORDER BY pub.id_publicacion DESC
    `);

    return rows;
};

export const obtenerPorId = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM publicaciones
         WHERE id_publicacion = ?`,
        [id]
    );

    return rows[0] || null;
};

export const obtenerActivaPorPropiedad = async (
    idPropiedad, excluirId = 0
) => {
    const [rows] = await pool.execute(
        `SELECT id_publicacion
         FROM publicaciones
         WHERE id_propiedad = ?
           AND estado IN ('borrador', 'publicada', 'pausada')
           AND id_publicacion <> ?
         LIMIT 1`,
        [idPropiedad, excluirId]
    );

    return rows[0] || null;
};

export const crear = async (datos) => {
    const [result] = await pool.execute(
        `INSERT INTO publicaciones
         (id_propiedad, tipo_operacion, precio,
          moneda, estado, fecha_publicacion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            datos.id_propiedad,
            datos.tipo_operacion,
            datos.precio,
            datos.moneda,
            datos.estado,
            datos.fecha_publicacion
        ]
    );

    return result.insertId;
};

export const actualizar = async (id, datos) => {
    const [result] = await pool.execute(
        `UPDATE publicaciones SET
            id_propiedad = ?,
            tipo_operacion = ?,
            precio = ?,
            moneda = ?,
            estado = ?,
            fecha_publicacion = ?
         WHERE id_publicacion = ?`,
        [
            datos.id_propiedad,
            datos.tipo_operacion,
            datos.precio,
            datos.moneda,
            datos.estado,
            datos.fecha_publicacion,
            id
        ]
    );

    return result.affectedRows;
};

export const finalizar = async (id) => {
    const [result] = await pool.execute(
        `UPDATE publicaciones
         SET estado = 'finalizada'
         WHERE id_publicacion = ?
           AND estado <> 'finalizada'`,
        [id]
    );

    return result.affectedRows;
};


export const obtenerCatalogo = async () => {
    const [rows] = await pool.query(`
        SELECT
            pub.id_publicacion,
            pub.tipo_operacion,
            pub.precio,
            pub.moneda,
            pub.fecha_publicacion,
            p.id_propiedad,
            p.titulo,
            p.descripcion,
            p.tipo,
            p.direccion,
            p.ciudad,
            p.provincia,
            p.habitaciones,
            p.banios,
            p.superficie_total,
            p.superficie_cubierta,
            p.cochera,
            p.balcon,
            p.patio,
            p.piscina,
            (
                SELECT pi.ruta_archivo
                FROM propiedad_imagenes pi
                WHERE pi.id_propiedad = p.id_propiedad
                ORDER BY pi.es_portada DESC,
                         pi.orden ASC,
                         pi.id_imagen ASC
                LIMIT 1
            ) AS imagen_portada
        FROM publicaciones pub
        INNER JOIN propiedades p
            ON p.id_propiedad = pub.id_propiedad
        WHERE pub.estado = 'publicada'
          AND p.estado = 'activa'
        ORDER BY pub.fecha_publicacion DESC,
                 pub.id_publicacion DESC
    `);

    return rows;
};


export const obtenerDetalleCatalogo = async (idPublicacion) => {
    const [rows] = await pool.execute(
        `SELECT
            pub.id_publicacion,
            pub.id_propiedad,
            pub.tipo_operacion,
            pub.precio,
            pub.moneda,
            pub.fecha_publicacion,

            p.titulo,
            p.descripcion,
            p.tipo,
            p.direccion,
            p.ciudad,
            p.provincia,
            p.habitaciones,
            p.banios,
            p.superficie_total,
            p.superficie_cubierta,
            p.cochera,
            p.balcon,
            p.patio,
            p.piscina

        FROM publicaciones pub
        INNER JOIN propiedades p
            ON p.id_propiedad = pub.id_propiedad

        WHERE pub.id_publicacion = ?
          AND pub.estado = 'publicada'
          AND p.estado = 'activa'

        LIMIT 1`,
        [idPublicacion]
    );

    const propiedad = rows[0];

    if (!propiedad) {
        return null;
    }

    const [imagenes] = await pool.execute(
        `SELECT
            id_imagen,
            ruta_archivo,
            nombre_original,
            es_portada,
            orden

        FROM propiedad_imagenes

        WHERE id_propiedad = ?

        ORDER BY
            es_portada DESC,
            orden ASC,
            id_imagen ASC`,
        [propiedad.id_propiedad]
    );

    return {
        ...propiedad,
        imagenes
    };
};


