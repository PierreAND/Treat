import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginPayload, RegisterPayload } from "@/src/domain/entities/user.model";
import { container } from "@/src/infrastructure/injecteur/container";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const userData = await AsyncStorage.getItem("user");
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("user");
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
        const storedToken = await AsyncStorage.getItem("token");
        console.log("TOKEN AFTER LOGIN:", storedToken ? "STORED" : "NOT STORED");
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

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await container.logoutUser.execute();
            setUser(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = !!user;

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