import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../conexion.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// REGISTRO DE USUARIO
// =========================
router.post("/registro", async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });
        }

        // Verificar si el correo ya existe
        const [existentes] = await pool.query(
            "SELECT id_user FROM usuarios WHERE correo = ?",
            [correo]
        );

        if (existentes.length > 0) {
            return res.status(409).json({ ok: false, mensaje: "El correo ya está registrado" });
        }

        // Encriptar contraseña
        const hashContrasena = await bcrypt.hash(contrasena, 10);

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)",
            [nombre, correo, hashContrasena]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado exitosamente",
            id_user: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error en el servidor al registrar usuario" });
    }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ ok: false, mensaje: "Correo y contraseña son obligatorios" });
        }

        const [usuarios] = await pool.query(
            "SELECT * FROM usuarios WHERE correo = ?",
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
        }

        const usuario = usuarios[0];
        const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!coincide) {
            return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
        }

        // Generar token
        const token = jwt.sign(
            { id_user: usuario.id_user, nombre: usuario.nombre, correo: usuario.correo },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            ok: true,
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id_user: usuario.id_user,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error en el servidor al iniciar sesión" });
    }
});

export default router;
