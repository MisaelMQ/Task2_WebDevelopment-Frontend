import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";
import logoWhite from "../assets/img/logo/logo-white-with-bluebg-bo.svg";
import { useAuth } from "../auth/useAuth.js";

function getInitials(name) {
    if (!name) {
        return "US";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
}

function AppLayout() {
    const {
        user,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    const roleLabel =
        user?.rol === "admin" ? "Administrador" : "Solo lectura";

    function handleLogout() {
        logout();
        navigate("/login", {
            replace: true,
        });
    }

    return (
        <div className="app-shell">
            <header className="navbar">
                <div className="container navbar__inner">
                    <NavLink
                        className="navbar__brand"
                        to="/dashboard"
                        aria-label="Ir al dashboard"
                    >
                        <img
                            className="navbar__logo"
                            src={logoWhite}
                            alt="Logo institucional"
                        />
                    </NavLink>

                    <nav aria-label="Navegación principal">
                        <ul className="navbar__nav">
                            <li>
                                <NavLink
                                    className="navbar__link"
                                    to="/dashboard"
                                >
                                    Dashboard
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    className="navbar__link"
                                    to="/canales"
                                >
                                    Canales
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    className="navbar__link"
                                    to="/encuestas"
                                >
                                    Encuestas
                                </NavLink>
                            </li>

                            <li className="d-md-none">
                                <button
                                    className="navbar__link navbar__button"
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    Salir
                                </button>
                            </li>
                        </ul>
                    </nav>

                    <div className="navbar__profile">
                        <div>
                            <p className="small-flexo text-demi">
                                {user?.nombre}
                            </p>

                            <p className="extra-small-flexo">
                                {roleLabel}
                            </p>
                        </div>

                        <span
                            className="navbar__avatar"
                            aria-hidden="true"
                        >
                            {getInitials(user?.nombre)}
                        </span>

                        <button
                            className="navbar__link navbar__button"
                            type="button"
                            onClick={handleLogout}
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            <main className="page-main">
                <Outlet />
            </main>

            <footer className="footer footer--slim">
                <div className="container footer__inner">
                    <img
                        className="footer__logo"
                        src={logoWhite}
                        alt="Logo institucional"
                    />

                    <p className="small-flexo">
                        Panel de administración de experiencia del cliente
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default AppLayout;