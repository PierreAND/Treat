import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from "react-native";
import { useBill } from "@/src/presentation/hooks/useBill";
import { useVotes } from "@/src/presentation/hooks/useVote";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { colors } from "@/src/ui/styles/colors";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { BillShare } from "@/src/domain/entities/bill.model";
import { PullToRefresh } from "@/src/ui/components/PullToRefresh";

interface Props {
    activityId: number;
    onBack: () => void;
}

export const BillScreen = ({ activityId, onBack }: Props) => {
    const { bill, loading, error, createBill, fetchBill } = useBill(activityId);
    const { results, fetchResults } = useVotes(activityId);
    const { user } = useAuth();

    const [amount, setAmount] = useState("");
    const [drinkType, setDrinkType] = useState("");
    const [phase, setPhase] = useState<"input" | "result">("input");
    const [refreshing, setRefreshing] = useState(false);

    const drinkOptions = [
        { label: "🍺 Bière", value: "bière" },
        { label: "☕ Café", value: "café" },
        { label: "🍷 Vin", value: "vin" },
        { label: "🧃 Soft", value: "soft" },
        { label: "🍹 Cocktail", value: "cocktail" },
    ];

    useEffect(() => {
        fetchBill();
        fetchResults();
    }, []);

    useEffect(() => {
        if (bill) setPhase("result");
    }, [bill]);

    const handleCreate = async () => {
        Keyboard.dismiss();
        const totalAmount = parseFloat(amount);
        if (!totalAmount || totalAmount <= 0) return;
        if (!drinkType) return;
        await createBill({ totalAmount, drinkType });
    };

    const handleRefreshResult = async () => {
        setRefreshing(true);
        await fetchBill();
        setRefreshing(false);
    };

    const getMedalEmoji = (rank: number) => {
        switch (rank) {
            case 1: return "🥇";
            case 2: return "🥈";
            case 3: return "🥉";
            default: return `#${rank}`;
        }
    };

    const getBarWidth = (percentage: number, maxPercentage: number) => {
        return `${(percentage / maxPercentage) * 100}%`;
    };

    // Phase résultat
    if (phase === "result" && bill) {
        const maxPercentage = Math.max(...bill.shares.map((s) => s.percentage));
        const myShare = bill.shares.find((s) => s.username === user?.username);

        return (
            <ScrollView
                style={styles.screen}
                refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefreshResult} />}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backText}>← Retour</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Note totale</Text>
                    <Text style={styles.totalAmount}>{bill.totalAmount.toFixed(2)} €</Text>
                    <View style={styles.drinkBadge}>
                        <Text style={styles.drinkBadgeText}>
                            {drinkOptions.find((d) => d.value === bill.drinkType)?.label || bill.drinkType}
                        </Text>
                    </View>
                </View>

                {myShare && (
                    <View style={styles.myShareCard}>
                        <Text style={styles.myShareLabel}>Ta part</Text>
                        <Text style={styles.myShareAmount}>{myShare.amount.toFixed(2)} €</Text>
                        <Text style={styles.myShareDetails}>
                            {getMedalEmoji(myShare.rank)} Classé {myShare.rank}e · {myShare.percentage.toFixed(1)}% · Score: {myShare.score}
                        </Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>📊 Répartition</Text>

                {bill.shares.map((share: BillShare, index: number) => {
                    const isMe = share.username === user?.username;
                    return (
                        <View
                            key={index}
                            style={[styles.shareCard, isMe && styles.shareCardMe]}
                        >
                            <View style={styles.shareHeader}>
                                <View style={styles.shareLeft}>
                                    <Text style={styles.shareMedal}>
                                        {getMedalEmoji(share.rank)}
                                    </Text>
                                    <View>
                                        <Text style={[styles.shareName, isMe && styles.shareNameMe]}>
                                            {share.username} {isMe ? "(toi)" : ""}
                                        </Text>
                                        <Text style={styles.shareScore}>
                                            Score: {share.score}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.shareRight}>
                                    <Text style={styles.shareAmount}>
                                        {share.amount.toFixed(2)} €
                                    </Text>
                                    <Text style={styles.sharePercentage}>
                                        {share.percentage.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            width: getBarWidth(share.percentage, maxPercentage) as any,
                                            backgroundColor:
                                                share.rank <= 2
                                                    ? colors.primary
                                                    : share.rank >= bill.shares.length
                                                        ? colors.error
                                                        : colors.accent,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    );
                })}

                <View style={styles.explanationCard}>
                    <Text style={styles.explanationTitle}>Comment ça marche ?</Text>
                    <Text style={styles.explanationText}>
                        Plus ton score de vote est élevé, moins tu paies.
                        La répartition est progressive : le dernier ne paie pas tout,
                        chacun contribue proportionnellement à son classement.
                    </Text>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    }

    // Phase saisie
    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack}>
                            <Text style={styles.backText}>← Retour</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputEmoji}>💰</Text>
                        <Text style={styles.inputTitle}>La note</Text>
                        <Text style={styles.inputSubtext}>
                            Combien coûte la tournée ?
                        </Text>

                        <View style={styles.amountContainer}>
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
                            <Text style={styles.amountCurrency}>€</Text>
                        </View>

                        <Text style={styles.drinkLabel}>Boisson</Text>
                        <View style={styles.drinkContainer}>
                            {drinkOptions.map((drink) => (
                                <TouchableOpacity
                                    key={drink.value}
                                    style={[
                                        styles.drinkChip,
                                        drinkType === drink.value && styles.drinkChipActive,
                                    ]}
                                    onPress={() => {
                                        setDrinkType(drink.value);
                                        Keyboard.dismiss();
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.drinkChipText,
                                            drinkType === drink.value && styles.drinkChipTextActive,
                                        ]}
                                    >
                                        {drink.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {results.length > 0 && (
                            <View style={styles.votePreview}>
                                <Text style={styles.votePreviewTitle}>Classement des votes</Text>
                                {results.map((r, i) => (
                                    <View key={i} style={styles.votePreviewRow}>
                                        <Text style={styles.votePreviewRank}>
                                            {getMedalEmoji(r.rank)}
                                        </Text>
                                        <Text style={styles.votePreviewName}>{r.username}</Text>
                                        <Text
                                            style={[
                                                styles.votePreviewScore,
                                                { color: r.score >= 0 ? colors.primary : colors.error },
                                            ]}
                                        >
                                            {r.score > 0 ? "+" : ""}{r.score}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={[
                                styles.calculateButton,
                                (!amount || !drinkType) && styles.calculateButtonDisabled,
                            ]}
                            onPress={handleCreate}
                            disabled={!amount || !drinkType || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.calculateButtonText}>
                                    Calculer la répartition 🧮
                                </Text>
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
    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: spacing.lg,
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

    totalCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: "center",
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary + "40",
    },
    totalLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    totalAmount: {
        color: colors.textPrimary,
        fontSize: 40,
        fontWeight: "bold",
    },
    drinkBadge: {
        backgroundColor: colors.accent + "20",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        marginTop: spacing.sm,
    },
    drinkBadgeText: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: "600",
    },

    myShareCard: {
        backgroundColor: colors.primary + "15",
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: "center",
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary + "40",
    },
    myShareLabel: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    myShareAmount: {
        color: colors.primary,
        fontSize: 32,
        fontWeight: "bold",
    },
    myShareDetails: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: spacing.xs,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },

    shareCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    shareCardMe: {
        borderColor: colors.primary + "60",
        backgroundColor: colors.primary + "08",
    },
    shareHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    shareLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    shareMedal: {
        fontSize: 20,
    },
    shareName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    shareNameMe: {
        color: colors.primary,
    },
    shareScore: {
        color: colors.textMuted,
        fontSize: 12,
    },
    shareRight: {
        alignItems: "flex-end",
    },
    shareAmount: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
    },
    sharePercentage: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    barContainer: {
        height: 6,
        backgroundColor: colors.bgInput,
        borderRadius: 3,
    },
    barFill: {
        height: 6,
        borderRadius: 3,
    },

    explanationCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
    },
    explanationTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: spacing.xs,
    },
    explanationText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
    },

    inputContainer: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    inputEmoji: {
        fontSize: 50,
        textAlign: "center",
        marginBottom: spacing.md,
    },
    inputTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.textPrimary,
        textAlign: "center",
    },
    inputSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.xl,
    },

    amountContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xl,
    },
    amountInput: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
        fontSize: 32,
        fontWeight: "bold",
        color: colors.textPrimary,
        textAlign: "center",
        width: 200,
    },
    amountCurrency: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },

    drinkLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: spacing.sm,
    },
    drinkContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    drinkChip: {
        backgroundColor: colors.bgSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
    },
    drinkChipActive: {
        backgroundColor: colors.accent + "20",
        borderColor: colors.accent,
    },
    drinkChipText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
    drinkChipTextActive: {
        color: colors.accent,
    },

    votePreview: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    votePreviewTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: spacing.md,
    },
    votePreviewRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.xs,
    },
    votePreviewRank: {
        fontSize: 16,
        width: 30,
    },
    votePreviewName: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
    },
    votePreviewScore: {
        fontSize: 14,
        fontWeight: "bold",
    },

    calculateButton: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary,
    },
    calculateButtonDisabled: {
        opacity: 0.4,
    },
    calculateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },

    error: {
        color: colors.error,
        textAlign: "center",
        marginTop: spacing.md,
        fontSize: 14,
    },
});