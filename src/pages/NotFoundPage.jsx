import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <main className="page-main">
            <div className="container-narrow">
                <section
                    className="card"
                    aria-labelledby="not-found-title"
                >
                    <div className="card__body stack-16 text-center">
                        <i
                            className="bi bi-exclamation-circle"
                            aria-hidden="true"
                            style={{
                                color: "var(--bcp-color-orange)",
                                fontSize: "2.5rem",
                            }}
                        />

                        <h1 id="not-found-title">Página no encontrada</h1>

                        <p className="text-muted">
                            La dirección solicitada no pertenece a esta aplicación.
                        </p>

                        <div>
                            <Link
                                className="button button--primary"
                                to="/dashboard"
                            >
                                Volver al dashboard
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default NotFoundPage;