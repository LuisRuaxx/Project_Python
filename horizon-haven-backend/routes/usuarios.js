import express from "express";
import bcrypt from "bcryptjs";
import pool from "../conexion.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verificarToken);

// =========================
// OBTENER TODOS LOS USUARIOS (sin contraseña)
// =========================
router.get("/", async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            "SELECT id_user, nombre, correo FROM usuarios ORDER BY id_user DESC"
        );
        res.json({ ok: true, data: usuarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener los usuarios" });
    }
});

// =========================
// OBTENER UN USUARIO POR ID
// =========================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [usuarios] = await pool.query(
            "SELECT id_user, nombre, correo FROM usuarios WHERE id_user = ?",
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
        }

        res.json({ ok: true, data: usuarios[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el usuario" });
    }
});

// =========================
// CREAR USUARIO (admin agrega usuarios desde el dashboard)
// =========================
router.post("/", async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        const [existentes] = await pool.query("SELECT id_user FROM usuarios WHERE correo = ?", [correo]);
        if (existentes.length > 0) {
            return res.status(409).json({ ok: false, mensaje: "El correo ya está registrado" });
        }

        const hashContrasena = await bcrypt.hash(contrasena, 10);

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)",
            [nombre, correo, hashContrasena]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Usuario creado exitosamente",
            id_user: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al crear el usuario" });
    }
});

// =========================
// ACTUALIZAR USUARIO
// =========================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo) {
            return res.status(400).json({ ok: false, mensaje: "Nombre y correo son obligatorios" });
        }

        // Si se envía nueva contraseña, se actualiza también
        if (contrasena && contrasena.trim() !== "") {
            const hashContrasena = await bcrypt.hash(contrasena, 10);
            const [resultado] = await pool.query(
                "UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ? WHERE id_user = ?",
                [nombre, correo, hashContrasena, id]
            );
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
            }
        } else {
            const [resultado] = await pool.query(
                "UPDATE usuarios SET nombre = ?, correo = ? WHERE id_user = ?",
                [nombre, correo, id]
            );
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
            }
        }

        res.json({ ok: true, mensaje: "Usuario actualizado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar el usuario" });
    }
});

// =========================
// ELIMINAR USUARIO
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM usuarios WHERE id_user = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
        }

        res.json({ ok: true, mensaje: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar el usuario" });
    }
});

export default router;
