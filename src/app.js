
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import propiedadesRoutes from './routes/propiedades.routes.js';
import publicacionesRoutes from './routes/publicaciones.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';
import authRoutes from './routes/auth.routes.js';
import catalogoRoutes from './routes/catalogo.routes.js';

import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de CORS
const origenesPermitidos = (
    process.env.CORS_ORIGINS || 'http://localhost:5173'
)
    .split(',')
    .map(origen => origen.trim());

app.use(cors({
    origin: (origin, callback) => {

        if (!origin || origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error('Origen no permitido por CORS');
        error.status = 403;

        return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(
    '/uploads',
    express.static(path.resolve(__dirname, '../uploads'))
);

// Health checks
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API AlquilAR funcionando correctamente'
    });
});

// DB health check
app.get('/api/health/db', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT 1 AS conectado'
        );

        res.json({
            success: true,
            database: 'alquilar_db',
            conectado: rows[0].conectado === 1
        });

    } catch (error) {
        console.error(
            'Error de conexión MySQL:',
            error.message
        );

        res.status(503).json({
            success: false,
            message: 'No se pudo conectar con MySQL'
        });
    }
});

// Rutas públicas y autenticación
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/auth', authRoutes);

// Rutas administrativas protegidas
app.use('/api/propiedades', propiedadesRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/propiedades', imagenesRoutes);

// Rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Middleware global de errores
app.use(errorHandler);

export default app;
