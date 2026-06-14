import { useEffect, useState } from "react";
import api from "../services/api";
import Alerta from "../components/Alerta";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const FORM_VACIO = { nombre: "", correo: "", contrasena: "" };

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [formulario, setFormulario] = useState(FORM_VACIO);
    const [enviando, setEnviando] = useState(false);

    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    const { usuario: usuarioActual } = useAuth();

    const cargarUsuarios = async () => {
        setCargando(true);
        try {
            const respuesta = await api.get("/usuarios");
            setUsuarios(respuesta.data.data);
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al cargar los usuarios"
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const abrirModalCrear = () => {
        setFormulario(FORM_VACIO);
        setModoEdicion(false);
        setIdEditando(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (usuario) => {
        setFormulario({ nombre: usuario.nombre, correo: usuario.correo, contrasena: "" });
        setModoEdicion(true);
        setIdEditando(usuario.id_user);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormulario(FORM_VACIO);
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario((prev) => ({ ...prev, [name]: value }));
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setAlerta({ tipo: "", mensaje: "" });

        try {
            if (modoEdicion) {
                const payload = { nombre: formulario.nombre, correo: formulario.correo };
                if (formulario.contrasena.trim() !== "") {
                    payload.contrasena = formulario.contrasena;
                }
                await api.put(`/usuarios/${idEditando}`, payload);
                setAlerta({ tipo: "exito", mensaje: "Usuario actualizado exitosamente" });
            } else {
                if (!formulario.contrasena || formulario.contrasena.trim() === "") {
                    setAlerta({ tipo: "error", mensaje: "La contraseña es obligatoria para crear un usuario" });
                    setEnviando(false);
                    return;
                }
                await api.post("/usuarios", formulario);
                setAlerta({ tipo: "exito", mensaje: "Usuario creado exitosamente" });
            }

            cerrarModal();
            cargarUsuarios();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al guardar el usuario"
            });
        } finally {
            setEnviando(false);
        }
    };

    const eliminarUsuario = async (id) => {
        try {
            await api.delete(`/usuarios/${id}`);
            setAlerta({ tipo: "exito", mensaje: "Usuario eliminado exitosamente" });
            setConfirmarEliminar(null);
            cargarUsuarios();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al eliminar el usuario"
            });
            setConfirmarEliminar(null);
        }
    };

    return (
        <div>
            <h1>Usuarios</h1>
            <p style={{ color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>
                Gestiona las cuentas de clientes y administradores registrados en la plataforma.
            </p>

            <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

            <div className="panel">
                <div className="panel-header">
                    <h2>Listado de usuarios</h2>
                    <button className="btn btn-dorado" onClick={abrirModalCrear}>
                        + Nuevo usuario
                    </button>
                </div>

                {cargando ? (
                    <p>Cargando usuarios...</p>
                ) : usuarios.length === 0 ? (
                    <p className="texto-vacio">No hay usuarios registrados todavía.</p>
                ) : (
                    <div className="tabla-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id_user}>
                                        <td>{usuario.id_user}</td>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.correo}</td>
                                        <td>
                                            <div className="acciones-celda">
                                                <button className="btn btn-secundario btn-pequeno" onClick={() => abrirModalEditar(usuario)}>
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-peligro btn-pequeno"
                                                    onClick={() => setConfirmarEliminar(usuario.id_user)}
                                                    disabled={usuario.id_user === usuarioActual?.id_user}
                                                    title={usuario.id_user === usuarioActual?.id_user ? "No puedes eliminar tu propia cuenta" : ""}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalAbierto && (
                <Modal titulo={modoEdicion ? "Editar usuario" : "Nuevo usuario"} onCerrar={cerrarModal}>
                    <form onSubmit={manejarSubmit}>
                        <div className="form-grupo">
                            <label htmlFor="nombre">Nombre completo</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formulario.nombre}
                                onChange={manejarCambio}
                                placeholder="Nombre del usuario"
                                required
                            />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="correo">Correo electrónico</label>
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                value={formulario.correo}
                                onChange={manejarCambio}
                                placeholder="ejemplo@correo.com"
                                required
                            />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="contrasena">
                                Contraseña {modoEdicion && "(dejar vacío para mantener la actual)"}
                            </label>
                            <input
                                id="contrasena"
                                name="contrasena"
                                type="password"
                                value={formulario.contrasena}
                                onChange={manejarCambio}
                                placeholder="••••••••"
                                minLength={6}
                                required={!modoEdicion}
                            />
                        </div>

                        <div className="form-acciones">
                            <button type="button" className="btn btn-secundario" onClick={cerrarModal}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-dorado" disabled={enviando}>
                                {enviando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Crear usuario"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirmarEliminar !== null && (
                <Modal titulo="Confirmar eliminación" onCerrar={() => setConfirmarEliminar(null)}>
                    <p style={{ marginBottom: "1.5rem" }}>
                        ¿Estás seguro de que deseas eliminar este usuario? Esta acción también eliminará sus citas asociadas y no se puede deshacer.
                    </p>
                    <div className="form-acciones">
                        <button className="btn btn-secundario" onClick={() => setConfirmarEliminar(null)}>
                            Cancelar
                        </button>
                        <button className="btn btn-peligro" onClick={() => eliminarUsuario(confirmarEliminar)}>
                            Eliminar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
