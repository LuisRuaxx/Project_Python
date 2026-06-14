export default function Modal({ titulo, onCerrar, children }) {
    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{titulo}</h2>
                    <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
