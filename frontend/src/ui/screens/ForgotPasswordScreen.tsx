import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing, radius } from '../styles/spacing';
import { shadows } from '../styles/shadow';
import { container } from '@/src/infrastructure/injecteur/container';

export const ForgotPasswordScreen = ({ onBack }: { onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError("Email requis");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await container.forgotPassword.execute(email.trim());
            setSuccess(true);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.screen}>
                <View style={styles.content}>
                    <Text style={styles.emoji}>📬</Text>
                    <Text style={styles.hero}>Email envoyé !</Text>
                    <Text style={styles.subtitle}>
                        Si cet email existe, tu recevras un lien de réinitialisation dans quelques minutes.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={onBack}>
                        <Text style={styles.buttonText}>← Retour à la connexion</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>

                <Text style={styles.hero}>Mot de{'\n'}passe{'\n'}oublié ?</Text>
                <Text style={styles.subtitle}>
                    Entre ton email pour recevoir un lien de réinitialisation.
                </Text>

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
                        <Text style={styles.buttonText}>Envoyer le lien</Text>
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
    backButton: {
        marginBottom: spacing.xl,
    },
    backText: {
        color: colors.accent,
        fontSize: 15,
        fontWeight: '600',
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
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