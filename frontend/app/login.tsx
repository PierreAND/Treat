import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { LoginScreen } from "@/src/ui/screens/LoginScreen";

export default function Login() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Redirect href="/(app)" />;
    }

    return (
        <LoginScreen
            onNavigateToRegister={() => router.push("/register")}
            onNavigateToForgotPassword={() => router.push("/forgot-password")}
        />
    );
}