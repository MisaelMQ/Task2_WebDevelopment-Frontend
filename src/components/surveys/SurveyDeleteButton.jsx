import { useState } from "react";
import { deleteSurveyRequest } from "../../api/surveysApi.js";
import { ApiError } from "../../api/http.js";
import { useAuth } from "../../auth/useAuth.js";
import ConfirmDialog from "../common/ConfirmDialog.jsx";

function SurveyDeleteButton({ survey, onDeleted }) {
    const { accessToken } = useAuth();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    function openDialog() {
        setDeleteError("");
        setIsDialogOpen(true);
    }

    function closeDialog() {
        if (!isDeleting) {
            setIsDialogOpen(false);
            setDeleteError("");
        }
    }

    async function handleDelete() {
        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteSurveyRequest(survey.id, accessToken);

            setIsDialogOpen(false);
            onDeleted(survey);
        } catch (error) {
            if (error instanceof ApiError) {
                setDeleteError(error.message);
            } else {
                setDeleteError(
                    "No fue posible eliminar la encuesta.",
                );
            }
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <button
                className="table-action-button table-action-danger"
                type="button"
                onClick={openDialog}
            >
                <i className="bi bi-trash" aria-hidden="true" />
                Eliminar
            </button>

            {isDialogOpen && (
                <ConfirmDialog
                    title="Eliminar encuesta"
                    message={`Se eliminará la encuesta #${survey.id} del canal ${survey.canal_nombre}. Esta acción no se puede deshacer.`}
                    confirmLabel="Eliminar encuesta"
                    isProcessing={isDeleting}
                    errorMessage={deleteError}
                    onConfirm={handleDelete}
                    onCancel={closeDialog}
                />
            )}
        </>
    );
}

export default SurveyDeleteButton;