import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import DashboardLayout from "./pages/DashboardLayout";
import Resumen from "./pages/Resumen";
import Viviendas from "./pages/Viviendas";
import Citas from "./pages/Citas";
import Usuarios from "./pages/Usuarios";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    <Route
                        path="/dashboard"
                        element={
                            <RutaProtegida>
                                <DashboardLayout />
                            </RutaProtegida>
                        }
                    >
                        <Route index element={<Resumen />} />
                        <Route path="viviendas" element={<Viviendas />} />
                        <Route path="citas" element={<Citas />} />
                        <Route path="usuarios" element={<Usuarios />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
