import {
    useEffect,
    useState,
} from "react";
import {
    Link,
    useLocation,
} from "react-router-dom";
import { listChannelsRequest } from "../api/channelsApi.js";
import { ApiError } from "../api/http.js";
import { listSurveysRequest } from "../api/surveysApi.js";
import { useAuth } from "../auth/useAuth.js";

const INITIAL_RESULT = {
    data: [],
    meta: {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
    },
};

const INITIAL_FILTERS = {
    search: "",
    channelId: "",
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
};

function getNpsClass(score) {
    if (score >= 9) {
        return "nps-metric-pill--high";
    }

    if (score >= 7) {
        return "nps-metric-pill--warn";
    }

    return "nps-metric-pill--detractor";
}

function getCategoryClass(category) {
    const categoryClasses = {
        Promotor: "status-badge--promoter",
        Pasivo: "status-badge--passive",
        Detractor: "status-badge--detractor",
    };

    return (
        categoryClasses[category] ??
        "status-badge--inactive"
    );
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "Sin fecha";
    }

    const [year, month, day] = dateValue
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return new Intl.DateTimeFormat("es-BO").format(date);
}

function SurveysPage() {
    const {
        accessToken,
        isAdmin,
    } = useAuth();

    const location = useLocation();

    const [result, setResult] = useState(INITIAL_RESULT);
    const [channelOptions, setChannelOptions] = useState([]);
    const [filterForm, setFilterForm] =
        useState(INITIAL_FILTERS);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [channelOptionsError, setChannelOptionsError] =
        useState("");

    const successMessage =
        location.state?.successMessage ?? "";

    useEffect(() => {
        const controller = new AbortController();

        async function loadChannelOptions() {
            try {
                const channelsResult = await listChannelsRequest(
                    {
                        page: 1,
                        pageSize: 100,
                    },
                    accessToken,
                    controller.signal,
                );

                setChannelOptions(channelsResult.data);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                setChannelOptions([]);

                if (error instanceof ApiError) {
                    setChannelOptionsError(error.message);
                } else {
                    setChannelOptionsError(
                        "No fue posible cargar los canales.",
                    );
                }
            }
        }

        loadChannelOptions();

        return () => {
            controller.abort();
        };
    }, [accessToken]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadSurveys() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const surveysResult = await listSurveysRequest(
                    {
                        page,
                        pageSize: 10,
                        ...filters,
                    },
                    accessToken,
                    controller.signal,
                );

                setResult(surveysResult);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                setResult(INITIAL_RESULT);

                if (error instanceof ApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage(
                        "No fue posible cargar las encuestas.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadSurveys();

        return () => {
            controller.abort();
        };
    }, [
        accessToken,
        filters,
        page,
    ]);

    function updateFilter(field, value) {
        setFilterForm((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));
    }

    function handleFilterSubmit(event) {
        event.preventDefault();

        if (
            filterForm.dateFrom &&
            filterForm.dateTo &&
            filterForm.dateFrom > filterForm.dateTo
        ) {
            setErrorMessage(
                "La fecha inicial no puede ser posterior a la fecha final.",
            );
            return;
        }

        setPage(1);
        setFilters({
            ...filterForm,
            search: filterForm.search.trim(),
        });
    }

    function handleClearFilters() {
        setFilterForm(INITIAL_FILTERS);
        setFilters(INITIAL_FILTERS);
        setErrorMessage("");
        setPage(1);
    }

    const totalPages = Math.max(
        result.meta.total_pages,
        1,
    );

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
                        Encuestas
                    </li>
                </ol>
            </nav>

            <header className="page-header">
                <div className="page-header__content">
                    <h1>Encuestas</h1>

                    <p className="text-muted">
                        Consulta y administra las encuestas NPS registradas.
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

            <form
                className="surface records-toolbar"
                onSubmit={handleFilterSubmit}
            >
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-search"
                            >
                                Buscar comentario
                            </label>

                            <input
                                className="form-control"
                                id="survey-search"
                                type="search"
                                placeholder="Texto contenido en el comentario"
                                minLength={2}
                                maxLength={100}
                                value={filterForm.search}
                                onChange={(event) =>
                                    updateFilter(
                                        "search",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-channel"
                            >
                                Canal
                            </label>

                            <select
                                className="form-select"
                                id="survey-channel"
                                value={filterForm.channelId}
                                onChange={(event) =>
                                    updateFilter(
                                        "channelId",
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Todos los canales</option>

                                {channelOptions.map((channel) => (
                                    <option
                                        key={channel.id}
                                        value={channel.id}
                                    >
                                        {channel.codigo} - {channel.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-category"
                            >
                                Categoría NPS
                            </label>

                            <select
                                className="form-select"
                                id="survey-category"
                                value={filterForm.category}
                                onChange={(event) =>
                                    updateFilter(
                                        "category",
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Todas las categorías</option>
                                <option value="Promotor">Promotor</option>
                                <option value="Pasivo">Pasivo</option>
                                <option value="Detractor">Detractor</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-status"
                            >
                                Estado
                            </label>

                            <select
                                className="form-select"
                                id="survey-status"
                                value={filterForm.status}
                                onChange={(event) =>
                                    updateFilter(
                                        "status",
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Todos los estados</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Revisada">Revisada</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-date-from"
                            >
                                Fecha desde
                            </label>

                            <input
                                className="form-control"
                                id="survey-date-from"
                                type="date"
                                value={filterForm.dateFrom}
                                onChange={(event) =>
                                    updateFilter(
                                        "dateFrom",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="survey-date-to"
                            >
                                Fecha hasta
                            </label>

                            <input
                                className="form-control"
                                id="survey-date-to"
                                type="date"
                                value={filterForm.dateTo}
                                onChange={(event) =>
                                    updateFilter(
                                        "dateTo",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="filters-actions justify-content-end">
                            <button
                                className="button button--primary"
                                type="submit"
                            >
                                Aplicar filtros
                            </button>

                            <button
                                className="button button--secondary"
                                type="button"
                                onClick={handleClearFilters}
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {successMessage && (
                <div
                    className="alert alert-success"
                    role="status"
                    aria-live="polite"
                >
                    {successMessage}
                </div>
            )}

            {channelOptionsError && (
                <div className="alert alert-warning" role="alert">
                    {channelOptionsError}
                </div>
            )}

            {errorMessage && (
                <div
                    className="alert alert-danger"
                    role="alert"
                    aria-live="polite"
                >
                    {errorMessage}
                </div>
            )}

            <section aria-labelledby="surveys-table-title">
                <div className="records-summary">
                    <h2
                        id="surveys-table-title"
                        className="h4-flexo"
                    >
                        Encuestas registradas
                    </h2>

                    <span className="records-count">
                        {result.meta.total} resultado(s)
                    </span>
                </div>

                <div
                    className="table-container"
                    aria-busy={isLoading}
                >
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th scope="col">Fecha</th>
                                <th scope="col">Canal</th>
                                <th scope="col">NPS</th>
                                <th scope="col">Categoría</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Comentario</th>

                                {isAdmin && (
                                    <th scope="col" className="text-right">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6}>
                                        <div className="table-empty">
                                            Cargando encuestas...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && errorMessage && (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6}>
                                        <div className="table-empty">
                                            No se pudieron cargar los datos.
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                !errorMessage &&
                                result.data.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6}>
                                            <div className="table-empty">
                                                No se encontraron encuestas.
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {!isLoading &&
                                !errorMessage &&
                                result.data.map((survey) => (
                                    <tr key={survey.id}>
                                        <td>
                                            {formatDate(survey.fecha_encuesta)}
                                        </td>

                                        <td>
                                            <span className="channel-name">
                                                {survey.canal_nombre}
                                            </span>

                                            <span className="extra-small-flexo text-muted">
                                                {survey.canal_codigo}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`nps-metric-pill ${getNpsClass(
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
                                                className={
                                                    survey.estado === "Revisada"
                                                        ? "status-badge status-badge--active"
                                                        : "status-badge status-badge--passive"
                                                }
                                            >
                                                {survey.estado}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className="survey-comment"
                                                title={
                                                    survey.comentario ??
                                                    "Sin comentario"
                                                }
                                            >
                                                {survey.comentario ||
                                                    "Sin comentario"}
                                            </span>
                                        </td>

                                        {isAdmin && (
                                            <td>
                                                <div className="data-table__actions">
                                                    <Link
                                                        className="table-action-link"
                                                        to={`/encuestas/${survey.id}/editar`}
                                                    >
                                                        <i
                                                            className="bi bi-pencil-square"
                                                            aria-hidden="true"
                                                        />
                                                        Editar
                                                    </Link>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <nav aria-label="Paginación de encuestas">
                    <ul className="pagination">
                        <li>
                            <button
                                className="pagination__link"
                                type="button"
                                disabled={isLoading || page <= 1}
                                onClick={() =>
                                    setPage(
                                        (currentPage) => currentPage - 1,
                                    )
                                }
                                aria-label="Página anterior"
                            >
                                <i
                                    className="bi bi-chevron-left"
                                    aria-hidden="true"
                                />
                            </button>
                        </li>

                        <li>
                            <span className="small-flexo text-muted">
                                Página {page} de {totalPages}
                            </span>
                        </li>

                        <li>
                            <button
                                className="pagination__link"
                                type="button"
                                disabled={
                                    isLoading ||
                                    page >= result.meta.total_pages
                                }
                                onClick={() =>
                                    setPage(
                                        (currentPage) => currentPage + 1,
                                    )
                                }
                                aria-label="Página siguiente"
                            >
                                <i
                                    className="bi bi-chevron-right"
                                    aria-hidden="true"
                                />
                            </button>
                        </li>
                    </ul>
                </nav>
            </section>
        </div>
    );
}

export default SurveysPage;