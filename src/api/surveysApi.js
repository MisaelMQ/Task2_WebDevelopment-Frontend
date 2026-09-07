import { apiRequest } from "./http.js";

export function listSurveysRequest(
    {
        page = 1,
        pageSize = 10,
        channelId = "",
        category = "",
        status = "",
        dateFrom = "",
        dateTo = "",
        search = "",
    },
    token,
    signal,
) {
    const query = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });

    if (channelId) {
        query.set("canal_id", channelId);
    }

    if (category) {
        query.set("categoria_nps", category);
    }

    if (status) {
        query.set("estado", status);
    }

    if (dateFrom) {
        query.set("fecha_desde", dateFrom);
    }

    if (dateTo) {
        query.set("fecha_hasta", dateTo);
    }

    if (search) {
        query.set("buscar", search);
    }

    return apiRequest(`/encuestas?${query.toString()}`, {
        token,
        signal,
    });
}

export function getSurveyRequest(
    surveyId,
    token,
    signal,
) {
    return apiRequest(`/encuestas/${surveyId}`, {
        token,
        signal,
    });
}

export function createSurveyRequest(survey, token) {
    return apiRequest("/encuestas", {
        method: "POST",
        body: survey,
        token,
    });
}

export function updateSurveyRequest(
    surveyId,
    survey,
    token,
) {
    return apiRequest(`/encuestas/${surveyId}`, {
        method: "PUT",
        body: survey,
        token,
    });
}

export function deleteSurveyRequest(surveyId, token) {
    return apiRequest(`/encuestas/${surveyId}`, {
        method: "DELETE",
        token,
    });
}