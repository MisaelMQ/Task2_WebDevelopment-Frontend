import { environment } from "../config/environment.js";

export class ApiError extends Error {
    constructor(message, status = 0, details = null) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

function buildApiUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${environment.apiBaseUrl}${normalizedPath}`;
}

function prepareRequestBody(body) {
    if (
        body === undefined ||
        body === null ||
        body instanceof FormData ||
        body instanceof URLSearchParams
    ) {
        return body;
    }

    return JSON.stringify(body);
}

async function readResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    const rawBody = await response.text();

    if (!rawBody) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        try {
            return JSON.parse(rawBody);
        } catch {
            return rawBody;
        }
    }

    return rawBody;
}

function extractErrorMessage(payload) {
    if (
        payload &&
        typeof payload === "object" &&
        typeof payload.detail === "string"
    ) {
        return payload.detail;
    }

    if (
        payload &&
        typeof payload === "object" &&
        Array.isArray(payload.detail)
    ) {
        return payload.detail
            .map((error) => error.msg ?? "Dato inválido.")
            .join(" ");
    }

    return "No fue posible completar la solicitud.";
}

export async function apiRequest(
    path,
    {
        method = "GET",
        body,
        token,
        headers = {},
        signal,
    } = {},
) {
    const requestHeaders = new Headers(headers);

    if (token) {
        requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    if (
        body !== undefined &&
        body !== null &&
        !(body instanceof FormData) &&
        !(body instanceof URLSearchParams) &&
        !requestHeaders.has("Content-Type")
    ) {
        requestHeaders.set("Content-Type", "application/json");
    }

    let response;

    try {
        response = await fetch(buildApiUrl(path), {
            method,
            headers: requestHeaders,
            body: prepareRequestBody(body),
            signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        throw new ApiError(
            "No se pudo establecer comunicación con el backend.",
            0,
            error,
        );
    }

    const payload = await readResponseBody(response);

    if (!response.ok) {
        throw new ApiError(
            extractErrorMessage(payload),
            response.status,
            payload,
        );
    }

    return payload;
}