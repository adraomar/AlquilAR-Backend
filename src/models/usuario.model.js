import pool from "../config/db.js";

const buscarPorEmail = async (email) => {
    const [rows] = await pool.execute(`SELECT * FROM usuarios WHERE email = ? LIMIT 1`, [email]);

    return rows[0] || null;
};

const crearUsuario = async (usuario) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [resultado] = await conexion.execute(`INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono) VALUES (?,?,?,?,?)`, [usuario.nombre, usuario.apellido, usuario.email, usuario.password_hash, usuario.telefono]);

        const idUsuario = resultado.insertId;

        const [roles] = await conexion.execute(
            `SELECT id_rol FROM roles WHERE nombre = ?`,
            ['visitante']
        );

        if (roles.length === 0) {
            throw new Error('El rol visitante no existe');
        }

        await conexion.execute(
            `INSERT INTO usuario_roles (id_usuario, id_rol)
             VALUES (?, ?)`,
            [idUsuario, roles[0].id_rol]
        );

        await conexion.commit();

        return {
            id_usuario: idUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            roles: ['visitante']
        };

    } catch (error) {
        await conexion.rollback();
        throw error;

    } finally {
        conexion.release();
    }
};

const obtenerRolesPorUsuario = async (idUsuario) => {
    const [rows] = await pool.execute(
        `SELECT r.nombre
         FROM roles r
         INNER JOIN usuario_roles ur
            ON r.id_rol = ur.id_rol
         WHERE ur.id_usuario = ?`,
        [idUsuario]
    );

    return rows.map(rol => rol.nombre);
};

const actualizarUltimoAcceso = async (idUsuario) => {
    await pool.execute(
        `UPDATE usuarios
         SET ultimo_acceso = NOW()
         WHERE id_usuario = ?`,
        [idUsuario]
    );
};

const buscarPorId = async (idUsuario) => {
    const [rows] = await pool.execute(
        `SELECT
            id_usuario,
            nombre,
            apellido,
            email,
            telefono,
            estado,
            ultimo_acceso,
            created_at
         FROM usuarios
         WHERE id_usuario = ?
         LIMIT 1`,
        [idUsuario]
    );

    return rows[0] || null;
};

const actualizarPerfil = async (idUsuario, datos) => {

    const {
        nombre,
        apellido,
        email,
        telefono
    } = datos;

    const sql = `
        UPDATE usuarios
        SET
            nombre = ?,
            apellido = ?,
            email = ?,
            telefono = ?
        WHERE id_usuario = ?
    `;

    await pool.execute(sql, [
        nombre,
        apellido,
        email,
        telefono,
        idUsuario
    ]);

    return await buscarPorId(idUsuario);
};

const obtenerPasswordHash = async (idUsuario) => {

    const sql = `
        SELECT password_hash
        FROM usuarios
        WHERE id_usuario = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [
        idUsuario
    ]);

    return rows[0]?.password_hash || null;
};

const actualizarPassword = async (
    idUsuario,
    passwordHash,
    passwordHashActual
) => {

    const sql = `
        UPDATE usuarios
        SET password_hash = ?
        WHERE id_usuario = ?
        AND password_hash = ?
    `;

    const [resultado] = await pool.execute(sql, [
        passwordHash,
        idUsuario,
        passwordHashActual
    ]);

    return resultado.affectedRows > 0;
};

export { buscarPorEmail, crearUsuario, obtenerRolesPorUsuario, actualizarUltimoAcceso, buscarPorId, actualizarPerfil, obtenerPasswordHash, actualizarPassword };