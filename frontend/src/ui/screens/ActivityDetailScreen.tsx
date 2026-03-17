import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Modal,
} from "react-native";
import { useActivity } from "@/src/presentation/hooks/useActivity";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { shadows } from "../styles/shadow";
import { ActivityMember } from "@/src/domain/entities/activity.model";
import { PullToRefresh } from "../components/PullToRefresh";
import { useVotes } from "@/src/presentation/hooks/useVote";
import { useRule } from "@/src/presentation/hooks/useRules";
import { ActivityProps } from "@/src/presentation/interface/ActivityScreenType";

export const ActivityDetailScreen = ({ activityId, onBack, onGoToVote, onGoToBill }: ActivityProps) => {
    const { activity, loading, error, invite, start, stop, refresh, refreshing, handleRefresh } = useActivity(activityId);
    const { user } = useAuth();
    const { allVoted, votedCount, totalCount, checkVoteCount } = useVotes(activityId);
    const [username, setUsername] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
    const { addRule, loading: addRuleLoading, error: addRuleEroor } = useRule();
    const [ruleModalVisible, setRuleModalVisible] = useState(false);
    const [ruleName, setRuleName] = useState("");
    const [ruleType, setRuleType] = useState<"bonus" | "malus">("bonus");
    const [rulePoints, setRulePoints] = useState("");

    const isCreator = activity?.creator === user?.username;

    useEffect(() => {
        if (activity && (activity.status === "voting" || activity.status === "finished")) {
            checkVoteCount();
        }
    }, [activity]);

    const handleRule = async () => {
        if (!ruleName.trim() || !rulePoints.trim()) return;
        const result = await addRule(activityId, {
            name: ruleName.trim(),
            type: ruleType,
            points: parseInt(rulePoints, 10),
        });
        if (result) {
            setRuleName("");
            setRulePoints("");
            setRuleType("bonus");
            setRuleModalVisible(false);
            refresh();
        }
    };

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

    const handleStart = async () => { await start(); };
    const handleStop = async () => { await stop(); };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending": return { label: "En attente", color: colors.warning };
            case "active": return { label: "En cours", color: colors.primary };
            case "voting": return { label: "Voting", color: colors.accent };
            case "finished": return { label: "Terminée", color: colors.textMuted };
            default: return { label: status, color: colors.textSecondary };
        }
    };

    const getMemberStatusColor = (status: string) => {
        switch (status) {
            case "accepted": return colors.primary;
            case "invited": return colors.accent;
            case "declined": return colors.error;
            default: return colors.textSecondary;
        }
    };

    if (loading || !activity) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const statusConfig = getStatusConfig(activity.status);
    const acceptedMembers = activity.members.filter((m) => m.status === "accepted");
    const pendingMembers = activity.members.filter((m) => m.status === "invited");
    const voteProgress = totalCount > 0 ? votedCount / totalCount : 0;

    return (
        <ScrollView
            style={styles.screen}
            showsVerticalScrollIndicator={false}
            refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} hitSlop={16}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroLeft}>
                    <Text style={styles.heroTitle}>{activity.name}</Text>
                    <Text style={styles.heroMeta}>{activity.theme} · {activity.creator}</Text>
                </View>
                <View style={styles.heroBubbles}>
                    {acceptedMembers.slice(0, 3).map((m, i) => (
                        <View key={m.id} style={styles.percentBubble}>
                            <Text style={styles.percentText}>
                                {Math.round(100 / acceptedMembers.length)}%
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {(activity.status === "voting" || activity.status === "finished") && (
                <TouchableOpacity
                    style={styles.votingBar}
                    onPress={() => activity.status === "voting" ? onGoToVote(activityId) : null}
                    activeOpacity={activity.status === "voting" ? 0.8 : 1}
                >
                    <View style={styles.votingBarInner}>
                        <View style={styles.votingBarLeft}>
                            <View style={styles.votingAvatar}>
                                <Text style={styles.votingAvatarText}>
                                    {user?.username.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.votingLabel}>{statusConfig.label}</Text>
                        </View>
                        <View style={styles.votingProgress}>
                            <View style={styles.votingTrack}>
                                <View style={[styles.votingFill, { width: `${voteProgress * 100}%` }]} />
                            </View>
                            <Text style={styles.votingCount}>{votedCount}/{totalCount}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {isCreator && activity.status === "pending" && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleStart} activeOpacity={0.8}>
                    <Text style={styles.actionBtnText}>Démarrer</Text>
                </TouchableOpacity>
            )}
            {isCreator && activity.status === "active" && (
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnStop]} onPress={handleStop} activeOpacity={0.8}>
                    <Text style={styles.actionBtnStopText}>Passer au vote</Text>
                </TouchableOpacity>
            )}

            {(activity.status === "voting" || activity.status === "finished") && allVoted && (
                <TouchableOpacity style={styles.billBtn} onPress={() => onGoToBill(activityId)} activeOpacity={0.8}>
                    <Text style={styles.billBtnText}>Voir la note</Text>
                </TouchableOpacity>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Membres</Text>
                <View style={styles.membersList}>
                    {acceptedMembers.map((member: ActivityMember, i: number) => (
                        <View key={member.id}>
                            {i > 0 && <View style={styles.memberDivider} />}
                            <View style={styles.memberRow}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>
                                        {member.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.memberContent}>
                                    <Text style={styles.memberName}>{member.username}</Text>
                                    <View style={styles.memberTags}>
                                        <View style={styles.memberTag}>
                                            <Text style={styles.memberTagText}>Accepté</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.memberToggle, { backgroundColor: colors.primary }]}>
                                    <View style={styles.memberToggleKnob} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {pendingMembers.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>En attente</Text>
                    <View style={styles.membersList}>
                        {pendingMembers.map((member, i) => (
                            <View key={member.id}>
                                {i > 0 && <View style={styles.memberDivider} />}
                                <View style={styles.memberRow}>
                                    <View style={[styles.memberAvatar, { backgroundColor: colors.bgInput }]}>
                                        <Text style={[styles.memberAvatarText, { color: colors.textMuted }]}>
                                            {member.username.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.memberContent}>
                                        <Text style={styles.memberName}>{member.username}</Text>
                                    </View>
                                    <View style={[styles.memberToggle, { backgroundColor: colors.bgInput }]}>
                                        <View style={[styles.memberToggleKnob, { alignSelf: "flex-start" }]} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {activity.status === "pending" && isCreator && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Inviter</Text>
                    <View style={styles.inviteCard}>
                        {inviteError && <Text style={styles.feedbackError}>{inviteError}</Text>}
                        {inviteSuccess && <Text style={styles.feedbackSuccess}>{inviteSuccess}</Text>}
                        <View style={styles.inviteRow}>
                            <TextInput
                                style={styles.inviteInput}
                                placeholder="Nom d'utilisateur"
                                placeholderTextColor={colors.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite} disabled={inviteLoading} activeOpacity={0.8}>
                                {inviteLoading ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Text style={styles.inviteBtnText}>Inviter</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Règles</Text>
                {activity.rules && activity.rules.length > 0 ? (
                    <View style={styles.membersList}>
                        {activity.rules.map((rule, i) => (
                            <View key={rule.id}>
                                {i > 0 && <View style={styles.memberDivider} />}
                                <View style={styles.ruleRow}>
                                    <View style={styles.ruleContent}>
                                        <Text style={styles.ruleName}>{rule.name}</Text>
                                        {rule.isDefault && <Text style={styles.ruleDefault}>par défaut</Text>}
                                    </View>
                                    <View style={[styles.ruleBadge, {
                                        backgroundColor: rule.type === "bonus" ? colors.primary + "14" : colors.error + "14"
                                    }]}>
                                        <Text style={{
                                            color: rule.type === "bonus" ? colors.primary : colors.error,
                                            fontWeight: "700",
                                            fontSize: 14,
                                        }}>
                                            {rule.points > 0 ? "+" : ""}{rule.points}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Aucune règle</Text>
                    </View>
                )}

                {isCreator && (activity.status === "pending" || activity.status === "active") && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => setRuleModalVisible(true)} activeOpacity={0.7}>
                        <Text style={styles.addBtnText}>+ Ajouter une règle</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Modal visible={ruleModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Nouvelle règle</Text>
                        {addRuleEroor && <Text style={styles.feedbackError}>{addRuleEroor}</Text>}

                        <View style={styles.modalInputGroup}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Nom de la règle"
                                placeholderTextColor={colors.textMuted}
                                value={ruleName}
                                onChangeText={setRuleName}
                            />
                        </View>

                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeChip, ruleType === "bonus" && { backgroundColor: colors.primary + "14" }]}
                                onPress={() => setRuleType("bonus")}
                            >
                                <Text style={[styles.typeChipText, ruleType === "bonus" && { color: colors.primary }]}>Bonus</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeChip, ruleType === "malus" && { backgroundColor: colors.error + "14" }]}
                                onPress={() => setRuleType("malus")}
                            >
                                <Text style={[styles.typeChipText, ruleType === "malus" && { color: colors.error }]}>Malus</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalInputGroup}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Points (ex: 2)"
                                placeholderTextColor={colors.textMuted}
                                value={rulePoints}
                                onChangeText={setRulePoints}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRuleModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, addRuleLoading && { opacity: 0.5 }]}
                                onPress={handleRule}
                                disabled={addRuleLoading}
                            >
                                <Text style={styles.modalSubmitText}>{addRuleLoading ? "..." : "Créer"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.lg },
    loadingContainer: { flex: 1, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center" },

    header: { paddingTop: 60, paddingBottom: spacing.sm },
    backArrow: { fontSize: 28, color: colors.textPrimary, fontWeight: "300" },

    // Hero
    heroSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.lg,
    },
    heroLeft: { flex: 1, paddingRight: spacing.md },
    heroTitle: {
        fontSize: 46,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -2,
        lineHeight: 48,
        marginBottom: spacing.sm,
    },
    heroMeta: { fontSize: 14, color: colors.textSecondary },
    heroBubbles: {
        justifyContent: "center",
        alignItems: "flex-end",
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    percentBubble: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        ...shadows.md,
    },
    percentText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },

    votingBar: {
        backgroundColor: colors.accent,
        borderRadius: radius.xl,
        padding: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    votingBarInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    votingBarLeft: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: spacing.md,
    },
    votingAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.25)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.sm,
    },
    votingAvatarText: { color: colors.white, fontWeight: "700", fontSize: 14 },
    votingLabel: { color: colors.white, fontWeight: "700", fontSize: 15 },
    votingProgress: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
    votingTrack: {
        flex: 1,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 2,
    },
    votingFill: {
        height: 4,
        backgroundColor: colors.white,
        borderRadius: 2,
    },
    votingCount: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },

    actionBtn: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    actionBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
    actionBtnStop: { backgroundColor: colors.white },
    actionBtnStopText: { color: colors.error, fontSize: 16, fontWeight: "700" },

    billBtn: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    billBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },

    section: { marginBottom: spacing.lg },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
        paddingLeft: spacing.xs,
    },

    membersList: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        overflow: "hidden",
        ...shadows.md,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.md,
    },
    memberDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: spacing.md + 42 + spacing.md,
    },
    memberAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    memberAvatarText: { color: colors.textPrimary, fontWeight: "700", fontSize: 17 },
    memberContent: { flex: 1 },
    memberName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    memberTags: { flexDirection: "row", gap: spacing.xs, marginTop: 3 },
    memberTag: {
        backgroundColor: colors.bgInput,
        borderRadius: radius.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    memberTagText: { fontSize: 10, color: colors.textMuted, fontWeight: "600" },

    memberToggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        paddingHorizontal: 3,
        alignItems: "flex-end",
    },
    memberToggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.white,
        ...shadows.sm,
    },

    ruleRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.md,
    },
    ruleContent: { flex: 1 },
    ruleName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    ruleDefault: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    ruleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.sm,
    },

    
    inviteCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.md,
        ...shadows.md,
    },
    inviteRow: { flexDirection: "row", gap: spacing.sm },
    inviteInput: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
    },
    inviteBtn: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    inviteBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },

    feedbackError: { color: colors.error, fontSize: 13, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
    feedbackSuccess: { color: colors.primary, fontSize: 13, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },

    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.lg,
        alignItems: "center",
        ...shadows.sm,
    },
    emptyText: { color: colors.textSecondary, fontSize: 14 },

    addBtn: {
        marginTop: spacing.sm,
        paddingVertical: spacing.md,
        alignItems: "center",
    },
    addBtnText: { color: colors.accent, fontSize: 15, fontWeight: "600" },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.lg,
        ...shadows.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
    modalInputGroup: {
        backgroundColor: colors.bgPrimary,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    modalInput: {
        padding: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
    },
    typeRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    typeChip: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        backgroundColor: colors.bgPrimary,
    },
    typeChipText: { color: colors.textSecondary, fontWeight: "600" },
    modalActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    modalCancelBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        backgroundColor: colors.bgPrimary,
    },
    modalCancelText: { color: colors.textSecondary, fontWeight: "600" },
    modalSubmitBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        backgroundColor: colors.accent,
    },
    modalSubmitText: { color: colors.white, fontWeight: "700" },
});