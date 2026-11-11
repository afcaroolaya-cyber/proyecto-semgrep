
import express from 'express';

import {
    registrarUsuario,
    iniciarSesion
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);

export default router;
