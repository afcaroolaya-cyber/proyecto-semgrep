
import express from 'express';

import {
    obtenerClientes,
    registrarCliente
} from '../controllers/clientesController.js';

import {
    verificarToken,
    verificarRol
} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Consultar clientes: solo administradores y entrenadores
router.get(
    '/',
    verificarToken,
    verificarRol('admin', 'entrenador'),
    obtenerClientes
);


router.post(
    '/',
    verificarToken,
    verificarRol('admin'),
    registrarCliente
);

export default router;
