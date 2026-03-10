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
import { ActivitySummary } from "@/src/domain/entities/activity.model";
import { ActivityDetailScreen } from "./ActivityDetailScreen";
import { VoteScreen } from "./VoteScreen"
import { BillScreen } from "./BillScreen"
import { PullToRefresh } from "../components/PullToRefresh";

export const HomeScreen = () => {
    const { user, logout } = useAuth();
    const { activities, loading, error,refreshing,  refresh, handleRefresh } = useActivities();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [theme, setTheme] = useState("");
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)
    const [voteActivityId, setVoteActivityId] = useState<number | null>(null);
    const [billActivityId, setBillActivityId] = useState<number | null>(null)
    const themes = ["sport", "sortie", "weekend"];

    const invitations = activities.filter((a) => a.memberStatus === "invited");
    const myActivities = activities.filter((a) => a.memberStatus === "accepted");

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
            case "pending": return colors.accent;
            case "active": return colors.primary;
            case "voting": return colors.warning;
            case "finished": return colors.textMuted;
            default: return colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return "⏳ En attente";
            case "active": return "🟢 En cours";
            case "voting": return "🗳️ Vote";
            case "finished": return "✅ Terminée";
            default: return status;
        }
    };

    const renderInvitation = ({ item }: { item: ActivitySummary }) => (
        <View style={styles.inviteCard}>
            <View style={styles.inviteGlow} />
            <View style={styles.inviteHeader}>
                <Text style={styles.inviteThemeTag}>{item.theme.toUpperCase()}</Text>
                <Text style={styles.inviteFrom}>de {item.creator}</Text>
            </View>
            <Text style={styles.inviteName}>{item.name}</Text>
            <View style={styles.inviteActions}>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleRespond(item.id, true)}
                >
                    <Text style={styles.acceptButtonText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleRespond(item.id, false)}
                >
                    <Text style={styles.declineButtonText}>Refuser</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderActivity = ({ item }: { item: ActivitySummary }) => (
        <TouchableOpacity
            style={styles.activityCard}
            onPress={() => setSelectedActivityId(item.id)}
        >
            <View style={styles.activityHeader}>
                <Text style={styles.activityThemeTag}>{item.theme.toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>
            <Text style={styles.activityName}>{item.name}</Text>
            <Text style={styles.activityCreator}>Créé par {item.creator}</Text>
        </TouchableOpacity>
    );
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }
    if (voteActivityId) {
        return (
            <VoteScreen
                activityId={voteActivityId}
                onBack={() => {
                    setVoteActivityId(null);
                    refresh();
                }}
                onGoToBill={(id) => {
                    setVoteActivityId(null);
                    setBillActivityId(id);
                }}
            />
        );
    }
    if (billActivityId) {
        return (
            <BillScreen
                activityId={billActivityId}
                onBack={() => {
                    setBillActivityId(null);
                    refresh();
                }}
            />
        );
    }
    if (selectedActivityId) {
        return (
            <ActivityDetailScreen
                activityId={selectedActivityId}
                onBack={() => {
                    setSelectedActivityId(null);
                    refresh();
                }}
                onGoToVote={(id) => {
                    setSelectedActivityId(null);
                    setVoteActivityId(id);
                }}
                onGoToBill={(id) => {
                    setSelectedActivityId(null);
                    setBillActivityId(id);
                }}
            />
        );
    }
    return (
        <ScrollView style={styles.screen}
        refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefresh} />}
        >

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hey {user?.username} 👊</Text>
                    <Text style={styles.subtitle}>Prêt pour l&apos;action ?</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>


            {!showForm && (
                <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
                    <Text style={styles.createButtonText}>+ Nouvelle activité</Text>
                </TouchableOpacity>
            )}


            {showForm && (
                <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>Créer une activité</Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Text style={styles.formClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {formError && <Text style={styles.formError}>{formError}</Text>}

                    <TextInput
                        style={styles.input}
                        placeholder="Nom de l'activité"
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.themeLabel}>Thème</Text>
                    <View style={styles.themeContainer}>
                        {themes.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.themeChip,
                                    theme === t && styles.themeChipActive,
                                ]}
                                onPress={() => setTheme(t)}
                            >
                                <Text
                                    style={[
                                        styles.themeChipText,
                                        theme === t && styles.themeChipTextActive,
                                    ]}
                                >
                                    {t === "sport" && "⚽ "}
                                    {t === "sortie" && "🎉 "}
                                    {t === "weekend" && "🏖️ "}
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleCreate}
                        disabled={creating}
                    >
                        {creating ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Créer 🚀</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {invitations.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        📩 Invitations ({invitations.length})
                    </Text>
                    <FlatList
                        data={invitations}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderInvitation}
                        scrollEnabled={false}
                    />
                </View>
            )}


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 Mes activités</Text>
                {myActivities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🥊</Text>
                        <Text style={styles.emptyText}>
                            Aucune activité pour le moment
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Crée ta première activité !
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={myActivities}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderActivity}
                        scrollEnabled={false}
                    />
                )}
            </View>

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
    loadingText: {
        color: colors.textSecondary,
        marginTop: spacing.md,
        fontSize: 14,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: spacing.lg,
    },
    greeting: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    logoutButton: {
        backgroundColor: colors.bgInput,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    logoutText: {
        color: colors.error,
        fontSize: 13,
        fontWeight: "600",
    },

    createButton: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    createButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },

    formCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    formHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    formClose: {
        fontSize: 20,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    formError: {
        color: colors.error,
        fontSize: 13,
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    themeLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: spacing.sm,
    },
    themeContainer: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    themeChip: {
        flex: 1,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.sm + 2,
        alignItems: "center",
    },
    themeChipActive: {
        backgroundColor: colors.accent + "20",
        borderColor: colors.accent,
    },
    themeChipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    themeChipTextActive: {
        color: colors.accent,
    },
    submitButton: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },

    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },

    inviteCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.accent + "40",
        overflow: "hidden",
    },
    inviteGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: colors.accent,
    },
    inviteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    inviteThemeTag: {
        fontSize: 11,
        fontWeight: "bold",
        color: colors.accent,
        backgroundColor: colors.accent + "15",
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.sm,
        overflow: "hidden",
    },
    inviteFrom: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    inviteName: {
        fontSize: 17,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    inviteActions: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: colors.primaryDark,
        paddingVertical: spacing.sm + 2,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary,
    },
    acceptButtonText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 14,
    },
    declineButton: {
        flex: 1,
        backgroundColor: colors.bgInput,
        paddingVertical: spacing.sm + 2,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    declineButtonText: {
        color: colors.error,
        fontWeight: "bold",
        fontSize: 14,
    },

    activityCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    activityThemeTag: {
        fontSize: 11,
        fontWeight: "bold",
        color: colors.primary,
        backgroundColor: colors.primary + "15",
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
        fontSize: 11,
        fontWeight: "bold",
    },
    activityName: {
        fontSize: 17,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    activityCreator: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    emptyState: {
        alignItems: "center",
        paddingVertical: spacing.xl,
        backgroundColor: colors.bgSecondary,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
    },
    emptyEmoji: {
        fontSize: 40,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: "600",
    },
    emptySubtext: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },


    error: {
        color: colors.error,
        textAlign: "center",
        marginTop: spacing.md,
        fontSize: 14,
    },
});