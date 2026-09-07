import { useContext } from "react";
import { AuthContext } from "./AuthContext.js";

export function useAuth() {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider.",
        );
    }

    return authContext;
}