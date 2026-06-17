import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";
import Alerta from "../components/Alerta";
import Modal from "../components/Modal";
import Vivienda from "../assets/Vivienda.png";
import Casa from "../assets/Casa.png";
import Departamento from "../assets/Departamento.png";
import Loft from "../assets/Loft.png";
import Finca from "../assets/Finca.png";
import Penthouse from "../assets/Penthouse.png";
import Duplex from "../assets/Duplex.png";
import Estudio from "../assets/Estudio.png";

const IMAGENES_CARRUSEL = [Vivienda, Casa, Departamento, Loft, Finca, Penthouse, Duplex, Estudio];
const TIEMPO_AUTOPLAY = 5000;

const TIPOS_VIVIENDA = ["Apartamento", "Casa", "Loft", "Penthouse", "Duplex", "Finca", "Estudio"];
const ESTADOS_VIVIENDA = ["Excelente", "Buena", "Media", "Mala", "Deteriorada"];

const FORM_VACIO = { tipo_vivienda: "Apartamento", precio: "", tamano: "", estado: "Excelente" };

export default function Viviendas() {
    const [viviendas, setViviendas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

    const [imagenActualIndex, setImagenActualIndex] = useState(0);
    const [autoplayHabilitado, setAutoplayHabilitado] = useState(true);
    const intervalRef = useRef(null);

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

    const siguienteImagen = useCallback(() => {
        setImagenActualIndex((prevIndex) => (prevIndex + 1) % IMAGENES_CARRUSEL.length);
    }, []);

    const anteriorImagen = () => {
        setImagenActualIndex((prevIndex) => (prevIndex - 1 + IMAGENES_CARRUSEL.length) % IMAGENES_CARRUSEL.length);
    };
-
    useEffect(() => {
        if (autoplayHabilitado) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(siguienteImagen, TIEMPO_AUTOPLAY);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [siguienteImagen, autoplayHabilitado]);

    const detenerAutoplay = () => setAutoplayHabilitado(false);
    const reanudarAutoplay = () => setAutoplayHabilitado(true);

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

    const estilosCarrusel = {
        contenedor: { position: "relative", width: "100%", overflow: "hidden", borderRadius: "12px", marginBottom: "2rem", cursor: "pointer" },
        imagen: { width: "100%", height: "400px", objectFit: "cover", transition: "transform 0.5s ease" },
        boton: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", padding: "10px 15px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", zIndex: 10, transition: "background 0.3s" },
        botonAnterior: { left: "10px" },
        botonSiguiente: { right: "10px" }
    };

    return (
        <div>
            <h1>Viviendas</h1>
            <p style={{ color: "var(--texto-secundario)", marginBottom: "1.5rem" }}>
                Gestiona el catálogo de propiedades disponibles para venta, alquiler y compra.
            </p>

            <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onCerrar={() => setAlerta({ tipo: "", mensaje: "" })} />

            {/* --- COMPONENTE INTERACTIVO DEL CARRUSEL --- */}
            <div
                style={estilosCarrusel.contenedor}
                onMouseEnter={detenerAutoplay}
                onMouseLeave={reanudarAutoplay}
            >
                <button
                    style={{...estilosCarrusel.boton, ...estilosCarrusel.botonAnterior}}
                    onClick={anteriorImagen}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}
                >
                    &#10094;
                </button>

                <img
                    src={IMAGENES_CARRUSEL[imagenActualIndex]}
                    alt={`Tipo de vivienda ${imagenActualIndex + 1}`}
                    style={estilosCarrusel.imagen}
                />

                <button
                    style={{...estilosCarrusel.boton, ...estilosCarrusel.botonSiguiente}}
                    onClick={siguienteImagen}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}
                >
                    &#10095;
                </button>
            </div>

            {/* --- PANEL DE TABLA DE VIVIENDAS --- */}
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

            {/* --- MODAL CREAR / EDITAR --- */}
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

            {/* --- MODAL CONFIRMAR ELIMINACIÓN --- */}
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