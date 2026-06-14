import { useEffect, useState } from "react";
import api from "../services/api";
import Alerta from "../components/Alerta";
import Modal from "../components/Modal";

const FORM_VACIO = { id_vivienda: "", id_user: "", fecha: "", hora: "" };

export default function Citas() {
    const [citas, setCitas] = useState([]);
    const [viviendas, setViviendas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [formulario, setFormulario] = useState(FORM_VACIO);
    const [enviando, setEnviando] = useState(false);

    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resCitas, resViviendas, resUsuarios] = await Promise.all([
                api.get("/citas"),
                api.get("/viviendas"),
                api.get("/usuarios")
            ]);
            setCitas(resCitas.data.data);
            setViviendas(resViviendas.data.data);
            setUsuarios(resUsuarios.data.data);
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al cargar las citas"
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirModalCrear = () => {
        setFormulario(FORM_VACIO);
        setModoEdicion(false);
        setIdEditando(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (cita) => {
        setFormulario({
            id_vivienda: cita.id_vivienda,
            id_user: cita.id_user,
            fecha: cita.fecha.slice(0, 10),
            hora: cita.hora
        });
        setModoEdicion(true);
        setIdEditando(cita.id_cita);
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
            const payload = {
                id_vivienda: parseInt(formulario.id_vivienda),
                id_user: parseInt(formulario.id_user),
                fecha: formulario.fecha,
                hora: formulario.hora
            };

            if (modoEdicion) {
                await api.put(`/citas/${idEditando}`, payload);
                setAlerta({ tipo: "exito", mensaje: "Cita actualizada exitosamente" });
            } else {
                await api.post("/citas", payload);
                setAlerta({ tipo: "exito", mensaje: "Cita agendada exitosamente" });
            }

            cerrarModal();
            cargarDatos();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al guardar la cita"
            });
        } finally {
            setEnviando(false);
        }
    };

    const eliminarCita = async (id) => {
        try {
            await api.delete(`/citas/${id}`);
            setAlerta({ tipo: "exito", mensaje: "Cita eliminada exitosamente" });
            setConfirmarEliminar(null);
            cargarDatos();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al eliminar la cita"
            });
            setConfirmarEliminar(null);
        }
    };

    const formatoFecha = (fecha) => {
        const f = new Date(fecha);
        return f.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <div>
            <h1>Citas</h1>
            <p style={{ color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>
                Agenda y administra las visitas a las propiedades.
            </p>

            <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

            <div className="panel">
                <div className="panel-header">
                    <h2>Listado de citas</h2>
                    <button
                        className="btn btn-dorado"
                        onClick={abrirModalCrear}
                        disabled={viviendas.length === 0 || usuarios.length === 0}
                        title={viviendas.length === 0 || usuarios.length === 0 ? "Debes tener al menos una vivienda y un usuario registrados" : ""}
                    >
                        + Nueva cita
                    </button>
                </div>

                {cargando ? (
                    <p>Cargando citas...</p>
                ) : citas.length === 0 ? (
                    <p className="texto-vacio">No hay citas agendadas todavía.</p>
                ) : (
                    <div className="tabla-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vivienda</th>
                                    <th>Cliente</th>
                                    <th>Correo</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {citas.map((cita) => (
                                    <tr key={cita.id_cita}>
                                        <td>{cita.id_cita}</td>
                                        <td>{cita.tipo_vivienda} (ID {cita.id_vivienda})</td>
                                        <td>{cita.nombre_usuario}</td>
                                        <td>{cita.correo_usuario}</td>
                                        <td>{formatoFecha(cita.fecha)}</td>
                                        <td>{cita.hora}</td>
                                        <td>
                                            <div className="acciones-celda">
                                                <button className="btn btn-secundario btn-pequeno" onClick={() => abrirModalEditar(cita)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-peligro btn-pequeno" onClick={() => setConfirmarEliminar(cita.id_cita)}>
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
                <Modal titulo={modoEdicion ? "Editar cita" : "Nueva cita"} onCerrar={cerrarModal}>
                    <form onSubmit={manejarSubmit}>
                        <div className="form-grupo">
                            <label htmlFor="id_vivienda">Vivienda</label>
                            <select id="id_vivienda" name="id_vivienda" value={formulario.id_vivienda} onChange={manejarCambio} required>
                                <option value="">Selecciona una vivienda</option>
                                {viviendas.map((v) => (
                                    <option key={v.id_vivienda} value={v.id_vivienda}>
                                        #{v.id_vivienda} - {v.tipo_vivienda} ({v.estado})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="id_user">Cliente</label>
                            <select id="id_user" name="id_user" value={formulario.id_user} onChange={manejarCambio} required>
                                <option value="">Selecciona un usuario</option>
                                {usuarios.map((u) => (
                                    <option key={u.id_user} value={u.id_user}>
                                        {u.nombre} ({u.correo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-fila">
                            <div className="form-grupo">
                                <label htmlFor="fecha">Fecha</label>
                                <input
                                    id="fecha"
                                    name="fecha"
                                    type="date"
                                    value={formulario.fecha}
                                    onChange={manejarCambio}
                                    required
                                />
                            </div>
                            <div className="form-grupo">
                                <label htmlFor="hora">Hora</label>
                                <input
                                    id="hora"
                                    name="hora"
                                    type="time"
                                    value={formulario.hora}
                                    onChange={manejarCambio}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-acciones">
                            <button type="button" className="btn btn-secundario" onClick={cerrarModal}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-dorado" disabled={enviando}>
                                {enviando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Agendar cita"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirmarEliminar !== null && (
                <Modal titulo="Confirmar eliminación" onCerrar={() => setConfirmarEliminar(null)}>
                    <p style={{ marginBottom: "1.5rem" }}>
                        ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
                    </p>
                    <div className="form-acciones">
                        <button className="btn btn-secundario" onClick={() => setConfirmarEliminar(null)}>
                            Cancelar
                        </button>
                        <button className="btn btn-peligro" onClick={() => eliminarCita(confirmarEliminar)}>
                            Eliminar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
