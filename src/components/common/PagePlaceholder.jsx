import { Link } from "react-router-dom";

function PagePlaceholder({ title, description, icon }) {
    return (
        <div className="container">
            <nav aria-label="Ruta de navegación">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link
                            className="text-breadcrumb-link"
                            to="/dashboard"
                        >
                            Inicio
                        </Link>
                    </li>

                    <li className="breadcrumb-item" aria-current="page">
                        {title}
                    </li>
                </ol>
            </nav>

            <header className="page-header">
                <div className="page-header__content">
                    <h1>{title}</h1>
                    <p className="text-muted">{description}</p>
                </div>
            </header>

            <section aria-labelledby="development-status">
                <article className="card">
                    <div className="card__body stack-16">
                        <i
                            className={`bi ${icon}`}
                            aria-hidden="true"
                            style={{
                                color: "var(--bcp-color-orange)",
                                fontSize: "2rem",
                            }}
                        />

                        <div className="stack-8">
                            <h2 id="development-status">
                                Estructura configurada
                            </h2>

                            <p className="text-muted">
                                Esta pantalla será implementada en su rama de
                                funcionalidad y utilizará información obtenida desde
                                la API REST.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}

export default PagePlaceholder;