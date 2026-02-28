import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    body: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: 13,
        color: colors.textSecondary,
    },
});