import { useRouter, useLocalSearchParams } from "expo-router";
import { VoteScreen } from "@/src/ui/screens/VoteScreen";
 
export default function Vote() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const activityId = Number(id);
 
    return (
        <VoteScreen
            activityId={activityId}
            onBack={() => router.back()}
            onGoToBill={(id: number) => router.replace(`/(app)/activity/${id}/bill` as any)}
        />
    );
}
 