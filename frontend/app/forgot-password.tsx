import { useRouter } from "expo-router";
import { ForgotPasswordScreen } from "@/src/ui/screens/ForgotPasswordScreen";
 
export default function ForgotPassword() {
    const router = useRouter();
 
    return <ForgotPasswordScreen onBack={() => router.back()} />;
}
 