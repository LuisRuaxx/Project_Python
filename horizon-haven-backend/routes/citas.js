import express from "express";
import pool from "../conexion.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verificarToken);

// =========================
// OBTENER TODAS LAS CITAS (con info de vivienda y usuario)
// =========================
router.get("/", async (req, res) => {
    try {
        const [citas] = await pool.query(`
            SELECT 
                c.id_cita, c.fecha, c.hora,
                c.id_vivienda, c.id_user,
                v.tipo_vivienda, v.precio, v.estado AS estado_vivienda,
                u.nombre AS nombre_usuario, u.correo AS correo_usuario
            FROM citas c
            INNER JOIN viviendas v ON c.id_vivienda = v.id_vivienda
            INNER JOIN usuarios u ON c.id_user = u.id_user
            ORDER BY c.fecha DESC, c.hora DESC
        `);
        res.json({ ok: true, data: citas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener las citas" });
    }
});

// =========================
// OBTENER UNA CITA POR ID
// =========================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [citas] = await pool.query(
            "SELECT * FROM citas WHERE id_cita = ?",
            [id]
        );

        if (citas.length === 0) {
            return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
        }

        res.json({ ok: true, data: citas[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener la cita" });
    }
});

// =========================
// CREAR CITA
// =========================
router.post("/", async (req, res) => {
    try {
        const { id_vivienda, id_user, fecha, hora } = req.body;

        if (!id_vivienda || !id_user || !fecha || !hora) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        // Verificar que la vivienda exista
        const [viviendas] = await pool.query("SELECT id_vivienda FROM viviendas WHERE id_vivienda = ?", [id_vivienda]);
        if (viviendas.length === 0) {
            return res.status(404).json({ ok: false, mensaje: "La vivienda seleccionada no existe" });
        }

        // Verificar que el usuario exista
        const [usuarios] = await pool.query("SELECT id_user FROM usuarios WHERE id_user = ?", [id_user]);
        if (usuarios.length === 0) {
            return res.status(404).json({ ok: false, mensaje: "El usuario seleccionado no existe" });
        }

        const [resultado] = await pool.query(
            "INSERT INTO citas (id_vivienda, id_user, fecha, hora) VALUES (?, ?, ?, ?)",
            [id_vivienda, id_user, fecha, hora]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Cita agendada exitosamente",
            id_cita: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al crear la cita" });
    }
});

// =========================
// ACTUALIZAR CITA
// =========================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { id_vivienda, id_user, fecha, hora } = req.body;

        if (!id_vivienda || !id_user || !fecha || !hora) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        const [resultado] = await pool.query(
            "UPDATE citas SET id_vivienda = ?, id_user = ?, fecha = ?, hora = ? WHERE id_cita = ?",
            [id_vivienda, id_user, fecha, hora, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
        }

        res.json({ ok: true, mensaje: "Cita actualizada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar la cita" });
    }
});

// =========================
// ELIMINAR CITA
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM citas WHERE id_cita = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
        }

        res.json({ ok: true, mensaje: "Cita eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la cita" });
    }
});

export default router;
