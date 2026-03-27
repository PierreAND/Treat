import { useRouter, useLocalSearchParams } from "expo-router";
import { ActivityDetailScreen } from "@/src/ui/screens/ActivityDetailScreen";
 
export default function ActivityDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const activityId = Number(id);
 
    return (
        <ActivityDetailScreen
            activityId={activityId}
            onBack={() => router.back()}
            onGoToVote={(id: number) => router.push(`/(app)/activity/${id}/vote` as any)}
            onGoToBill={(id: number) => router.push(`/(app)/activity/${id}/bill` as any)}
        />
    );
}
 