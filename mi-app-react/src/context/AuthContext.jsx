import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const guardado = localStorage.getItem("usuario");
        return guardado ? JSON.parse(guardado) : null;
    });

    const login = async (correo, contrasena) => {
        const respuesta = await api.post("/auth/login", { correo, contrasena });
        const { token, usuario: datosUsuario } = respuesta.data;

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));
        setUsuario(datosUsuario);

        return respuesta.data;
    };

    const registro = async (nombre, correo, contrasena) => {
        const respuesta = await api.post("/auth/registro", { nombre, correo, contrasena });
        return respuesta.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, registro, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
