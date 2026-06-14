import { useEffect, useState } from "react";
import api from "../services/api";
import Alerta from "../components/Alerta";

export default function Resumen() {
    const [datos, setDatos] = useState({ viviendas: 0, citas: 0, usuarios: 0, disponibles: 0 });
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resViviendas, resCitas, resUsuarios] = await Promise.all([
                    api.get("/viviendas"),
                    api.get("/citas"),
                    api.get("/usuarios")
                ]);

                const viviendas = resViviendas.data.data;
                const disponibles = viviendas.filter(v => v.estado === "Excelente" || v.estado === "Buena").length;

                setDatos({
                    viviendas: viviendas.length,
                    citas: resCitas.data.data.length,
                    usuarios: resUsuarios.data.data.length,
                    disponibles
                });
            } catch (error) {
                setAlerta({
                    tipo: "error",
                    mensaje: error.response?.data?.mensaje || "Error al cargar los datos del dashboard"
                });
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    return (
        <div>
            <h1>Resumen general</h1>
            <p style={{ color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>
                Bienvenido al panel de administración de Horizon Haven.
            </p>

            <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

            {cargando ? (
                <p>Cargando información...</p>
            ) : (
                <div className="resumen-grid">
                    <div className="tarjeta-resumen">
                        <h3>Total viviendas</h3>
                        <p className="valor">{datos.viviendas}</p>
                    </div>
                    <div className="tarjeta-resumen">
                        <h3>En buen estado</h3>
                        <p className="valor">{datos.disponibles}</p>
                    </div>
                    <div className="tarjeta-resumen">
                        <h3>Citas agendadas</h3>
                        <p className="valor">{datos.citas}</p>
                    </div>
                    <div className="tarjeta-resumen">
                        <h3>Usuarios registrados</h3>
                        <p className="valor">{datos.usuarios}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
