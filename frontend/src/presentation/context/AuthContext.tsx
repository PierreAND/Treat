import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginPayload, RegisterPayload } from "@/src/domain/entities/user.model";
import { container } from "@/src/infrastructure/injecteur/container";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenExpired } from "@/src/infrastructure/auth/tokenUtils";
import { setOnUnauthorized } from "@/src/infrastructure/auth/ApiFetch-Repository";
import { useNotifications } from "../hooks/useNotifications";
import { environment } from "@/src/environment";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginPayload) => Promise<void>;
    register: (credentials: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { expoPushToken } = useNotifications();


    const logout = useCallback(async () => {
        try {
            await container.logoutUser.execute();
        } catch {

        } finally {
            await AsyncStorage.multiRemove(["token", "user"]);
            setUser(null);
            setError(null);
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        setOnUnauthorized(logout);
    }, [logout]);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const userData = await AsyncStorage.getItem("user");

                if (token && userData && !isTokenExpired(token)) {
                    setUser(JSON.parse(userData));
                } else {
                    await AsyncStorage.multiRemove(["token", "user"]);
                    setUser(null);
                }
            } catch (e) {
                await AsyncStorage.multiRemove(["token", "user"]);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (credentials: LoginPayload) => {
        setLoading(true);
        setError(null);
        try {
            const result = await container.loginUser.execute(credentials);
            setUser(result.user);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials: RegisterPayload) => {
        setLoading(true);
        setError(null);
        try {
            const result = await container.registerUser.execute(credentials);
            setUser(result.user);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = !!user;

    useEffect(() => {
    const saveToken = async () => {
        if (!isAuthenticated || !expoPushToken) return;
        const jwt = await AsyncStorage.getItem("token");
        await fetch(`${environment.apiUrl}/user/push-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ token: expoPushToken }),
        });
    };
    saveToken();
}, [isAuthenticated, expoPushToken]);

    return (
        <AuthContext.Provider value={{ user, loading, error, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return context;
};