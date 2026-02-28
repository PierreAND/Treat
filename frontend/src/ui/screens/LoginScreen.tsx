import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../presentation/hooks/useAuth';

export const LoginScreen = ({ onNavigateToRegister }: { onNavigateToRegister: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleLogin = () => {
        login({ email, password });
    };

    return (
        <View style= { styles.container } >
        <Text style={ styles.title }> Connexion </Text>

    { error && <Text style={ styles.error }> { error } </Text> }

    <TextInput
        style={ styles.input }
    placeholder = "Email"
    value = { email }
    onChangeText = { setEmail }
    keyboardType = "email-address"
    autoCapitalize = "none"
        />

        <TextInput
        style={ styles.input }
    placeholder = "Mot de passe"
    value = { password }
    onChangeText = { setPassword }
    secureTextEntry
        />

        <TouchableOpacity style={ styles.button } onPress = { handleLogin } disabled = { loading } >
            { loading?<ActivityIndicator color = "#fff" /> : <Text style={ styles.buttonText }> Se connecter </Text>
}
</TouchableOpacity>

    < TouchableOpacity onPress = { onNavigateToRegister } >
        <Text style={ styles.link }> Pas encore de compte ? S'inscrire</Text>
            </TouchableOpacity>
            </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        padding: 15, marginBottom: 15, fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF', padding: 15, borderRadius: 8,
        alignItems: 'center', marginBottom: 15,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    error: { color: 'red', textAlign: 'center', marginBottom: 15 },
    link: { color: '#007AFF', textAlign: 'center', fontSize: 14 },
});