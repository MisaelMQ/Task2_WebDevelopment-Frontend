import logoWhite from "./assets/img/logo/logo-white-with-bluebg-bo.svg";

function App() {
  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar__inner">
          <a className="navbar__brand" href="/" aria-label="Ir al inicio">
            <img
              className="navbar__logo"
              src={logoWhite}
              alt="Logo institucional"
            />
          </a>

          <nav aria-label="Navegación principal">
            <ul className="navbar__nav">
              <li>
                <a
                  className="navbar__link"
                  href="/"
                  aria-current="page"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a className="navbar__link" href="/">
                  Canales
                </a>
              </li>
              <li>
                <a className="navbar__link" href="/">
                  Encuestas
                </a>
              </li>
            </ul>
          </nav>

          <div className="navbar__profile">
            <div>
              <p className="small-flexo text-demi">Sistema NPS</p>
              <p className="extra-small-flexo">Configuración inicial</p>
            </div>

            <span className="navbar__avatar" aria-hidden="true">
              CX
            </span>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="container">
          <header className="page-header">
            <div className="page-header__content">
              <h1>CX Insight</h1>
              <p className="text-muted">
                Frontend React del Tablero NPS
              </p>
            </div>

            <button className="button button--primary" type="button">
              <i className="bi bi-check-circle" aria-hidden="true" />
              Configuración correcta
            </button>
          </header>

          <section
            className="row g-3"
            aria-label="Verificación de componentes"
          >
            <div className="col-12 col-md-6 col-xl-4">
              <article className="card card--metric h-100">
                <p className="metric-card__label">
                  Sistema visual
                </p>
                <p className="metric-card__value">BCP</p>
                <span className="metric-card__trend metric-card__trend--positive">
                  Estilos cargados
                </span>
              </article>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <article className="card card--metric h-100">
                <p className="metric-card__label">
                  Diseño responsivo
                </p>
                <p className="metric-card__value">CSS3</p>
                <span className="metric-card__trend metric-card__trend--positive">
                  Bootstrap disponible
                </span>
              </article>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <article className="card card--metric h-100">
                <p className="metric-card__label">
                  Comunicación REST
                </p>
                <p className="metric-card__value">API</p>
                <span className="metric-card__trend metric-card__trend--negative">
                  Pendiente de configurar
                </span>
              </article>
            </div>
          </section>
        </div>
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

export default App;