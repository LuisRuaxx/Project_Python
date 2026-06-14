import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alerta from "../components/Alerta";

export default function Registro() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [cargando, setCargando] = useState(false);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const { registro } = useAuth();
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setAlerta({ tipo: "", mensaje: "" });

        if (contrasena !== confirmarContrasena) {
            setAlerta({ tipo: "error", mensaje: "Las contraseñas no coinciden" });
            return;
        }

        setCargando(true);
        try {
            await registro(nombre, correo, contrasena);
            setAlerta({ tipo: "exito", mensaje: "Cuenta creada exitosamente. Redirigiendo al inicio de sesión..." });
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || "Error al registrar la cuenta. Intenta de nuevo.";
            setAlerta({ tipo: "error", mensaje });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-titulo">Horizon Haven</h1>
                <p className="auth-subtitulo">Crea tu cuenta</p>

                <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

                <form onSubmit={manejarSubmit}>
                    <div className="form-grupo">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Tu nombre"
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            id="contrasena"
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="confirmar">Confirmar contraseña</label>
                        <input
                            id="confirmar"
                            type="password"
                            value={confirmarContrasena}
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primario" disabled={cargando}>
                        {cargando ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="auth-link">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}
