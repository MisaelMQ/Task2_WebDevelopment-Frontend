import {
    useEffect,
    useState,
} from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    createChannelRequest,
    getChannelRequest,
    updateChannelRequest,
} from "../api/channelsApi.js";
import { ApiError } from "../api/http.js";
import { useAuth } from "../auth/useAuth.js";

const INITIAL_FORM = {
    codigo: "",
    nombre: "",
    fuente: "Agente IA",
    activo: true,
    descripcion: "",
};

function ChannelFormPage() {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    const isEditing = Boolean(channelId);

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isEditing) {
            return undefined;
        }

        const controller = new AbortController();

        async function loadChannel() {
            try {
                const channel = await getChannelRequest(
                    channelId,
                    accessToken,
                    controller.signal,
                );

                setFormData({
                    codigo: channel.codigo,
                    nombre: channel.nombre,
                    fuente: channel.fuente,
                    activo: channel.activo,
                    descripcion: channel.descripcion ?? "",
                });
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                if (error instanceof ApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage(
                        "No fue posible cargar la información del canal.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadChannel();

        return () => {
            controller.abort();
        };
    }, [
        accessToken,
        channelId,
        isEditing,
    ]);

    function updateField(field, value) {
        setFormData((currentData) => ({
            ...currentData,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        const channelData = {
            codigo: formData.codigo.trim().toUpperCase(),
            nombre: formData.nombre.trim(),
            fuente: formData.fuente,
            activo: formData.activo,
            descripcion: formData.descripcion.trim() || null,
        };

        try {
            if (isEditing) {
                await updateChannelRequest(
                    channelId,
                    channelData,
                    accessToken,
                );
            } else {
                await createChannelRequest(
                    channelData,
                    accessToken,
                );
            }

            navigate("/canales", {
                state: {
                    successMessage: isEditing
                        ? "El canal fue actualizado correctamente."
                        : "El canal fue registrado correctamente.",
                },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    "Ocurrió un error inesperado al guardar el canal.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="container">
                <section className="card" aria-live="polite">
                    <div className="card__body stack-16 text-center">
                        <div className="loader" aria-hidden="true" />
                        <p>Cargando información del canal...</p>
                    </div>
                </section>
            </div>
        );
    }

    if (isEditing && errorMessage) {
        return (
            <div className="container">
                <section className="card">
                    <div className="card__body stack-16">
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>

                        <div>
                            <Link
                                className="button button--secondary"
                                to="/canales"
                            >
                                Volver a canales
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const pageTitle = isEditing
        ? "Editar canal"
        : "Registrar canal";

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

                    <li className="breadcrumb-item">
                        <Link
                            className="text-breadcrumb-link"
                            to="/canales"
                        >
                            Canales
                        </Link>
                    </li>

                    <li className="breadcrumb-item" aria-current="page">
                        {pageTitle}
                    </li>
                </ol>
            </nav>

            <header className="page-header">
                <div className="page-header__content">
                    <h1>{pageTitle}</h1>

                    <p className="text-muted">
                        Define los parámetros de identificación y operación del
                        canal.
                    </p>
                </div>
            </header>

            <div className="form-layout">
                <form
                    className="card form-card"
                    onSubmit={handleSubmit}
                >
                    <section
                        className="form-section"
                        aria-labelledby="channel-data-title"
                    >
                        <header className="form-section__header">
                            <h2
                                className="form-section__title"
                                id="channel-data-title"
                            >
                                Datos del canal
                            </h2>

                            <p className="small-flexo text-muted">
                                Los campos marcados con asterisco son requeridos.
                            </p>
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

                        <div className="form-grid">
                            <div className="form-field">
                                <label
                                    className="form-label"
                                    htmlFor="channel-code"
                                >
                                    Código{" "}
                                    <span
                                        className="form-label__required"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                </label>

                                <input
                                    className="form-control"
                                    id="channel-code"
                                    name="codigo"
                                    type="text"
                                    placeholder="Ej. CAN-008"
                                    minLength={2}
                                    maxLength={30}
                                    pattern="[A-Za-z0-9_-]+"
                                    value={formData.codigo}
                                    onChange={(event) =>
                                        updateField(
                                            "codigo",
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    disabled={isSubmitting}
                                    required
                                />

                                <span className="form-help">
                                    Usa letras, números, guiones o guiones bajos.
                                </span>
                            </div>

                            <div className="form-field">
                                <label
                                    className="form-label"
                                    htmlFor="channel-name"
                                >
                                    Nombre{" "}
                                    <span
                                        className="form-label__required"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                </label>

                                <input
                                    className="form-control"
                                    id="channel-name"
                                    name="nombre"
                                    type="text"
                                    placeholder="Ej. Agente BCP"
                                    minLength={2}
                                    maxLength={100}
                                    value={formData.nombre}
                                    onChange={(event) =>
                                        updateField("nombre", event.target.value)
                                    }
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="form-field form-grid__full">
                                <label
                                    className="form-label"
                                    htmlFor="channel-source"
                                >
                                    Fuente de información{" "}
                                    <span
                                        className="form-label__required"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                </label>

                                <select
                                    className="form-select"
                                    id="channel-source"
                                    name="fuente"
                                    value={formData.fuente}
                                    onChange={(event) =>
                                        updateField("fuente", event.target.value)
                                    }
                                    disabled={isSubmitting}
                                    required
                                >
                                    <option value="Agente IA">Agente IA</option>
                                    <option value="CleverTap">CleverTap</option>
                                    <option value="Encuesta QR">
                                        Encuesta QR
                                    </option>
                                </select>
                            </div>

                            <fieldset
                                className="form-field form-grid__full"
                                disabled={isSubmitting}
                            >
                                <legend className="form-label">
                                    Estado operativo{" "}
                                    <span
                                        className="form-label__required"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                </legend>

                                <div className="choice-card-group">
                                    <label className="choice-card">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="activo"
                                            checked={formData.activo}
                                            onChange={() =>
                                                updateField("activo", true)
                                            }
                                        />

                                        <span
                                            className="choice-card__indicator"
                                            aria-hidden="true"
                                        />

                                        <span className="choice-card__label">
                                            Activo
                                        </span>
                                    </label>

                                    <label className="choice-card">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="inactivo"
                                            checked={!formData.activo}
                                            onChange={() =>
                                                updateField("activo", false)
                                            }
                                        />

                                        <span
                                            className="choice-card__indicator"
                                            aria-hidden="true"
                                        />

                                        <span className="choice-card__label">
                                            Inactivo
                                        </span>
                                    </label>
                                </div>
                            </fieldset>

                            <div className="form-field form-grid__full">
                                <label
                                    className="form-label"
                                    htmlFor="channel-description"
                                >
                                    Descripción y alcance
                                </label>

                                <textarea
                                    className="form-textarea"
                                    id="channel-description"
                                    name="descripcion"
                                    placeholder="Describe brevemente el objetivo del canal..."
                                    maxLength={255}
                                    value={formData.descripcion}
                                    onChange={(event) =>
                                        updateField(
                                            "descripcion",
                                            event.target.value,
                                        )
                                    }
                                    disabled={isSubmitting}
                                />

                                <span className="form-help">
                                    {formData.descripcion.length}/255 caracteres.
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="form-actions">
                        <Link
                            className="button button--secondary"
                            to="/canales"
                        >
                            Cancelar
                        </Link>

                        <button
                            className="button button--primary"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i
                                        className="bi bi-check-circle"
                                        aria-hidden="true"
                                    />
                                    {isEditing
                                        ? "Guardar cambios"
                                        : "Registrar canal"}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <aside
                    className="card form-guide-card"
                    aria-label="Guía de fuentes"
                >
                    <header className="form-guide-header">
                        <h2 className="form-guide-title">
                            Fuentes de feedback CX
                        </h2>
                    </header>

                    <ul className="form-guide-list">
                        <li className="form-guide-item">
                            <span
                                className="form-guide-badge"
                                aria-hidden="true"
                            >
                                IA
                            </span>

                            <p className="form-guide-text">
                                <strong>Agente IA</strong>
                                Encuestas procesadas mediante inteligencia artificial.
                            </p>
                        </li>

                        <li className="form-guide-item">
                            <span
                                className="form-guide-badge"
                                aria-hidden="true"
                            >
                                CT
                            </span>

                            <p className="form-guide-text">
                                <strong>CleverTap</strong>
                                Información procedente de canales digitales.
                            </p>
                        </li>

                        <li className="form-guide-item">
                            <span
                                className="form-guide-badge"
                                aria-hidden="true"
                            >
                                QR
                            </span>

                            <p className="form-guide-text">
                                <strong>Encuesta QR</strong>
                                Respuestas obtenidas mediante formularios QR.
                            </p>
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}

export default ChannelFormPage;