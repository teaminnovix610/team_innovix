import { createContext, useEffect, useState } from "react";
import * as authService from "../features/auth/services/auth.service";
import { registerSessionExpiredHandler } from "../services/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await authService.me();
                setUser(response);
            } catch (error) {
                setUser(null);

                try {
                    await authService.logout();
                } catch {
                    // best-effort cleanup — ignore failures here
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Let the axios interceptor tell us when a refresh has definitively failed,
    // so a session that dies mid-session (not just on initial load) also clears `user`.
    useEffect(() => {
        const unregister = registerSessionExpiredHandler(() => {
            setUser(null);
        });

        return unregister;
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const register = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}