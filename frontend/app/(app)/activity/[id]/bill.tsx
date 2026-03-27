import { useRouter, useLocalSearchParams } from "expo-router";
import { BillScreen } from "@/src/ui/screens/BillScreen";

export default function Bill() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const activityId = Number(id);

    return (
        <BillScreen
            activityId={activityId}
            onBack={() => router.back()}
        />
    );
}