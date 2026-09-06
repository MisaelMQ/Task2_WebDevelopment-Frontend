import { Link } from "react-router-dom";
import logoBlue from "../assets/img/logo/logo-blue-whit-whitebg-bo.svg";

function LoginPage() {
    return (
        <main className="login-page">
            <section
                className="login-panel"
                aria-labelledby="login-title"
            >
                <div className="login-card">
                    <img
                        className="login-card__logo"
                        src={logoBlue}
                        alt="Logo institucional"
                    />

                    <header className="login-card__header">
                        <h1 id="login-title">Iniciar sesión</h1>

                        <p className="text-muted">
                            La autenticación con el backend será implementada en la
                            siguiente fase.
                        </p>
                    </header>

                    <div className="login-card__form">
                        <Link
                            className="button button--primary button--block"
                            to="/dashboard"
                        >
                            Probar navegación
                        </Link>
                    </div>
                </div>
            </section>

            <aside
                className="login-visual"
                aria-label="Descripción del sistema"
            >
                <div className="login-visual__content stack-16">
                    <p className="small-flexo text-demi">
                        CX - EXPERIENCIA AL CLIENTE
                    </p>

                    <h2>Seguimiento NPS</h2>

                    <p>
                        Consulta la experiencia de los clientes y administra los
                        canales y encuestas del sistema.
                    </p>
                </div>
            </aside>
        </main>
    );
}

export default LoginPage;