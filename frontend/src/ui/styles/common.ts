import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, radius } from './spacing';
import { shadows } from './shadow';

export const commonStyles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        padding: spacing.lg,
        justifyContent: 'center',
    },

    input: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
        ...shadows.sm,
    },

    buttonPrimary: {
        backgroundColor: colors.accent,
        padding: spacing.md + 2,
        borderRadius: radius.md,
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    buttonPrimaryText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },

    buttonAccent: {
        backgroundColor: colors.primary,
        padding: spacing.md + 2,
        borderRadius: radius.md,
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    buttonAccentText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },

    link: {
        color: colors.accent,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },

    error: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontSize: 14,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.lg,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
});