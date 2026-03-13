import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useActivity } from "@/src/presentation/hooks/useActivity";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { ActivityMember } from "@/src/domain/entities/activity.model";
import { PullToRefresh } from "../components/PullToRefresh";
import { useVotes } from "@/src/presentation/hooks/useVote";
import { ActivityProps } from "@/src/presentation/interface/ActivityScreenType";



export const ActivityDetailScreen = ({ activityId, onBack, onGoToVote, onGoToBill }: ActivityProps) => {
    const { activity, loading, error, invite, start, stop, refresh, refreshing, handleRefresh } = useActivity(activityId);
    const { user } = useAuth();
    const { allVoted, votedCount, totalCount, checkVoteCount } = useVotes(activityId)
    const [username, setUsername] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    const isCreator = activity?.creator === user?.username;

    useEffect(() => {
        if (activity && (activity.status === "voting" || activity.status === "finished")) {
            checkVoteCount()
        }

    }, [activity]);

    const handleInvite = async () => {
        if (!username.trim()) return;
        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(null);
        try {
            await invite(username.trim());
            setInviteSuccess(`${username} a été invité !`);
            setUsername("");
        } catch (e: any) {
            setInviteError(e.message);
        } finally {
            setInviteLoading(false);
        }
    };

    const handleStart = async () => {
        await start();
    };

    const handleStop = async () => {
        await stop();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return { label: "En attente", color: colors.accent, emoji: "⏳" };
            case "active":
                return { label: "En cours", color: colors.primary, emoji: "🟢" };
            case "voting":
                return { label: "Phase de vote", color: colors.warning, emoji: "🗳️" };
            case "finished":
                return { label: "Terminée", color: colors.textMuted, emoji: "✅" };
            default:
                return { label: status, color: colors.textSecondary, emoji: "" };
        }
    };

    const getMemberStatusConfig = (status: string) => {
        switch (status) {
            case "accepted":
                return { label: "Accepté", color: colors.primary };
            case "invited":
                return { label: "En attente", color: colors.accent };
            case "declined":
                return { label: "Refusé", color: colors.error };
            default:
                return { label: status, color: colors.textSecondary };
        }
    };

    const renderMember = ({ item }: { item: ActivityMember }) => {
        const config = getMemberStatusConfig(item.status);
        return (
            <View style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.username}</Text>
                    <View style={[styles.memberStatusBadge, { backgroundColor: config.color + "20" }]}>
                        <Text style={[styles.memberStatusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading || !activity) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const statusConfig = getStatusConfig(activity.status);
    const acceptedMembers = activity.members.filter((m) => m.status === "accepted");
    const pendingMembers = activity.members.filter((m) => m.status === "invited");

    return (
        <ScrollView style={styles.screen}
            refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefresh} />}
        >

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                    <Text style={styles.themeTag}>{activity.theme.toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + "20" }]}>
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.emoji} {statusConfig.label}
                        </Text>
                    </View>
                </View>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityCreator}>Créé par {activity.creator}</Text>
            </View>


            {isCreator && (
                <View style={styles.actionSection}>
                    {activity.status === "pending" && (
                        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                            <Text style={styles.startButtonText}>▶ Démarrer l&apos;activité</Text>
                        </TouchableOpacity>
                    )}

                    {activity.status === "active" && (
                        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                            <Text style={styles.stopButtonText}>⏹ Arrêter → Passer au vote</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {activity.status === "voting" && (
                <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => onGoToVote(activityId)}
                >
                    <Text style={styles.voteButtonText}>🗳️ Voter maintenant</Text>
                </TouchableOpacity>
            )}


            {(activity.status === "voting" || activity.status === "finished") && (
                <View>
                    <Text style={styles.voteProgress}>
                        🗳️ Votes : {votedCount}/{totalCount}
                    </Text>
                    {allVoted ? (
                        <TouchableOpacity
                            style={styles.billAccessButton}
                            onPress={() => onGoToBill(activityId)}
                        >
                            <Text style={styles.billAccessButtonText}>💰 Voir la note</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.billDisabledButton}>
                            <Text style={styles.billDisabledText}>
                                💰 En attente de tous les votes ({votedCount}/{totalCount})
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {activity.status === "pending" && isCreator && (
                <View style={styles.inviteSection}>
                    <Text style={styles.sectionTitle}>📩 Inviter un ami</Text>

                    {inviteError && <Text style={styles.inviteError}>{inviteError}</Text>}
                    {inviteSuccess && <Text style={styles.inviteSuccessText}>{inviteSuccess}</Text>}

                    <View style={styles.inviteRow}>
                        <TextInput
                            style={styles.inviteInput}
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor={colors.textMuted}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.inviteButton}
                            onPress={handleInvite}
                            disabled={inviteLoading}
                        >
                            {inviteLoading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <Text style={styles.inviteButtonText}>Inviter</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}


            <View style={styles.membersSection}>
                <Text style={styles.sectionTitle}>
                    👥 Membres ({acceptedMembers.length})
                </Text>
                {acceptedMembers.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun membre pour le moment</Text>
                ) : (
                    <FlatList
                        data={acceptedMembers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMember}
                        scrollEnabled={false}
                    />
                )}
            </View>


            {pendingMembers.length > 0 && (
                <View style={styles.membersSection}>
                    <Text style={styles.sectionTitle}>
                        ⏳ En attente ({pendingMembers.length})
                    </Text>
                    <FlatList
                        data={pendingMembers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMember}
                        scrollEnabled={false}
                    />
                </View>
            )}


            {activity.rules && activity.rules.length > 0 && (
                <View style={styles.rulesSection}>
                    <Text style={styles.sectionTitle}>📋 Règles</Text>
                    {activity.rules.map((rule) => (
                        <View key={rule.id} style={styles.ruleCard}>
                            <View style={styles.ruleLeft}>
                                <Text style={styles.ruleName}>{rule.name}</Text>
                                {rule.isDefault && (
                                    <Text style={styles.ruleDefault}>par défaut</Text>
                                )}
                            </View>
                            <View
                                style={[
                                    styles.rulePoints,
                                    {
                                        backgroundColor:
                                            rule.type === "bonus"
                                                ? colors.primary + "20"
                                                : colors.error + "20",
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: rule.type === "bonus" ? colors.primary : colors.error,
                                        fontWeight: "bold",
                                        fontSize: 14,
                                    }}
                                >
                                    {rule.points > 0 ? "+" : ""}
                                    {rule.points}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

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
    backButton: {
        alignSelf: "flex-start",
        paddingVertical: spacing.sm,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },

    activityCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    themeTag: {
        fontSize: 11,
        fontWeight: "bold",
        color: colors.accent,
        backgroundColor: colors.accent + "15",
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.sm,
        overflow: "hidden",
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    activityName: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    activityCreator: {
        fontSize: 13,
        color: colors.textSecondary,
    },

    actionSection: {
        marginBottom: spacing.lg,
    },
    startButton: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary,
    },
    startButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    stopButton: {
        backgroundColor: colors.error + "20",
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.error,
    },
    stopButtonText: {
        color: colors.error,
        fontSize: 16,
        fontWeight: "bold",
    },
    voteButton: {
        backgroundColor: colors.accent + "20",
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.accent,
        marginBottom: spacing.lg,
    },
    voteButtonText: {
        color: colors.accent,
        fontSize: 16,
        fontWeight: "bold",
    },

    inviteSection: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inviteRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    inviteInput: {
        flex: 1,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
    },
    inviteButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    inviteButtonText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 14,
    },
    inviteError: {
        color: colors.error,
        fontSize: 13,
        marginBottom: spacing.sm,
    },
    inviteSuccessText: {
        color: colors.primary,
        fontSize: 13,
        marginBottom: spacing.sm,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },

    membersSection: {
        marginBottom: spacing.lg,
    },
    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent + "30",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    memberAvatarText: {
        color: colors.accent,
        fontWeight: "bold",
        fontSize: 18,
    },
    memberInfo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    memberName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    memberStatusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.sm,
    },
    memberStatusText: {
        fontSize: 11,
        fontWeight: "bold",
    },


    rulesSection: {
        marginBottom: spacing.lg,
    },
    ruleCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ruleLeft: {
        flex: 1,
    },
    ruleName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    ruleDefault: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: 2,
    },
    rulePoints: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },

    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: "center",
        paddingVertical: spacing.lg,
    },
    error: {
        color: colors.error,
        textAlign: "center",
        marginTop: spacing.md,
        fontSize: 14,
    },
    billAccessButton: {
        backgroundColor: colors.primary + "15",
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary + "40",
        marginBottom: spacing.lg,
    },
    billAccessButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
    voteProgress: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    billDisabledButton: {
        backgroundColor: colors.bgInput,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.lg,
        opacity: 0.6,
    },
    billDisabledText: {
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: "600",
    },
});