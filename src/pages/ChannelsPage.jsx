import {
    useEffect,
    useState,
} from "react";
import {
    Link,
    useLocation,
} from "react-router-dom";
import {
    deleteChannelRequest,
    listChannelsRequest,
} from "../api/channelsApi.js";
import { ApiError } from "../api/http.js";
import { useAuth } from "../auth/useAuth.js";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";

const INITIAL_RESULT = {
    data: [],
    meta: {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
    },
};

function getSourceClass(source) {
    const sourceClasses = {
        "Agente IA": "source-tag--ai",
        CleverTap: "source-tag--clevertap",
        "Encuesta QR": "source-tag--qr",
    };

    return sourceClasses[source] ?? "source-tag--traditional";
}

function ChannelsPage() {
    const {
        accessToken,
        isAdmin,
    } = useAuth();

    const location = useLocation();

    const [result, setResult] = useState(INITIAL_RESULT);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        location.state?.successMessage ?? "",
    );
    const [channelToDelete, setChannelToDelete] =
        useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadChannels() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const channelsResult = await listChannelsRequest(
                    {
                        page,
                        pageSize: 10,
                        search,
                        source,
                    },
                    accessToken,
                    controller.signal,
                );

                setResult(channelsResult);
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
                        "No fue posible cargar los canales.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadChannels();

        return () => {
            controller.abort();
        };
    }, [
        accessToken,
        page,
        reloadKey,
        search,
        source,
    ]);

    function handleSearch(event) {
        event.preventDefault();

        setPage(1);
        setSearch(searchInput.trim());
    }

    function handleSourceChange(event) {
        setPage(1);
        setSource(event.target.value);
    }

    function handleClearFilters() {
        setSearchInput("");
        setSearch("");
        setSource("");
        setPage(1);
    }

    function openDeleteDialog(channel) {
        setDeleteError("");
        setChannelToDelete(channel);
    }

    function closeDeleteDialog() {
        if (isDeleting) {
            return;
        }

        setDeleteError("");
        setChannelToDelete(null);
    }

    async function confirmDelete() {
        if (!channelToDelete) {
            return;
        }

        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteChannelRequest(
                channelToDelete.id,
                accessToken,
            );

            const deletedChannelName = channelToDelete.nombre;

            setChannelToDelete(null);
            setSuccessMessage(
                `El canal "${deletedChannelName}" fue eliminado correctamente.`,
            );

            if (result.data.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                setReloadKey((currentKey) => currentKey + 1);
            }
        } catch (error) {
            if (error instanceof ApiError) {
                setDeleteError(error.message);
            } else {
                setDeleteError(
                    "Ocurrió un error inesperado al eliminar el canal.",
                );
            }
        } finally {
            setIsDeleting(false);
        }
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
                        Canales
                    </li>
                </ol>
            </nav>

            <header className="page-header">
                <div className="page-header__content">
                    <h1>Canales</h1>

                    <p className="text-muted">
                        Administra los canales incluidos en el seguimiento NPS.
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        className="button button--primary"
                        to="/canales/nuevo"
                    >
                        <i
                            className="bi bi-plus-circle"
                            aria-hidden="true"
                        />
                        Registrar canal
                    </Link>
                )}
            </header>

            <form
                className="surface records-toolbar"
                onSubmit={handleSearch}
            >
                <div className="records-toolbar__main">
                    <div className="form-field">
                        <label
                            className="form-label"
                            htmlFor="channel-search"
                        >
                            Buscar canal
                        </label>

                        <input
                            className="form-control"
                            id="channel-search"
                            type="search"
                            placeholder="Código, nombre o descripción"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                        />
                    </div>

                    <div className="form-field">
                        <label
                            className="form-label"
                            htmlFor="channel-source"
                        >
                            Fuente
                        </label>

                        <select
                            className="form-select"
                            id="channel-source"
                            value={source}
                            onChange={handleSourceChange}
                        >
                            <option value="">Todas las fuentes</option>
                            <option value="Agente IA">Agente IA</option>
                            <option value="CleverTap">CleverTap</option>
                            <option value="Encuesta QR">
                                Encuesta QR
                            </option>
                        </select>
                    </div>

                    <div className="filters-actions">
                        <button
                            className="button button--primary"
                            type="submit"
                        >
                            Buscar
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

            {errorMessage && (
                <div
                    className="alert alert-danger"
                    role="alert"
                    aria-live="polite"
                >
                    {errorMessage}
                </div>
            )}

            <section aria-labelledby="channels-table-title">
                <div className="records-summary">
                    <h2
                        id="channels-table-title"
                        className="h4-flexo"
                    >
                        Canales registrados
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
                                <th scope="col">Código</th>
                                <th scope="col">Canal</th>
                                <th scope="col">Fuente</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Descripción</th>

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
                                    <td colSpan={isAdmin ? 6 : 5}>
                                        <div className="table-empty">
                                            Cargando canales...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && errorMessage && (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5}>
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
                                        <td colSpan={isAdmin ? 6 : 5}>
                                            <div className="table-empty">
                                                No se encontraron canales.
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {!isLoading &&
                                !errorMessage &&
                                result.data.map((channel) => (
                                    <tr key={channel.id}>
                                        <td>{channel.codigo}</td>

                                        <td>
                                            <span className="channel-name">
                                                {channel.nombre}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`source-tag ${getSourceClass(
                                                    channel.fuente,
                                                )}`}
                                            >
                                                {channel.fuente}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    channel.activo
                                                        ? "status-badge status-badge--active"
                                                        : "status-badge status-badge--inactive"
                                                }
                                            >
                                                {channel.activo
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </span>
                                        </td>

                                        <td>
                                            {channel.descripcion ||
                                                "Sin descripción"}
                                        </td>

                                        {isAdmin && (
                                            <td>
                                                <div className="data-table__actions">
                                                    <Link
                                                        className="table-action-link"
                                                        to={`/canales/${channel.id}/editar`}
                                                    >
                                                        <i
                                                            className="bi bi-pencil-square"
                                                            aria-hidden="true"
                                                        />
                                                        Editar
                                                    </Link>

                                                    <button
                                                        className="table-action-button table-action-danger"
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteDialog(channel)
                                                        }
                                                    >
                                                        <i
                                                            className="bi bi-trash3"
                                                            aria-hidden="true"
                                                        />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <nav aria-label="Paginación de canales">
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

            {channelToDelete && (
                <ConfirmDialog
                    title="Eliminar canal"
                    message={`¿Deseas eliminar el canal "${channelToDelete.codigo} - ${channelToDelete.nombre}"? Esta acción no se puede deshacer.`}
                    confirmLabel="Eliminar canal"
                    isProcessing={isDeleting}
                    errorMessage={deleteError}
                    onConfirm={confirmDelete}
                    onCancel={closeDeleteDialog}
                />
            )}
        </div>
    );
}

export default ChannelsPage;