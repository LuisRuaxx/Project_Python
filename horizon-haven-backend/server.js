import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import viviendasRoutes from "./routes/viviendas.js";
import citasRoutes from "./routes/citas.js";
import usuariosRoutes from "./routes/usuarios.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/viviendas", viviendasRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ ok: true, mensaje: "API de Horizon Haven funcionando correctamente 🏠" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
