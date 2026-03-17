import React, { useEffect } from "react";
import {
    View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet,
} from "react-native";
import { useProfile } from "@/src/presentation/hooks/useProfile";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { shadows } from "../styles/shadow";
import { useAuth } from "@/src/presentation/context/AuthContext";

interface Props { username: string; onBack: () => void; }

const getReputation = (score: number) => {
    if (score >= 80) return { label: "Bon joueur", color: colors.primary, emoji: "😇" };
    if (score >= 60) return { label: "Fiable", color: colors.accent, emoji: "😊" };
    if (score >= 40) return { label: "Neutre", color: colors.warning, emoji: "😐" };
    if (score >= 20) return { label: "Agitateur", color: colors.error, emoji: "😈" };
    return { label: "Chaotique", color: "#FF3B30", emoji: "💀" };
};

export const ProfileScreen = ({ username, onBack }: Props) => {
    const { logout } = useAuth();
    const { profile, loading, error, fetchProfile } = useProfile(username);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>;
    }
    if (error || !profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error || "Profil introuvable"}</Text>
                <TouchableOpacity onPress={onBack}><Text style={styles.linkText}>Retour</Text></TouchableOpacity>
            </View>
        );
    }

    const rep = getReputation(profile.reputationScore);

    return (
        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} hitSlop={16}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
                <View style={[styles.avatarCircle, { borderColor: rep.color, backgroundColor: rep.color + "10" }]}>
                    <Text style={styles.avatarEmoji}>{rep.emoji}</Text>
                </View>
                <Text style={styles.username}>{username}</Text>
            </View>

            <View style={styles.repCard}>
                <View style={styles.repHeader}>
                    <Text style={styles.repTitle}>Réputation</Text>
                    <Text style={[styles.repScore, { color: rep.color }]}>{profile.reputationScore}/100</Text>
                </View>
                <View style={styles.repBarBg}>
                    <View style={[styles.repBarFill, { width: `${profile.reputationScore}%`, backgroundColor: rep.color }]} />
                </View>
                <Text style={[styles.repLabel, { color: rep.color }]}>{rep.label}</Text>
            </View>

            <Text style={styles.sectionLabel}>Statistiques</Text>
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statVal}>{profile.totalActivities}</Text>
                    <Text style={styles.statLbl}>Activités</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statVal, { color: profile.totalPoints >= 0 ? colors.primary : colors.error }]}>
                        {profile.totalPoints > 0 ? "+" : ""}{profile.totalPoints}
                    </Text>
                    <Text style={styles.statLbl}>Points</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statVal, { color: colors.primary }]}>{profile.bonusReceived}</Text>
                    <Text style={styles.statLbl}>Bonus</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statVal, { color: colors.error }]}>{profile.malusReceived}</Text>
                    <Text style={styles.statLbl}>Malus</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
                <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.lg },
    center: { flex: 1, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center" },

    header: { paddingTop: 60, paddingBottom: spacing.sm },
    backArrow: { fontSize: 28, color: colors.textPrimary, fontWeight: "300" },

    avatarSection: { alignItems: "center", paddingVertical: spacing.xl },
    avatarCircle: {
        width: 96, height: 96, borderRadius: 48,
        justifyContent: "center", alignItems: "center",
        borderWidth: 3, marginBottom: spacing.md, ...shadows.md,
    },
    avatarEmoji: { fontSize: 44 },
    username: { fontSize: 28, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },

    repCard: {
        backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
        marginBottom: spacing.lg, ...shadows.md,
    },
    repHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    repTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    repScore: { fontSize: 16, fontWeight: "700" },
    repBarBg: { height: 8, backgroundColor: colors.bgInput, borderRadius: 4, overflow: "hidden", marginBottom: spacing.sm },
    repBarFill: { height: 8, borderRadius: 4 },
    repLabel: { fontSize: 14, fontWeight: "600", textAlign: "center" },

    sectionLabel: {
        fontSize: 12, fontWeight: "600", color: colors.textSecondary,
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm, paddingLeft: spacing.xs,
    },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
    statCard: {
        flex: 1, minWidth: "45%",
        backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing.lg, alignItems: "center", ...shadows.md,
    },
    statVal: { fontSize: 30, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
    statLbl: { fontSize: 13, color: colors.textSecondary },

    logoutBtn: {
        backgroundColor: colors.white, padding: spacing.md,
        borderRadius: radius.md, alignItems: "center", ...shadows.sm,
    },
    logoutText: { color: colors.error, fontSize: 15, fontWeight: "600" },

    error: { color: colors.error, fontSize: 14, marginBottom: spacing.md },
    linkText: { color: colors.accent, fontSize: 15, fontWeight: "600" },
});