import { useRouter, useLocalSearchParams } from "expo-router";
import { ResetPasswordScreen } from "@/src/ui/screens/ResetPasswordScreen";
 
export default function ResetPassword() {
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();
 
    return (
        <ResetPasswordScreen
            token={token || ""}
            onSuccess={() => router.replace("/login")}
        />
    );
}
 