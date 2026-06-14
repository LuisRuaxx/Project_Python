import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alerta from "../components/Alerta";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [cargando, setCargando] = useState(false);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const { login } = useAuth();
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setAlerta({ tipo: "", mensaje: "" });
        setCargando(true);

        try {
            await login(correo, contrasena);
            navigate("/dashboard");
        } catch (error) {
            const mensaje = error.response?.data?.mensaje || "Error al iniciar sesión. Intenta de nuevo.";
            setAlerta({ tipo: "error", mensaje });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-titulo">Horizon Haven</h1>
                <p className="auth-subtitulo">Find Your Place. Own Your Future.</p>

                <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

                <form onSubmit={manejarSubmit}>
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
                        />
                    </div>

                    <button type="submit" className="btn btn-primario" disabled={cargando}>
                        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="auth-link">
                    ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}
