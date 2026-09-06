import { NavLink, Outlet } from "react-router-dom";
import logoWhite from "../assets/img/logo/logo-white-with-bluebg-bo.svg";

function AppLayout() {
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
                                <NavLink className="navbar__link" to="/dashboard">
                                    Dashboard
                                </NavLink>
                            </li>

                            <li>
                                <NavLink className="navbar__link" to="/canales">
                                    Canales
                                </NavLink>
                            </li>

                            <li>
                                <NavLink className="navbar__link" to="/encuestas">
                                    Encuestas
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    <div className="navbar__profile">
                        <div>
                            <p className="small-flexo text-demi">
                                Usuario de prueba
                            </p>
                            <p className="extra-small-flexo">
                                Sesión pendiente
                            </p>
                        </div>

                        <span className="navbar__avatar" aria-hidden="true">
                            UP
                        </span>

                        <NavLink className="navbar__link" to="/login">
                            Salir
                        </NavLink>
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