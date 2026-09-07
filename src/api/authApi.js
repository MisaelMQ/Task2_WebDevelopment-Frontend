import { apiRequest } from "./http.js";

export function loginRequest({ username, password }) {
    const loginData = new URLSearchParams();

    loginData.set("username", username.trim());
    loginData.set("password", password);

    return apiRequest("/auth/login", {
        method: "POST",
        body: loginData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
}

export function getCurrentUserRequest(token) {
    return apiRequest("/auth/me", {
        token,
    });
}