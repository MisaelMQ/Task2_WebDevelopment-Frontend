const SESSION_STORAGE_KEY = "cx-insight-auth-session";

function isValidStoredSession(session) {
    return (
        session &&
        typeof session === "object" &&
        typeof session.accessToken === "string" &&
        session.accessToken.length > 0 &&
        typeof session.expiresAt === "number" &&
        session.user &&
        typeof session.user === "object"
    );
}

export function saveAuthSession(loginResponse) {
    const expiresAt =
        Date.now() + loginResponse.expires_in * 1000;

    const session = {
        accessToken: loginResponse.access_token,
        expiresAt,
        user: loginResponse.user,
    };

    sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(session),
    );

    return session;
}

export function loadAuthSession() {
    const storedSession = sessionStorage.getItem(
        SESSION_STORAGE_KEY,
    );

    if (!storedSession) {
        return null;
    }

    try {
        const session = JSON.parse(storedSession);

        if (!isValidStoredSession(session)) {
            clearAuthSession();
            return null;
        }

        if (Date.now() >= session.expiresAt) {
            clearAuthSession();
            return null;
        }

        return session;
    } catch {
        clearAuthSession();
        return null;
    }
}

export function clearAuthSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}