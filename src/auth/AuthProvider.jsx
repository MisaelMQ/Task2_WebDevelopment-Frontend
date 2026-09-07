import {
    useCallback,
    useMemo,
    useState,
} from "react";
import { loginRequest } from "../api/authApi.js";
import { AuthContext } from "./AuthContext.js";
import {
    clearAuthSession,
    loadAuthSession,
    saveAuthSession,
} from "./sessionStorage.js";

function AuthProvider({ children }) {
    const [session, setSession] = useState(() =>
        loadAuthSession(),
    );

    const login = useCallback(async (credentials) => {
        const loginResponse = await loginRequest(credentials);
        const newSession = saveAuthSession(loginResponse);

        setSession(newSession);

        return newSession.user;
    }, []);

    const logout = useCallback(() => {
        clearAuthSession();
        setSession(null);
    }, []);

    const authValue = useMemo(
        () => ({
            accessToken: session?.accessToken ?? null,
            user: session?.user ?? null,
            isAuthenticated: Boolean(
                session?.accessToken && session?.user,
            ),
            isAdmin: session?.user?.rol === "admin",
            login,
            logout,
        }),
        [session, login, logout],
    );

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;