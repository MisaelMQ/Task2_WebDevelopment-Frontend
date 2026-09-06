import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import PagePlaceholder from "../components/common/PagePlaceholder.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route
                        path="/dashboard"
                        element={
                            <PagePlaceholder
                                title="Dashboard NPS"
                                description="Resumen general de la experiencia del cliente."
                                icon="bi-speedometer2"
                            />
                        }
                    />

                    <Route
                        path="/canales"
                        element={
                            <PagePlaceholder
                                title="Canales"
                                description="Administración de los canales de atención."
                                icon="bi-diagram-3"
                            />
                        }
                    />

                    <Route
                        path="/encuestas"
                        element={
                            <PagePlaceholder
                                title="Encuestas"
                                description="Administración de encuestas NPS."
                                icon="bi-clipboard-data"
                            />
                        }
                    />

                    <Route element={<AdminRoute />}>
                        <Route
                            path="/canales/nuevo"
                            element={
                                <PagePlaceholder
                                    title="Registrar canal"
                                    description="Creación de un nuevo canal."
                                    icon="bi-plus-circle"
                                />
                            }
                        />

                        <Route
                            path="/canales/:channelId/editar"
                            element={
                                <PagePlaceholder
                                    title="Editar canal"
                                    description="Actualización de la información del canal."
                                    icon="bi-pencil-square"
                                />
                            }
                        />

                        <Route
                            path="/encuestas/nueva"
                            element={
                                <PagePlaceholder
                                    title="Registrar encuesta"
                                    description="Creación de una nueva encuesta NPS."
                                    icon="bi-file-earmark-plus"
                                />
                            }
                        />

                        <Route
                            path="/encuestas/:surveyId/editar"
                            element={
                                <PagePlaceholder
                                    title="Editar encuesta"
                                    description="Actualización de una encuesta existente."
                                    icon="bi-pencil-square"
                                />
                            }
                        />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRoutes;