import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listChannelsRequest } from "../api/channelsApi.js";
import { listSurveysRequest } from "../api/surveysApi.js";
import { ApiError } from "../api/http.js";
import { useAuth } from "../auth/useAuth.js";

const INITIAL_DASHBOARD = {
    channels: 0,
    surveys: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    pending: 0,
    reviewed: 0,
    nps: 0,
    recentSurveys: [],
};

function getTotal(result) {
    return result?.meta?.total ?? 0;
}

function calculatePercentage(value, total) {
    if (total === 0) {
        return 0;
    }

    return Math.round((value / total) * 100);
}

function calculateNps(promoters, detractors, total) {
    if (total === 0) {
        return 0;
    }

    return Math.round(
        ((promoters - detractors) / total) * 100,
    );
}

function formatDate(value) {
    if (!value) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
}

function getCategoryClass(category) {
    const classes = {
        Promotor: "status-badge--promoter",
        Pasivo: "status-badge--passive",
        Detractor: "status-badge--detractor",
    };

    return classes[category] ?? "";
}

function getScoreClass(score) {
    if (score >= 9) {
        return "nps-metric-pill--high";
    }

    if (score >= 7) {
        return "nps-metric-pill--warn";
    }

    return "nps-metric-pill--detractor";
}

function DashboardPage() {
    const { accessToken, isAdmin } = useAuth();

    const [dashboard, setDashboard] =
        useState(INITIAL_DASHBOARD);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadDashboard() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const [
                    channelsResult,
                    surveysResult,
                    promotersResult,
                    passivesResult,
                    detractorsResult,
                    pendingResult,
                ] = await Promise.all([
                    listChannelsRequest(
                        {
                            page: 1,
                            pageSize: 1,
                        },
                        accessToken,
                        controller.signal,
                    ),
                    listSurveysRequest(
                        {
                            page: 1,
                            pageSize: 5,
                        },
                        accessToken,
                        controller.signal,
                    ),
                    listSurveysRequest(
                        {
                            page: 1,
                            pageSize: 1,
                            category: "Promotor",
                        },
                        accessToken,
                        controller.signal,
                    ),
                    listSurveysRequest(
                        {
                            page: 1,
                            pageSize: 1,
                            category: "Pasivo",
                        },
                        accessToken,
                        controller.signal,
                    ),
                    listSurveysRequest(
                        {
                            page: 1,
                            pageSize: 1,
                            category: "Detractor",
                        },
                        accessToken,
                        controller.signal,
                    ),
                    listSurveysRequest(
                        {
                            page: 1,
                            pageSize: 1,
                            status: "Pendiente",
                        },
                        accessToken,
                        controller.signal,
                    ),
                ]);

                const surveys = getTotal(surveysResult);
                const promoters = getTotal(promotersResult);
                const passives = getTotal(passivesResult);
                const detractors = getTotal(detractorsResult);
                const pending = getTotal(pendingResult);

                setDashboard({
                    channels: getTotal(channelsResult),
                    surveys,
                    promoters,
                    passives,
                    detractors,
                    pending,
                    reviewed: Math.max(surveys - pending, 0),
                    nps: calculateNps(
                        promoters,
                        detractors,
                        surveys,
                    ),
                    recentSurveys: surveysResult.data ?? [],
                });
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                setDashboard(INITIAL_DASHBOARD);

                if (error instanceof ApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage(
                        "No fue posible cargar la información del dashboard.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadDashboard();

        return () => controller.abort();
    }, [accessToken]);

    const promoterPercentage = calculatePercentage(
        dashboard.promoters,
        dashboard.surveys,
    );

    const passivePercentage = calculatePercentage(
        dashboard.passives,
        dashboard.surveys,
    );

    const detractorPercentage = calculatePercentage(
        dashboard.detractors,
        dashboard.surveys,
    );

    if (isLoading) {
        return (
            <div className="container">
                <section
                    className="card dashboard-loading"
                    aria-labelledby="dashboard-loading-title"
                >
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p
                        id="dashboard-loading-title"
                        className="mb-0"
                    >
                        Cargando indicadores...
                    </p>
                </section>
            </div>
        );
    }

    return (
        <div className="container">
            <nav aria-label="Ruta de navegación">
                <ol className="breadcrumb">
                    <li
                        className="breadcrumb-item active"
                        aria-current="page"
                    >
                        Dashboard
                    </li>
                </ol>
            </nav>

            <header className="page-header">
                <div className="page-header__content">
                    <p className="text-uppercase text-primary fw-semibold mb-1">
                        Gestión de experiencia
                    </p>

                    <h1>Dashboard NPS</h1>

                    <p className="text-muted mb-0">
                        Resumen general de los canales y encuestas
                        registradas.
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        className="button button--primary"
                        to="/encuestas/nueva"
                    >
                        <i
                            className="bi bi-plus-circle"
                            aria-hidden="true"
                        />
                        Registrar encuesta
                    </Link>
                )}
            </header>

            {errorMessage && (
                <div
                    className="alert alert-danger"
                    role="alert"
                    aria-live="polite"
                >
                    {errorMessage}
                </div>
            )}

            <section
                className="grid grid--metrics"
                aria-label="Indicadores generales"
            >
                <article className="card card--metric">
                    <div className="metric-card__header">
                        <div>
                            <p className="metric-card__label">
                                Canales registrados
                            </p>

                            <p className="metric-card__value">
                                {dashboard.channels}
                            </p>
                        </div>

                        <span className="dashboard-metric-icon">
                            <i
                                className="bi bi-diagram-3"
                                aria-hidden="true"
                            />
                        </span>
                    </div>

                    <div className="metric-card__footer">
                        <Link to="/canales">Ver canales</Link>
                    </div>
                </article>

                <article className="card card--metric">
                    <div className="metric-card__header">
                        <div>
                            <p className="metric-card__label">
                                Encuestas registradas
                            </p>

                            <p className="metric-card__value">
                                {dashboard.surveys}
                            </p>
                        </div>

                        <span className="dashboard-metric-icon">
                            <i
                                className="bi bi-chat-square-text"
                                aria-hidden="true"
                            />
                        </span>
                    </div>

                    <div className="metric-card__footer">
                        <Link to="/encuestas">Ver encuestas</Link>
                    </div>
                </article>

                <article className="card card--metric">
                    <div className="metric-card__header">
                        <div>
                            <p className="metric-card__label">
                                NPS general
                            </p>

                            <p className="metric-card__value">
                                {dashboard.nps}
                            </p>
                        </div>

                        <span className="dashboard-metric-icon">
                            <i
                                className="bi bi-speedometer2"
                                aria-hidden="true"
                            />
                        </span>
                    </div>

                    <div className="metric-card__footer">
                        <span className="metric-card__benchmark">
                            Escala de -100 a 100
                        </span>
                    </div>
                </article>

                <article className="card card--metric">
                    <div className="metric-card__header">
                        <div>
                            <p className="metric-card__label">
                                Pendientes de revisión
                            </p>

                            <p className="metric-card__value">
                                {dashboard.pending}
                            </p>
                        </div>

                        <span className="dashboard-metric-icon dashboard-metric-icon--warning">
                            <i
                                className="bi bi-clock-history"
                                aria-hidden="true"
                            />
                        </span>
                    </div>

                    <div className="metric-card__footer">
                        <span className="text-muted small">
                            {dashboard.reviewed} revisada(s)
                        </span>
                    </div>
                </article>
            </section>

            <div className="dashboard-section-grid">
                <section
                    className="card"
                    aria-labelledby="distribution-title"
                >
                    <div className="card__header">
                        <div>
                            <h2
                                id="distribution-title"
                                className="h4-flexo mb-1"
                            >
                                Distribución NPS
                            </h2>

                            <p className="text-muted small mb-0">
                                Clasificación de las encuestas registradas.
                            </p>
                        </div>
                    </div>

                    <div className="card__body">
                        <div className="dashboard-distribution-list">
                            <div className="dashboard-distribution-item">
                                <div className="dashboard-distribution-header">
                                    <span className="status-badge status-badge--promoter">
                                        Promotores
                                    </span>

                                    <strong>
                                        {dashboard.promoters} (
                                        {promoterPercentage}%)
                                    </strong>
                                </div>

                                <div className="dashboard-distribution-track">
                                    <span
                                        className="dashboard-distribution-bar dashboard-distribution-bar--promoter"
                                        style={{
                                            width: `${promoterPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-distribution-item">
                                <div className="dashboard-distribution-header">
                                    <span className="status-badge status-badge--passive">
                                        Pasivos
                                    </span>

                                    <strong>
                                        {dashboard.passives} (
                                        {passivePercentage}%)
                                    </strong>
                                </div>

                                <div className="dashboard-distribution-track">
                                    <span
                                        className="dashboard-distribution-bar dashboard-distribution-bar--passive"
                                        style={{
                                            width: `${passivePercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-distribution-item">
                                <div className="dashboard-distribution-header">
                                    <span className="status-badge status-badge--detractor">
                                        Detractores
                                    </span>

                                    <strong>
                                        {dashboard.detractors} (
                                        {detractorPercentage}%)
                                    </strong>
                                </div>

                                <div className="dashboard-distribution-track">
                                    <span
                                        className="dashboard-distribution-bar dashboard-distribution-bar--detractor"
                                        style={{
                                            width: `${detractorPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="card"
                    aria-labelledby="recent-surveys-title"
                >
                    <div className="card__header">
                        <div>
                            <h2
                                id="recent-surveys-title"
                                className="h4-flexo mb-1"
                            >
                                Encuestas recientes
                            </h2>

                            <p className="text-muted small mb-0">
                                Últimos registros recibidos desde la API.
                            </p>
                        </div>

                        <Link
                            className="table-action-link"
                            to="/encuestas"
                        >
                            Ver todas
                        </Link>
                    </div>

                    <div className="card__body">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Fecha</th>
                                        <th scope="col">Canal</th>
                                        <th scope="col">NPS</th>
                                        <th scope="col">Categoría</th>
                                        <th scope="col">Estado</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.recentSurveys.length === 0 ? (
                                        <tr>
                                            <td
                                                className="table-empty"
                                                colSpan="5"
                                            >
                                                No existen encuestas registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        dashboard.recentSurveys.map((survey) => (
                                            <tr key={survey.id}>
                                                <td>
                                                    {formatDate(
                                                        survey.fecha_encuesta,
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="survey-channel-cell">
                                                        <strong>
                                                            {survey.canal_nombre}
                                                        </strong>

                                                        <span className="survey-channel-code">
                                                            {survey.canal_codigo}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`nps-metric-pill ${getScoreClass(
                                                            survey.puntuacion_nps,
                                                        )}`}
                                                    >
                                                        {survey.puntuacion_nps}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${getCategoryClass(
                                                            survey.categoria_nps,
                                                        )}`}
                                                    >
                                                        {survey.categoria_nps}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${survey.estado === "Revisada"
                                                                ? "status-badge--active"
                                                                : "status-badge--passive"
                                                            }`}
                                                    >
                                                        {survey.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DashboardPage;