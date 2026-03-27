import { Redirect } from "expo-router";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/src/ui/styles/colors";

export default function Index() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPrimary }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return <Redirect href={isAuthenticated ? "/(app)" : "/login"} />;
}