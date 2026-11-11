
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Registrar un cliente completo
export const registrarCliente = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nombre,
            correo,
            password,
            telefono,
            fecha_nacimiento,
            direccion
        } = req.body;

        if (!nombre || !correo || !password || !telefono) {
            return res.status(400).json({
                message: 'Nombre, correo, contraseña y teléfono son obligatorios'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener mínimo 8 caracteres'
            });
        }

        const email = correo.trim().toLowerCase();

        await client.query('BEGIN');

        const usuarioExistente = await client.query(
            'SELECT id FROM usuarios WHERE correo = $1',
            [email]
        );

        if (usuarioExistente.rows.length > 0) {
            await client.query('ROLLBACK');

            return res.status(409).json({
                message: 'El correo ya está registrado'
            });
        }

        const passwordCifrada = await bcrypt.hash(password, 12);

        const usuario = await client.query(
            `INSERT INTO usuarios (nombre, correo, password, rol)
             VALUES ($1, $2, $3, 'cliente')
             RETURNING id, nombre, correo, rol`,
            [nombre.trim(), email, passwordCifrada]
        );

        const nuevoCliente = await client.query(
            `INSERT INTO clientes
             (usuario_id, telefono, fecha_nacimiento, direccion)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                usuario.rows[0].id,
                telefono.trim(),
                fecha_nacimiento || null,
                direccion?.trim() || null
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Cliente registrado correctamente',
            usuario: usuario.rows[0],
            cliente: nuevoCliente.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al registrar cliente:', error.message);

        res.status(500).json({
            message: 'Error al registrar el cliente'
        });

    } finally {
        client.release();
    }
};


export const obtenerClientes = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                c.id,
                u.nombre,
                u.correo,
                c.telefono,
                c.fecha_nacimiento,
                c.direccion,
                c.creado_en
            FROM clientes c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.id DESC
        `);

        res.status(200).json({
            message: 'Clientes obtenidos correctamente',
            clientes: resultado.rows
        });

    } catch (error) {
        console.error('Error al obtener clientes:', error.message);

        res.status(500).json({
            message: 'Error al consultar los clientes'
        });
    }
};

