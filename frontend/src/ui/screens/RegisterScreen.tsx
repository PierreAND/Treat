import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../presentation/hooks/useAuth';
import { commonStyles } from '../styles/common';
import { typography } from '../styles/typo';
import { colors } from '../styles/colors';

export const RegisterScreen = ({ onNavigateToLogin }: { onNavigateToLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error } = useAuth();

    const handleRegister = () => register({ email, username, password });

    return (
        <View style={commonStyles.screen}>
            <Text style={[typography.title, { textAlign: 'center', marginBottom: 8 }]}>
                🟣 Inscription
            </Text>
            <Text style={[typography.caption, { textAlign: 'center', marginBottom: 32 }]}>
                Rejoins le combat
            </Text>

            {error && <Text style={commonStyles.error}>{error}</Text>}

            <TextInput
                style={commonStyles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

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

            <TouchableOpacity style={commonStyles.buttonAccent} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={commonStyles.buttonAccentText}>S'inscrire</Text>
                )}
            </TouchableOpacity>

            <View style={commonStyles.divider} />

            <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={commonStyles.link}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
        </View>
    );
};