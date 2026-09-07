import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    createSurveyRequest,
    getSurveyRequest,
    updateSurveyRequest,
} from "../api/surveysApi.js";
import { listChannelsRequest } from "../api/channelsApi.js";
import { ApiError } from "../api/http.js";
import { useAuth } from "../auth/useAuth.js";

function getTodayValue() {
    const now = new Date();
    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
    );

    return localDate.toISOString().slice(0, 10);
}

function getInitialForm() {
    return {
        canal_id: "",
        fecha_encuesta: getTodayValue(),
        puntuacion_nps: "",
        comentario: "",
        estado: "Pendiente",
    };
}

function getNpsCategory(score) {
    if (score === "") {
        return "Sin clasificación";
    }

    const numericScore = Number(score);

    if (numericScore >= 9) {
        return "Promotor";
    }

    if (numericScore >= 7) {
        return "Pasivo";
    }

    return "Detractor";
}

function getCategoryClass(category) {
    if (category === "Promotor") {
        return "status-badge--promoter";
    }

    if (category === "Pasivo") {
        return "status-badge--passive";
    }

    if (category === "Detractor") {
        return "status-badge--detractor";
    }

    return "";
}

function SurveyFormPage() {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    const isEditing = Boolean(surveyId);

    const [formData, setFormData] = useState(getInitialForm);
    const [channels, setChannels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    const category = getNpsCategory(formData.puntuacion_nps);
    const categoryClass = getCategoryClass(category);

    useEffect(() => {
        const controller = new AbortController();

        async function loadFormData() {
            setIsLoading(true);
            setLoadError("");

            try {
                const channelsPromise = listChannelsRequest(
                    {
                        page: 1,
                        pageSize: 100,
                    },
                    accessToken,
                    controller.signal,
                );

                const surveyPromise = isEditing
                    ? getSurveyRequest(
                        surveyId,
                        accessToken,
                        controller.signal,
                    )
                    : Promise.resolve(null);

                const [channelsResult, survey] = await Promise.all([
                    channelsPromise,
                    surveyPromise,
                ]);

                setChannels(channelsResult.data ?? []);

                if (survey) {
                    setFormData({
                        canal_id: String(survey.canal_id),
                        fecha_encuesta: survey.fecha_encuesta,
                        puntuacion_nps: String(survey.puntuacion_nps),
                        comentario: survey.comentario ?? "",
                        estado: survey.estado,
                    });
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                if (error instanceof ApiError) {
                    setLoadError(error.message);
                } else {
                    setLoadError(
                        "No fue posible cargar la información del formulario.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadFormData();

        return () => controller.abort();
    }, [accessToken, isEditing, surveyId]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitError("");
        setIsSaving(true);

        const payload = {
            canal_id: Number(formData.canal_id),
            fecha_encuesta: formData.fecha_encuesta,
            puntuacion_nps: Number(formData.puntuacion_nps),
            comentario: formData.comentario.trim() || null,
            estado: formData.estado,
        };

        try {
            if (isEditing) {
                await updateSurveyRequest(
                    surveyId,
                    payload,
                    accessToken,
                );
            } else {
                await createSurveyRequest(payload, accessToken);
            }

            navigate("/encuestas", {
                replace: true,
                state: {
                    successMessage: isEditing
                        ? "La encuesta fue actualizada correctamente."
                        : "La encuesta fue registrada correctamente.",
                },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                setSubmitError(error.message);
            } else {
                setSubmitError(
                    "No fue posible guardar la encuesta. Intenta nuevamente.",
                );
            }
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <section aria-labelledby="survey-loading-title">
                <div className="form-card text-center">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">Cargando...</span>
                    </div>

                    <p
                        id="survey-loading-title"
                        className="mt-3 mb-0"
                    >
                        Cargando formulario de encuesta...
                    </p>
                </div>
            </section>
        );
    }

    if (loadError) {
        return (
            <section aria-labelledby="survey-error-title">
                <div className="alert alert-danger">
                    <h1
                        id="survey-error-title"
                        className="h5 alert-heading"
                    >
                        No fue posible abrir el formulario
                    </h1>

                    <p className="mb-3">{loadError}</p>

                    <Link
                        className="btn btn-outline-danger"
                        to="/encuestas"
                    >
                        Volver a encuestas
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <div className="container">
            <nav aria-label="Ruta de navegación">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Inicio</Link>
                    </li>

                    <li className="breadcrumb-item">
                        <Link to="/encuestas">Encuestas</Link>
                    </li>

                    <li
                        className="breadcrumb-item active"
                        aria-current="page"
                    >
                        {isEditing ? "Editar" : "Registrar"}
                    </li>
                </ol>
            </nav>

            <section aria-labelledby="survey-form-title">
                <div className="mb-4">
                    <p className="text-uppercase text-primary fw-semibold mb-1">
                        Gestión de experiencia
                    </p>

                    <h1 id="survey-form-title" className="mb-2">
                        {isEditing
                            ? "Editar encuesta"
                            : "Registrar encuesta"}
                    </h1>

                    <p className="text-muted mb-0">
                        Registra la calificación NPS asociada a uno de los
                        canales de atención.
                    </p>
                </div>

                {submitError && (
                    <div className="alert alert-danger" role="alert">
                        {submitError}
                    </div>
                )}

                {channels.length === 0 && (
                    <div className="alert alert-warning" role="alert">
                        No existen canales disponibles. Debes registrar un
                        canal antes de crear una encuesta.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-layout">
                        <div className="form-card surface">
                            <fieldset disabled={isSaving}>
                                <legend className="h5 mb-4">
                                    Información de la encuesta
                                </legend>

                                <div className="form-grid">
                                    <div className="form-field">
                                        <label
                                            className="form-label"
                                            htmlFor="canal_id"
                                        >
                                            Canal de atención
                                        </label>

                                        <select
                                            className="form-select"
                                            id="canal_id"
                                            name="canal_id"
                                            value={formData.canal_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Selecciona un canal
                                            </option>

                                            {channels.map((channel) => (
                                                <option
                                                    key={channel.id}
                                                    value={channel.id}
                                                >
                                                    {channel.nombre} — {channel.codigo}
                                                    {!channel.activo ? " (Inactivo)" : ""}
                                                </option>
                                            ))}
                                        </select>

                                        <span className="form-help">
                                            La encuesta quedará relacionada con este
                                            canal.
                                        </span>
                                    </div>

                                    <div className="form-field">
                                        <label
                                            className="form-label"
                                            htmlFor="fecha_encuesta"
                                        >
                                            Fecha de la encuesta
                                        </label>

                                        <input
                                            className="form-control"
                                            id="fecha_encuesta"
                                            name="fecha_encuesta"
                                            type="date"
                                            value={formData.fecha_encuesta}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label
                                            className="form-label"
                                            htmlFor="puntuacion_nps"
                                        >
                                            Puntuación NPS
                                        </label>

                                        <select
                                            className="form-select"
                                            id="puntuacion_nps"
                                            name="puntuacion_nps"
                                            value={formData.puntuacion_nps}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Selecciona una puntuación
                                            </option>

                                            {Array.from(
                                                { length: 11 },
                                                (_, score) => (
                                                    <option key={score} value={score}>
                                                        {score}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <span className="form-help">
                                            La puntuación debe estar entre 0 y 10.
                                        </span>
                                    </div>

                                    <div className="form-field">
                                        <span className="form-label">
                                            Clasificación automática
                                        </span>

                                        <div className="survey-category-preview">
                                            <span
                                                className={`status-badge ${categoryClass}`}
                                            >
                                                {category}
                                            </span>

                                            <p className="form-help mt-2 mb-0">
                                                La categoría definitiva será calculada
                                                por el backend.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label
                                            className="form-label"
                                            htmlFor="estado"
                                        >
                                            Estado
                                        </label>

                                        <select
                                            className="form-select"
                                            id="estado"
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Pendiente">
                                                Pendiente
                                            </option>
                                            <option value="Revisada">
                                                Revisada
                                            </option>
                                        </select>
                                    </div>

                                    <div className="form-field form-grid__full">
                                        <label
                                            className="form-label"
                                            htmlFor="comentario"
                                        >
                                            Comentario
                                        </label>

                                        <textarea
                                            className="form-control"
                                            id="comentario"
                                            name="comentario"
                                            rows="5"
                                            maxLength="1000"
                                            value={formData.comentario}
                                            onChange={handleChange}
                                            placeholder="Describe brevemente la experiencia del cliente"
                                        />

                                        <div className="d-flex justify-content-between gap-3">
                                            <span className="form-help">
                                                Evita registrar información personal o
                                                sensible.
                                            </span>

                                            <span className="form-help">
                                                {formData.comentario.length}/1000
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div className="form-actions">
                                <Link
                                    className="button button--secondary"
                                    to="/encuestas"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    className="button button--primary"
                                    type="submit"
                                    disabled={isSaving || channels.length === 0}
                                >
                                    {isSaving && (
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            aria-hidden="true"
                                        />
                                    )}

                                    {isEditing
                                        ? "Guardar cambios"
                                        : "Registrar encuesta"}
                                </button>
                            </div>
                        </div>

                        <aside
                            className="form-guide-card surface"
                            aria-labelledby="nps-guide-title"
                        >
                            <div className="form-guide-header">
                                <i
                                    className="bi bi-info-circle text-primary"
                                    aria-hidden="true"
                                />

                                <h2
                                    id="nps-guide-title"
                                    className="form-guide-title"
                                >
                                    Guía de clasificación NPS
                                </h2>
                            </div>

                            <p className="form-guide-text mb-3">
                                La clasificación depende de la puntuación seleccionada.
                            </p>

                            <ul className="form-guide-list">
                                <li className="form-guide-item">
                                    <span className="form-guide-badge form-guide-badge--promoter">
                                        9–10
                                    </span>

                                    <p className="form-guide-text">
                                        <strong>Promotor</strong>
                                        Cliente satisfecho y con alta probabilidad de recomendar.
                                    </p>
                                </li>

                                <li className="form-guide-item">
                                    <span className="form-guide-badge form-guide-badge--passive">
                                        7–8
                                    </span>

                                    <p className="form-guide-text">
                                        <strong>Pasivo</strong>
                                        Cliente satisfecho, pero susceptible a otras alternativas.
                                    </p>
                                </li>

                                <li className="form-guide-item">
                                    <span className="form-guide-badge form-guide-badge--detractor">
                                        0–6
                                    </span>

                                    <p className="form-guide-text">
                                        <strong>Detractor</strong>
                                        Cliente insatisfecho que requiere especial atención.
                                    </p>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default SurveyFormPage;