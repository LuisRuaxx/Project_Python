import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const manejarLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>Horizon Haven</h2>
                    <p>BUY · SELL · RENT</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "activo" : ""}>
                        📊 Resumen
                    </NavLink>
                    <NavLink to="/dashboard/viviendas" className={({ isActive }) => isActive ? "activo" : ""}>
                        🏠 Viviendas
                    </NavLink>
                    <NavLink to="/dashboard/citas" className={({ isActive }) => isActive ? "activo" : ""}>
                        📅 Citas
                    </NavLink>
                    <NavLink to="/dashboard/usuarios" className={({ isActive }) => isActive ? "activo" : ""}>
                        👤 Usuarios
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <p className="sidebar-usuario">Sesión: {usuario?.nombre}</p>
                    <button className="btn btn-logout" onClick={manejarLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="contenido-principal">
                <Outlet />
            </main>
        </div>
    );
}
