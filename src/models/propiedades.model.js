
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

export const obtenerTodas = async ({
    pagina = 1,
    limite = 10,
    estado = 'todas',
    tipo = 'todos',
    busqueda = ''
} = {}) => {

    const condiciones = [];
    const parametros = [];

    if (estado !== 'todas') {
        condiciones.push('p.estado = ?');
        parametros.push(estado);
    }

    if (tipo !== 'todos') {
        condiciones.push('p.tipo = ?');
        parametros.push(tipo);
    }

    if (busqueda) {

        const texto = `%${busqueda}%`;

        condiciones.push(`
            (
                p.titulo LIKE ?
                OR p.direccion LIKE ?
                OR p.ciudad LIKE ?
                OR p.provincia LIKE ?
                OR CAST(p.id_propiedad AS CHAR) LIKE ?
            )
        `);

        parametros.push(
            texto,
            texto,
            texto,
            texto,
            texto
        );
    }

    const where = condiciones.length > 0
        ? `WHERE ${condiciones.join(' AND ')}`
        : '';

    const offset = (pagina - 1) * limite;

    // Total de propiedades que coinciden con los filtros
    const [conteo] = await pool.execute(`
        SELECT COUNT(*) AS total
        FROM propiedades p
        ${where}
    `, parametros);

    const total = Number(conteo[0].total);

    // Propiedades correspondientes a la página solicitada
    const [rows] = await pool.execute(`
        SELECT
            p.*,

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

        ${where}

        ORDER BY p.id_propiedad DESC

        LIMIT ? OFFSET ?
    `, [
        ...parametros,
        limite,
        offset
    ]);

    return {
        propiedades: rows,
        paginacion: {
            pagina,
            limite,
            total,
            total_paginas: Math.ceil(total / limite)
        }
    };
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
