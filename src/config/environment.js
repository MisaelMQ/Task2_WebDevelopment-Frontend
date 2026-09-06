const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
    throw new Error(
        "La variable VITE_API_BASE_URL no se encuentra configurada.",
    );
}

export const environment = Object.freeze({
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
});