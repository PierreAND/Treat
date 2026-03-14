import React, { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useProfile } from "@/src/presentation/hooks/useProfile";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { useAuth } from "@/src/presentation/context/AuthContext";

interface Props {
    username: string;
    onBack: () => void;
}

const getReputationConfig = (score: number) => {
    if (score >= 80) return { label: "Bon joueur 🏆", color: colors.primary };
    if (score >= 60) return { label: "Fiable 👍", color: colors.accent };
    if (score >= 40) return { label: "Neutre 😐", color: colors.warning };
    if (score >= 20) return { label: "Agitateur 👀", color: colors.error };
    return { label: "Chaotique 💀", color: "#ff0000" };
};

export const ProfileScreen = ({ username, onBack }: Props) => {
    const { logout } = useAuth();
    const { profile, loading, error, fetchProfile } = useProfile(username);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.error}>{error || "Profil introuvable"}</Text>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const config = getReputationConfig(profile.reputationScore);

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.username}>{username}</Text>
            </View>

            <View style={styles.reputationCard}>
                <View style={styles.reputationHeader}>
                    <Text style={styles.reputationTitle}>Réputation</Text>
                    <Text style={[styles.reputationScore, { color: config.color }]}>
                        {profile.reputationScore}/100
                    </Text>
                </View>
                <View style={styles.reputationBarBg}>
                    <View
                        style={[
                            styles.reputationBarFill,
                            {
                                width: `${profile.reputationScore}%`,
                                backgroundColor: config.color,
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.reputationLabel, { color: config.color }]}>
                    {config.label}
                </Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{profile.totalActivities}</Text>
                    <Text style={styles.statLabel}>Activités</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[
                        styles.statValue,
                        { color: profile.totalPoints >= 0 ? colors.primary : colors.error }
                    ]}>
                        {profile.totalPoints > 0 ? "+" : ""}{profile.totalPoints}
                    </Text>
                    <Text style={styles.statLabel}>Points totaux</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                        {profile.bonusReceived}
                    </Text>
                    <Text style={styles.statLabel}> Bonus</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.error }]}>
                        {profile.malusReceived}
                    </Text>
                    <Text style={styles.statLabel}> Malus</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
       
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingTop: 60,
        paddingBottom: spacing.md,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },
    avatarSection: {
        alignItems: "center",
        paddingVertical: spacing.xl,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.accent + "30",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: colors.accent,
        marginBottom: spacing.md,
    },
    avatarText: {
        color: colors.accent,
        fontSize: 40,
        fontWeight: "bold",
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    reputationCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reputationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    reputationTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    reputationScore: {
        fontSize: 16,
        fontWeight: "bold",
    },
    reputationBarBg: {
        height: 12,
        backgroundColor: colors.bgInput,
        borderRadius: radius.full,
        overflow: "hidden",
        marginBottom: spacing.sm,
    },
    reputationBarFill: {
        height: 12,
        borderRadius: radius.full,
    },
    reputationLabel: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    error: {
        color: colors.error,
        fontSize: 14,
        marginBottom: spacing.md,
    },
    logoutButton: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error + "40",
    marginTop: spacing.lg,
},
logoutButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "600",
},
});