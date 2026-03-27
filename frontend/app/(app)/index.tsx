import { useRouter } from "expo-router";
import { HomeScreen } from "@/src/ui/screens/HomeScreen";
 
export default function Home() {
    const router = useRouter();
 
    return (
        <HomeScreen
            onNavigateToActivity={(id: number) => router.push(`/(app)/activity/${id}` as any)}
            onNavigateToProfile={(username: string) => router.push(`/(app)/profile/${username}` as any)}
        />
    );
}
 