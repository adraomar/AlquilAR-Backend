import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import * as UsuarioModel from '../models/usuario.model.js';

const errorHttp = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export const registrarUsuario = async (datos) => {

    const nombre = typeof datos.nombre === 'string'
        ? datos.nombre.trim() : '';

    const apellido = typeof datos.apellido === 'string'
        ? datos.apellido.trim() : '';

    const email = typeof datos.email === 'string'
        ? datos.email.trim().toLowerCase() : '';

    const password = datos.password;

    const telefono = typeof datos.telefono === 'string'
        ? datos.telefono.trim() || null : null;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
        throw errorHttp(
            'Todos los campos obligatorios deben completarse',
            400
        );
    }

    // Validar longitudes
    if (
        nombre.length > 100 ||
        apellido.length > 100 ||
        email.length > 150 ||
        (telefono && telefono.length > 30)
    ) {
        throw errorHttp(
            'Uno o más campos superan la longitud permitida',
            400
        );
    }

    // Validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw errorHttp('El correo electrónico no es válido', 400);
    }

    // Validar contraseña
    if (
        typeof password !== 'string' ||
        password.length < 8 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        throw errorHttp(
            'La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes',
            400
        );
    }

    // Verificar si existe el usuario
    const usuarioExistente =
        await UsuarioModel.buscarPorEmail(email);

    if (usuarioExistente) {
        throw errorHttp(
            'El correo electrónico ya está registrado',
            409
        );
    }

    // Generar hash de la contraseña
    const password_hash = await bcrypt.hash(password, 12);

    // Crear usuario
    try {
        return await UsuarioModel.crearUsuario({
            nombre,
            apellido,
            email,
            password_hash,
            telefono
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw errorHttp(
                'El correo electrónico ya está registrado',
                409
            );
        }

        throw error;
    }
};

export const iniciarSesion = async (datos) => {

    const email = typeof datos.email === 'string'
        ? datos.email.trim().toLowerCase()
        : '';

    const password = datos.password;

    // Validar campos obligatorios
    if (
        !email ||
        typeof password !== 'string' ||
        !password
    ) {
        throw errorHttp(
            'El correo electrónico y la contraseña son obligatorios',
            400
        );
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw errorHttp('Credenciales incorrectas', 401);
    }

    // Buscar usuario
    const usuario = await UsuarioModel.buscarPorEmail(email);

    if (!usuario) {
        throw errorHttp('Credenciales incorrectas', 401);
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordValida) {
        throw errorHttp('Credenciales incorrectas', 401);
    }

    // Verificar estado de la cuenta
    if (usuario.estado !== 'activo') {
        throw errorHttp(
            'La cuenta no se encuentra habilitada',
            403
        );
    }

    // Obtener roles
    const roles = await UsuarioModel.obtenerRolesPorUsuario(
        usuario.id_usuario
    );

    if (roles.length === 0) {
        throw errorHttp(
            'El usuario no tiene roles asignados',
            403
        );
    }

    // Verificar configuración JWT
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
    }

    // Generar token
    const token = jwt.sign(
        {
            sub: String(usuario.id_usuario),
            roles: roles
        },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
    );

    // Actualizar último acceso
    await UsuarioModel.actualizarUltimoAcceso(
        usuario.id_usuario
    );

    // Devolver datos seguros
    return {
        token,
        usuario: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            roles: roles
        }
    };
};


export const actualizarPerfil = async (idUsuario, datos) => {

    const usuarioActual = await UsuarioModel.buscarPorId(
        idUsuario
    );

    if (!usuarioActual) {
        throw errorHttp('Usuario no encontrado', 404);
    }

    const campos = ['nombre', 'apellido', 'email', 'telefono'];

    for (const campo of campos) {
        if (
            datos[campo] !== undefined &&
            typeof datos[campo] !== 'string' &&
            !(campo === 'telefono' && datos[campo] === null)
        ) {
            throw errorHttp(`El campo ${campo} no es válido`, 400);
        }
    }

    const nombre = (
        datos.nombre ?? usuarioActual.nombre
    ).trim();

    const apellido = (
        datos.apellido ?? usuarioActual.apellido
    ).trim();

    const email = (
        datos.email ?? usuarioActual.email
    ).trim().toLowerCase();

    const telefono = datos.telefono === undefined
        ? usuarioActual.telefono
        : datos.telefono?.trim() || null;

    if (!nombre || !apellido || !email) {
        throw errorHttp(
            'Nombre, apellido y correo son obligatorios',
            400
        );
    }

    if (nombre.length > 100 || apellido.length > 100) {
        throw errorHttp(
            'El nombre o apellido supera la longitud permitida',
            400
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email) || email.length > 150) {
        throw errorHttp('Correo electrónico inválido', 400);
    }

    if (telefono && telefono.length > 30) {
        throw errorHttp('Teléfono inválido', 400);
    }

    const usuarioExistente = await UsuarioModel.buscarPorEmail(
        email
    );

    if (
        usuarioExistente &&
        usuarioExistente.id_usuario !== idUsuario
    ) {
        throw errorHttp(
            'El correo electrónico ya está registrado',
            409
        );
    }

    try {

        const usuario = await UsuarioModel.actualizarPerfil(
            idUsuario,
            {
                nombre,
                apellido,
                email,
                telefono
            }
        );

        const roles = await UsuarioModel.obtenerRolesPorUsuario(
            idUsuario
        );

        return {
            ...usuario,
            roles
        };

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            throw errorHttp(
                'El correo electrónico ya está registrado',
                409
            );
        }

        throw error;
    }
};


export const cambiarPassword = async (idUsuario, datos) => {

    const {
        passwordActual,
        passwordNueva
    } = datos;

    if (
        typeof passwordActual !== 'string' ||
        typeof passwordNueva !== 'string' ||
        !passwordActual ||
        !passwordNueva
    ) {
        throw errorHttp(
            'Debés completar ambas contraseñas',
            400
        );
    }

    if (passwordNueva.length < 8) {
        throw errorHttp(
            'La nueva contraseña debe tener al menos 8 caracteres',
            400
        );
    }

    if (
        Buffer.byteLength(passwordActual, 'utf8') > 72 ||
        Buffer.byteLength(passwordNueva, 'utf8') > 72
    ) {
        throw errorHttp(
            'La contraseña supera la longitud permitida',
            400
        );
    }

    const passwordHashActual =
        await UsuarioModel.obtenerPasswordHash(idUsuario);

    if (!passwordHashActual) {
        throw errorHttp('Usuario no encontrado', 404);
    }

    const passwordValida = await bcrypt.compare(
        passwordActual,
        passwordHashActual
    );

    if (!passwordValida) {
        throw errorHttp(
            'La contraseña actual es incorrecta',
            400
        );
    }

    if (passwordActual === passwordNueva) {
        throw errorHttp(
            'La nueva contraseña debe ser diferente a la actual',
            400
        );
    }

    const passwordHashNuevo = await bcrypt.hash(
        passwordNueva,
        12
    );

    const actualizado = await UsuarioModel.actualizarPassword(
        idUsuario,
        passwordHashNuevo,
        passwordHashActual
    );

    if (!actualizado) {
        throw errorHttp(
            'La contraseña fue modificada. Volvé a intentarlo',
            409
        );
    }
};
