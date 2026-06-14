import { useEffect, useState } from "react";
import api from "../services/api";
import Alerta from "../components/Alerta";
import Modal from "../components/Modal";

const TIPOS_VIVIENDA = ["Apartamento", "Casa", "Loft", "Penthouse", "Duplex", "Finca", "Estudio"];
const ESTADOS_VIVIENDA = ["Excelente", "Buena", "Media", "Mala", "Deteriorada"];

const FORM_VACIO = { tipo_vivienda: "Apartamento", precio: "", tamano: "", estado: "Excelente" };

export default function Viviendas() {
    const [viviendas, setViviendas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [formulario, setFormulario] = useState(FORM_VACIO);
    const [enviando, setEnviando] = useState(false);

    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    const cargarViviendas = async () => {
        setCargando(true);
        try {
            const respuesta = await api.get("/viviendas");
            setViviendas(respuesta.data.data);
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al cargar las viviendas"
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarViviendas();
    }, []);

    const abrirModalCrear = () => {
        setFormulario(FORM_VACIO);
        setModoEdicion(false);
        setIdEditando(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (vivienda) => {
        setFormulario({
            tipo_vivienda: vivienda.tipo_vivienda,
            precio: vivienda.precio,
            tamano: vivienda.tamano,
            estado: vivienda.estado
        });
        setModoEdicion(true);
        setIdEditando(vivienda.id_vivienda);
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
                tipo_vivienda: formulario.tipo_vivienda,
                precio: parseFloat(formulario.precio),
                tamano: parseFloat(formulario.tamano),
                estado: formulario.estado
            };

            if (modoEdicion) {
                await api.put(`/viviendas/${idEditando}`, payload);
                setAlerta({ tipo: "exito", mensaje: "Vivienda actualizada exitosamente" });
            } else {
                await api.post("/viviendas", payload);
                setAlerta({ tipo: "exito", mensaje: "Vivienda creada exitosamente" });
            }

            cerrarModal();
            cargarViviendas();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al guardar la vivienda"
            });
        } finally {
            setEnviando(false);
        }
    };

    const eliminarVivienda = async (id) => {
        try {
            await api.delete(`/viviendas/${id}`);
            setAlerta({ tipo: "exito", mensaje: "Vivienda eliminada exitosamente" });
            setConfirmarEliminar(null);
            cargarViviendas();
        } catch (error) {
            setAlerta({
                tipo: "error",
                mensaje: error.response?.data?.mensaje || "Error al eliminar la vivienda"
            });
            setConfirmarEliminar(null);
        }
    };

    const formatoPrecio = (precio) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precio);

    const claseBadge = (estado) => {
        const mapa = {
            Excelente: "badge-excelente",
            Buena: "badge-buena",
            Media: "badge-media",
            Mala: "badge-mala",
            Deteriorada: "badge-deteriorada"
        };
        return `badge ${mapa[estado] || ""}`;
    };

    return (
        <div>
            <h1>Viviendas</h1>
            <p style={{ color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>
                Gestiona el catálogo de propiedades disponibles para venta, alquiler y compra.
            </p>

            <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

            <div className="panel">
                <div className="panel-header">
                    <h2>Listado de viviendas</h2>
                    <button className="btn btn-dorado" onClick={abrirModalCrear}>
                        + Nueva vivienda
                    </button>
                </div>

                {cargando ? (
                    <p>Cargando viviendas...</p>
                ) : viviendas.length === 0 ? (
                    <p className="texto-vacio">No hay viviendas registradas todavía.</p>
                ) : (
                    <div className="tabla-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Precio</th>
                                    <th>Tamaño (m²)</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viviendas.map((vivienda) => (
                                    <tr key={vivienda.id_vivienda}>
                                        <td>{vivienda.id_vivienda}</td>
                                        <td>{vivienda.tipo_vivienda}</td>
                                        <td>{formatoPrecio(vivienda.precio)}</td>
                                        <td>{vivienda.tamano} m²</td>
                                        <td><span className={claseBadge(vivienda.estado)}>{vivienda.estado}</span></td>
                                        <td>
                                            <div className="acciones-celda">
                                                <button className="btn btn-secundario btn-pequeno" onClick={() => abrirModalEditar(vivienda)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-peligro btn-pequeno" onClick={() => setConfirmarEliminar(vivienda.id_vivienda)}>
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
                <Modal titulo={modoEdicion ? "Editar vivienda" : "Nueva vivienda"} onCerrar={cerrarModal}>
                    <form onSubmit={manejarSubmit}>
                        <div className="form-grupo">
                            <label htmlFor="tipo_vivienda">Tipo de vivienda</label>
                            <select id="tipo_vivienda" name="tipo_vivienda" value={formulario.tipo_vivienda} onChange={manejarCambio} required>
                                {TIPOS_VIVIENDA.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-fila">
                            <div className="form-grupo">
                                <label htmlFor="precio">Precio (COP)</label>
                                <input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formulario.precio}
                                    onChange={manejarCambio}
                                    placeholder="Ej: 250000000"
                                    required
                                />
                            </div>
                            <div className="form-grupo">
                                <label htmlFor="tamano">Tamaño (m²)</label>
                                <input
                                    id="tamano"
                                    name="tamano"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formulario.tamano}
                                    onChange={manejarCambio}
                                    placeholder="Ej: 85.5"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="estado">Estado de la vivienda</label>
                            <select id="estado" name="estado" value={formulario.estado} onChange={manejarCambio} required>
                                {ESTADOS_VIVIENDA.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-acciones">
                            <button type="button" className="btn btn-secundario" onClick={cerrarModal}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-dorado" disabled={enviando}>
                                {enviando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Crear vivienda"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirmarEliminar !== null && (
                <Modal titulo="Confirmar eliminación" onCerrar={() => setConfirmarEliminar(null)}>
                    <p style={{ marginBottom: "1.5rem" }}>
                        ¿Estás seguro de que deseas eliminar esta vivienda? Esta acción también eliminará las citas asociadas y no se puede deshacer.
                    </p>
                    <div className="form-acciones">
                        <button className="btn btn-secundario" onClick={() => setConfirmarEliminar(null)}>
                            Cancelar
                        </button>
                        <button className="btn btn-peligro" onClick={() => eliminarVivienda(confirmarEliminar)}>
                            Eliminar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
