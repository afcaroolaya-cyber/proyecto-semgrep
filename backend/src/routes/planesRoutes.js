
import express from 'express';

import {
    obtenerPlanes,
    registrarPlan
} from '../controllers/planesController.js';

import {
    verificarToken,
    verificarRol
} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Consultar planes
router.get(
    '/',
    verificarToken,
    verificarRol('admin', 'entrenador'),
    obtenerPlanes
);

// Registrar planes
router.post(
    '/',
    verificarToken,
    verificarRol('admin'),
    registrarPlan
);

export default router;
