import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { colors } from '../styles/colors';
import { spacing, radius } from '../styles/spacing';
import { shadows } from '../styles/shadow';

export const RegisterScreen = ({ onNavigateToLogin }: { onNavigateToLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error } = useAuth();

    const handleRegister = () => register({ email, username, password });

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <Text style={styles.hero}>Join{'\n'}The{'\n'}Game</Text>
                <Text style={styles.subtitle}>Crée ton compte</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom d'utilisateur"
                        placeholderTextColor={colors.textMuted}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <View style={styles.inputDivider} />
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

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>S&apos;inscrire</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNavigateToLogin} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Déjà un compte ?</Text>
                    <Text style={styles.linkAction}> Se connecter</Text>
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
        backgroundColor: colors.primary,
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