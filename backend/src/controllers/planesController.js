
import pool from '../config/db.js';

// Obtener todos los planes
export const obtenerPlanes = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT *
             FROM planes
             ORDER BY id DESC`
        );

        res.status(200).json({
            message: 'Planes obtenidos correctamente',
            planes: resultado.rows
        });

    } catch (error) {
        console.error('Error al obtener planes:', error.message);

        res.status(500).json({
            message: 'Error al consultar los planes'
        });
    }
};

// Registrar un nuevo plan
export const registrarPlan = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            duracion_dias
        } = req.body;

        if (
            !nombre ||
            precio === undefined ||
            precio === null ||
            duracion_dias === undefined ||
            duracion_dias === null
        ) {
            return res.status(400).json({
                message: 'Nombre, precio y duración son obligatorios'
            });
        }

        if (
            !Number.isFinite(Number(precio)) ||
            Number(precio) <= 0 ||
            !Number.isInteger(Number(duracion_dias)) ||
            Number(duracion_dias) <= 0
        ) {
            return res.status(400).json({
                message: 'El precio y la duración deben ser valores positivos válidos'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO planes
             (nombre, descripcion, precio, duracion_dias)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                nombre.trim(),
                descripcion || null,
                precio,
                duracion_dias
            ]
        );

        res.status(201).json({
            message: 'Plan registrado correctamente',
            plan: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar plan:', error.message);

        res.status(500).json({
            message: 'Error al registrar el plan'
        });
    }
};
