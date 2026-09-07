function ConfirmDialog({
    title,
    message,
    confirmLabel,
    isProcessing,
    errorMessage,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="modal-backdrop">
            <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                aria-describedby="confirmation-message"
            >
                <header className="modal__header">
                    <h2 id="confirmation-title">{title}</h2>

                    <button
                        className="button button--ghost button--small"
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                </header>

                <div className="modal__body stack-16">
                    <p id="confirmation-message">{message}</p>

                    {errorMessage && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                            aria-live="polite"
                        >
                            {errorMessage}
                        </div>
                    )}
                </div>

                <footer className="modal__footer">
                    <button
                        className="button button--secondary"
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        Cancelar
                    </button>

                    <button
                        className="button button--danger"
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <i
                                    className="bi bi-trash3"
                                    aria-hidden="true"
                                />
                                {confirmLabel}
                            </>
                        )}
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default ConfirmDialog;