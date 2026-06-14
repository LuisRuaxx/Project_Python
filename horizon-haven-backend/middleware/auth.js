import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ ok: false, mensaje: "Token no proporcionado" });
    }

    // El header viene como: "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ ok: false, mensaje: "Formato de token inválido" });
    }

    try {
        const datos = jwt.verify(token, JWT_SECRET);
        req.usuario = datos; // guardamos los datos del usuario decodificados
        next();
    } catch (error) {
        return res.status(403).json({ ok: false, mensaje: "Token inválido o expirado" });
    }
}
