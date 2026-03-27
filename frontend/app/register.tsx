import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { RegisterScreen } from "@/src/ui/screens/RegisterScreen";

export default function Register() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Redirect href="/(app)" />;
    }

    return <RegisterScreen onNavigateToLogin={() => router.replace("/login")} />;
}