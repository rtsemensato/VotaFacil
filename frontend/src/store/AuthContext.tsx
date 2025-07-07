import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";
import type { AuthResponse, User } from "../types";

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Carregar do localStorage se não expirado
    const getStoredAuth = () => {
        const raw = localStorage.getItem("votafacil_auth");

        if (!raw) return { user: null, accessToken: null };

        try {
            const parsed = JSON.parse(raw);
            const now = Date.now();
            // 30 dias em ms
            if (parsed.timestamp && now - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
                return { user: parsed.user, accessToken: parsed.accessToken };
            }
        } catch {

        }
        // Se inválido ou expirado
        localStorage.removeItem("votafacil_auth");

        return { user: null, accessToken: null };
    };

    const stored = getStoredAuth();
    const [user, setUser] = useState<User | null>(stored.user);
    const [accessToken, setAccessToken] = useState<string | null>(stored.accessToken);
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);

        try {
            const { data } = await api.post<AuthResponse>("/auth/login", { email, password });

            setUser(data.user);
            setAccessToken(data.accessToken);

            localStorage.setItem("votafacil_auth", JSON.stringify({
                user: data.user,
                accessToken: data.accessToken,
                timestamp: Date.now(),
            }));
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);

        try {
            await api.post("/auth/register", { name, email, password });
            await login(email, password);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("votafacil_auth");
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 