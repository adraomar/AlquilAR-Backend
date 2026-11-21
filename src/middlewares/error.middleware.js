
export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: status === 500
            ? 'Error interno del servidor'
            : err.message
    });
};
