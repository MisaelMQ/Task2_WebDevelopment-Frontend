import { useState } from "react";
import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { ApiError } from "../api/http.js";
import logoBlue from "../assets/img/logo/logo-blue-whit-whitebg-bo.svg";
import { useAuth } from "../auth/useAuth.js";

function LoginPage() {
    const {
        isAuthenticated,
        login,
    } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await login({
                username,
                password,
            });

            const destination =
                location.state?.from?.pathname ?? "/dashboard";

            navigate(destination, {
                replace: true,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    "Ocurrió un error inesperado al iniciar sesión.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

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
                            Ingresa tus datos para acceder al seguimiento de CX.
                        </p>
                    </header>

                    <form
                        className="login-card__form"
                        onSubmit={handleSubmit}
                    >
                        {errorMessage && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                                aria-live="polite"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div className="form-field">
                            <label className="form-label" htmlFor="username">
                                Usuario
                            </label>

                            <input
                                className="form-control"
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Ingresa tu usuario"
                                autoComplete="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label" htmlFor="password">
                                Contraseña
                            </label>

                            <input
                                className="form-control"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <button
                            className="button button--primary button--block"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />
                                    Ingresando...
                                </>
                            ) : (
                                <>
                                    <i
                                        className="bi bi-box-arrow-in-right"
                                        aria-hidden="true"
                                    />
                                    Ingresar
                                </>
                            )}
                        </button>
                    </form>
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