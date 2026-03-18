import AsyncStorage from "@react-native-async-storage/async-storage";

let logoutCallback: (() => void) | null = null;

export const setOnUnauthorized = (onLogout: () => void) => {
    logoutCallback = onLogout;
};

export const apiFetch = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 && logoutCallback) {
        console.warn("[Auth] Token expiré — déconnexion automatique");
        logoutCallback();
    }

    return response;
};