import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
    hero: {
        fontSize: 52,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -2,
        lineHeight: 54,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    body: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '400',
    },
    caption: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    label: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});