import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useNotifications } from "@/src/presentation/hooks/useNotifications";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/src/ui/styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/src/environment";
import { useEffect } from "react";

export default function AppLayout() {
    const { isAuthenticated, loading } = useAuth();
    const { expoPushToken } = useNotifications();

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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPrimary }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}