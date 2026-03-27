import { useRouter, useLocalSearchParams } from "expo-router";
import { ProfileScreen } from "@/src/ui/screens/ProfileScreen";
 
export default function Profile() {
    const router = useRouter();
    const { username } = useLocalSearchParams<{ username: string }>();
 
    return (
        <ProfileScreen
            username={username!}
            onBack={() => router.back()}
        />
    );
}
 