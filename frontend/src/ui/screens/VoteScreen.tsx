import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Animated,
} from "react-native";
import { useActivity } from "@/src/presentation/hooks/useActivity";
import { useVotes, PendingVote } from "@/src/presentation/hooks/useVote";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { ActivityMember } from "@/src/domain/entities/activity.model";
import { Rule } from "@/src/domain/entities/rule.model";
import { VoteScreenProps } from "@/src/presentation/interface/VoteScreenType";


export const VoteScreen = ({ activityId, onBack, onGoToBill }: VoteScreenProps) => {
    const { activity, loading: activityLoading } = useActivity(activityId);
    const { user } = useAuth();
    const {
        pendingVotes,
        loading: voteLoading,
        error,
        hasVoted,
        checkVoteStatus,
        addVote,
        removeVote,
        getVotesForMember,
        getScorePreview,
        submitVotes,
        allVoted,
        totalCount,
        votedCount,
        checkVoteCount,
    } = useVotes(activityId);

    const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
    const [phase, setPhase] = useState<"voting" | "review" | "submitted">("voting");
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        checkVoteStatus();
    }, []);

    useEffect(() => {
        if (hasVoted) {
            setPhase("submitted");
            checkVoteCount();
        }
    }, [hasVoted]);

    const otherMembers = activity?.members.filter(
        (m) => m.status === "accepted" && m.username !== user?.username
    ) || [];

    const currentMember = otherMembers[currentMemberIndex];
    const bonusRules = activity?.rules.filter((r) => r.type === "bonus") || [];
    const malusRules = activity?.rules.filter((r) => r.type === "malus") || [];

    const isRuleSelected = (memberId: number, ruleId: number): boolean => {
        return getVotesForMember(memberId).some((v) => v.ruleId === ruleId);
    };

    const toggleRule = (member: ActivityMember, rule: Rule) => {
        if (isRuleSelected(member.id, rule.id)) {
            removeVote(member.id, rule.id);
        } else {
            addVote(member, rule);
        }
    };

    const animateTransition = (callback: () => void) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            callback();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    const nextMember = () => {
        if (currentMemberIndex < otherMembers.length - 1) {
            animateTransition(() => setCurrentMemberIndex((i) => i + 1));
        } else {
            setPhase("review");
        }
    };

    const prevMember = () => {
        if (currentMemberIndex > 0) {
            animateTransition(() => setCurrentMemberIndex((i) => i - 1));
        }
    };

    const handleSubmit = async () => {
        await submitVotes();
        setPhase("submitted");
    };

    if (activityLoading || !activity) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (phase === "submitted") {
        return (
            <View style={styles.submittedContainer}>
                <Text style={styles.submittedEmoji}>✅</Text>
                <Text style={styles.submittedTitle}>Votes envoyés !</Text>
                <Text style={styles.submittedSubtext}>
                    En attente des autres joueurs...
                </Text>
            {allVoted ? (
                <TouchableOpacity
                    style={styles.billButton}
                    onPress={() => onGoToBill(activityId)}
                >
                    <Text style={styles.billButtonText}>💰 Passer à la note</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.submittedSubtext}>
                    🗳️ {votedCount}/{totalCount} votes reçus
                </Text>
            )}

            <TouchableOpacity style={styles.backButtonBottom} onPress={onBack}>
                <Text style={styles.backButtonBottomText}>← Retour</Text>
            </TouchableOpacity>
        </View>
        );
    }

    if (phase === "review") {
        return (
            <ScrollView style={styles.screen}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setPhase("voting")}>
                        <Text style={styles.backText}>← Modifier</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.reviewTitle}>📋 Récapitulatif</Text>
                <Text style={styles.reviewSubtext}>
                    Vérifie tes votes avant de valider
                </Text>

                {otherMembers.map((member) => {
                    const memberVotes = getVotesForMember(member.id);
                    const score = getScorePreview(member.id);
                    return (
                        <View key={member.id} style={styles.reviewCard}>
                            <View style={styles.reviewCardHeader}>
                                <View style={styles.reviewAvatar}>
                                    <Text style={styles.reviewAvatarText}>
                                        {member.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.reviewName}>{member.username}</Text>
                                <View
                                    style={[
                                        styles.reviewScoreBadge,
                                        {
                                            backgroundColor:
                                                score >= 0
                                                    ? colors.primary + "20"
                                                    : colors.error + "20",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: score >= 0 ? colors.primary : colors.error,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {score > 0 ? "+" : ""}
                                        {score}
                                    </Text>
                                </View>
                            </View>
                            {memberVotes.length === 0 ? (
                                <Text style={styles.noVoteText}>Aucun vote</Text>
                            ) : (
                                memberVotes.map((v, i) => (
                                    <View key={i} style={styles.reviewVoteRow}>
                                        <Text style={styles.reviewVoteName}>{v.ruleName}</Text>
                                        <Text
                                            style={{
                                                color: v.points > 0 ? colors.primary : colors.error,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {v.points > 0 ? "+" : ""}
                                            {v.points}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                    );
                })}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={voteLoading}
                >
                    {voteLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Valider mes votes 🚀</Text>
                    )}
                </TouchableOpacity>

                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>
                <Text style={styles.progressText}>
                    {currentMemberIndex + 1} / {otherMembers.length}
                </Text>
            </View>

            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${((currentMemberIndex + 1) / otherMembers.length) * 100}%`,
                        },
                    ]}
                />
            </View>

            <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
                <Text style={styles.questionLabel}>Que penses-tu de...</Text>
                <View style={styles.questionAvatarLarge}>
                    <Text style={styles.questionAvatarText}>
                        {currentMember?.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.questionName}>{currentMember?.username}</Text>

                <View style={styles.scorePreview}>
                    <Text
                        style={[
                            styles.scorePreviewText,
                            {
                                color:
                                    getScorePreview(currentMember?.id || 0) >= 0
                                        ? colors.primary
                                        : colors.error,
                            },
                        ]}
                    >
                        {getScorePreview(currentMember?.id || 0) > 0 ? "+" : ""}
                        {getScorePreview(currentMember?.id || 0)} pts
                    </Text>
                </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                <ScrollView style={styles.rulesContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.rulesSectionTitle}>👍 Bonus</Text>
                    <View style={styles.chipsContainer}>
                        {bonusRules.map((rule) => {
                            const selected = isRuleSelected(currentMember?.id || 0, rule.id);
                            return (
                                <TouchableOpacity
                                    key={rule.id}
                                    style={[
                                        styles.chip,
                                        selected && styles.chipBonusActive,
                                    ]}
                                    onPress={() => currentMember && toggleRule(currentMember, rule)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selected && styles.chipTextActive,
                                        ]}
                                    >
                                        {rule.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.chipPoints,
                                            selected && { color: colors.white },
                                        ]}
                                    >
                                        +{rule.points}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.rulesSectionTitle}>👎 Malus</Text>
                    <View style={styles.chipsContainer}>
                        {malusRules.map((rule) => {
                            const selected = isRuleSelected(currentMember?.id || 0, rule.id);
                            return (
                                <TouchableOpacity
                                    key={rule.id}
                                    style={[
                                        styles.chip,
                                        selected && styles.chipMalusActive,
                                    ]}
                                    onPress={() => currentMember && toggleRule(currentMember, rule)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selected && styles.chipTextActive,
                                        ]}
                                    >
                                        {rule.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.chipPoints,
                                            selected && { color: colors.white },
                                        ]}
                                    >
                                        {rule.points}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </Animated.View>

            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navButton, currentMemberIndex === 0 && styles.navButtonDisabled]}
                    onPress={prevMember}
                    disabled={currentMemberIndex === 0}
                >
                    <Text
                        style={[
                            styles.navButtonText,
                            currentMemberIndex === 0 && styles.navButtonTextDisabled,
                        ]}
                    >
                        ← Précédent
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButtonNext} onPress={nextMember}>
                    <Text style={styles.navButtonNextText}>
                        {currentMemberIndex < otherMembers.length - 1
                            ? "Suivant →"
                            : "Récapitulatif →"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: spacing.md,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },
    progressText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },

    progressBar: {
        height: 4,
        backgroundColor: colors.bgInput,
        borderRadius: 2,
        marginBottom: spacing.lg,
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.accent,
        borderRadius: 2,
    },

    questionCard: {
        alignItems: "center",
        paddingVertical: spacing.lg,
    },
    questionLabel: {
        color: colors.textSecondary,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    questionAvatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent + "30",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
        borderWidth: 3,
        borderColor: colors.accent,
    },
    questionAvatarText: {
        color: colors.accent,
        fontWeight: "bold",
        fontSize: 36,
    },
    questionName: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: "bold",
    },
    scorePreview: {
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.md,
    },
    scorePreviewText: {
        fontSize: 16,
        fontWeight: "bold",
    },

    rulesContainer: {
        flex: 1,
    },
    rulesSectionTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.bgSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        gap: spacing.xs,
    },
    chipBonusActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    chipMalusActive: {
        backgroundColor: colors.error,
        borderColor: colors.error,
    },
    chipText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    chipTextActive: {
        color: colors.white,
    },
    chipPoints: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: "bold",
    },

    navBar: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.lg,
    },
    navButton: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    navButtonDisabled: {
        opacity: 0.4,
    },
    navButtonText: {
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 15,
    },
    navButtonTextDisabled: {
        color: colors.textMuted,
    },
    navButtonNext: {
        flex: 1,
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
    },
    navButtonNextText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 15,
    },

    reviewTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: 4,
    },
    reviewSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
    reviewCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reviewCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent + "30",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.sm,
    },
    reviewAvatarText: {
        color: colors.accent,
        fontWeight: "bold",
        fontSize: 16,
    },
    reviewName: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
    },
    reviewScoreBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    noVoteText: {
        color: colors.textMuted,
        fontSize: 13,
        fontStyle: "italic",
    },
    reviewVoteRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    reviewVoteName: {
        color: colors.textSecondary,
        fontSize: 14,
    },

    submitButton: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },

    submittedContainer: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
    },
    submittedEmoji: {
        fontSize: 60,
        marginBottom: spacing.lg,
    },
    submittedTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    submittedSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    billButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    billButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    backButtonBottom: {
        paddingVertical: spacing.md,
    },
    backButtonBottomText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },

    error: {
        color: colors.error,
        textAlign: "center",
        marginTop: spacing.md,
        fontSize: 14,
    },
});