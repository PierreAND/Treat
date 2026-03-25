import { useLocalSearchParams, router } from "expo-router";
import { ResetPasswordScreen } from "@/src/ui/screens/ResetPasswordScreen";

export default function ResetPassword() {
    const { token } = useLocalSearchParams<{ token: string }>();

    return (
        <ResetPasswordScreen
            token={token || ""}
            onSuccess={() => router.replace("/")}
        />
    );
}