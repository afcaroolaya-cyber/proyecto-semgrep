
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// REGISTRAR USUARIO
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener mínimo 8 caracteres'
            });
        }

        const email = correo.trim().toLowerCase();

        const usuarioExistente = await pool.query(
            'SELECT id FROM usuarios WHERE correo = $1',
            [email]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({
                message: 'El correo ya está registrado'
            });
        }

        const passwordCifrada = await bcrypt.hash(password, 12);

        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nombre, correo, rol`,
            [nombre.trim(), email, passwordCifrada, 'cliente']
        );

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar:', error.message);

        res.status(500).json({
            message: 'Error interno al registrar el usuario'
        });
    }
};

// INICIAR SESION
export const iniciarSesion = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                message: 'Correo y contraseña son obligatorios'
            });
        }

        const email = correo.trim().toLowerCase();

        const resultado = await pool.query(
            `SELECT id, nombre, correo, password, rol, activo
             FROM usuarios
             WHERE correo = $1`,
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = resultado.rows[0];

        if (!usuario.activo) {
            return res.status(403).json({
                message: 'La cuenta está desactivada'
            });
        }

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            { sub: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);

        res.status(500).json({
            message: 'Error interno al iniciar sesión'
        });
    }
};
