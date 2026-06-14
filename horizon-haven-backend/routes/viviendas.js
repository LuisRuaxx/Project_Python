import express from "express";
import pool from "../conexion.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas de viviendas requieren autenticación
router.use(verificarToken);

// =========================
// OBTENER TODAS LAS VIVIENDAS
// =========================
router.get("/", async (req, res) => {
    try {
        const [viviendas] = await pool.query(
            "SELECT * FROM viviendas ORDER BY id_vivienda DESC"
        );
        res.json({ ok: true, data: viviendas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener las viviendas" });
    }
});

// =========================
// OBTENER UNA VIVIENDA POR ID
// =========================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [viviendas] = await pool.query(
            "SELECT * FROM viviendas WHERE id_vivienda = ?",
            [id]
        );

        if (viviendas.length === 0) {
            return res.status(404).json({ ok: false, mensaje: "Vivienda no encontrada" });
        }

        res.json({ ok: true, data: viviendas[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener la vivienda" });
    }
});

// =========================
// CREAR VIVIENDA
// =========================
router.post("/", async (req, res) => {
    try {
        const { tipo_vivienda, precio, tamano, estado } = req.body;

        if (!tipo_vivienda || !precio || !tamano || !estado) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        const [resultado] = await pool.query(
            "INSERT INTO viviendas (tipo_vivienda, precio, tamano, estado) VALUES (?, ?, ?, ?)",
            [tipo_vivienda, precio, tamano, estado]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Vivienda creada exitosamente",
            id_vivienda: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al crear la vivienda" });
    }
});

// =========================
// ACTUALIZAR VIVIENDA
// =========================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_vivienda, precio, tamano, estado } = req.body;

        if (!tipo_vivienda || !precio || !tamano || !estado) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        const [resultado] = await pool.query(
            "UPDATE viviendas SET tipo_vivienda = ?, precio = ?, tamano = ?, estado = ? WHERE id_vivienda = ?",
            [tipo_vivienda, precio, tamano, estado, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "Vivienda no encontrada" });
        }

        res.json({ ok: true, mensaje: "Vivienda actualizada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar la vivienda" });
    }
});

// =========================
// ELIMINAR VIVIENDA
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM viviendas WHERE id_vivienda = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "Vivienda no encontrada" });
        }

        res.json({ ok: true, mensaje: "Vivienda eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la vivienda" });
    }
});

export default router;
