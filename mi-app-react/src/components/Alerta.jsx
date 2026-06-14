export default function Alerta({ tipo, mensaje, onCerrar }) {
    if (!mensaje) return null;

    return (
        <div className={`alerta alerta-${tipo}`}>
            <span className="alerta-icono">
                {tipo === "exito" ? "✓" : tipo === "error" ? "✕" : "ℹ"}
            </span>
            <span className="alerta-texto">{mensaje}</span>
            {onCerrar && (
                <button className="alerta-cerrar" onClick={onCerrar} aria-label="Cerrar">
                    ×
                </button>
            )}
        </div>
    );
}
