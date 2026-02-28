import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, radius } from './spacing';

export const commonStyles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        padding: spacing.lg,
        justifyContent: 'center',
    },

    input: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
    },

    buttonPrimary: {
        backgroundColor: colors.primaryDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    buttonPrimaryText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

    buttonAccent: {
        backgroundColor: colors.accentDark,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    buttonAccentText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

    link: {
        color: colors.primary,
        textAlign: 'center',
        fontSize: 14,
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
});