import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing, radius } from '../styles/spacing';
import { shadows } from '../styles/shadow';
import { container } from '@/src/infrastructure/injecteur/container';

export const ResetPasswordScreen = ({ token, onSuccess }: { 
    token: string,
    onSuccess: () => void 
}) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!password.trim()) {
            setError("Mot de passe requis");
            return;
        }
        if (password !== confirm) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        if (password.length < 6) {
            setError("Le mot de passe doit faire au moins 6 caractères");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await container.resetPassword.execute(token, password);
            onSuccess();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <Text style={styles.hero}>Nouveau{'\n'}mot de{'\n'}passe</Text>
                <Text style={styles.subtitle}>
                    Choisis un nouveau mot de passe sécurisé.
                </Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nouveau mot de passe"
                        placeholderTextColor={colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <View style={styles.inputDivider} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor={colors.textMuted}
                        value={confirm}
                        onChangeText={setConfirm}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Réinitialiser 🔐</Text>
                    )}
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
        ...shadows.md,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});