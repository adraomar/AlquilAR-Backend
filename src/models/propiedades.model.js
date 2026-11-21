
import pool from '../config/db.js';

const CAMPOS = `
    id_propiedad,
    titulo,
    descripcion,
    tipo,
    direccion,
    ciudad,
    provincia,
    habitaciones,
    banios,
    superficie_total,
    superficie_cubierta,
    cochera,
    balcon,
    patio,
    piscina,
    estado,
    created_at,
    updated_at
`;

export const obtenerTodas = async () => {
    const [rows] = await pool.query(`
        SELECT ${CAMPOS}
        FROM propiedades
        WHERE estado = 'activa'
        ORDER BY id_propiedad DESC
    `);

    return rows;
};

export const obtenerPorId = async (id) => {
    const [rows] = await pool.execute(
        `SELECT ${CAMPOS} FROM propiedades WHERE id_propiedad = ?`,
        [id]
    );

    return rows[0] || null;
};

export const crear = async (propiedad) => {
    const {
        titulo, descripcion, tipo, direccion, ciudad, provincia,
        habitaciones, banios, superficie_total, superficie_cubierta,
        cochera, balcon, patio, piscina
    } = propiedad;

    const [result] = await pool.execute(
        `INSERT INTO propiedades (
            titulo, descripcion, tipo, direccion, ciudad, provincia,
            habitaciones, banios, superficie_total, superficie_cubierta,
            cochera, balcon, patio, piscina
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            titulo, descripcion, tipo, direccion, ciudad, provincia,
            habitaciones, banios, superficie_total, superficie_cubierta,
            cochera, balcon, patio, piscina
        ]
    );

    return result.insertId;
};

export const actualizar = async (id, propiedad) => {
    const {
        titulo, descripcion, tipo, direccion, ciudad, provincia,
        habitaciones, banios, superficie_total, superficie_cubierta,
        cochera, balcon, patio, piscina
    } = propiedad;

    const [result] = await pool.execute(
        `UPDATE propiedades SET
            titulo = ?, descripcion = ?, tipo = ?, direccion = ?,
            ciudad = ?, provincia = ?, habitaciones = ?, banios = ?,
            superficie_total = ?, superficie_cubierta = ?,
            cochera = ?, balcon = ?, patio = ?, piscina = ?
         WHERE id_propiedad = ? AND estado = 'activa'`,
        [
            titulo, descripcion, tipo, direccion, ciudad, provincia,
            habitaciones, banios, superficie_total, superficie_cubierta,
            cochera, balcon, patio, piscina, id
        ]
    );

    return result.affectedRows;
};

export const eliminar = async (id) => {
    const [result] = await pool.execute(
        `UPDATE propiedades SET estado = 'inactiva'
         WHERE id_propiedad = ? AND estado = 'activa'`,
        [id]
    );

    return result.affectedRows;
};
