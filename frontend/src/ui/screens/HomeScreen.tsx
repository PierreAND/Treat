import React, { useState } from "react";
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
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useActivities } from "@/src/presentation/hooks/useActivities";
import { colors } from "@/src/ui/styles/colors";
import { container } from "@/src/infrastructure/injecteur/container";
import { spacing, radius } from "@/src/ui/styles/spacing";
import { shadows } from "../styles/shadow";
import { ActivitySummary } from "@/src/domain/entities/activity.model";
import { ActivityDetailScreen } from "./ActivityDetailScreen";
import { ProfileScreen } from "./ProfileScreen";
import { VoteScreen } from "./VoteScreen";
import { BillScreen } from "./BillScreen";
import { PullToRefresh } from "../components/PullToRefresh";
import { SafeAreaView } from "react-native-safe-area-context";

export const HomeScreen = () => {
    const { user } = useAuth();
    const { activities, loading, error, refreshing, refresh, handleRefresh } = useActivities();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [theme, setTheme] = useState("");
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [voteActivityId, setVoteActivityId] = useState<number | null>(null);
    const [billActivityId, setBillActivityId] = useState<number | null>(null);
    const [profileUsername, setProfileUsername] = useState<string | null>(null);
    const themes = ["sport", "sortie", "weekend"];

    const invitations = activities.filter((a) => a.memberStatus === "invited");
    const myActivities = activities.filter((a) => a.memberStatus === "accepted" && a.status !== "finished");
    const archivedActivities = activities.filter((a) => a.status === "finished");

    const handleCreate = async () => {
        if (!name || !theme) {
            setFormError("Nom et thème requis");
            return;
        }
        setCreating(true);
        setFormError(null);
        try {
            await container.createActivity.execute({ name, theme });
            setName("");
            setTheme("");
            setShowForm(false);
            refresh();
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setCreating(false);
        }
    };

    const handleRespond = async (activityId: number, accept: boolean) => {
        try {
            await container.respondInvite.execute(activityId, accept);
            refresh();
        } catch (e: any) {
            console.error(e.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return colors.warning;
            case "active": return colors.primary;
            case "voting": return colors.accent;
            case "finished": return colors.textMuted;
            default: return colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return "En attente";
            case "active": return "En cours";
            case "voting": return "Vote";
            case "finished": return "Terminée";
            default: return status;
        }
    };

    const renderInvitation = ({ item }: { item: ActivitySummary }) => (
        <View style={styles.inviteCard}>
            <View style={styles.inviteTop}>
                <View style={styles.inviteAvatar}>
                    <Text style={styles.inviteAvatarText}>{item.creator.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.inviteContent}>
                    <Text style={styles.inviteName}>{item.name}</Text>
                    <Text style={styles.inviteMeta}>{item.theme} · {item.creator}</Text>
                </View>
            </View>
            <View style={styles.inviteActions}>
                <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleRespond(item.id, true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.acceptBtnText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleRespond(item.id, false)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.declineBtnText}>Refuser</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderActivity = ({ item }: { item: ActivitySummary }) => (
        <TouchableOpacity
            style={styles.activityRow}
            onPress={() => setSelectedActivityId(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.activityAvatar}>
                <Text style={styles.activityAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityMeta}>{item.creator} · {new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) + "14" }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }
    if (voteActivityId) {
        return (
            <VoteScreen
                activityId={voteActivityId}
                onBack={() => { setVoteActivityId(null); refresh(); }}
                onGoToBill={(id) => { setVoteActivityId(null); setBillActivityId(id); }}
            />
        );
    }
    if (billActivityId) {
        return (
            <BillScreen
                activityId={billActivityId}
                onBack={() => { setBillActivityId(null); refresh(); }}
            />
        );
    }
    if (selectedActivityId) {
        return (
            <ActivityDetailScreen
                activityId={selectedActivityId}
                onBack={() => { setSelectedActivityId(null); refresh(); }}
                onGoToVote={(id) => { setSelectedActivityId(null); setVoteActivityId(id); }}
                onGoToBill={(id) => { setSelectedActivityId(null); setBillActivityId(id); }}
            />
        );
    }
    if (profileUsername) {
        return <ProfileScreen username={profileUsername} onBack={() => setProfileUsername(null)} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.screen}
                showsVerticalScrollIndicator={false}
                refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.profileBubble}
                        onPress={() => setProfileUsername(user?.username || "")}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.profileBubbleText}>{user?.username.charAt(0).toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.hero}>Who{'\n'}Gonna{'\n'}Pay</Text>

                {!showForm && (
                    <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
                        <Text style={styles.createBtnText}>Nouvelle activité</Text>
                    </TouchableOpacity>
                )}

                {showForm && (
                    <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>Nouvelle activité</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)} hitSlop={16}>
                                <Text style={styles.formClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {formError && <Text style={styles.formError}>{formError}</Text>}

                        <View style={styles.formInputGroup}>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Nom de l'activité"
                                placeholderTextColor={colors.textMuted}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <Text style={styles.formLabel}>Thème</Text>
                        <View style={styles.themeRow}>
                            {themes.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.themeChip, theme === t && styles.themeChipActive]}
                                    onPress={() => setTheme(t)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.themeChipText, theme === t && styles.themeChipTextActive]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.formSubmitBtn} onPress={handleCreate} disabled={creating} activeOpacity={0.8}>
                            {creating ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.formSubmitText}>Créer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                
                {invitations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Invitations</Text>
                        <FlatList
                            data={invitations}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderInvitation}
                            scrollEnabled={false}
                        />
                    </View>
                )}

              
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes activités</Text>
                    {myActivities.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>Rien pour le moment</Text>
                            <Text style={styles.emptySubtext}>Crée ta première activité</Text>
                        </View>
                    ) : (
                        <View style={styles.listCard}>
                            {myActivities.map((item, i) => (
                                <View key={item.id.toString()}>
                                    {i > 0 && <View style={styles.rowDivider} />}
                                    {renderActivity({ item })}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                
                {archivedActivities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Terminées</Text>
                        <View style={styles.listCard}>
                            {archivedActivities.map((item, i) => (
                                <View key={item.id.toString()}>
                                    {i > 0 && <View style={styles.rowDivider} />}
                                    {renderActivity({ item })}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgPrimary },
    screen: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: spacing.lg },
    loadingContainer: { flex: 1, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center" },

    topBar: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: spacing.sm,
        marginBottom: spacing.md,
    },
    profileBubble: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        ...shadows.md,
    },
    profileBubbleText: {
        color: colors.textPrimary,
        fontWeight: "700",
        fontSize: 18,
    },

    hero: {
        fontSize: 52,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -2,
        lineHeight: 54,
        marginBottom: spacing.xl,
    },

    createBtn: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        marginBottom: spacing.xl,
        ...shadows.md,
    },
    createBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700",
    },

    formCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        ...shadows.lg,
    },
    formHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    formTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
    formClose: { fontSize: 18, color: colors.textMuted, padding: spacing.xs },
    formError: { color: colors.error, fontSize: 13, marginBottom: spacing.md },
    formInputGroup: {
        backgroundColor: colors.bgPrimary,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    formInput: {
        padding: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
    },
    formLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    themeRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    themeChip: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        borderRadius: radius.md,
        paddingVertical: spacing.sm + 4,
        alignItems: "center",
    },
    themeChipActive: {
        backgroundColor: colors.accent + "14",
    },
    themeChipText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
    themeChipTextActive: { color: colors.accent },
    formSubmitBtn: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
    },
    formSubmitText: { color: colors.white, fontSize: 16, fontWeight: "700" },

    section: { marginBottom: spacing.lg },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.md,
        letterSpacing: -0.3,
    },

    inviteCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        ...shadows.md,
    },
    inviteTop: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
    inviteAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accent + "14",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    inviteAvatarText: { color: colors.accent, fontWeight: "700", fontSize: 18 },
    inviteContent: { flex: 1 },
    inviteName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    inviteMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    inviteActions: { flexDirection: "row", gap: spacing.sm },
    acceptBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm + 4,
        borderRadius: radius.md,
        alignItems: "center",
    },
    acceptBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
    declineBtn: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingVertical: spacing.sm + 4,
        borderRadius: radius.md,
        alignItems: "center",
    },
    declineBtnText: { color: colors.error, fontWeight: "700", fontSize: 14 },

    listCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        overflow: "hidden",
        ...shadows.md,
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
    },
    activityAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    activityAvatarText: { color: colors.textPrimary, fontWeight: "700", fontSize: 17 },
    activityContent: { flex: 1 },
    activityName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    activityMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 4,
        borderRadius: radius.full,
        gap: 5,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 11, fontWeight: "600" },
    rowDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: 42 + spacing.md * 2,
    },

    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        paddingVertical: spacing.xl,
        alignItems: "center",
        ...shadows.sm,
    },
    emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
    emptySubtext: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

    error: { color: colors.error, textAlign: "center", marginTop: spacing.md, fontSize: 14 },
});