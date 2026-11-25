
import * as service from '../services/dashboard.service.js';

export const obtenerResumen = async (req, res, next) => {

    try {

        const resumen = await service.obtenerResumen();

        res.status(200).json({
            success: true,
            data: resumen
        });

    } catch (error) {

        next(error);

    }
};
