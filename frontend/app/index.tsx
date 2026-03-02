import React, { useState } from "react";
import { LoginScreen } from "@/src/ui/screens/LoginScreen";
import { RegisterScreen } from "@/src/ui/screens/RegisterScreen";
import { HomeScreen } from "@/src/ui/screens/HomeScreen";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/src/ui/styles/colors";

export default function Index() {
    const [screen, setScreen] = useState<"login" | "register">("login");
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPrimary }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (isAuthenticated) {
        return <HomeScreen />;
    }

    if (screen === "register") {
        return <RegisterScreen onNavigateToLogin={() => setScreen("login")} />;
    }

    return <LoginScreen onNavigateToRegister={() => setScreen("register")} />;
}