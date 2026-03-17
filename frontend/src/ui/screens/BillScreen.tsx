import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
    StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
} from "react-native";
import { useBill } from "@/src/presentation/hooks/useBill";
import { useVotes } from "@/src/presentation/hooks/useVote";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { shadows } from "../styles/shadow";
import { BillShare } from "@/src/domain/entities/bill.model";
import { PullToRefresh } from "@/src/ui/components/PullToRefresh";
import { BillProps } from "@/src/presentation/interface/BillScreenType";

export const BillScreen = ({ activityId, onBack }: BillProps) => {
    const { bill, loading, error, createBill, fetchBill } = useBill(activityId);
    const { results, fetchResults } = useVotes(activityId);
    const { user } = useAuth();

    const [amount, setAmount] = useState("");
    const [drinkType, setDrinkType] = useState("");
    const [phase, setPhase] = useState<"input" | "result">("input");
    const [refreshing, setRefreshing] = useState(false);

    const drinkOptions = [
        { label: "Bière", emoji: "🍺", value: "bière" },
        { label: "Café", emoji: "☕", value: "café" },
        { label: "Vin", emoji: "🍷", value: "vin" },
        { label: "Soft", emoji: "🧃", value: "soft" },
        { label: "Cocktail", emoji: "🍹", value: "cocktail" },
    ];

    useEffect(() => { fetchBill(); fetchResults(); }, []);
    useEffect(() => { if (bill) setPhase("result"); }, [bill]);

    const handleCreate = async () => {
        Keyboard.dismiss();
        const totalAmount = parseFloat(amount);
        if (!totalAmount || totalAmount <= 0 || !drinkType) return;
        await createBill({ totalAmount, drinkType });
    };

    const handleRefreshResult = async () => { setRefreshing(true); await fetchBill(); setRefreshing(false); };

    const getMedalEmoji = (rank: number) => {
        switch (rank) { case 1: return "🥇"; case 2: return "🥈"; case 3: return "🥉"; default: return `#${rank}`; }
    };

    if (phase === "result" && bill) {
        const maxPct = Math.max(...bill.shares.map((s) => s.percentage));
        const myShare = bill.shares.find((s) => s.username === user?.username);

        return (
            <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}
                refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefreshResult} />}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} hitSlop={16}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Note totale</Text>
                    <Text style={styles.totalAmount}>{bill.totalAmount.toFixed(2)} €</Text>
                    <View style={styles.drinkPill}>
                        <Text style={styles.drinkPillText}>
                            {drinkOptions.find((d) => d.value === bill.drinkType)?.emoji}{" "}
                            {drinkOptions.find((d) => d.value === bill.drinkType)?.label || bill.drinkType}
                        </Text>
                    </View>
                </View>

                {myShare && (
                    <View style={styles.myCard}>
                        <Text style={styles.myLabel}>Ta part</Text>
                        <Text style={styles.myAmount}>{myShare.amount.toFixed(2)} €</Text>
                        <Text style={styles.myDetail}>
                            {getMedalEmoji(myShare.rank)} {myShare.rank}e · {myShare.percentage.toFixed(1)}% · Score {myShare.score}
                        </Text>
                    </View>
                )}

                <Text style={styles.sectionLabel}>Répartition</Text>
                <View style={styles.sharesCard}>
                    {bill.shares.map((share: BillShare, i: number) => {
                        const isMe = share.username === user?.username;
                        return (
                            <View key={i}>
                                {i > 0 && <View style={styles.shareDivider} />}
                                <View style={styles.shareRow}>
                                    <Text style={styles.shareMedal}>{getMedalEmoji(share.rank)}</Text>
                                    <View style={styles.shareContent}>
                                        <Text style={[styles.shareName, isMe && { color: colors.accent }]}>
                                            {share.username}{isMe ? " (toi)" : ""}
                                        </Text>
                                        <View style={styles.shareBar}>
                                            <View style={[styles.shareBarFill, {
                                                width: `${(share.percentage / maxPct) * 100}%`,
                                                backgroundColor: share.rank <= 2 ? colors.primary : share.rank >= bill.shares.length ? colors.error : colors.accent,
                                            }]} />
                                        </View>
                                    </View>
                                    <View style={styles.shareRight}>
                                        <Text style={styles.shareAmount}>{share.amount.toFixed(2)} €</Text>
                                        <Text style={styles.sharePct}>{share.percentage.toFixed(1)}%</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Comment ça marche</Text>
                    <Text style={styles.infoText}>
                        Plus ton score est élevé, moins tu paies. Chacun contribue proportionnellement à son classement.
                    </Text>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} hitSlop={16}>
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputTitle}>La note</Text>
                        <Text style={styles.inputSub}>Combien coûte la tournée ?</Text>

                        <View style={styles.amountRow}>
                            <View style={styles.amountCard}>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textMuted}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </View>
                            <Text style={styles.amountCurrency}>€</Text>
                        </View>

                        <Text style={styles.fieldLabel}>Boisson</Text>
                        <View style={styles.drinkRow}>
                            {drinkOptions.map((d) => (
                                <TouchableOpacity
                                    key={d.value}
                                    style={[styles.drinkChip, drinkType === d.value && styles.drinkChipOn]}
                                    onPress={() => { setDrinkType(d.value); Keyboard.dismiss(); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.drinkChipText, drinkType === d.value && styles.drinkChipTextOn]}>
                                        {d.emoji} {d.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {results.length > 0 && (
                            <View style={styles.previewCard}>
                                <Text style={styles.previewTitle}>Classement</Text>
                                {results.map((r, i) => (
                                    <View key={i} style={styles.previewRow}>
                                        <Text style={styles.previewMedal}>{getMedalEmoji(r.rank)}</Text>
                                        <Text style={styles.previewName}>{r.username}</Text>
                                        <Text style={[styles.previewScore, { color: r.score >= 0 ? colors.primary : colors.error }]}>
                                            {r.score > 0 ? "+" : ""}{r.score}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={[styles.calcBtn, (!amount || !drinkType) && { opacity: 0.35 }]}
                            onPress={handleCreate}
                            disabled={!amount || !drinkType || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color={colors.white} /> : (
                                <Text style={styles.calcBtnText}>Calculer la répartition</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.lg },
    header: { paddingTop: 60, paddingBottom: spacing.sm },
    backArrow: { fontSize: 28, color: colors.textPrimary, fontWeight: "300" },

    totalCard: {
        backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing.xl, alignItems: "center", marginBottom: spacing.lg, ...shadows.md,
    },
    totalLabel: { color: colors.textSecondary, fontSize: 13 },
    totalAmount: { color: colors.textPrimary, fontSize: 48, fontWeight: "800", letterSpacing: -1.5 },
    drinkPill: {
        backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2, borderRadius: radius.full, marginTop: spacing.sm,
    },
    drinkPillText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },

    myCard: {
        backgroundColor: colors.accent + "0A", borderRadius: radius.xl,
        padding: spacing.lg, alignItems: "center", marginBottom: spacing.lg,
        borderWidth: 1, borderColor: colors.accent + "18",
    },
    myLabel: { color: colors.accent, fontSize: 13, fontWeight: "600" },
    myAmount: { color: colors.accent, fontSize: 38, fontWeight: "800", letterSpacing: -1 },
    myDetail: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs },

    sectionLabel: {
        fontSize: 12, fontWeight: "600", color: colors.textSecondary,
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm, paddingLeft: spacing.xs,
    },

    sharesCard: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: "hidden", ...shadows.md, marginBottom: spacing.lg },
    shareRow: { flexDirection: "row", alignItems: "center", padding: spacing.md },
    shareDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.md + 28 },
    shareMedal: { fontSize: 18, width: 28 },
    shareContent: { flex: 1, marginRight: spacing.md },
    shareName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 },
    shareBar: { height: 4, backgroundColor: colors.bgInput, borderRadius: 2 },
    shareBarFill: { height: 4, borderRadius: 2 },
    shareRight: { alignItems: "flex-end" },
    shareAmount: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    sharePct: { fontSize: 12, color: colors.textMuted },

    infoCard: {
        backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadows.sm,
    },
    infoTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.xs },
    infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

    inputSection: { paddingTop: spacing.xl },
    inputTitle: { fontSize: 38, fontWeight: "800", color: colors.textPrimary, textAlign: "center", letterSpacing: -1 },
    inputSub: { fontSize: 15, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xl },

    amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
    amountCard: { backgroundColor: colors.white, borderRadius: radius.xl, ...shadows.md },
    amountInput: {
        padding: spacing.lg, fontSize: 38, fontWeight: "800",
        color: colors.textPrimary, textAlign: "center", width: 200,
    },
    amountCurrency: { fontSize: 38, fontWeight: "800", color: colors.textMuted, marginLeft: spacing.sm },

    fieldLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm },
    drinkRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl },
    drinkChip: {
        backgroundColor: colors.white, borderRadius: radius.full,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, ...shadows.sm,
    },
    drinkChipOn: { backgroundColor: colors.accent + "12" },
    drinkChipText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
    drinkChipTextOn: { color: colors.accent },

    previewCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.md },
    previewTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.md },
    previewRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.xs + 2 },
    previewMedal: { fontSize: 16, width: 30 },
    previewName: { flex: 1, color: colors.textPrimary, fontSize: 14 },
    previewScore: { fontSize: 14, fontWeight: "700" },

    calcBtn: {
        backgroundColor: colors.accent, paddingVertical: spacing.md,
        borderRadius: radius.md, alignItems: "center", ...shadows.md,
    },
    calcBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },

    error: { color: colors.error, textAlign: "center", marginTop: spacing.md, fontSize: 14 },
});