import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Animated,
} from "react-native";
import { useActivity } from "@/src/presentation/hooks/useActivity";
import { useVotes } from "@/src/presentation/hooks/useVote";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { shadows } from "../styles/shadow";
import { ActivityMember } from "@/src/domain/entities/activity.model";
import { Rule } from "@/src/domain/entities/rule.model";
import { VoteScreenProps } from "@/src/presentation/interface/VoteScreenType";

export const VoteScreen = ({ activityId, onBack, onGoToBill }: VoteScreenProps) => {
    const { activity, loading: activityLoading } = useActivity(activityId);
    const { user } = useAuth();
    const {
        loading: voteLoading, error, hasVoted,
        checkVoteStatus, addVote, removeVote, getVotesForMember,
        getScorePreview, submitVotes, allVoted, totalCount, votedCount, checkVoteCount,
    } = useVotes(activityId);

    const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
    const [phase, setPhase] = useState<"voting" | "review" | "submitted">("voting");
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => { checkVoteStatus(); }, []);
    useEffect(() => {
        if (hasVoted) { setPhase("submitted"); checkVoteCount(); }
    }, [hasVoted]);

    const otherMembers = activity?.members.filter(
        (m) => m.status === "accepted" && m.username !== user?.username
    ) || [];

    const currentMember = otherMembers[currentMemberIndex];
    const bonusRules = activity?.rules.filter((r) => r.type === "bonus") || [];
    const malusRules = activity?.rules.filter((r) => r.type === "malus") || [];

    const isRuleSelected = (memberId: number, ruleId: number): boolean =>
        getVotesForMember(memberId).some((v) => v.ruleId === ruleId);

    const toggleRule = (member: ActivityMember, rule: Rule) => {
        isRuleSelected(member.id, rule.id) ? removeVote(member.id, rule.id) : addVote(member, rule);
    };

    const animateTransition = (callback: () => void) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            callback();
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        });
    };

    const nextMember = () => {
        currentMemberIndex < otherMembers.length - 1
            ? animateTransition(() => setCurrentMemberIndex((i) => i + 1))
            : setPhase("review");
    };
    const prevMember = () => {
        if (currentMemberIndex > 0) animateTransition(() => setCurrentMemberIndex((i) => i - 1));
    };
    const handleSubmit = async () => { await submitVotes(); setPhase("submitted"); };

    if (activityLoading || !activity) {
        return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>;
    }

    if (phase === "submitted") {
        return (
            <View style={styles.center}>
                <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.submittedTitle}>Votes envoyés</Text>
                <Text style={styles.submittedSub}>En attente des autres joueurs</Text>
                {allVoted ? (
                    <TouchableOpacity style={styles.ctaBtn} onPress={() => onGoToBill(activityId)} activeOpacity={0.8}>
                        <Text style={styles.ctaBtnText}>Voir la note</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitPill}>
                        <Text style={styles.waitText}>{votedCount}/{totalCount} votes</Text>
                    </View>
                )}
                <TouchableOpacity onPress={onBack} style={{ marginTop: spacing.md }}>
                    <Text style={styles.linkText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (phase === "review") {
        return (
            <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setPhase("voting")} hitSlop={16}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.pageTitle}>Récap</Text>
                <Text style={styles.pageSub}>Vérifie avant de valider</Text>

                {otherMembers.map((member) => {
                    const memberVotes = getVotesForMember(member.id);
                    const score = getScorePreview(member.id);
                    return (
                        <View key={member.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewAvatar}>
                                    <Text style={styles.reviewAvatarText}>{member.username.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text style={styles.reviewName}>{member.username}</Text>
                                <View style={[styles.scorePill, { backgroundColor: score >= 0 ? colors.primary + "14" : colors.error + "14" }]}>
                                    <Text style={{ color: score >= 0 ? colors.primary : colors.error, fontWeight: "700", fontSize: 14 }}>
                                        {score > 0 ? "+" : ""}{score}
                                    </Text>
                                </View>
                            </View>
                            {memberVotes.length === 0 ? (
                                <Text style={styles.noVote}>Aucun vote</Text>
                            ) : (
                                memberVotes.map((v, i) => (
                                    <View key={i} style={styles.reviewRow}>
                                        <Text style={styles.reviewRuleName}>{v.ruleName}</Text>
                                        <Text style={{ color: v.points > 0 ? colors.primary : colors.error, fontWeight: "600" }}>
                                            {v.points > 0 ? "+" : ""}{v.points}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                    );
                })}

                <TouchableOpacity style={styles.ctaBtn} onPress={handleSubmit} disabled={voteLoading} activeOpacity={0.8}>
                    {voteLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.ctaBtnText}>Valider</Text>}
                </TouchableOpacity>

                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} hitSlop={16}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.progressLabel}>{currentMemberIndex + 1}/{otherMembers.length}</Text>
            </View>

            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((currentMemberIndex + 1) / otherMembers.length) * 100}%` }]} />
            </View>

            <Animated.View style={[styles.memberCard, { opacity: fadeAnim }]}>
                <View style={styles.memberCardAvatar}>
                    <Text style={styles.memberCardAvatarText}>{currentMember?.username.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberCardName}>{currentMember?.username}</Text>
                <View style={[styles.scorePill, {
                    backgroundColor: getScorePreview(currentMember?.id || 0) >= 0 ? colors.primary + "14" : colors.error + "14"
                }]}>
                    <Text style={{
                        color: getScorePreview(currentMember?.id || 0) >= 0 ? colors.primary : colors.error,
                        fontWeight: "700", fontSize: 16,
                    }}>
                        {getScorePreview(currentMember?.id || 0) > 0 ? "+" : ""}{getScorePreview(currentMember?.id || 0)} pts
                    </Text>
                </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {bonusRules.length > 0 && (
                        <>
                            <Text style={styles.ruleGroupLabel}>Bonus</Text>
                            <View style={styles.chipsWrap}>
                                {bonusRules.map((rule) => {
                                    const sel = isRuleSelected(currentMember?.id || 0, rule.id);
                                    return (
                                        <TouchableOpacity
                                            key={rule.id}
                                            style={[styles.chip, sel && styles.chipBonusOn]}
                                            onPress={() => currentMember && toggleRule(currentMember, rule)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.chipLabel, sel && { color: colors.white }]}>{rule.name}</Text>
                                            <Text style={[styles.chipPts, sel && { color: "rgba(255,255,255,0.8)" }]}>+{rule.points}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}
                    {malusRules.length > 0 && (
                        <>
                            <Text style={styles.ruleGroupLabel}>Malus</Text>
                            <View style={styles.chipsWrap}>
                                {malusRules.map((rule) => {
                                    const sel = isRuleSelected(currentMember?.id || 0, rule.id);
                                    return (
                                        <TouchableOpacity
                                            key={rule.id}
                                            style={[styles.chip, sel && styles.chipMalusOn]}
                                            onPress={() => currentMember && toggleRule(currentMember, rule)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.chipLabel, sel && { color: colors.white }]}>{rule.name}</Text>
                                            <Text style={[styles.chipPts, sel && { color: "rgba(255,255,255,0.8)" }]}>{rule.points}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </ScrollView>
            </Animated.View>

            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.navBtn, currentMemberIndex === 0 && { opacity: 0.3 }]}
                    onPress={prevMember}
                    disabled={currentMemberIndex === 0}
                >
                    <Text style={styles.navBtnText}>Précédent</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtnNext} onPress={nextMember} activeOpacity={0.8}>
                    <Text style={styles.navBtnNextText}>
                        {currentMemberIndex < otherMembers.length - 1 ? "Suivant" : "Récapitulatif"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.lg },
    center: { flex: 1, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.lg },

    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 60, paddingBottom: spacing.sm },
    backArrow: { fontSize: 28, color: colors.textPrimary, fontWeight: "300" },
    progressLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: "600" },

    progressTrack: { height: 4, backgroundColor: colors.bgInput, borderRadius: 2, marginBottom: spacing.lg },
    progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },

    memberCard: { alignItems: "center", paddingVertical: spacing.lg },
    memberCardAvatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.white,
        justifyContent: "center", alignItems: "center",
        marginBottom: spacing.md,
        ...shadows.lg,
    },
    memberCardAvatarText: { color: colors.textPrimary, fontWeight: "800", fontSize: 34 },
    memberCardName: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.sm },

    scorePill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full },

    ruleGroupLabel: {
        fontSize: 12, fontWeight: "600", color: colors.textSecondary,
        textTransform: "uppercase", letterSpacing: 0.5,
        marginBottom: spacing.sm, marginTop: spacing.sm, paddingLeft: spacing.xs,
    },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
    chip: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, gap: spacing.xs,
        ...shadows.sm,
    },
    chipBonusOn: { backgroundColor: colors.primary },
    chipMalusOn: { backgroundColor: colors.error },
    chipLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
    chipPts: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },

    navRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.lg },
    navBtn: {
        flex: 1, backgroundColor: colors.white, paddingVertical: spacing.md,
        borderRadius: radius.md, alignItems: "center", ...shadows.sm,
    },
    navBtnText: { color: colors.textPrimary, fontWeight: "600", fontSize: 15 },
    navBtnNext: {
        flex: 1, backgroundColor: colors.accent, paddingVertical: spacing.md,
        borderRadius: radius.md, alignItems: "center", ...shadows.md,
    },
    navBtnNextText: { color: colors.white, fontWeight: "700", fontSize: 15 },

    pageTitle: { fontSize: 34, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5, textAlign: "center" },
    pageSub: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg },
    reviewCard: {
        backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
        marginBottom: spacing.sm, ...shadows.md,
    },
    reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
    reviewAvatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center", marginRight: spacing.sm,
    },
    reviewAvatarText: { color: colors.textPrimary, fontWeight: "700", fontSize: 16 },
    reviewName: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    noVote: { color: colors.textMuted, fontSize: 13, fontStyle: "italic" },
    reviewRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: spacing.xs + 2,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    },
    reviewRuleName: { color: colors.textSecondary, fontSize: 14 },

    ctaBtn: {
        backgroundColor: colors.accent, paddingVertical: spacing.md,
        borderRadius: radius.md, alignItems: "center", marginTop: spacing.md, ...shadows.md,
        paddingHorizontal: spacing.lg
    },
    ctaBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },

    checkCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.primary + "14",
        justifyContent: "center", alignItems: "center", marginBottom: spacing.lg,
    },
    checkMark: { fontSize: 36, color: colors.primary, fontWeight: "800" },
    submittedTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.sm },
    submittedSub: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl },
    waitPill: {
        backgroundColor: colors.white, paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2, borderRadius: radius.full, ...shadows.sm,
    },
    waitText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
    linkText: { color: colors.accent, fontSize: 15, fontWeight: "600" },

    error: { color: colors.error, textAlign: "center", marginTop: spacing.md, fontSize: 14 },
});