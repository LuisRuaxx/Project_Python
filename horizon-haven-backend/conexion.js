import mysql from "mysql2/promise";

// Pool de conexiones: maneja múltiples consultas concurrentes
// sin necesidad de abrir/cerrar conexión manualmente.
const pool = mysql.createPool({
    host: "localhost",
    database: "horizon_haven",
    user: "root",
    password: "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prueba de conexión inicial
try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión exitosa a la base de datos horizon_haven");
    conn.release();
} catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err.message);
}

export default pool;
