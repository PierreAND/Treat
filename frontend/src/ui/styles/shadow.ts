import { Platform, ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
        },
        android: {
            elevation: 1,
        },
    }) as ViewStyle,

    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
        },
        android: {
            elevation: 2,
        },
    }) as ViewStyle,

    lg: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
        },
        android: {
            elevation: 4,
        },
    }) as ViewStyle,
};