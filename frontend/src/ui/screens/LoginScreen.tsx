import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../presentation/hooks/useAuth';
import { commonStyles } from '../styles/common';
import { typography } from '../styles/typo';
import { colors } from '../styles/colors';

export const LoginScreen = ({ onNavigateToRegister }: { onNavigateToRegister: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleLogin = () => login({ email, password });

    return (
        <View style={commonStyles.screen}>
            <Text style={[typography.title, { textAlign: 'center', marginBottom: 8 }]}>
                🟢 Connexion
            </Text>
            <Text style={[typography.caption, { textAlign: 'center', marginBottom: 32 }]}>
                Entrez dans l&apos;arène
            </Text>

            {error && <Text style={commonStyles.error}>{error}</Text>}

            <TextInput
                style={commonStyles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={commonStyles.input}
                placeholder="Mot de passe"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={commonStyles.buttonPrimary} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={commonStyles.buttonPrimaryText}>Se connecter</Text>
                )}
            </TouchableOpacity>

            <View style={commonStyles.divider} />

            <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={commonStyles.link}>Pas encore de compte ? S&apos;inscrire</Text>
            </TouchableOpacity>
        </View>
    );
};