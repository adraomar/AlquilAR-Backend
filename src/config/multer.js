
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadsDir = path.resolve(
    __dirname, '../../uploads/propiedades'
);

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
        const extension = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp'
        }[file.mimetype];

        cb(null, `${randomUUID()}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const permitidos = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (!permitidos.includes(file.mimetype)) {
        const error = new Error(
            'Solo se permiten imágenes JPG, PNG o WEBP'
        );
        error.status = 400;
        return cb(error);
    }

    cb(null, true);
};

export const uploadImagenes = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    }
});
