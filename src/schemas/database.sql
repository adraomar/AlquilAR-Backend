CREATE DATABASE IF NOT EXISTS alquilar_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE alquilar_db;

CREATE TABLE propiedades IF NOT EXISTS (
    id_propiedad INT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,

    tipo ENUM(
        'casa',
        'departamento',
        'terreno',
        'local',
        'otro'
    ) NOT NULL,

    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,

    habitaciones INT UNSIGNED DEFAULT 0,
    banios INT UNSIGNED DEFAULT 0,

    superficie_total DECIMAL(10,2),
    superficie_cubierta DECIMAL(10,2),

    cochera BOOLEAN DEFAULT FALSE,
    balcon BOOLEAN DEFAULT FALSE,
    patio BOOLEAN DEFAULT FALSE,
    piscina BOOLEAN DEFAULT FALSE,

    estado ENUM('activa', 'inactiva')
        NOT NULL DEFAULT 'activa',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_superficie_total
    CHECK (superficie_total IS NULL OR superficie_total > 0),

    CONSTRAINT chk_superficie_cubierta
    CHECK (superficie_cubierta IS NULL OR superficie_cubierta > 0)
);

CREATE TABLE publicaciones IF NOT EXISTS (
    id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_propiedad INT NOT NULL,
    tipo_operacion ENUM('venta', 'alquiler')
        NOT NULL,
    precio DECIMAL(15,2) NOT NULL,
    moneda ENUM('ARS', 'USD')
        NOT NULL DEFAULT 'ARS',
    estado ENUM(
        'borrador',
        'publicada',
        'pausada',
        'finalizada'
    ) NOT NULL DEFAULT 'borrador',

    fecha_publicacion DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_publicacion_propiedad
        FOREIGN KEY (id_propiedad)
        REFERENCES propiedades(id_propiedad)
        ON DELETE RESTRICT,

    CONSTRAINT chk_precio_positivo
        CHECK (precio > 0),

    INDEX idx_publicaciones_propiedad (id_propiedad),
    INDEX idx_publicaciones_estado (estado),
    INDEX idx_publicaciones_operacion (tipo_operacion)
);

CREATE TABLE propiedad_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_propiedad INT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    nombre_original VARCHAR(255),
    es_portada BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagen_propiedad
        FOREIGN KEY (id_propiedad)
        REFERENCES propiedades(id_propiedad)
        ON DELETE CASCADE,

    INDEX idx_imagen_propiedad (id_propiedad)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    telefono VARCHAR(30),

    estado ENUM('activo', 'inactivo', 'bloqueado')
        NOT NULL DEFAULT 'activo',

    ultimo_acceso DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion)
VALUES
(
    'admin_sistema',
    'Administrador general del sistema'
),
(
    'admin_consorcio',
    'Administrador de consorcios asignados'
),
(
    'residente',
    'Propietario o inquilino de una propiedad'
),
(
    'visitante',
    'Usuario registrado sin vinculacion residencial'
),
(
    'tecnico',
    'Responsable de atender tickets de refaccion'
),
(
    'admin_inmobiliaria',
    'Responsable de la gestion comercial inmobiliaria'
);

CREATE TABLE IF NOT EXISTS usuario_roles (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,

    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_usuario, id_rol),

    CONSTRAINT fk_usuario_roles_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_roles_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS usuario_propiedades (
    id_usuario_propiedad INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,
    id_propiedad INT NOT NULL,

    tipo_vinculo ENUM('propietario', 'inquilino')
        NOT NULL,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE DEFAULT NULL,

    estado ENUM('activo', 'finalizado')
        NOT NULL DEFAULT 'activo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_propiedades_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT fk_usuario_propiedades_propiedad
        FOREIGN KEY (id_propiedad)
        REFERENCES propiedades(id_propiedad)
        ON DELETE RESTRICT,

    CONSTRAINT chk_fechas_vinculo
        CHECK (
            fecha_fin IS NULL
            OR fecha_fin >= fecha_inicio
        )
);

INSERT INTO propiedades (
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
    piscina
)
VALUES
(
    'Departamento moderno en Barrio Norte',
    'Departamento de dos dormitorios con balcón.',
    'departamento',
    'Muñecas 850',
    'San Miguel de Tucumán',
    'Tucumán',
    2, 1, 85, 75,
    FALSE, TRUE, FALSE, FALSE
),
(
    'Casa familiar con patio',
    'Casa de tres dormitorios, cochera y patio amplio.',
    'casa',
    'Av. Mate de Luna 2400',
    'San Miguel de Tucumán',
    'Tucumán',
    3, 2, 240, 170,
    TRUE, FALSE, TRUE, FALSE
),
(
    'Terreno residencial',
    'Terreno apto para construcción de vivienda.',
    'terreno',
    'Zona Yerba Buena',
    'Yerba Buena',
    'Tucumán',
    0, 0, 450, NULL,
    FALSE, FALSE, FALSE, FALSE
);

INSERT INTO publicaciones (
    id_propiedad,
    tipo_operacion,
    precio,
    moneda,
    estado,
    fecha_publicacion
)
VALUES
(
    1,
    'alquiler',
    650000,
    'ARS',
    'publicada',
    NOW()
),
(
    2,
    'venta',
    145000,
    'USD',
    'publicada',
    NOW()
);

SELECT
    p.id_propiedad,
    p.titulo,
    p.tipo,
    p.ciudad,
    pub.tipo_operacion,
    pub.precio,
    pub.moneda,
    pub.estado AS estado_publicacion
FROM propiedades p
LEFT JOIN publicaciones pub
    ON pub.id_propiedad = p.id_propiedad
ORDER BY p.id_propiedad;