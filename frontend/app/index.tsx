import React, { useState } from "react";
import { LoginScreen } from "@/src/ui/screens/LoginScreen";
import { RegisterScreen } from "@/src/ui/screens/RegisterScreen";
import { HomeScreen } from "@/src/ui/screens/HomeScreen";
import { ForgotPasswordScreen } from "@/src/ui/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/src/ui/screens/ResetPasswordScreen";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/src/ui/styles/colors";

export default function Index() {
    const [screen, setScreen] = useState<"login" | "register" | "forgot" | "reset">("login");
    const [resetToken, setResetToken] = useState<string>("");
    const { isAuthenticated, loading } = useAuth();

 
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPrimary }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (isAuthenticated) return <HomeScreen />;

    if (screen === "register") {
        return <RegisterScreen onNavigateToLogin={() => setScreen("login")} />;
    }

    if (screen === "forgot") {
        return <ForgotPasswordScreen onBack={() => setScreen("login")} />;
    }

    if (screen === "reset") {
        return (
            <ResetPasswordScreen
                token={resetToken}
                onSuccess={() => setScreen("login")}
            />
        );
    }

    return (
        <LoginScreen
            onNavigateToRegister={() => setScreen("register")}
            onNavigateToForgotPassword={() => setScreen("forgot")}
        />
    );
}