import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ActivitySummary } from "@/src/domain/entities/activity.model";
import { colors } from "../styles/colors";
import { radius, spacing } from "../styles/spacing";
import { shadows } from "../styles/shadow";

interface InvitationCardProps {
    item: ActivitySummary;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

export const InvitationCard = ({ item, onAccept, onDecline }: InvitationCardProps) => (
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
            <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item.id)} activeOpacity={0.8}>
                <Text style={styles.acceptBtnText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineBtn} onPress={() => onDecline(item.id)} activeOpacity={0.8}>
                <Text style={styles.declineBtnText}>Refuser</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
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
});