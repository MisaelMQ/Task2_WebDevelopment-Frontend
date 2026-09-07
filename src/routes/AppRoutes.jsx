import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import ChannelFormPage from "../pages/ChannelFormPage.jsx";
import ChannelsPage from "../pages/ChannelsPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import SurveysPage from "../pages/SurveysPage.jsx";
import SurveyFormPage from "../pages/SurveyFormPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";

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
                        path="dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/canales"
                        element={<ChannelsPage />}
                    />

                    <Route
                        path="/encuestas"
                        element={<SurveysPage />}
                    />

                    <Route element={<AdminRoute />}>
                        <Route
                            path="/canales/nuevo"
                            element={<ChannelFormPage />}
                        />

                        <Route
                            path="/canales/:channelId/editar"
                            element={<ChannelFormPage />}
                        />

                        <Route
                            path="encuestas/nueva"
                            element={<SurveyFormPage />}
                        />

                        <Route
                            path="encuestas/:surveyId/editar"
                            element={<SurveyFormPage />}
                        />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRoutes;