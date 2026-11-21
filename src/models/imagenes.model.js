
import pool from '../config/db.js';

export const obtenerPorPropiedad = async (idPropiedad) => {
    const [rows] = await pool.execute(
        `SELECT *
         FROM propiedad_imagenes
         WHERE id_propiedad = ?
         ORDER BY es_portada DESC, orden ASC, id_imagen ASC`,
        [idPropiedad]
    );

    return rows;
};

export const obtenerPorId = async (idImagen) => {
    const [rows] = await pool.execute(
        `SELECT *
         FROM propiedad_imagenes
         WHERE id_imagen = ?`,
        [idImagen]
    );

    return rows[0] || null;
};

export const crear = async (datos) => {
    const [result] = await pool.execute(
        `INSERT INTO propiedad_imagenes
         (id_propiedad, ruta_archivo, nombre_original,
          es_portada, orden)
         VALUES (?, ?, ?, ?, ?)`,
        [
            datos.id_propiedad,
            datos.ruta_archivo,
            datos.nombre_original,
            datos.es_portada,
            datos.orden
        ]
    );

    return result.insertId;
};

export const contarPorPropiedad = async (idPropiedad) => {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM propiedad_imagenes
         WHERE id_propiedad = ?`,
        [idPropiedad]
    );

    return Number(rows[0].total);
};

export const establecerPortada = async (idPropiedad, idImagen) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE propiedad_imagenes
             SET es_portada = 0
             WHERE id_propiedad = ?`,
            [idPropiedad]
        );

        await connection.execute(
            `UPDATE propiedad_imagenes
             SET es_portada = 1
             WHERE id_propiedad = ? AND id_imagen = ?`,
            [idPropiedad, idImagen]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const eliminar = async (idImagen) => {
    const [result] = await pool.execute(
        `DELETE FROM propiedad_imagenes
         WHERE id_imagen = ?`,
        [idImagen]
    );

    return result.affectedRows;
};
