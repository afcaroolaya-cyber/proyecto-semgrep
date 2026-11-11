
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import {
    verificarToken,
    verificarRol
} from './middlewares/authMiddleware.js';
import clientesRoutes from './routes/clientesRoutes.js';
import planesRoutes from './routes/planesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/planes', planesRoutes);

app.get('/api/protegido', verificarToken, (req, res) => {
    res.json({
        message: 'Acceso autorizado a FitZone',
        usuario: req.usuario
    });
});

app.get(
    '/api/admin',
    verificarToken,
    verificarRol('admin'),
    (req, res) => {
        res.json({
            message: 'Bienvenido al panel de administrador',
            usuario: req.usuario
        });
    }
);

app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a FitZone',
        status: 'Servidor funcionando correctamente'
    });
});




const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');

        console.log('PostgreSQL conectado correctamente');

        app.listen(PORT, () => {
            console.log(`FitZone funcionando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar PostgreSQL:', error.message);
        process.exit(1);
    }
};

startServer();
