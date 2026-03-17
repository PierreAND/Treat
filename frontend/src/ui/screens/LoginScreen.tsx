import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { colors } from '../styles/colors';
import { spacing, radius } from '../styles/spacing';
import { shadows } from '../styles/shadow';

export const LoginScreen = ({ onNavigateToRegister }: { onNavigateToRegister: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleLogin = () => login({ email, password });

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <Text style={styles.hero}>Who{'\n'}gonna{'\n'}pay</Text>
                <Text style={styles.subtitle}>Connecte-toi pour continuer</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.inputDivider} />
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor={colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNavigateToRegister} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Pas encore de compte ?</Text>
                    <Text style={styles.linkAction}> S&apos;inscrire</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    hero: {
        fontSize: 52,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -2,
        lineHeight: 54,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    error: {
        color: colors.error,
        fontSize: 13,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    inputCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    input: {
        padding: spacing.md + 2,
        fontSize: 16,
        color: colors.textPrimary,
    },
    inputDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
    button: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md + 2,
        borderRadius: radius.md,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    linkText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    linkAction: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600',
    },
});